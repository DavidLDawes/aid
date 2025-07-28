import React from 'react';
import { Defense } from '../types/ship';

interface DefensesPanelProps {
  defenses: Defense[];
  shipTonnage: number;
  onUpdate: (defenses: Defense[]) => void;
}

const DefensesPanel: React.FC<DefensesPanelProps> = ({ defenses, shipTonnage, onUpdate }) => {
  return (
    <div className="panel-content">
      <p>Defense systems for your starship.</p>
      <div className="form-group">
        <label>Armor (tons)</label>
        <input type="number" min="0" step="0.1" defaultValue="0" />
      </div>
      <p>More defense options coming soon...</p>
    </div>
  );
};

export default DefensesPanel;