import React from 'react';
import type { StaffRequirements, Berth } from '../types/ship';

interface StaffPanelProps {
  staffRequirements: StaffRequirements;
  berths: Berth[];
}

const StaffPanel: React.FC<StaffPanelProps> = ({ staffRequirements, berths }) => {
  return (
    <div className="panel-content">
      <h3>Staff Requirements</h3>

      <div className="staff-breakdown">
        <p>Pilot: {staffRequirements.pilot}</p>
        <p>Navigator: {staffRequirements.navigator}</p>
        <p>Engineers: {staffRequirements.engineers}</p>
        <p>Gunners: {staffRequirements.gunners}</p>
        <p>Service (Vehicle & Drone Maintenance): {staffRequirements.service}</p>
        <p>Stewards: {staffRequirements.stewards}</p>
        <p>Nurses: {staffRequirements.nurses}</p>
        <p>Surgeons: {staffRequirements.surgeons}</p>
        <p>Techs: {staffRequirements.techs}</p>
        <p><strong>Total Staff: {staffRequirements.total}</strong></p>
      </div>

      <p><small>{berths.filter(b => b.berth_type === 'staterooms' || b.berth_type === 'luxury_staterooms').reduce((sum, b) => sum + b.quantity, 0).toLocaleString()} staterooms available for crew and passengers.</small></p>
    </div>
  );
};

export default StaffPanel;
