import React from 'react';
import { Fitting } from '../types/ship';
import { getBridgeMassAndCost } from '../data/constants';

interface FittingsPanelProps {
  fittings: Fitting[];
  shipTonnage: number;
  onUpdate: (fittings: Fitting[]) => void;
}

const FittingsPanel: React.FC<FittingsPanelProps> = ({ fittings, shipTonnage, onUpdate }) => {
  const hasBridge = fittings.some(f => f.fitting_type === 'bridge');
  const hasHalfBridge = fittings.some(f => f.fitting_type === 'half_bridge');
  const launchTubes = fittings.filter(f => f.fitting_type === 'launch_tube');

  const setBridgeType = (isHalfBridge: boolean) => {
    const { mass, cost } = getBridgeMassAndCost(shipTonnage, isHalfBridge);
    const newFittings = fittings.filter(f => f.fitting_type !== 'bridge' && f.fitting_type !== 'half_bridge');
    
    newFittings.push({
      fitting_type: isHalfBridge ? 'half_bridge' : 'bridge',
      mass,
      cost
    });

    onUpdate(newFittings);
  };

  const addLaunchTube = () => {
    const newFittings = [...fittings];
    newFittings.push({
      fitting_type: 'launch_tube',
      mass: 25, // Default 1 ton vehicle = 25 tons tube
      cost: 0.5, // 0.5 MCr per ton
      launch_vehicle_mass: 1
    });
    onUpdate(newFittings);
  };

  const updateLaunchTube = (index: number, vehicleMass: number) => {
    const newFittings = [...fittings];
    const tubeIndex = fittings.findIndex((f, i) => f.fitting_type === 'launch_tube' && fittings.slice(0, i + 1).filter(fit => fit.fitting_type === 'launch_tube').length === index + 1);
    
    if (tubeIndex >= 0) {
      newFittings[tubeIndex] = {
        ...newFittings[tubeIndex],
        launch_vehicle_mass: vehicleMass,
        mass: vehicleMass * 25,
        cost: vehicleMass * 0.5
      };
      onUpdate(newFittings);
    }
  };

  const removeLaunchTube = (index: number) => {
    const newFittings = fittings.filter((f, i) => {
      if (f.fitting_type !== 'launch_tube') return true;
      const tubeIndex = fittings.slice(0, i + 1).filter(fit => fit.fitting_type === 'launch_tube').length - 1;
      return tubeIndex !== index;
    });
    onUpdate(newFittings);
  };

  return (
    <div className="panel-content">
      <div className="form-group">
        <h3>Bridge Type (Required) *</h3>
        <div className="radio-group">
          <label>
            <input
              type="radio"
              checked={hasBridge}
              onChange={() => setBridgeType(false)}
            />
            Full Bridge ({getBridgeMassAndCost(shipTonnage, false).mass} tons, {getBridgeMassAndCost(shipTonnage, false).cost} MCr)
          </label>
          <label>
            <input
              type="radio"
              checked={hasHalfBridge}
              onChange={() => setBridgeType(true)}
            />
            Half Bridge ({getBridgeMassAndCost(shipTonnage, true).mass} tons, {getBridgeMassAndCost(shipTonnage, true).cost} MCr)
          </label>
        </div>
      </div>

      <div className="form-group">
        <h3>Launch Tubes (Optional)</h3>
        <p>Launch tubes allow deployment of vehicles. Each tube is sized for a specific vehicle mass.</p>
        
        {launchTubes.map((tube, index) => (
          <div key={index} className="component-item">
            <div className="component-info">
              <h4>Launch Tube {index + 1}</h4>
              <p>Mass: {tube.mass} tons, Cost: {tube.cost} MCr</p>
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
              <button onClick={() => removeLaunchTube(index)} className="remove-btn">
                Remove
              </button>
            </div>
          </div>
        ))}

        <button onClick={addLaunchTube} className="add-btn">
          Add Launch Tube
        </button>
      </div>

      <div className="validation-info">
        <h3>Requirements:</h3>
        <ul>
          <li className={hasBridge || hasHalfBridge ? 'valid' : 'invalid'}>
            ✓ Bridge or Half Bridge selected
          </li>
        </ul>
      </div>
    </div>
  );
};

export default FittingsPanel;