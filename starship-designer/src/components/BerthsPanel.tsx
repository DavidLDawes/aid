import React from 'react';
import { Berth } from '../types/ship';

interface BerthsPanelProps {
  berths: Berth[];
  onUpdate: (berths: Berth[]) => void;
}

const BerthsPanel: React.FC<BerthsPanelProps> = ({ berths, onUpdate }) => {
  return (
    <div className="panel-content">
      <p>Configure crew and passenger accommodations.</p>
      <p>Berth configuration coming soon...</p>
    </div>
  );
};

export default BerthsPanel;