import React from 'react';
import type { Engine } from '../types/ship';
import { getAvailableEngines, calculateJumpFuel, calculateManeuverFuel, calculateJumpBatteryMass, calculateTotalFuelMass, getMaxJumpByTechLevel } from '../data/constants';

interface EnginesPanelProps {
  engines: Engine[];
  shipTonnage: number;
  techLevel: string;
  fuelWeeks: number;
  externalFuel: boolean;
  activeRules: Set<string>;
  onUpdate: (engines: Engine[]) => void;
  onFuelWeeksUpdate: (weeks: number) => void;
  onExternalFuelUpdate: (externalFuel: boolean) => void;
}

const EnginesPanel: React.FC<EnginesPanelProps> = ({ engines, shipTonnage, techLevel, fuelWeeks, externalFuel, activeRules, onUpdate, onFuelWeeksUpdate, onExternalFuelUpdate }) => {
  const useAntimatter = activeRules.has('antimatter');
  const longerJumps = activeRules.has('longer_jumps');
  const maxJump = getMaxJumpByTechLevel(techLevel, longerJumps);
  const engineOptions = { maxJumpPerformance: maxJump, extendedDrives: longerJumps };

  const getEngine = (type: Engine['engine_type']): Engine => {
    const defaultEngine = engines.find(e => e.engine_type === type);
    if (defaultEngine) {
      // Validate that the stored engine data is consistent with current ENGINE_DRIVES data
      if (defaultEngine.drive_code && defaultEngine.drive_code !== '' && defaultEngine.drive_code !== 'M-0') {
        const availableEngines = getAvailableEngines(shipTonnage, type, undefined, engineOptions);
        const expectedEngine = availableEngines.find(eng => eng.code === defaultEngine.drive_code);
        
        if (expectedEngine && expectedEngine.performance !== defaultEngine.performance) {
          // Fix inconsistent data by returning corrected engine data
          return {
            ...defaultEngine,
            performance: expectedEngine.performance,
            mass: expectedEngine.mass,
            cost: expectedEngine.cost
          };
        }
      }
      return defaultEngine;
    }
    
    // For maneuver drive, if not configured, return M-0 performance
    if (type === 'maneuver_drive') {
      return {
        engine_type: type,
        drive_code: 'M-0',
        performance: 0,
        mass: 0,
        cost: 0
      };
    }
    
    return {
      engine_type: type,
      drive_code: '',
      performance: 1,
      mass: 0.1,
      cost: 0
    };
  };

  const updateEngine = (type: Engine['engine_type'], updates: Partial<Engine>) => {
    const newEngines = [...engines];
    const existingIndex = newEngines.findIndex(e => e.engine_type === type);
    
    const updatedEngine = { 
      ...getEngine(type), 
      ...updates, 
      engine_type: type 
    };

    if (existingIndex >= 0) {
      newEngines[existingIndex] = updatedEngine;
    } else {
      newEngines.push(updatedEngine);
    }

    onUpdate(newEngines);
  };

  // An engine option is only selectable if the ship could still fit the other
  // configured engines plus fuel for the minimum duration (1 week) — otherwise
  // the user could reach fuel selection with no workable choice.
  const fitsWithMinimumFuel = (type: Engine['engine_type'], option: { performance: number; mass: number }): boolean => {
    const otherEnginesMass = engines
      .filter(e => e.engine_type !== type)
      .reduce((sum, e) => sum + e.mass, 0);
    const jumpPerf = type === 'jump_drive' ? option.performance
      : (engines.find(e => e.engine_type === 'jump_drive')?.performance || 0);
    const maneuverPerf = type === 'maneuver_drive' ? option.performance
      : (engines.find(e => e.engine_type === 'maneuver_drive')?.performance || 0);
    const minimumFuel = calculateTotalFuelMass(shipTonnage, jumpPerf, maneuverPerf, 1, useAntimatter, externalFuel);
    return otherEnginesMass + option.mass + minimumFuel <= shipTonnage;
  };

  const renderEngineInput = (type: Engine['engine_type'], label: string) => {
    const engine = getEngine(type);
    const powerPlant = getEngine('power_plant');
    // Only apply power plant performance filtering if a specific power plant drive is selected
    const powerPlantPerformance = (powerPlant.drive_code && powerPlant.performance > 0) ? powerPlant.performance : undefined;
    const availableEngines = getAvailableEngines(shipTonnage, type, powerPlantPerformance, engineOptions)
      .filter(option => fitsWithMinimumFuel(type, option));

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
                  updateEngine(type, { 
                    drive_code: 'M-0',
                    performance: 0,
                    mass: 0,
                    cost: 0
                  });
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
              {availableEngines.map(availEngine => (
                <option key={availEngine.code} value={availEngine.code}>
                  {availEngine.label}
                </option>
              ))}
            </select>
            {(type === 'jump_drive' || type === 'maneuver_drive') && powerPlantPerformance && (
              <small>Limited by Power Plant P-{powerPlantPerformance}</small>
            )}
            {(type === 'jump_drive' || type === 'maneuver_drive') && !powerPlantPerformance && (
              <small className="info">Select Power Plant first to see power-limited options</small>
            )}
            {type === 'jump_drive' && (
              <small className="info">Tech Level {techLevel} allows up to J-{maxJump}{longerJumps && maxJump > 6 ? ' (Longer Jumps)' : ''}</small>
            )}
            {type === 'jump_drive' && availableEngines.length === 0 && (
              <small className="invalid">No jump drive fits this hull at Tech Level {techLevel} — increase tech level or hull size</small>
            )}
          </div>

        </div>
        
        {engine.drive_code && (
          <div className="engine-info">
            <small>Performance: {engine.performance} ({type === 'jump_drive' ? 'J' : type === 'maneuver_drive' ? 'M' : 'P'}-{engine.performance})</small>
          </div>
        )}
      </div>
    );
  };

  const powerPlant = getEngine('power_plant');
  const jumpDrive = getEngine('jump_drive');
  const maneuverDrive = getEngine('maneuver_drive');
  
  const powerRequirementsMet = 
    (!jumpDrive.drive_code || jumpDrive.performance <= powerPlant.performance) &&
    (!maneuverDrive.drive_code || maneuverDrive.performance <= powerPlant.performance);
  
  // Calculate fuel requirements with antimatter / external fuel consideration
  const jumpFuel = (jumpDrive.performance > 0 && !externalFuel) ? calculateJumpFuel(shipTonnage, jumpDrive.performance) : 0;
  const maneuverFuel = maneuverDrive.performance > 0 ? calculateManeuverFuel(shipTonnage, maneuverDrive.performance, fuelWeeks) : 0;

  // Apply antimatter reduction if active; jump batteries (external fuel) are unaffected
  const adjustedJumpFuel = useAntimatter ? jumpFuel * 0.1 : jumpFuel;
  const adjustedManeuverFuel = useAntimatter ? maneuverFuel * 0.1 : maneuverFuel;
  const batteryMass = (externalFuel && jumpDrive.performance > 0) ? calculateJumpBatteryMass(shipTonnage) : 0;
  const totalFuelMass = adjustedJumpFuel + adjustedManeuverFuel + batteryMass;

  // Calculate total engine mass
  const totalEngineMass = engines.reduce((sum, engine) => sum + engine.mass, 0);

  // Calculate remaining mass available for fuel (assuming we need some buffer)
  const usedMass = totalEngineMass; // This should include other ship components in a real calculation
  const remainingMass = shipTonnage - usedMass;
  const fuelFitsInShip = totalFuelMass <= remainingMass;

  // Calculate maximum weeks possible given remaining mass
  const maxPossibleWeeks = maneuverDrive.performance > 0
    ? Math.floor(2 * (remainingMass - adjustedJumpFuel - batteryMass) / (shipTonnage * 0.01 * maneuverDrive.performance * (useAntimatter ? 0.1 : 1)))
    : 12;
  const effectiveMaxWeeks = Math.min(12, Math.max(1, maxPossibleWeeks));

  const handleExternalFuelToggle = (checked: boolean) => {
    if (checked) {
      alert(
        'External fuel source selected:\n\n' +
        'Jump fuel is provided by external fuelers at departure, so no jump fuel tankage is needed. ' +
        'The ship can only jump from systems that have external fuel suppliers available. ' +
        'An additional 1% of the ship\'s mass in batteries is required to power the final seconds ' +
        'before the jump, after the fueler disconnects and moves clear.'
      );
    }
    onExternalFuelUpdate(checked);
  };
  
  const requiredEnginesConfigured = 
    engines.some(e => e.engine_type === 'power_plant' && e.drive_code && e.performance >= 1) &&
    engines.some(e => e.engine_type === 'jump_drive' && e.drive_code && e.performance >= 1);
  
  const allEnginesConfigured = requiredEnginesConfigured &&
    powerRequirementsMet &&
    fuelFitsInShip;

  return (
    <div className="panel-content">
      <p>Configure the engine types for your starship. Power Plant and Jump Drive are required. Maneuver Drive is optional (defaults to M-0).</p>
      <p><small><strong>Note:</strong> Jump and Maneuver drives require a Power Plant with equal or higher performance rating.</small></p>
      
      <div className="engines-horizontal-layout">
        {renderEngineInput('power_plant', 'Power Plant')}
        {renderEngineInput('maneuver_drive', 'Maneuver Drive')}
        {renderEngineInput('jump_drive', 'Jump Drive')}
      </div>

      <div className="fuel-section">
        <h3>Fuel Requirements</h3>
        <div className="fuel-horizontal-layout">
          <div className="fuel-selection">
            <div className="form-group">
              <label htmlFor="fuel-weeks">Power Plant Fuel Duration</label>
              <select
                id="fuel-weeks"
                value={fuelWeeks}
                onChange={(e) => onFuelWeeksUpdate(parseInt(e.target.value))}
              >
                {Array.from({length: effectiveMaxWeeks}, (_, i) => i + 1).map(weeks => (
                  <option key={weeks} value={weeks}>
                    {weeks} {weeks === 1 ? 'week' : 'weeks'}
                  </option>
                ))}
              </select>
              <small>Maximum {effectiveMaxWeeks} weeks based on available mass</small>
            </div>
            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={externalFuel}
                  onChange={(e) => handleExternalFuelToggle(e.target.checked)}
                />
                External fuel source
              </label>
              <small>
                Jump fuel supplied by external fuelers; requires {calculateJumpBatteryMass(shipTonnage).toFixed(1)} tons
                of jump batteries (1% of hull). Jumps only possible from systems with fueler support.
              </small>
            </div>
          </div>

          <div className="fuel-summary">
            <h4>Fuel Mass Breakdown{useAntimatter ? ' (Antimatter)' : ''}:</h4>
            <table>
              <tbody>
                <tr>
                  <td>Jump Fuel (per jump):</td>
                  <td>{adjustedJumpFuel.toFixed(1)} tons</td>
                  <td><small>{externalFuel && jumpDrive.performance > 0
                    ? '(supplied by external fuelers)'
                    : `(${jumpDrive.performance > 0 ? `J-${jumpDrive.performance}` : 'No Jump Drive'} × 0.1 × ${shipTonnage}t${useAntimatter ? ' × 0.1 antimatter' : ''})`}</small></td>
                </tr>
                {batteryMass > 0 && (
                  <tr>
                    <td>Jump Batteries:</td>
                    <td>{batteryMass.toFixed(1)} tons</td>
                    <td><small>(1% of hull, powers the final seconds before jump)</small></td>
                  </tr>
                )}
                <tr>
                  <td>Maneuver Fuel ({fuelWeeks} weeks):</td>
                  <td>{adjustedManeuverFuel.toFixed(1)} tons</td>
                  <td><small>({maneuverDrive.performance > 0 ? `M-${maneuverDrive.performance}` : 'No Maneuver Drive'} × 0.01 × {shipTonnage}t × {fuelWeeks/2}{useAntimatter ? ' × 0.1 antimatter' : ''})</small></td>
                </tr>
                {useAntimatter && (
                  <tr className="antimatter-savings">
                    <td><em>Antimatter Fuel Savings:</em></td>
                    <td><em>{((jumpFuel + maneuverFuel) * 0.9).toFixed(1)} tons saved</em></td>
                    <td><small><em>90% reduction from standard fuel</em></small></td>
                  </tr>
                )}
                <tr className="total-row">
                  <td><strong>Total Fuel Mass:</strong></td>
                  <td><strong>{totalFuelMass.toFixed(1)} tons</strong></td>
                  <td><small>{((totalFuelMass / shipTonnage) * 100).toFixed(1)}% of ship mass</small></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="validation-info">
        <h3>Requirements:</h3>
        <ul>
          <li className={engines.some(e => e.engine_type === 'power_plant') ? 'valid' : 'invalid'}>
            ✓ Power Plant configured
          </li>
          <li className={'valid'}>
            ✓ Maneuver Drive configured (M-0 if none selected)
          </li>
          <li className={engines.some(e => e.engine_type === 'jump_drive') ? 'valid' : 'invalid'}>
            ✓ Jump Drive configured
          </li>
          <li className={powerRequirementsMet ? 'valid' : 'invalid'}>
            ✓ Power Plant provides sufficient power for Jump and Maneuver drives
          </li>
          <li className={fuelFitsInShip ? 'valid' : 'invalid'}>
            ✓ Fuel requirements fit within available ship mass
          </li>
          <li className={allEnginesConfigured ? 'valid' : 'invalid'}>
            ✓ Required engines have valid drive selection with automatic mass and cost
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
            {/* Always show all three engine types */}
            {['power_plant', 'maneuver_drive', 'jump_drive'].map(engineType => {
              const engine = getEngine(engineType as Engine['engine_type']);
              return (
                <tr key={engineType}>
                  <td>{engineType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</td>
                  <td>{engine.drive_code || '-'}</td>
                  <td>{engine.performance} ({engineType === 'jump_drive' ? 'J' : engineType === 'maneuver_drive' ? 'M' : 'P'}-{engine.performance})</td>
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