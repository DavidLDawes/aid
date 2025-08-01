import React from 'react';
import type { Drone } from '../types/ship';
import { DRONE_TYPES } from '../data/constants';

interface DronesPanelProps {
  drones: Drone[];
  onUpdate: (drones: Drone[]) => void;
}

const DronesPanel: React.FC<DronesPanelProps> = ({ drones, onUpdate }) => {
  const addDrone = (droneType: typeof DRONE_TYPES[0]) => {
    const existingDrone = drones.find(d => d.drone_type === droneType.type);
    if (existingDrone) {
      const newDrones = drones.map(d =>
        d.drone_type === droneType.type
          ? { ...d, quantity: d.quantity + 1 }
          : d
      );
      onUpdate(newDrones);
    } else {
      onUpdate([...drones, {
        drone_type: droneType.type as Drone['drone_type'],
        quantity: 1,
        mass: droneType.mass,
        cost: droneType.cost
      }]);
    }
  };

  const removeDrone = (droneType: string) => {
    const newDrones = drones.map(d =>
      d.drone_type === droneType
        ? { ...d, quantity: Math.max(0, d.quantity - 1) }
        : d
    ).filter(d => d.quantity > 0);
    onUpdate(newDrones);
  };

  const groupedDrones = [];
  for (let i = 0; i < DRONE_TYPES.length; i += 3) {
    groupedDrones.push(DRONE_TYPES.slice(i, i + 3));
  }

  return (
    <div className="panel-content">
      <p>Configure drones and robotic units carried by the starship.</p>
      
      <div className="drones-grouped-layout">
        {groupedDrones.map((droneGroup, groupIndex) => (
          <div key={groupIndex} className="drone-group-row">
            {droneGroup.map(droneType => {
              const currentDrone = drones.find(d => d.drone_type === droneType.type);
              const quantity = currentDrone?.quantity || 0;

              return (
                <div key={droneType.type} className="component-item">
                  <div className="component-info">
                    <h4>{droneType.name}</h4>
                    <p>{droneType.mass} tons, {droneType.cost} MCr</p>
                    {quantity > 0 && (
                      <p><strong>Total:</strong> {(droneType.mass * quantity).toFixed(1)} tons, {(droneType.cost * quantity).toFixed(3)} MCr</p>
                    )}
                  </div>
                  <div className="quantity-control">
                    <button 
                      onClick={() => removeDrone(droneType.type)}
                      disabled={quantity === 0}
                    >
                      -
                    </button>
                    <span>{quantity}</span>
                    <button 
                      onClick={() => addDrone(droneType)}
                    >
                      +
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <div className="drone-summary">
        <h3>Drone Summary</h3>
        {drones.length === 0 ? (
          <p>No drones configured.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Drone Type</th>
                <th>Quantity</th>
                <th>Mass (t)</th>
                <th>Cost (MCr)</th>
              </tr>
            </thead>
            <tbody>
              {drones.map(drone => {
                const droneType = DRONE_TYPES.find(dt => dt.type === drone.drone_type);
                
                return (
                  <tr key={drone.drone_type}>
                    <td>{droneType?.name || drone.drone_type}</td>
                    <td>{drone.quantity}</td>
                    <td>{(drone.mass * drone.quantity).toFixed(1)}</td>
                    <td>{(drone.cost * drone.quantity).toFixed(3)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

    </div>
  );
};

export default DronesPanel;