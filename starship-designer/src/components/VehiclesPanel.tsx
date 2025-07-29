import React from 'react';
import type { Vehicle } from '../types/ship';

interface VehiclesPanelProps {
  vehicles: Vehicle[];
  onUpdate: (vehicles: Vehicle[]) => void;
}

const VehiclesPanel: React.FC<VehiclesPanelProps> = ({ vehicles, onUpdate }) => {
  return (
    <div className="panel-content">
      <p>Configure vehicles carried by the starship.</p>
      <p>Vehicle configuration coming soon...</p>
    </div>
  );
};

export default VehiclesPanel;