import React from 'react';
import type { Cargo } from '../types/ship';
import { CARGO_TYPES } from '../data/constants';
import { calculateMonthsBetweenService, getSparesIncrement } from '../utils/sparesCalculation';

interface CargoPanelProps {
  cargo: Cargo[];
  remainingMass: number;
  shipTonnage: number;
  onUpdate: (cargo: Cargo[]) => void;
}

const CargoPanel: React.FC<CargoPanelProps> = ({ cargo, remainingMass, shipTonnage, onUpdate }) => {
  const updateCargoTonnage = (cargoType: typeof CARGO_TYPES[0], newTonnage: number) => {
    const newCargo = [...cargo];
    const existingIndex = newCargo.findIndex(c => c.cargo_type === cargoType.type);
    
    if (newTonnage === 0) {
      // Remove cargo if tonnage is 0
      if (existingIndex >= 0) {
        newCargo.splice(existingIndex, 1);
      }
    } else {
      const cargoData: Cargo = {
        cargo_type: cargoType.type as Cargo['cargo_type'],
        tonnage: newTonnage,
        cost: cargoType.costPerTon * newTonnage
      };
      
      if (existingIndex >= 0) {
        newCargo[existingIndex] = cargoData;
      } else {
        newCargo.push(cargoData);
      }
    }
    
    onUpdate(newCargo);
  };

  const getCargoTonnage = (cargoType: string): number => {
    const cargoItem = cargo.find(c => c.cargo_type === cargoType);
    return cargoItem?.tonnage || 0;
  };

  const getTotalCargoTonnage = (): number => {
    return cargo.reduce((sum, c) => sum + c.tonnage, 0);
  };

  const getSparesTonnage = (): number => {
    const sparesItem = cargo.find(c => c.cargo_type === 'spares');
    return sparesItem?.tonnage || 0;
  };

  return (
    <div className="panel-content">
      <p>Configure cargo storage. Remaining mass: {remainingMass.toFixed(1)} tons</p>
      <p>Total cargo: {getTotalCargoTonnage()} tons</p>
      
      <div className="cargo-grouped-layout">
        {/* Row 1: Basic Storage */}
        <div className="cargo-group-row">
          {CARGO_TYPES.slice(0, 3).map(cargoType => {
            const tonnage = getCargoTonnage(cargoType.type);
            const maxTonnage = Math.floor(remainingMass + tonnage);
            
            // Special handling for Spares
            if (cargoType.type === 'spares') {
              const increment = getSparesIncrement(tonnage, shipTonnage);
              return (
                <div key={cargoType.type} className="component-item">
                  <div className="component-info">
                    <h4>{cargoType.name}</h4>
                    <p>{cargoType.costPerTon} MCr per ton</p>
                    {tonnage > 0 && (
                      <p><strong>Total:</strong> {tonnage} tons, {(cargoType.costPerTon * tonnage).toFixed(2)} MCr</p>
                    )}
                  </div>
                  <div className="quantity-control">
                    <button 
                      onClick={() => updateCargoTonnage(cargoType, Math.max(0, tonnage - increment))}
                      disabled={tonnage === 0}
                    >
                      -
                    </button>
                    <span>{tonnage} tons</span>
                    <button 
                      onClick={() => updateCargoTonnage(cargoType, Math.min(maxTonnage, tonnage + increment))}
                      disabled={tonnage + increment > maxTonnage}
                    >
                      +
                    </button>
                  </div>
                </div>
              );
            }
            
            return (
              <div key={cargoType.type} className="component-item">
                <div className="component-info">
                  <h4>{cargoType.name}</h4>
                  <p>{cargoType.costPerTon} MCr per ton</p>
                  {tonnage > 0 && (
                    <p><strong>Total:</strong> {tonnage} tons, {(cargoType.costPerTon * tonnage).toFixed(2)} MCr</p>
                  )}
                </div>
                <div className="tonnage-control">
                  <label>
                    Tonnage:
                    <input
                      type="number"
                      min="0"
                      max={maxTonnage}
                      value={tonnage}
                      onChange={(e) => updateCargoTonnage(cargoType, Math.max(0, Math.min(maxTonnage, parseInt(e.target.value) || 0)))}
                      style={{ width: '60px', marginLeft: '0.5rem' }}
                    />
                    <small>/{maxTonnage}</small>
                  </label>
                </div>
              </div>
            );
          })}
        </div>

        {/* Row 2: Specialized Storage */}
        <div className="cargo-group-row">
          {CARGO_TYPES.slice(3, 6).map(cargoType => {
            const tonnage = getCargoTonnage(cargoType.type);
            const maxTonnage = Math.floor(remainingMass + tonnage);
            
            return (
              <div key={cargoType.type} className="component-item">
                <div className="component-info">
                  <h4>{cargoType.name}</h4>
                  <p>{cargoType.costPerTon} MCr per ton</p>
                  {tonnage > 0 && (
                    <p><strong>Total:</strong> {tonnage} tons, {(cargoType.costPerTon * tonnage).toFixed(2)} MCr</p>
                  )}
                </div>
                <div className="tonnage-control">
                  <label>
                    Tonnage:
                    <input
                      type="number"
                      min="0"
                      max={maxTonnage}
                      value={tonnage}
                      onChange={(e) => updateCargoTonnage(cargoType, Math.max(0, Math.min(maxTonnage, parseInt(e.target.value) || 0)))}
                      style={{ width: '60px', marginLeft: '0.5rem' }}
                    />
                    <small>/{maxTonnage}</small>
                  </label>
                </div>
              </div>
            );
          })}
        </div>

        {/* Row 3: Life Support Storage */}
        <div className="cargo-group-row">
          {CARGO_TYPES.slice(6, 8).map(cargoType => {
            const tonnage = getCargoTonnage(cargoType.type);
            const maxTonnage = Math.floor(remainingMass + tonnage);
            
            return (
              <div key={cargoType.type} className="component-item">
                <div className="component-info">
                  <h4>{cargoType.name}</h4>
                  <p>{cargoType.costPerTon} MCr per ton</p>
                  {tonnage > 0 && (
                    <p><strong>Total:</strong> {tonnage} tons, {(cargoType.costPerTon * tonnage).toFixed(2)} MCr</p>
                  )}
                </div>
                <div className="tonnage-control">
                  <label>
                    Tonnage:
                    <input
                      type="number"
                      min="0"
                      max={maxTonnage}
                      value={tonnage}
                      onChange={(e) => updateCargoTonnage(cargoType, Math.max(0, Math.min(maxTonnage, parseInt(e.target.value) || 0)))}
                      style={{ width: '60px', marginLeft: '0.5rem' }}
                    />
                    <small>/{maxTonnage}</small>
                  </label>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="cargo-summary">
        <h3>Cargo Summary</h3>
        {cargo.length === 0 ? (
          <p>No cargo configured.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Cargo Type</th>
                <th>Tonnage</th>
                <th>Cost per Ton</th>
                <th>Total Cost (MCr)</th>
              </tr>
            </thead>
            <tbody>
              {cargo.map(cargoItem => (
                <tr key={cargoItem.cargo_type}>
                  <td>{CARGO_TYPES.find(ct => ct.type === cargoItem.cargo_type)?.name || cargoItem.cargo_type}</td>
                  <td>{cargoItem.tonnage}</td>
                  <td>{CARGO_TYPES.find(ct => ct.type === cargoItem.cargo_type)?.costPerTon || 0}</td>
                  <td>{cargoItem.cost.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="service-interval">
        <h3>Maintenance Schedule</h3>
        <div className="service-info">
          <p><strong>Months Between Service:</strong> {calculateMonthsBetweenService(getSparesTonnage(), shipTonnage)}</p>
          <p className="service-calculation">
            Based on: 1 + {getSparesTonnage()} spares ÷ {shipTonnage} ship tons × 100 = 1 + {Math.floor(getSparesTonnage() / shipTonnage * 100)}
          </p>
        </div>
      </div>

    </div>
  );
};

export default CargoPanel;