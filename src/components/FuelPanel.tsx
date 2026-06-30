import React from 'react';
import type { FuelSystem, Engine } from '../types/ship';
import { FUEL_SYSTEM_TYPES, PLANT_PER_SCOOP, getMegastructureSections } from '../data/constants';

interface FuelPanelProps {
  fuelSystems: FuelSystem[];
  engines: Engine[];
  shipTonnage: number;
  onUpdate: (fuelSystems: FuelSystem[]) => void;
}

const FuelPanel: React.FC<FuelPanelProps> = ({ fuelSystems, engines, shipTonnage, onUpdate }) => {
  const sections = getMegastructureSections(shipTonnage);
  const maxScoopsPerSection = 1000;
  const maxScoops = maxScoopsPerSection * sections;

  const powerPlant = engines.find(e => e.engine_type === 'power_plant');
  const powerPlantPerformance = powerPlant?.performance || 0;
  const hasP10 = powerPlantPerformance >= 10;

  const getSystem = (type: FuelSystem['system_type']): FuelSystem | undefined =>
    fuelSystems.find(s => s.system_type === type);

  const getQuantity = (type: FuelSystem['system_type']): number =>
    getSystem(type)?.quantity ?? 0;

  const setQuantity = (type: FuelSystem['system_type'], quantity: number) => {
    const spec = FUEL_SYSTEM_TYPES.find(s => s.type === type)!;
    const clampedQty = Math.max(0, quantity);
    const mass = clampedQty * spec.massPerUnit;
    const cost = clampedQty * spec.costPerUnit;

    const newSystems = fuelSystems.filter(s => s.system_type !== type);
    if (clampedQty > 0) {
      newSystems.push({ system_type: type, quantity: clampedQty, mass, cost });
    }
    onUpdate(newSystems);
  };

  const scoopQty = getQuantity('fuel_scoop');
  const processorQty = getQuantity('fuel_processor');
  const tankQty = getQuantity('fuel_tank');
  const amPlantQty = getQuantity('antimatter_plant');

  // Plant is auto-calculated: 100 tons, 1 MCr per scoop
  const plantMass = scoopQty * PLANT_PER_SCOOP.mass;
  const plantCost = scoopQty * PLANT_PER_SCOOP.cost;

  // Outputs
  const fuelProcessingPerDay = processorQty * 20000;
  const amFuelPerDay = amPlantQty * 1200;

  return (
    <div className="panel-content">
      <p>
        Configure fuel infrastructure for the megastructure. Scoops collect raw fuel, processors refine it,
        tanks store it, and plant provides the support infrastructure. Allocate in the increments shown.
      </p>
      <p><small><strong>Sections:</strong> {sections} × 1,000,000-ton sections</small></p>

      {/* Fuel Scoops */}
      <div className="form-group">
        <h3>Fuel Scoops</h3>
        <p>No tonnage, 1 MCr per scoop. Maximum {maxScoops.toLocaleString()} scoops ({maxScoopsPerSection.toLocaleString()} per section × {sections} sections).</p>
        <div className="component-item">
          <div className="component-info">
            <h4>Fuel Scoops — 0 tons, 1 MCr each</h4>
          </div>
          <div className="quantity-control">
            <label>
              Quantity:
              <input
                type="number"
                min="0"
                max={maxScoops}
                value={scoopQty}
                onChange={(e) => setQuantity('fuel_scoop', Math.min(maxScoops, parseInt(e.target.value) || 0))}
                style={{ width: '100px', marginLeft: '0.5rem' }}
              />
              / {maxScoops.toLocaleString()} max
            </label>
          </div>
          {scoopQty > 0 && (
            <p><strong>Cost:</strong> {scoopQty.toLocaleString()} MCr</p>
          )}
        </div>
      </div>

      {/* Plant — auto-calculated from scoops */}
      {scoopQty > 0 && (
        <div className="form-group">
          <h3>Fuel Plant (Auto-calculated)</h3>
          <p>Pipelines, treatment, separators, pumps, and valves: 100 tons and 1 MCr per fuel scoop.</p>
          <div className="info-message">
            <p><strong>Plant:</strong> {plantMass.toLocaleString()} tons, {plantCost.toLocaleString()} MCr</p>
            <p><small>({scoopQty.toLocaleString()} scoops × 100 tons, × 1 MCr)</small></p>
          </div>
        </div>
      )}

      {/* Fuel Processors */}
      <div className="form-group">
        <h3>Fuel Processors</h3>
        <p>1,000 tons each, 50 MCr each. Output: 20,000 tons of refined fuel per day per unit.</p>
        <div className="component-item">
          <div className="component-info">
            <h4>Fuel Processor Units — 1,000 tons, 50 MCr each</h4>
          </div>
          <div className="quantity-control">
            <label>
              Units:
              <input
                type="number"
                min="0"
                value={processorQty}
                onChange={(e) => setQuantity('fuel_processor', parseInt(e.target.value) || 0)}
                style={{ width: '100px', marginLeft: '0.5rem' }}
              />
            </label>
          </div>
          {processorQty > 0 && (
            <p>
              <strong>Total:</strong> {(processorQty * 1000).toLocaleString()} tons,{' '}
              {(processorQty * 50).toLocaleString()} MCr —{' '}
              Output: {fuelProcessingPerDay.toLocaleString()} tons/day
            </p>
          )}
        </div>
      </div>

      {/* Fuel Tanks */}
      <div className="form-group">
        <h3>Fuel Tanks</h3>
        <p>1,000 tons each, 1 MCr each. Stores refined fuel.</p>
        <div className="component-item">
          <div className="component-info">
            <h4>Fuel Tank Units — 1,000 tons, 1 MCr each</h4>
          </div>
          <div className="quantity-control">
            <label>
              Units:
              <input
                type="number"
                min="0"
                value={tankQty}
                onChange={(e) => setQuantity('fuel_tank', parseInt(e.target.value) || 0)}
                style={{ width: '100px', marginLeft: '0.5rem' }}
              />
            </label>
          </div>
          {tankQty > 0 && (
            <p>
              <strong>Total:</strong> {(tankQty * 1000).toLocaleString()} tons,{' '}
              {tankQty.toLocaleString()} MCr — Capacity: {(tankQty * 1000).toLocaleString()} tons fuel
            </p>
          )}
        </div>
      </div>

      {/* Antimatter Plant */}
      <div className="form-group">
        <h3>Antimatter Plant</h3>
        <p>
          100,000 tons per unit, 1,000 MCr per unit. Output: 1,200 tons AM fuel/day per unit.
          <strong> Requires P-10 power plant.</strong>
        </p>
        {!hasP10 ? (
          <p className="warning-message">
            ⚠ Antimatter Plant requires a P-10 Power Plant (current: {powerPlantPerformance > 0 ? `P-${powerPlantPerformance}` : 'none'}).
          </p>
        ) : (
          <div className="component-item">
            <div className="component-info">
              <h4>Antimatter Plant Units — 100,000 tons, 1,000 MCr each</h4>
            </div>
            <div className="quantity-control">
              <label>
                Units:
                <input
                  type="number"
                  min="0"
                  value={amPlantQty}
                  onChange={(e) => setQuantity('antimatter_plant', parseInt(e.target.value) || 0)}
                  style={{ width: '100px', marginLeft: '0.5rem' }}
                />
              </label>
            </div>
            {amPlantQty > 0 && (
              <p>
                <strong>Total:</strong> {(amPlantQty * 100000).toLocaleString()} tons,{' '}
                {(amPlantQty * 1000).toLocaleString()} MCr —{' '}
                Output: {amFuelPerDay.toLocaleString()} tons AM/day
              </p>
            )}
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="fuel-section">
        <h3>Fuel Infrastructure Summary</h3>
        <table>
          <thead>
            <tr>
              <th>System</th>
              <th>Quantity</th>
              <th>Mass (tons)</th>
              <th>Cost (MCr)</th>
              <th>Output/Notes</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Fuel Scoops</td>
              <td>{scoopQty.toLocaleString()}</td>
              <td>0</td>
              <td>{scoopQty.toLocaleString()}</td>
              <td>Raw fuel collection</td>
            </tr>
            {scoopQty > 0 && (
              <tr>
                <td>Plant (auto)</td>
                <td>{scoopQty.toLocaleString()} units</td>
                <td>{plantMass.toLocaleString()}</td>
                <td>{plantCost.toLocaleString()}</td>
                <td>Support per scoop</td>
              </tr>
            )}
            <tr>
              <td>Fuel Processors</td>
              <td>{processorQty}</td>
              <td>{(processorQty * 1000).toLocaleString()}</td>
              <td>{(processorQty * 50).toLocaleString()}</td>
              <td>{fuelProcessingPerDay.toLocaleString()} tons/day</td>
            </tr>
            <tr>
              <td>Fuel Tanks</td>
              <td>{tankQty}</td>
              <td>{(tankQty * 1000).toLocaleString()}</td>
              <td>{tankQty.toLocaleString()}</td>
              <td>{(tankQty * 1000).toLocaleString()} ton capacity</td>
            </tr>
            {hasP10 && (
              <tr>
                <td>Antimatter Plant</td>
                <td>{amPlantQty}</td>
                <td>{(amPlantQty * 100000).toLocaleString()}</td>
                <td>{(amPlantQty * 1000).toLocaleString()}</td>
                <td>{amFuelPerDay.toLocaleString()} tons AM/day</td>
              </tr>
            )}
            <tr className="total-row">
              <td><strong>Total</strong></td>
              <td>—</td>
              <td><strong>{(plantMass + processorQty * 1000 + tankQty * 1000 + amPlantQty * 100000).toLocaleString()}</strong></td>
              <td><strong>{(scoopQty + plantCost + processorQty * 50 + tankQty + amPlantQty * 1000).toLocaleString()}</strong></td>
              <td>—</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FuelPanel;
