import React from 'react';
import type { Fitting, Engine } from '../types/ship';
import { getBridgeMassAndCost, COMMS_SENSORS_TYPES, getMinimumComputer, COMPUTER_TYPES, TECH_LEVELS } from '../data/constants';

interface FittingsPanelProps {
  fittings: Fitting[];
  shipTonnage: number;
  shipTechLevel: string;
  engines: Engine[];
  shipSections?: number;
  onUpdate: (fittings: Fitting[]) => void;
}

const FittingsPanel: React.FC<FittingsPanelProps> = ({ fittings, shipTonnage, shipTechLevel, engines, shipSections, onUpdate }) => {
  const hasBridge = fittings.some(f => f.fitting_type === 'bridge');
  const hasHalfBridge = fittings.some(f => f.fitting_type === 'half_bridge');
  const launchTubes = fittings.filter(f => f.fitting_type === 'launch_tube');
  const commsSensors = fittings.find(f => f.fitting_type === 'comms_sensors');
  const computer = fittings.find(f => f.fitting_type === 'computer');

  // Calculate bridge multiplier based on sections (each section needs command module)
  const sectionMultiplier = shipSections || 1;

  // Generate bridge label text based on sections
  const getBridgeLabel = (isHalfBridge: boolean): string => {
    const bridgeType = isHalfBridge ? 'Half Bridge' : 'Bridge';

    if (!shipSections || shipSections < 2) {
      return bridgeType;
    }

    if (shipSections === 2) {
      return `${bridgeType} and Section Command`;
    }

    // For 3+ sections: "Bridge and N Section Commands"
    const sectionCommands = shipSections - 1;
    return `${bridgeType} and ${sectionCommands} Section Command${sectionCommands > 1 ? 's' : ''}`;
  };

  const setBridgeType = (isHalfBridge: boolean) => {
    const { mass, cost } = getBridgeMassAndCost(shipTonnage, isHalfBridge);
    const newFittings = fittings.filter(f => f.fitting_type !== 'bridge' && f.fitting_type !== 'half_bridge');

    // Multiply by section count for capital ships
    const totalMass = mass * sectionMultiplier;
    const totalCost = cost * sectionMultiplier;

    newFittings.push({
      fitting_type: isHalfBridge ? 'half_bridge' : 'bridge',
      mass: totalMass,
      cost: totalCost
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

  const setCommsSensorsType = (sensorType: typeof COMMS_SENSORS_TYPES[0]) => {
    const newFittings = fittings.filter(f => f.fitting_type !== 'comms_sensors');

    newFittings.push({
      fitting_type: 'comms_sensors',
      comms_sensors_type: sensorType.type as any,
      mass: sensorType.mass,
      cost: sensorType.cost
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
          computer_model: computerModel as any,
          mass: 0, // Computers don't take tonnage
          cost: selectedComputer.cost
        });
      }
    }

    onUpdate(newFittings);
  };

  return (
    <div className="panel-content">
      <div className="form-group">
        <h3>Bridge Type (Required) *</h3>
        {shipSections && shipSections >= 2 && (
          <p className="info-message">
            Capital ships require a bridge plus command modules for each section ({shipSections} total).
          </p>
        )}
        <div className="radio-group">
          <label>
            <input
              type="radio"
              checked={hasBridge}
              onChange={() => setBridgeType(false)}
            />
            {getBridgeLabel(false)} ({getBridgeMassAndCost(shipTonnage, false).mass * sectionMultiplier} tons, {getBridgeMassAndCost(shipTonnage, false).cost * sectionMultiplier} MCr)
          </label>
          <label>
            <input
              type="radio"
              checked={hasHalfBridge}
              onChange={() => setBridgeType(true)}
            />
            {getBridgeLabel(true)} ({getBridgeMassAndCost(shipTonnage, true).mass * sectionMultiplier} tons, {getBridgeMassAndCost(shipTonnage, true).cost * sectionMultiplier} MCr)
          </label>
        </div>
      </div>

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

      <div className="form-group">
        <h3>Comms & Sensors</h3>
        <p>Communications and sensor systems for the starship. Standard is included by default.</p>
        
        <label htmlFor="comms-sensors">Comms & Sensors Type</label>
        <select
          id="comms-sensors"
          value={commsSensors?.comms_sensors_type || 'standard'}
          onChange={(e) => {
            const selectedType = COMMS_SENSORS_TYPES.find(t => t.type === e.target.value);
            if (selectedType) {
              setCommsSensorsType(selectedType);
            }
          }}
        >
          {COMMS_SENSORS_TYPES.map(sensorType => (
            <option key={sensorType.type} value={sensorType.type}>
              {sensorType.name} ({sensorType.mass} tons, {sensorType.cost} MCr)
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <h3>Computer</h3>
        {(() => {
          const jumpDrive = engines.find(e => e.engine_type === 'jump_drive');
          const jumpPerformance = jumpDrive?.performance || 0;
          const minimumComputer = getMinimumComputer(shipTonnage, jumpPerformance);

          // Always show computers that meet tech level requirements
          // TECH_LEVELS: ['A', 'B', 'C', ...] where A=TL10, B=TL11, etc.
          const allAvailableComputers = COMPUTER_TYPES.filter(comp => {
            const shipTechLevelIndex = TECH_LEVELS.indexOf(shipTechLevel);
            if (shipTechLevelIndex === -1) return false;

            const shipNumericTL = shipTechLevelIndex + 10; // A=10, B=11, C=12, etc.
            return comp.techLevel <= shipNumericTL;
          });

          // Determine the starting index for available computers based on minimum requirement
          const minimumIndex = minimumComputer
            ? COMPUTER_TYPES.findIndex(c => c.name === minimumComputer.name)
            : -1;

          return (
            <>
              {minimumComputer ? (
                <p>
                  Minimum required: <strong>{minimumComputer.name}</strong> (TL {minimumComputer.techLevel}, Rating {minimumComputer.rating})
                  <br />
                  <small>Based on ship size ({shipTonnage.toLocaleString()} tons) and jump performance (J-{jumpPerformance})</small>
                </p>
              ) : (
                <p className="info-message">
                  No computer required for this configuration, but you may install one if desired.
                  {jumpPerformance === 0 && <><br /><small>Ships with jump drives may require computers depending on tonnage and jump performance.</small></>}
                </p>
              )}

              {allAvailableComputers.length === 0 ? (
                <p className="warning-message">
                  {minimumComputer
                    ? `Ship requires ${minimumComputer.name} but current tech level is too low (TL ${minimumComputer.techLevel} required).`
                    : `No computers available at current tech level (TL ${shipTechLevel}).`
                  }
                </p>
              ) : (
                <>
                  <label htmlFor="computer">Computer Model</label>
                  <select
                    id="computer"
                    value={computer?.computer_model || ''}
                    onChange={(e) => setComputerType(e.target.value || null)}
                  >
                    <option value="">None</option>
                    {allAvailableComputers.map(comp => {
                      const isValid = minimumIndex === -1 || COMPUTER_TYPES.findIndex(c => c.model === comp.model) >= minimumIndex;
                      return (
                        <option key={comp.model} value={comp.model}>
                          {comp.name} - Rating {comp.rating}, TL {comp.techLevel}, {comp.cost} MCr
                          {!isValid ? ' (below minimum)' : ''}
                        </option>
                      );
                    })}
                  </select>
                  {computer && (() => {
                    const selectedComp = COMPUTER_TYPES.find(c => c.model === computer.computer_model);
                    if (selectedComp) {
                      return (
                        <small>
                          Selected: {selectedComp.name}, Rating {selectedComp.rating}, Cost: {selectedComp.cost} MCr (0 tons)
                        </small>
                      );
                    }
                    return null;
                  })()}
                </>
              )}
            </>
          );
        })()}
      </div>

      <div className="validation-info">
        <h3>Requirements:</h3>
        <ul>
          <li className={hasBridge || hasHalfBridge ? 'valid' : 'invalid'}>
            ✓ Bridge or Half Bridge selected
          </li>
          {(() => {
            const jumpDrive = engines.find(e => e.engine_type === 'jump_drive');
            const jumpPerformance = jumpDrive?.performance || 0;
            const minimumComputer = getMinimumComputer(shipTonnage, jumpPerformance);

            if (minimumComputer) {
              const hasValidComputer = computer && COMPUTER_TYPES.findIndex(c => c.model === computer.computer_model) >=
                COMPUTER_TYPES.findIndex(c => c.name === minimumComputer.name);

              return (
                <li className={hasValidComputer ? 'valid' : 'invalid'}>
                  {hasValidComputer ? '✓' : '✗'} Computer ({minimumComputer.name} or better required)
                </li>
              );
            }
            return null;
          })()}
        </ul>
      </div>
    </div>
  );
};

export default FittingsPanel;