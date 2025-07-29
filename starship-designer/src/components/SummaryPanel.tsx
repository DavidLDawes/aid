import React from 'react';
import type { ShipDesign, MassCalculation, CostCalculation, StaffRequirements } from '../types/ship';

interface SummaryPanelProps {
  shipDesign: ShipDesign;
  mass: MassCalculation;
  cost: CostCalculation;
  staff: StaffRequirements;
}

const SummaryPanel: React.FC<SummaryPanelProps> = ({ shipDesign, mass, cost, staff }) => {
  return (
    <div className="panel-content">
      <h3>Ship Design Summary</h3>
      
      <div className="summary-section">
        <h4>Basic Information</h4>
        <p><strong>Name:</strong> {shipDesign.ship.name}</p>
        <p><strong>Tech Level:</strong> {shipDesign.ship.tech_level}</p>
        <p><strong>Tonnage:</strong> {shipDesign.ship.tonnage} tons</p>
        {shipDesign.ship.description && (
          <p><strong>Description:</strong> {shipDesign.ship.description}</p>
        )}
      </div>

      <div className="summary-section">
        <h4>Mass & Cost</h4>
        <p><strong>Total Mass:</strong> {mass.total} tons</p>
        <p><strong>Used Mass:</strong> {mass.used.toFixed(1)} tons</p>
        <p><strong>Remaining Mass:</strong> {mass.remaining.toFixed(1)} tons</p>
        <p><strong>Total Cost:</strong> {Math.round(cost.total)} MCr</p>
        
        {mass.isOverweight && (
          <div className="warning">
            ⚠️ WARNING: Ship design exceeds tonnage limit!
          </div>
        )}
      </div>

      <div className="summary-section">
        <h4>Staff Requirements</h4>
        <p><strong>Total Staff:</strong> {staff.total}</p>
      </div>

      <div className="summary-actions">
        <button className="save-btn">Save Design</button>
        <button className="load-btn">Load Design</button>
      </div>
    </div>
  );
};

export default SummaryPanel;