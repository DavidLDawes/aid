import React from 'react';
import type { Vehicle } from '../types/ship';
import { getAvailableVehicles, calculateVehicleServiceStaff } from '../data/constants';

interface VehiclesPanelProps {
  vehicles: Vehicle[];
  shipTechLevel: string;
  onUpdate: (vehicles: Vehicle[]) => void;
}

const VehiclesPanel: React.FC<VehiclesPanelProps> = ({ vehicles, shipTechLevel, onUpdate }) => {
  const availableVehicles = getAvailableVehicles(shipTechLevel);
  const totalServiceStaff = calculateVehicleServiceStaff(vehicles);

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
      <p><strong>Total Service Staff Required:</strong> {totalServiceStaff}</p>
      
      <div className="component-list">
        {availableVehicles.map(vehicleType => {
          const currentVehicle = vehicles.find(v => v.vehicle_type === vehicleType.type);
          const quantity = currentVehicle?.quantity || 0;

          return (
            <div key={vehicleType.type} className="component-item">
              <div className="component-info">
                <h4>{vehicleType.name}, {vehicleType.mass} tons, {vehicleType.cost} MCr, TL: {vehicleType.techLevel}, Service Staff: {vehicleType.serviceStaff}</h4>
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
                <th>Service Staff</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map(vehicle => {
                const vehicleType = availableVehicles.find(vt => vt.type === vehicle.vehicle_type);
                let serviceStaff = 0;
                if (vehicleType) {
                  if (vehicleType.serviceStaff === 0.25) {
                    serviceStaff = Math.ceil(vehicle.quantity * vehicleType.serviceStaff);
                  } else if (vehicleType.serviceStaff === 0.5) {
                    serviceStaff = Math.ceil(vehicle.quantity * vehicleType.serviceStaff);
                  } else {
                    serviceStaff = vehicle.quantity * vehicleType.serviceStaff;
                  }
                }
                
                return (
                  <tr key={vehicle.vehicle_type}>
                    <td>{vehicleType?.name || vehicle.vehicle_type}</td>
                    <td>{vehicle.quantity}</td>
                    <td>{(vehicle.mass * vehicle.quantity).toFixed(1)}</td>
                    <td>{(vehicle.cost * vehicle.quantity).toFixed(3)}</td>
                    <td>{serviceStaff}</td>
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

export default VehiclesPanel;