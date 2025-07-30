import React from 'react';
import type { Vehicle } from '../types/ship';
import { getAvailableVehicles } from '../data/constants';

interface VehiclesPanelProps {
  vehicles: Vehicle[];
  shipTechLevel: string;
  onUpdate: (vehicles: Vehicle[]) => void;
}

const VehiclesPanel: React.FC<VehiclesPanelProps> = ({ vehicles, shipTechLevel, onUpdate }) => {
  const availableVehicles = getAvailableVehicles(shipTechLevel);

  const addVehicle = (vehicleType: typeof availableVehicles[0]) => {
    const existingVehicle = vehicles.find(v => v.vehicle_type === vehicleType.type);
    if (existingVehicle) {
      const newVehicles = vehicles.map(v =>
        v.vehicle_type === vehicleType.type
          ? { ...v, quantity: v.quantity + 1 }
          : v
      );
      onUpdate(newVehicles);
    } else {
      onUpdate([...vehicles, {
        vehicle_type: vehicleType.type as Vehicle['vehicle_type'],
        quantity: 1,
        mass: vehicleType.mass,
        cost: vehicleType.cost
      }]);
    }
  };

  const removeVehicle = (vehicleType: string) => {
    const newVehicles = vehicles.map(v =>
      v.vehicle_type === vehicleType
        ? { ...v, quantity: Math.max(0, v.quantity - 1) }
        : v
    ).filter(v => v.quantity > 0);
    onUpdate(newVehicles);
  };

  return (
    <div className="panel-content">
      <p>Configure vehicles carried by the starship. Only vehicles compatible with TL-{shipTechLevel} are available.</p>
      
      <div className="component-list">
        {availableVehicles.map(vehicleType => {
          const currentVehicle = vehicles.find(v => v.vehicle_type === vehicleType.type);
          const quantity = currentVehicle?.quantity || 0;

          return (
            <div key={vehicleType.type} className="component-item">
              <div className="component-info">
                <h4>{vehicleType.name}</h4>
                <p>Mass: {vehicleType.mass} tons, Cost: {vehicleType.cost} MCr, TL: {vehicleType.techLevel}</p>
              </div>
              <div className="quantity-control">
                <button 
                  onClick={() => removeVehicle(vehicleType.type)}
                  disabled={quantity === 0}
                >
                  -
                </button>
                <span>{quantity}</span>
                <button 
                  onClick={() => addVehicle(vehicleType)}
                >
                  +
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="vehicle-summary">
        <h3>Vehicle Summary</h3>
        {vehicles.length === 0 ? (
          <p>No vehicles configured.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Vehicle Type</th>
                <th>Quantity</th>
                <th>Mass (t)</th>
                <th>Cost (MCr)</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map(vehicle => (
                <tr key={vehicle.vehicle_type}>
                  <td>{availableVehicles.find(vt => vt.type === vehicle.vehicle_type)?.name || vehicle.vehicle_type}</td>
                  <td>{vehicle.quantity}</td>
                  <td>{(vehicle.mass * vehicle.quantity).toFixed(1)}</td>
                  <td>{(vehicle.cost * vehicle.quantity).toFixed(3)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default VehiclesPanel;