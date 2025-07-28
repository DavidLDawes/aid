import React from 'react';
import { Cargo } from '../types/ship';

interface CargoPanelProps {
  cargo: Cargo[];
  remainingMass: number;
  onUpdate: (cargo: Cargo[]) => void;
}

const CargoPanel: React.FC<CargoPanelProps> = ({ cargo, remainingMass, onUpdate }) => {
  return (
    <div className="panel-content">
      <p>Configure cargo storage. Remaining mass: {remainingMass.toFixed(1)} tons</p>
      <p>Cargo configuration coming soon...</p>
    </div>
  );
};

export default CargoPanel;