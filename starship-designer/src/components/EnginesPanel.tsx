import React from 'react';
import type { Engine } from '../types/ship';
import { getAvailableEngines } from '../data/constants';

interface EnginesPanelProps {
  engines: Engine[];
  shipTonnage: number;
  onUpdate: (engines: Engine[]) => void;
}

const EnginesPanel: React.FC<EnginesPanelProps> = ({ engines, shipTonnage, onUpdate }) => {
  const maxMass = Math.floor(shipTonnage * 0.95 * 10) / 10; // 95% of ship tonnage, rounded to 0.1

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
    const availableEngines = getAvailableEngines(shipTonnage, type);

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
                    performance: selectedEngine.performance
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
          </div>

          <div className="form-group">
            <label>Mass (tons) *</label>
            <input
              type="number"
              min="0.1"
              max={maxMass}
              step="0.1"
              value={engine.mass}
              onChange={(e) => {
                const value = parseFloat(e.target.value) || 0.1;
                updateEngine(type, { 
                  mass: Math.min(maxMass, Math.max(0.1, Math.round(value * 10) / 10))
                });
              }}
            />
            <small>0.1 - {maxMass} tons</small>
          </div>

          <div className="form-group">
            <label>Cost (MCr) *</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={engine.cost}
              onChange={(e) => updateEngine(type, { 
                cost: Math.max(0, parseFloat(e.target.value) || 0) 
              })}
            />
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

  const allEnginesConfigured = engines.length === 3 && 
    engines.every(e => e.drive_code && e.performance >= 1 && e.performance <= 10 && e.mass >= 0.1 && e.cost >= 0);

  return (
    <div className="panel-content">
      <p>Configure the three required engine types for your starship.</p>
      
      {renderEngineInput('power_plant', 'Power Plant')}
      {renderEngineInput('maneuver_drive', 'Maneuver Drive')}
      {renderEngineInput('jump_drive', 'Jump Drive')}

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
          <li className={allEnginesConfigured ? 'valid' : 'invalid'}>
            ✓ All engines have valid drive selection, mass (≥0.1), and cost (≥0)
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