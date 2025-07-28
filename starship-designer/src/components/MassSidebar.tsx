import React from 'react';
import { MassCalculation, CostCalculation } from '../types/ship';

interface MassSidebarProps {
  mass: MassCalculation;
  cost: CostCalculation;
}

const MassSidebar: React.FC<MassSidebarProps> = ({ mass, cost }) => {
  return (
    <aside className="mass-sidebar">
      <div className="mass-tracker">
        <h3>Mass Tracker</h3>
        <div className="mass-item">
          <span>Total:</span>
          <span>{mass.total.toFixed(1)} tons</span>
        </div>
        <div className="mass-item">
          <span>Used:</span>
          <span>{mass.used.toFixed(1)} tons</span>
        </div>
        <div className={`mass-item ${mass.isOverweight ? 'overweight' : ''}`}>
          <span>Remaining:</span>
          <span>{mass.remaining.toFixed(1)} tons</span>
        </div>
        
        {mass.isOverweight && (
          <div className="warning">
            ⚠️ Ship is overweight! Remove components.
          </div>
        )}
      </div>

      <div className="cost-tracker">
        <h3>Cost Tracker</h3>
        <div className="cost-item">
          <span>Total Cost:</span>
          <span>{Math.round(cost.total)} MCr</span>
        </div>
      </div>
    </aside>
  );
};

export default MassSidebar;