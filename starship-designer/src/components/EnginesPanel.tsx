import React, { useState } from 'react';
import type { Engine } from '../types/ship';
import { getAvailableEngines, calculateJumpFuel, calculateManeuverFuel, calculateTotalFuelMass } from '../data/constants';

interface EnginesPanelProps {
  engines: Engine[];
  shipTonnage: number;
  fuelWeeks: number;
  onUpdate: (engines: Engine[]) => void;
  onFuelWeeksUpdate: (weeks: number) => void;
}

const EnginesPanel: React.FC<EnginesPanelProps> = ({ engines, shipTonnage, fuelWeeks, onUpdate, onFuelWeeksUpdate }) => {

  const getEngine = (type: Engine['engine_type']): Engine => {
    return engines.find(e => e.engine_type === type) || {
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

  const renderEngineInput = (type: Engine['engine_type'], label: string) => {
    const engine = getEngine(type);
    const powerPlant = getEngine('power_plant');
    const powerPlantPerformance = powerPlant.performance > 0 ? powerPlant.performance : undefined;
    const availableEngines = getAvailableEngines(shipTonnage, type, powerPlantPerformance);

    return (
      <div key={type} className="engine-group">
        <h3>{label}</h3>
        
        <div className="form-row">
          <div className="form-group">
            <label>Drive Selection *</label>
            <select
              value={engine.drive_code}
              onChange={(e) => {
                const selectedEngine = availableEngines.find(eng => eng.code === e.target.value);
                if (selectedEngine) {
                  updateEngine(type, { 
                    drive_code: selectedEngine.code,
                    performance: selectedEngine.performance,
                    mass: selectedEngine.mass,
                    cost: selectedEngine.cost
                  });
                }
              }}
            >
              <option value="">Select a drive...</option>
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
              <small className="warning">Configure Power Plant first to see available options</small>
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
  
  // Calculate fuel requirements
  const jumpFuel = jumpDrive.performance > 0 ? calculateJumpFuel(shipTonnage, jumpDrive.performance) : 0;
  const maneuverFuel = maneuverDrive.performance > 0 ? calculateManeuverFuel(shipTonnage, maneuverDrive.performance, fuelWeeks) : 0;
  const totalFuelMass = jumpFuel + maneuverFuel;
  
  // Calculate total engine mass
  const totalEngineMass = engines.reduce((sum, engine) => sum + engine.mass, 0);
  
  // Calculate remaining mass available for fuel (assuming we need some buffer)
  const usedMass = totalEngineMass; // This should include other ship components in a real calculation
  const remainingMass = shipTonnage - usedMass;
  const fuelFitsInShip = totalFuelMass <= remainingMass;
  
  // Calculate maximum weeks possible given remaining mass
  const maxPossibleWeeks = maneuverDrive.performance > 0 
    ? Math.floor(2 * (remainingMass - jumpFuel) / (shipTonnage * 0.01 * maneuverDrive.performance))
    : 12;
  const effectiveMaxWeeks = Math.min(12, Math.max(2, maxPossibleWeeks));
  
  const allEnginesConfigured = engines.length === 3 && 
    engines.every(e => e.drive_code && e.performance >= 1 && e.performance <= 10 && e.mass > 0 && e.cost > 0) &&
    powerRequirementsMet &&
    fuelFitsInShip;

  return (
    <div className="panel-content">
      <p>Configure the three required engine types for your starship.</p>
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
              <label htmlFor="fuel-weeks">Maneuver Drive Fuel Duration</label>
              <select
                id="fuel-weeks"
                value={fuelWeeks}
                onChange={(e) => onFuelWeeksUpdate(parseInt(e.target.value))}
              >
                {Array.from({length: effectiveMaxWeeks - 1}, (_, i) => i + 2).map(weeks => (
                  <option key={weeks} value={weeks}>
                    {weeks} weeks
                  </option>
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
                  <td>Jump Fuel (per jump):</td>
                  <td>{jumpFuel.toFixed(1)} tons</td>
                  <td><small>({jumpDrive.performance > 0 ? `J-${jumpDrive.performance}` : 'No Jump Drive'} × 0.1 × {shipTonnage}t)</small></td>
                </tr>
                <tr>
                  <td>Maneuver Fuel ({fuelWeeks} weeks):</td>
                  <td>{maneuverFuel.toFixed(1)} tons</td>
                  <td><small>({maneuverDrive.performance > 0 ? `M-${maneuverDrive.performance}` : 'No Maneuver Drive'} × 0.01 × {shipTonnage}t × {fuelWeeks/2})</small></td>
                </tr>
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
          <li className={engines.some(e => e.engine_type === 'maneuver_drive') ? 'valid' : 'invalid'}>
            ✓ Maneuver Drive configured
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
            ✓ All engines have valid drive selection with automatic mass and cost
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
            {engines.map(engine => (
              <tr key={engine.engine_type}>
                <td>{engine.engine_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</td>
                <td>{engine.drive_code || '-'}</td>
                <td>{engine.performance} ({engine.engine_type === 'jump_drive' ? 'J' : engine.engine_type === 'maneuver_drive' ? 'M' : 'P'}-{engine.performance})</td>
                <td>{engine.mass.toFixed(1)}</td>
                <td>{engine.cost.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
};

export default EnginesPanel;