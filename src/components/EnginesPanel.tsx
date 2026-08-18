import React, { useState } from 'react';
import type { Engine } from '../types/ship';
import { getAvailableEngines, getMaxPowerPlantByTechLevel, calculateAntimatterAdjustedManeuverFuel, getMinPowerPlantForFuelEquipment, formatPowerPlantCode } from '../data/constants';
import { getMaxEnginePerformance } from '../utils/calculations';

interface EnginesPanelProps {
  engines: Engine[];
  shipTonnage: number;
  shipTechLevel: string;
  fuelWeeks: number;
  activeRules: Set<string>;
  hasAmPlant: boolean;
  onUpdate: (engines: Engine[]) => void;
  onFuelWeeksUpdate: (weeks: number) => void;
}

const EnginesPanel: React.FC<EnginesPanelProps> = ({ engines, shipTonnage, shipTechLevel, fuelWeeks, hasAmPlant, onUpdate, onFuelWeeksUpdate }) => {
  const maxPowerPlant = getMaxPowerPlantByTechLevel(shipTechLevel);
  const minPowerForFuel = getMinPowerPlantForFuelEquipment(shipTonnage);

  // Multiple engines of the same type can be installed for redundancy. The
  // highest-performing one of each type is what the structure actually runs
  // on for gating/fuel/crew purposes — see getMaxEnginePerformance.
  const powerPlantPerformance = getMaxEnginePerformance(engines, 'power_plant');
  const maneuverPerformance = getMaxEnginePerformance(engines, 'maneuver_drive');

  const [selectedCode, setSelectedCode] = useState<Record<Engine['engine_type'], string>>({
    power_plant: '',
    maneuver_drive: '',
  });

  const addEngine = (type: Engine['engine_type']) => {
    const code = selectedCode[type];
    if (!code) return;
    const availableEngines = getAvailableEngines(
      shipTonnage,
      type,
      type === 'maneuver_drive' ? (powerPlantPerformance > 0 ? powerPlantPerformance : undefined) : undefined,
      shipTechLevel
    );
    const picked = availableEngines.find(eng => eng.code === code);
    if (!picked) return;

    const newEngine: Engine = {
      engine_type: type,
      drive_code: picked.code,
      performance: picked.performance,
      mass: picked.mass,
      cost: picked.cost,
    };
    onUpdate([...engines, newEngine]);
    setSelectedCode(prev => ({ ...prev, [type]: '' }));
  };

  const removeEngine = (index: number) => {
    onUpdate(engines.filter((_, i) => i !== index));
  };

  const renderEngineAddForm = (type: Engine['engine_type'], label: string) => {
    const countOfType = engines.filter(e => e.engine_type === type).length;
    const availableEngines = getAvailableEngines(
      shipTonnage,
      type,
      type === 'maneuver_drive' ? (powerPlantPerformance > 0 ? powerPlantPerformance : undefined) : undefined,
      shipTechLevel
    );

    return (
      <div key={type} className="engine-group">
        <h3>{label}{countOfType > 0 ? ` (${countOfType} installed)` : ''}</h3>
        <div className="form-row">
          <div className="form-group">
            <label>Drive Selection {type === 'power_plant' && countOfType === 0 ? '*' : ''}</label>
            <select
              value={selectedCode[type]}
              onChange={(e) => setSelectedCode(prev => ({ ...prev, [type]: e.target.value }))}
            >
              <option value="">Select a drive...</option>
              {availableEngines.map(eng => (
                <option key={eng.code} value={eng.code}>{eng.label}</option>
              ))}
            </select>
            {type === 'maneuver_drive' && powerPlantPerformance > 0 && (
              <small>Limited by Power Plant P-{powerPlantPerformance}</small>
            )}
            {type === 'power_plant' && (
              <small>Tech Level {shipTechLevel} allows up to P-{maxPowerPlant} (Antimatter Plant requires {formatPowerPlantCode(minPowerForFuel)}+ at this structure's tonnage)</small>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={() => addEngine(type)}
          disabled={!selectedCode[type]}
          className="add-item-btn"
        >
          Add {label}
        </button>
        {countOfType > 0 && (
          <p><small>{countOfType > 1 ? 'Redundant engines installed — see Engine Summary below.' : 'Add another for redundancy.'}</small></p>
        )}
      </div>
    );
  };

  const powerRequirementsMet = maneuverPerformance <= powerPlantPerformance;

  const maneuverFuel = maneuverPerformance > 0
    ? calculateAntimatterAdjustedManeuverFuel(shipTonnage, maneuverPerformance, fuelWeeks, hasAmPlant)
    : 0;

  const totalEngineMass = engines.reduce((sum, e) => sum + e.mass, 0);
  const remainingMass = shipTonnage - totalEngineMass;
  const fuelFitsInShip = maneuverFuel <= remainingMass;

  const fuelRateDivisor = shipTonnage * 0.01 * (hasAmPlant ? 0.1 : 1);
  const maxPossibleWeeks = maneuverPerformance > 0
    ? Math.floor(2 * remainingMass / (fuelRateDivisor * maneuverPerformance))
    : 12;
  const effectiveMaxWeeks = Math.min(12, Math.max(2, maxPossibleWeeks));

  // performance > 0 (not >= 1): fractional power plants (P-.01..P-.5) are
  // valid selections too, matching App.tsx's isCurrentPanelValid() check.
  const requiredConfigured = engines.some(e => e.engine_type === 'power_plant' && e.drive_code && e.performance > 0);

  return (
    <div className="panel-content">
      <p>Configure engines for the megastructure. Power Plant is required. Jump Drive is not available for megastructures. Maneuver Drive is optional (no entries means M-0). Multiple engines of the same type can be added for redundancy — the highest-performing one determines what the structure actually runs on.</p>

      <div className="engines-horizontal-layout">
        {renderEngineAddForm('power_plant', 'Power Plant')}
        {renderEngineAddForm('maneuver_drive', 'Maneuver Drive')}
      </div>

      <div className="fuel-section">
        <h3>Maneuver Fuel Requirements</h3>
        <div className="fuel-horizontal-layout">
          <div className="fuel-selection">
            <div className="form-group">
              <label htmlFor="fuel-weeks">Power Plant Fuel Duration</label>
              <select
                id="fuel-weeks"
                value={fuelWeeks}
                onChange={(e) => onFuelWeeksUpdate(parseInt(e.target.value))}
              >
                {Array.from({ length: effectiveMaxWeeks - 1 }, (_, i) => i + 2).map(weeks => (
                  <option key={weeks} value={weeks}>{weeks} weeks</option>
                ))}
              </select>
              <small>Maximum {effectiveMaxWeeks} weeks based on available mass</small>
            </div>
          </div>

          <div className="fuel-summary">
            <h4>Fuel Mass Breakdown{hasAmPlant ? ' (Antimatter Plant)' : ''}:</h4>
            <table>
              <tbody>
                <tr>
                  <td>Maneuver Fuel ({fuelWeeks} weeks):</td>
                  <td>{maneuverFuel.toFixed(1)} tons</td>
                  <td><small>({maneuverPerformance > 0 ? `M-${maneuverPerformance}` : 'No Maneuver Drive'} × 0.01 × {shipTonnage.toLocaleString()}t × {fuelWeeks / 2}{hasAmPlant ? ' × 0.1 antimatter' : ''})</small></td>
                </tr>
                <tr className="total-row">
                  <td><strong>Total Maneuver Fuel:</strong></td>
                  <td><strong>{maneuverFuel.toFixed(1)} tons</strong></td>
                  <td><small>{shipTonnage > 0 ? ((maneuverFuel / shipTonnage) * 100).toFixed(2) : '0.00'}% of structure mass</small></td>
                </tr>
              </tbody>
            </table>
            <p><small>Note: Fuel storage, scoops, processors, and antimatter plants are configured in the Fuel panel. An installed Antimatter Plant reduces maneuver fuel requirements to 1/10th.</small></p>
          </div>
        </div>
      </div>

      <div className="validation-info">
        <h3>Requirements:</h3>
        <ul>
          <li className={engines.some(e => e.engine_type === 'power_plant') ? 'valid' : 'invalid'}>
            ✓ Power Plant configured
          </li>
          <li className="valid">✓ Maneuver Drive configured (M-0 if none selected)</li>
          <li className="valid">✓ No Jump Drive (megastructures do not jump)</li>
          <li className={powerRequirementsMet ? 'valid' : 'invalid'}>
            ✓ Power Plant provides sufficient power for Maneuver Drive
          </li>
          <li className={fuelFitsInShip ? 'valid' : 'invalid'}>
            ✓ Maneuver fuel fits within available mass
          </li>
          <li className={requiredConfigured ? 'valid' : 'invalid'}>
            ✓ Required engines have valid drive selection
          </li>
        </ul>
      </div>

      <div className="engine-summary">
        <h3>Engine Summary:</h3>
        {engines.length === 0 ? (
          <p>No engines configured.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Engine Type</th>
                <th>Drive</th>
                <th>Performance</th>
                <th>Mass (tons)</th>
                <th>Cost (MCr)</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {engines.map((engine, index) => (
                <tr key={`${engine.engine_type}-${index}`}>
                  <td>{engine.engine_type === 'power_plant' ? 'Power Plant' : 'Maneuver Drive'}</td>
                  <td>{engine.drive_code || '-'}</td>
                  <td>{engine.performance} ({engine.drive_code || '-'})</td>
                  <td>{engine.mass.toFixed(1)}</td>
                  <td>{engine.cost.toFixed(2)}</td>
                  <td>
                    <button type="button" onClick={() => removeEngine(index)} className="remove-btn">
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default EnginesPanel;
