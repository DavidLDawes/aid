import React from 'react';
import type { Vehicle, ModularCutterModule } from '../types/ship';
import {
  getAvailableVehicles, calculateVehicleServiceStaff,
  MODULE_TYPES, getModularCutterCount, calculateModularCutterBayMass, calculateModularCutterModuleCost
} from '../data/constants';

interface VehiclesPanelProps {
  vehicles: Vehicle[];
  shipTechLevel: string;
  modularCutterModules: ModularCutterModule[];
  onUpdate: (vehicles: Vehicle[]) => void;
  onModulesUpdate: (modules: ModularCutterModule[]) => void;
}

const VehiclesPanel: React.FC<VehiclesPanelProps> = ({ vehicles, shipTechLevel, modularCutterModules, onUpdate, onModulesUpdate }) => {
  const availableVehicles = getAvailableVehicles(shipTechLevel);
  const totalServiceStaff = calculateVehicleServiceStaff(vehicles);
  const modularCutterCount = getModularCutterCount(vehicles);
  const spareModuleCount = modularCutterModules.reduce((sum, m) => sum + m.quantity, 0);
  const moduleBayMass = calculateModularCutterBayMass(modularCutterCount, spareModuleCount);
  const moduleCost = calculateModularCutterModuleCost(modularCutterModules);

  const addModule = (moduleType: typeof MODULE_TYPES[0]) => {
    const existingModule = modularCutterModules.find(m => m.module_type === moduleType.type);
    if (existingModule) {
      onModulesUpdate(modularCutterModules.map(m =>
        m.module_type === moduleType.type ? { ...m, quantity: m.quantity + 1 } : m
      ));
    } else {
      onModulesUpdate([...modularCutterModules, {
        module_type: moduleType.type as ModularCutterModule['module_type'],
        quantity: 1
      }]);
    }
  };

  const removeModule = (moduleType: string) => {
    const newModules = modularCutterModules.map(m =>
      m.module_type === moduleType
        ? { ...m, quantity: Math.max(0, m.quantity - 1) }
        : m
    ).filter(m => m.quantity > 0);
    onModulesUpdate(newModules);
  };

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
                const serviceStaff = vehicleType ? vehicle.quantity * vehicleType.serviceStaff : 0;

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

      {modularCutterCount > 0 && (
        <div className="module-bay-section">
          <h3>Modular Cutter Modules</h3>
          <p>
            Each Modular Cutter's 50 tons already includes one installed module at no extra cost.
            Carrying spare modules to swap in requires a reload bay retrofit across all {modularCutterCount} cutter{modularCutterCount === 1 ? '' : 's'}:
            the first spare costs 60 tons/cutter (bay + module), every spare after that is a flat +30 tons.
          </p>
          <p><strong>Spare Modules:</strong> {spareModuleCount} &nbsp; <strong>Reload Bay + Spares Mass:</strong> {moduleBayMass.toFixed(1)} tons &nbsp; <strong>Spare Modules Cost:</strong> {moduleCost.toFixed(1)} MCr</p>

          <div className="vehicles-grouped-layout">
            <div className="vehicle-group-row">
              {MODULE_TYPES.map(moduleType => {
                const currentModule = modularCutterModules.find(m => m.module_type === moduleType.type);
                const quantity = currentModule?.quantity || 0;

                return (
                  <div key={moduleType.type} className="component-item">
                    <div className="component-info">
                      <h4>{moduleType.name}</h4>
                      <p>{moduleType.mass} tons, {moduleType.cost} MCr</p>
                      <p>{moduleType.description}</p>
                    </div>
                    <div className="quantity-control">
                      <button
                        onClick={() => removeModule(moduleType.type)}
                        disabled={quantity === 0}
                      >
                        -
                      </button>
                      <span>{quantity}</span>
                      <button
                        onClick={() => addModule(moduleType)}
                      >
                        +
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="vehicle-summary">
            <h3>Module Summary</h3>
            {modularCutterModules.length === 0 ? (
              <p>No modules configured.</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Module Type</th>
                    <th>Quantity</th>
                    <th>Mass (t)</th>
                    <th>Cost (MCr)</th>
                  </tr>
                </thead>
                <tbody>
                  {modularCutterModules.map(module => {
                    const moduleType = MODULE_TYPES.find(mt => mt.type === module.module_type);

                    return (
                      <tr key={module.module_type}>
                        <td>{moduleType?.name || module.module_type}</td>
                        <td>{module.quantity}</td>
                        <td>{(module.quantity * 30).toFixed(1)}</td>
                        <td>{((moduleType?.cost ?? 0) * module.quantity).toFixed(3)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      <div className="vehicle-attribution">
        <p>
          <a
            href="https://drive.google.com/drive/folders/1DKuxqeL2wTd8Hh9rsScdXkm2WdMubYps"
            target="_blank" 
            rel="noopener noreferrer"
          >
            Vehicles from the MgT2 collection, just used their data.
          </a>
        </p>
      </div>
    </div>
  );
};

export default VehiclesPanel;