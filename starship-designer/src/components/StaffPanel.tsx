import React from 'react';
import { StaffRequirements, Berth } from '../types/ship';

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
        <p>Stewards: {staffRequirements.stewards}</p>
        <p><strong>Total Staff: {staffRequirements.total}</strong></p>
      </div>
      
      <p>Staff accommodation validation coming soon...</p>
    </div>
  );
};

export default StaffPanel;