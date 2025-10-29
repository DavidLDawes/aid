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

  const updateVehicleQuantity = (vehicleType: typeof availableVehicles[0], quantity: number) => {
    const validQuantity = Math.max(0, Math.floor(quantity));
    const existingVehicle = vehicles.find(v => v.vehicle_type === vehicleType.type);

    if (validQuantity === 0) {
      onUpdate(vehicles.filter(v => v.vehicle_type !== vehicleType.type));
    } else if (existingVehicle) {
      const newVehicles = vehicles.map(v =>
        v.vehicle_type === vehicleType.type
          ? { ...v, quantity: validQuantity }
          : v
      );
      onUpdate(newVehicles);
    } else {
      onUpdate([...vehicles, {
        vehicle_type: vehicleType.type as Vehicle['vehicle_type'],
        quantity: validQuantity,
        mass: vehicleType.mass,
        cost: vehicleType.cost
      }]);
    }
  };

  const groupedVehicles = [];
  for (let i = 0; i < availableVehicles.length; i += 3) {
    groupedVehicles.push(availableVehicles.slice(i, i + 3));
  }

  return (
    <div className="panel-content">
      <p>Configure vehicles carried by the starship. Only vehicles compatible with TL-{shipTechLevel} are available.</p>
      <p><strong>Total Service Staff Required:</strong> {totalServiceStaff}</p>
      
      <div className="vehicles-grouped-layout">
        {groupedVehicles.map((vehicleGroup, groupIndex) => (
          <div key={groupIndex} className="vehicle-group-row">
            {vehicleGroup.map(vehicleType => {
              const currentVehicle = vehicles.find(v => v.vehicle_type === vehicleType.type);
              const quantity = currentVehicle?.quantity || 0;

              return (
                <div key={vehicleType.type} className="component-item">
                  <div className="component-info">
                    <h4>{vehicleType.name}</h4>
                    <p>{vehicleType.mass} tons, {vehicleType.cost} MCr</p>
                    {quantity > 0 && (
                      <p><strong>Total:</strong> {(vehicleType.mass * quantity).toFixed(1)} tons, {(vehicleType.cost * quantity).toFixed(3)} MCr</p>
                    )}
                  </div>
                  <div className="quantity-control">
                    <label>
                      Quantity:
                      <input
                        type="number"
                        min="0"
                        value={quantity}
                        onChange={(e) => updateVehicleQuantity(vehicleType, parseInt(e.target.value) || 0)}
                        style={{ width: '60px', marginLeft: '0.5rem' }}
                      />
                    </label>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
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

      <div className="vehicle-attribution">
        <p>
          <a 
            href="https://drive.google.com/drive/folders/1DKuxqeL2wTd8Hh9rsScdXkm2WdMubYps" 
            target="_blank" 
            rel="noopener noreferrer"
          >
            Vehicles from the MgT2 collection, jut used their data.
          </a>
        </p>
      </div>
    </div>
  );
};

export default VehiclesPanel;