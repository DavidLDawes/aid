import React from 'react';
import type { Berth, StaffRequirements } from '../types/ship';
import { BERTH_TYPES } from '../data/constants';

interface BerthsPanelProps {
  berths: Berth[];
  staffRequirements: StaffRequirements;
  onUpdate: (berths: Berth[]) => void;
}

const BerthsPanel: React.FC<BerthsPanelProps> = ({ berths, staffRequirements, onUpdate }) => {
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
        mass: berthType.mass * newQuantity,
        cost: berthType.cost * newQuantity
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

  const hasEnoughStaterooms = (): boolean => {
    return getTotalStaterooms() >= staffRequirements.total;
  };

  return (
    <div className="panel-content">
      <p>Configure crew and passenger accommodations. Staterooms are required for all crew members.</p>
      
      <div className="berth-requirements">
        <h3>Crew Requirements</h3>
        <p><strong>Total Crew:</strong> {staffRequirements.total}</p>
        <p><strong>Total Staterooms:</strong> {getTotalStaterooms()}</p>
        <p className={hasEnoughStaterooms() ? 'valid' : 'invalid'}>
          {hasEnoughStaterooms() ? '✓ Sufficient staterooms' : '⚠️ Need more staterooms for crew'}
        </p>
      </div>

      <div className="berth-selection">
        <h3>Berth Options</h3>
        {BERTH_TYPES.map(berthType => {
          const quantity = getBerthQuantity(berthType.type);
          const isStateroom = berthType.type === 'staterooms' || berthType.type === 'luxury_staterooms';
          
          return (
            <div key={berthType.type} className="berth-item">
              <div className="berth-info">
                <h4>{berthType.name} {berthType.required && '(Required)'}</h4>
                <p>{berthType.mass} tons, {berthType.cost} MCr each</p>
                {quantity > 0 && (
                  <p><strong>Total:</strong> {(berthType.mass * quantity).toFixed(1)} tons, {(berthType.cost * quantity).toFixed(2)} MCr</p>
                )}
              </div>
              <div className="quantity-control">
                <button 
                  onClick={() => updateBerthQuantity(berthType, Math.max(0, quantity - 1))}
                  disabled={quantity === 0}
                >
                  -
                </button>
                <span>{quantity}</span>
                <button 
                  onClick={() => updateBerthQuantity(berthType, quantity + 1)}
                >
                  +
                </button>
              </div>
            </div>
          );
        })}
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
                  <td>{berth.mass.toFixed(1)}</td>
                  <td>{berth.cost.toFixed(2)}</td>
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
            {hasEnoughStaterooms() ? '✓' : '✗'} At least {staffRequirements.total} staterooms for crew
          </li>
        </ul>
      </div>
    </div>
  );
};

export default BerthsPanel;