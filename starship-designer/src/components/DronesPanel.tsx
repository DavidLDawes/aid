import React from 'react';
import type { Drone } from '../types/ship';

interface DronesPanelProps {
  drones: Drone[];
  onUpdate: (drones: Drone[]) => void;
}

const DronesPanel: React.FC<DronesPanelProps> = ({ drones, onUpdate }) => {
  return (
    <div className="panel-content">
      <p>Configure drones carried by the starship.</p>
      <p>Drone configuration coming soon...</p>
    </div>
  );
};

export default DronesPanel;