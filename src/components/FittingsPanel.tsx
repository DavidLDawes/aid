import React from 'react';
import type { Fitting, Engine } from '../types/ship';
import {
  COMMS_SENSORS_TYPES, COMPUTER_TYPES, TECH_LEVELS,
  calculateControlCenterMass, calculateControlCenterCost,
  getMegastructureSections, getMegastructureSensorMassAndCost, getMegastructureComputerCost
} from '../data/constants';

interface FittingsPanelProps {
  fittings: Fitting[];
  shipTonnage: number;
  shipTechLevel: string;
  engines: Engine[];
  shipSections?: number;
  onUpdate: (fittings: Fitting[]) => void;
}

const FittingsPanel: React.FC<FittingsPanelProps> = ({ fittings, shipTonnage, shipTechLevel, onUpdate }) => {
  const sections = getMegastructureSections(shipTonnage);
  const controlCenterMass = calculateControlCenterMass(shipTonnage);
  const controlCenterCost = calculateControlCenterCost(shipTonnage);

  const launchTubes = fittings.filter(f => f.fitting_type === 'launch_tube');
  const commsSensors = fittings.find(f => f.fitting_type === 'comms_sensors');
  const computer = fittings.find(f => f.fitting_type === 'computer');

  const addLaunchTube = () => {
    onUpdate([...fittings, { fitting_type: 'launch_tube', mass: 25, cost: 0.5, launch_vehicle_mass: 1 }]);
  };

  const updateLaunchTube = (index: number, vehicleMass: number) => {
    const newFittings = [...fittings];
    let tubeCount = 0;
    for (let i = 0; i < newFittings.length; i++) {
      if (newFittings[i].fitting_type === 'launch_tube') {
        if (tubeCount === index) {
          newFittings[i] = { ...newFittings[i], launch_vehicle_mass: vehicleMass, mass: vehicleMass * 25, cost: vehicleMass * 0.5 };
          break;
        }
        tubeCount++;
      }
    }
    onUpdate(newFittings);
  };

  const removeLaunchTube = (index: number) => {
    let tubeCount = 0;
    onUpdate(fittings.filter(f => {
      if (f.fitting_type !== 'launch_tube') return true;
      const keep = tubeCount !== index;
      tubeCount++;
      return keep;
    }));
  };

  const setCommsSensorsType = (sensorType: typeof COMMS_SENSORS_TYPES[0]) => {
    const { mass, cost } = getMegastructureSensorMassAndCost(sensorType.mass, sensorType.cost, shipTonnage);
    const newFittings = fittings.filter(f => f.fitting_type !== 'comms_sensors');
    newFittings.push({
      fitting_type: 'comms_sensors',
      comms_sensors_type: sensorType.type as Fitting['comms_sensors_type'],
      mass,
      cost
    });
    onUpdate(newFittings);
  };

  const setComputerType = (computerModel: string | null) => {
    const newFittings = fittings.filter(f => f.fitting_type !== 'computer');
    if (computerModel) {
      const selectedComputer = COMPUTER_TYPES.find(c => c.model === computerModel);
      if (selectedComputer) {
        newFittings.push({
          fitting_type: 'computer',
          computer_model: computerModel as Fitting['computer_model'],
          mass: 0,
          cost: getMegastructureComputerCost(selectedComputer.cost, shipTonnage)
        });
      }
    }
    onUpdate(newFittings);
  };

  const availableComputers = COMPUTER_TYPES.filter(comp => {
    const shipTechLevelIndex = TECH_LEVELS.indexOf(shipTechLevel);
    if (shipTechLevelIndex === -1) return false;
    return comp.techLevel <= shipTechLevelIndex + 10;
  });

  return (
    <div className="panel-content">

      {/* Control Center — auto-calculated, read-only */}
      <div className="form-group">
        <h3>Control Center (Auto-calculated)</h3>
        <p>
          Megastructures require a 100-ton control center per million-ton section.
          This megastructure has <strong>{sections}</strong> section{sections !== 1 ? 's' : ''}.
        </p>
        <div className="info-message">
          <p><strong>Control Center:</strong> {controlCenterMass.toLocaleString()} tons, {controlCenterCost.toLocaleString()} MCr</p>
          <p><small>({sections} section{sections !== 1 ? 's' : ''} × 100 tons @ 0.5 MCr/ton)</small></p>
        </div>
      </div>

      {/* Launch Tubes */}
      <div className="form-group">
        <h3>Launch Tubes (Optional)</h3>
        <p>Launch tubes allow deployment of vehicles. Each tube is sized for a specific vehicle mass.</p>

        {launchTubes.map((tube, index) => (
          <div key={index} className="component-item">
            <div className="component-info">
              <h4>Launch Tube {index + 1} for {tube.launch_vehicle_mass || 1} ton vehicle</h4>
            </div>
            <div className="component-controls">
              <label>
                Vehicle Mass:
                <input
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={tube.launch_vehicle_mass || 1}
                  onChange={(e) => updateLaunchTube(index, parseFloat(e.target.value) || 1)}
                  style={{ width: '80px', marginLeft: '0.5rem' }}
                />
                tons
              </label>
              <button onClick={() => removeLaunchTube(index)} className="remove-btn">Remove</button>
            </div>
          </div>
        ))}

        <button onClick={addLaunchTube} className="add-btn">Add Launch Tube</button>
      </div>

      {/* Comms & Sensors — 10× per section */}
      <div className="form-group">
        <h3>Comms & Sensors</h3>
        <p>
          Megastructure sensors are 10× a starship's sensor mass and cost, applied per million-ton section
          ({sections} section{sections !== 1 ? 's' : ''} × 10×).
        </p>

        <label htmlFor="comms-sensors">Comms & Sensors Type</label>
        <select
          id="comms-sensors"
          value={commsSensors?.comms_sensors_type || 'standard'}
          onChange={(e) => {
            const selectedType = COMMS_SENSORS_TYPES.find(t => t.type === e.target.value);
            if (selectedType) setCommsSensorsType(selectedType);
          }}
        >
          {COMMS_SENSORS_TYPES.map(sensorType => {
            const { mass, cost } = getMegastructureSensorMassAndCost(sensorType.mass, sensorType.cost, shipTonnage);
            return (
              <option key={sensorType.type} value={sensorType.type}>
                {sensorType.name} ({mass.toLocaleString()} tons, {cost.toLocaleString()} MCr total)
              </option>
            );
          })}
        </select>
        {commsSensors && (
          <small>
            Base: {COMMS_SENSORS_TYPES.find(t => t.type === commsSensors.comms_sensors_type)?.mass ?? 0} tons,{' '}
            {COMMS_SENSORS_TYPES.find(t => t.type === commsSensors.comms_sensors_type)?.cost ?? 0} MCr → ×10 × {sections} sections
            = {commsSensors.mass} tons, {commsSensors.cost} MCr
          </small>
        )}
      </div>

      {/* Computer — 4× per section */}
      <div className="form-group">
        <h3>Computer</h3>
        <p>
          Megastructures use redundant computers: 4× standard cost per million-ton section
          ({sections} section{sections !== 1 ? 's' : ''} × 4×).
        </p>

        {availableComputers.length === 0 ? (
          <p className="warning-message">No computers available at current tech level.</p>
        ) : (
          <>
            <label htmlFor="computer">Computer Model</label>
            <select
              id="computer"
              value={computer?.computer_model || ''}
              onChange={(e) => setComputerType(e.target.value || null)}
            >
              <option value="">None</option>
              {availableComputers.map(comp => (
                <option key={comp.model} value={comp.model}>
                  {comp.name} — Rating {comp.rating}, TL {comp.techLevel},
                  base {comp.cost} MCr → {getMegastructureComputerCost(comp.cost, shipTonnage).toLocaleString()} MCr total
                </option>
              ))}
            </select>
            {computer && (() => {
              const selectedComp = COMPUTER_TYPES.find(c => c.model === computer.computer_model);
              if (selectedComp) {
                return (
                  <small>
                    {selectedComp.name}, Rating {selectedComp.rating},
                    Cost: {computer.cost.toLocaleString()} MCr (0 tons)
                    — base {selectedComp.cost} MCr × 4 × {sections} sections
                  </small>
                );
              }
              return null;
            })()}
          </>
        )}
      </div>

      <div className="validation-info">
        <h3>Status:</h3>
        <ul>
          <li className="valid">✓ Control Center: {controlCenterMass.toLocaleString()} tons (auto-configured)</li>
          <li className={computer ? 'valid' : 'invalid'}>
            {computer ? '✓' : '✗'} Computer selected
          </li>
        </ul>
      </div>
    </div>
  );
};

export default FittingsPanel;
