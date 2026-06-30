import React from 'react';
import type { Engine } from '../types/ship';
import { getAvailableEngines, calculateManeuverFuel } from '../data/constants';

interface EnginesPanelProps {
  engines: Engine[];
  shipTonnage: number;
  shipTechLevel: string;
  fuelWeeks: number;
  activeRules: Set<string>;
  onUpdate: (engines: Engine[]) => void;
  onFuelWeeksUpdate: (weeks: number) => void;
}

const EnginesPanel: React.FC<EnginesPanelProps> = ({ engines, shipTonnage, shipTechLevel, fuelWeeks, onUpdate, onFuelWeeksUpdate }) => {

  const getEngine = (type: Engine['engine_type']): Engine => {
    const found = engines.find(e => e.engine_type === type);
    if (found) return found;
    return { engine_type: type, drive_code: type === 'maneuver_drive' ? 'M-0' : '', performance: 0, mass: 0, cost: 0 };
  };

  const updateEngine = (type: Engine['engine_type'], updates: Partial<Engine>) => {
    const newEngines = [...engines];
    const existingIndex = newEngines.findIndex(e => e.engine_type === type);
    const updatedEngine = { ...getEngine(type), ...updates, engine_type: type };

    if (existingIndex >= 0) {
      newEngines[existingIndex] = updatedEngine;
    } else {
      newEngines.push(updatedEngine);
    }
    onUpdate(newEngines);
  };

  const renderEngineInput = (type: Engine['engine_type'], label: string) => {
    const engine = getEngine(type);
    const powerPlant = getEngine('power_plant');
    const powerPlantPerformance = (powerPlant.drive_code && powerPlant.performance > 0) ? powerPlant.performance : undefined;
    const availableEngines = getAvailableEngines(shipTonnage, type, powerPlantPerformance, shipTechLevel, false);

    return (
      <div key={type} className="engine-group">
        <h3>{label}</h3>
        <div className="form-row">
          <div className="form-group">
            <label>Drive Selection {type === 'maneuver_drive' ? '' : '*'}</label>
            <select
              value={engine.drive_code}
              onChange={(e) => {
                if (e.target.value === 'M-0' && type === 'maneuver_drive') {
                  updateEngine(type, { drive_code: 'M-0', performance: 0, mass: 0, cost: 0 });
                } else {
                  const selectedEngine = availableEngines.find(eng => eng.code === e.target.value);
                  if (selectedEngine) {
                    updateEngine(type, {
                      drive_code: selectedEngine.code,
                      performance: selectedEngine.performance,
                      mass: selectedEngine.mass,
                      cost: selectedEngine.cost
                    });
                  }
                }
              }}
            >
              <option value="">Select a drive...</option>
              {type === 'maneuver_drive' && (
                <option value="M-0">None (M-0 performance, 0 tons, 0 MCr)</option>
              )}
              {availableEngines.map(eng => (
                <option key={eng.code} value={eng.code}>{eng.label}</option>
              ))}
            </select>
            {type === 'maneuver_drive' && powerPlantPerformance && (
              <small>Limited by Power Plant P-{powerPlantPerformance}</small>
            )}
          </div>
        </div>
        {engine.drive_code && (
          <div className="engine-info">
            <small>Performance: {engine.performance} ({type === 'maneuver_drive' ? 'M' : 'P'}-{engine.performance})</small>
          </div>
        )}
      </div>
    );
  };

  const powerPlant = getEngine('power_plant');
  const maneuverDrive = getEngine('maneuver_drive');

  const powerRequirementsMet = !maneuverDrive.drive_code || maneuverDrive.performance <= powerPlant.performance;

  const maneuverFuel = maneuverDrive.performance > 0
    ? calculateManeuverFuel(shipTonnage, maneuverDrive.performance, fuelWeeks)
    : 0;

  const totalEngineMass = engines.reduce((sum, e) => sum + e.mass, 0);
  const remainingMass = shipTonnage - totalEngineMass;
  const fuelFitsInShip = maneuverFuel <= remainingMass;

  const maxPossibleWeeks = maneuverDrive.performance > 0
    ? Math.floor(2 * remainingMass / (shipTonnage * 0.01 * maneuverDrive.performance))
    : 12;
  const effectiveMaxWeeks = Math.min(12, Math.max(2, maxPossibleWeeks));

  const requiredConfigured = engines.some(e => e.engine_type === 'power_plant' && e.drive_code && e.performance >= 1);

  return (
    <div className="panel-content">
      <p>Configure engines for the megastructure. Power Plant is required. Jump Drive is not available for megastructures. Maneuver Drive is optional (defaults to M-0).</p>

      <div className="engines-horizontal-layout">
        {renderEngineInput('power_plant', 'Power Plant')}
        {renderEngineInput('maneuver_drive', 'Maneuver Drive')}
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
            <h4>Fuel Mass Breakdown:</h4>
            <table>
              <tbody>
                <tr>
                  <td>Maneuver Fuel ({fuelWeeks} weeks):</td>
                  <td>{maneuverFuel.toFixed(1)} tons</td>
                  <td><small>({maneuverDrive.performance > 0 ? `M-${maneuverDrive.performance}` : 'No Maneuver Drive'} × 0.01 × {shipTonnage.toLocaleString()}t × {fuelWeeks / 2})</small></td>
                </tr>
                <tr className="total-row">
                  <td><strong>Total Maneuver Fuel:</strong></td>
                  <td><strong>{maneuverFuel.toFixed(1)} tons</strong></td>
                  <td><small>{shipTonnage > 0 ? ((maneuverFuel / shipTonnage) * 100).toFixed(2) : '0.00'}% of structure mass</small></td>
                </tr>
              </tbody>
            </table>
            <p><small>Note: Fuel storage, scoops, processors, and antimatter plants are configured in the Fuel panel.</small></p>
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
        <table>
          <thead>
            <tr>
              <th>Engine Type</th>
              <th>Drive</th>
              <th>Performance</th>
              <th>Mass (tons)</th>
              <th>Cost (MCr)</th>
            </tr>
          </thead>
          <tbody>
            {(['power_plant', 'maneuver_drive'] as Engine['engine_type'][]).map(engineType => {
              const engine = getEngine(engineType);
              return (
                <tr key={engineType}>
                  <td>{engineType === 'power_plant' ? 'Power Plant' : 'Maneuver Drive'}</td>
                  <td>{engine.drive_code || '-'}</td>
                  <td>{engine.performance} ({engineType === 'maneuver_drive' ? 'M' : 'P'}-{engine.performance})</td>
                  <td>{engine.mass.toFixed(1)}</td>
                  <td>{engine.cost.toFixed(2)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EnginesPanel;
