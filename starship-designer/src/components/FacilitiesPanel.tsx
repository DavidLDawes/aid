import React from 'react';
import type { Facility } from '../types/ship';
import { FACILITY_TYPES } from '../data/constants';

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

  const addFacility = (facilityType: typeof FACILITY_TYPES[0]) => {
    const existingFacility = facilities.find(f => f.facility_type === facilityType.type);
    if (existingFacility) {
      const newFacilities = facilities.map(f =>
        f.facility_type === facilityType.type
          ? { ...f, quantity: f.quantity + 1 }
          : f
      );
      onUpdate(newFacilities);
    } else {
      onUpdate([...facilities, {
        facility_type: facilityType.type as Facility['facility_type'],
        quantity: 1,
        mass: facilityType.mass,
        cost: facilityType.cost
      }]);
    }
  };

  const removeFacility = (facilityType: string) => {
    const newFacilities = facilities.map(f =>
      f.facility_type === facilityType
        ? { ...f, quantity: Math.max(0, f.quantity - 1) }
        : f
    ).filter(f => f.quantity > 0);
    onUpdate(newFacilities);
  };

  return (
    <div className="panel-content">
      <p>Recreation and health facilities. Commissary is required.</p>
      
      {!hasCommissary && (
        <button onClick={addCommissary}>Add Required Commissary</button>
      )}
      
      <div className="component-list">
        {FACILITY_TYPES.map(facilityType => {
          const currentFacility = facilities.find(f => f.facility_type === facilityType.type);
          const quantity = currentFacility?.quantity || 0;

          return (
            <div key={facilityType.type} className="component-item">
              <div className="component-info">
                <h4>{facilityType.name}, {facilityType.mass} tons, {facilityType.cost} MCr</h4>
              </div>
              <div className="quantity-control">
                <button 
                  onClick={() => removeFacility(facilityType.type)}
                  disabled={quantity === 0}
                >
                  -
                </button>
                <span>{quantity}</span>
                <button 
                  onClick={() => addFacility(facilityType)}
                >
                  +
                </button>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="validation-info">
        <h3>Requirements:</h3>
        <ul>
          <li className={hasCommissary ? 'valid' : 'invalid'}>
            ✓ Commissary is required
          </li>
        </ul>
      </div>
    </div>
  );
};

export default FacilitiesPanel;