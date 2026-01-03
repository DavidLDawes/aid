import React, { useEffect } from 'react';
import type { Berth, StaffRequirements } from '../types/ship';
import { BERTH_TYPES } from '../data/constants';

interface BerthsPanelProps {
  berths: Berth[];
  staffRequirements: StaffRequirements;
  adjustedCrewCount?: number;
  onUpdate: (berths: Berth[]) => void;
}

const BerthsPanel: React.FC<BerthsPanelProps> = ({ berths, staffRequirements, adjustedCrewCount, onUpdate }) => {
  const updateBerthQuantity = (berthType: typeof BERTH_TYPES[0], newQuantity: number) => {
    const newBerths = [...berths];
    const existingIndex = newBerths.findIndex(b => b.berth_type === berthType.type);
    
    if (newQuantity === 0) {
      // Remove berth if quantity is 0
      if (existingIndex >= 0) {
        newBerths.splice(existingIndex, 1);
      }
    } else {
      const berthData: Berth = {
        berth_type: berthType.type as Berth['berth_type'],
        quantity: newQuantity,
        mass: berthType.mass,
        cost: berthType.cost
      };
      
      if (existingIndex >= 0) {
        newBerths[existingIndex] = berthData;
      } else {
        newBerths.push(berthData);
      }
    }
    
    onUpdate(newBerths);
  };

  const getBerthQuantity = (berthType: string): number => {
    const berth = berths.find(b => b.berth_type === berthType);
    return berth?.quantity || 0;
  };

  const getTotalStaterooms = (): number => {
    return getBerthQuantity('staterooms') + getBerthQuantity('luxury_staterooms');
  };

  const getEffectiveCrewCount = (): number => {
    return adjustedCrewCount !== undefined ? adjustedCrewCount : staffRequirements.total;
  };

  const hasEnoughStaterooms = (): boolean => {
    return getTotalStaterooms() >= getEffectiveCrewCount();
  };

  const getPassengerCount = (): number => {
    const totalStaterooms = getTotalStaterooms();
    const crewCount = getEffectiveCrewCount();
    return Math.max(0, totalStaterooms - crewCount);
  };

  // Ensure minimum staterooms match crew requirements
  useEffect(() => {
    const totalStaterooms = getTotalStaterooms();
    const crewCount = getEffectiveCrewCount();
    
    if (totalStaterooms < crewCount && crewCount > 0) {
      const shortfall = crewCount - totalStaterooms;
      const currentStaterooms = getBerthQuantity('staterooms');
      
      updateBerthQuantity(
        BERTH_TYPES.find(bt => bt.type === 'staterooms')!,
        currentStaterooms + shortfall
      );
    }
  }, [staffRequirements.total, adjustedCrewCount]);

  return (
    <div className="panel-content">
      <p>Configure crew and passenger accommodations. Staterooms are required for all crew members.</p>
      
      <div className="berth-requirements">
        <h3>Accommodations</h3>
        <p><strong>Total Crew:</strong> {getEffectiveCrewCount()}</p>
        {getPassengerCount() >= 1 && (
          <p><strong>Passengers:</strong> {getPassengerCount()}</p>
        )}
        <p><strong>Total Staterooms:</strong> {getTotalStaterooms()}</p>
        <p className={hasEnoughStaterooms() ? 'valid' : 'invalid'}>
          {hasEnoughStaterooms() ? '✓ Sufficient staterooms' : '⚠️ Need more staterooms for crew'}
        </p>
      </div>

      <div className="berths-grouped-layout">
        <div className="berth-group-row">
          {BERTH_TYPES.map(berthType => {
            const quantity = getBerthQuantity(berthType.type);

            return (
              <div key={berthType.type} className="component-item">
                <div className="component-info">
                  <h4>{berthType.name} {berthType.required && '(Required)'}</h4>
                  <p>{berthType.mass} tons, {berthType.cost} MCr each</p>
                  {quantity > 0 && (
                    <p><strong>Total:</strong> {(berthType.mass * quantity).toFixed(1)} tons, {(berthType.cost * quantity).toFixed(2)} MCr</p>
                  )}
                </div>
                <div className="quantity-control">
                  <label>
                    Quantity:
                    <input
                      type="number"
                      min="0"
                      value={quantity}
                      onChange={(e) => updateBerthQuantity(berthType, parseInt(e.target.value) || 0)}
                      style={{ width: '60px', marginLeft: '0.5rem' }}
                    />
                  </label>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="berth-summary">
        <h3>Berth Summary</h3>
        {berths.length === 0 ? (
          <p>No berths configured.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Berth Type</th>
                <th>Quantity</th>
                <th>Mass (t)</th>
                <th>Cost (MCr)</th>
              </tr>
            </thead>
            <tbody>
              {berths.map(berth => (
                <tr key={berth.berth_type}>
                  <td>{BERTH_TYPES.find(bt => bt.type === berth.berth_type)?.name || berth.berth_type}</td>
                  <td>{berth.quantity}</td>
                  <td>{(berth.mass * berth.quantity).toFixed(1)}</td>
                  <td>{(berth.cost * berth.quantity).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="validation-info">
        <h3>Requirements:</h3>
        <ul>
          <li className={hasEnoughStaterooms() ? 'valid' : 'invalid'}>
            {hasEnoughStaterooms() ? '✓' : '✗'} At least {getEffectiveCrewCount()} staterooms for crew
          </li>
        </ul>
      </div>

    </div>
  );
};

export default BerthsPanel;