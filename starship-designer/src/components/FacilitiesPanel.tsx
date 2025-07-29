import React from 'react';
import type { Facility } from '../types/ship';

interface FacilitiesPanelProps {
  facilities: Facility[];
  onUpdate: (facilities: Facility[]) => void;
}

const FacilitiesPanel: React.FC<FacilitiesPanelProps> = ({ facilities, onUpdate }) => {
  const hasCommissary = facilities.some(f => f.facility_type === 'commissary');

  const addCommissary = () => {
    if (!hasCommissary) {
      onUpdate([...facilities, {
        facility_type: 'commissary',
        quantity: 1,
        mass: 2,
        cost: 0.2
      }]);
    }
  };

  return (
    <div className="panel-content">
      <p>Recreation and health facilities. Commissary is required.</p>
      
      {!hasCommissary && (
        <button onClick={addCommissary}>Add Required Commissary</button>
      )}
      
      <div className="validation-info">
        <h3>Requirements:</h3>
        <ul>
          <li className={hasCommissary ? 'valid' : 'invalid'}>
            ✓ Commissary is required
          </li>
        </ul>
      </div>
      
      <p>More facilities coming soon...</p>
    </div>
  );
};

export default FacilitiesPanel;