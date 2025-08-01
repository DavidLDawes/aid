import { useState } from 'react';
import type { ShipDesign, MassCalculation, CostCalculation, StaffRequirements } from '../types/ship';
import { calculateTotalFuelMass, COMMS_SENSORS_TYPES, DEFENSE_TYPES, FACILITY_TYPES, CARGO_TYPES, VEHICLE_TYPES, DRONE_TYPES, BERTH_TYPES } from '../data/constants';
import { databaseService } from '../services/database';

interface SummaryPanelProps {
  shipDesign: ShipDesign;
  mass: MassCalculation;
  cost: CostCalculation;
  staff: StaffRequirements;
  onBackToShipSelect?: () => void;
}

const SummaryPanel: React.FC<SummaryPanelProps> = ({ shipDesign, mass, cost, staff, onBackToShipSelect }) => {
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // Calculate fuel breakdown for display
  const jumpDrive = shipDesign.engines.find(e => e.engine_type === 'jump_drive');
  const maneuverDrive = shipDesign.engines.find(e => e.engine_type === 'maneuver_drive');
  const jumpPerformance = jumpDrive?.performance || 0;
  const maneuverPerformance = maneuverDrive?.performance || 0;
  const totalFuelMass = calculateTotalFuelMass(shipDesign.ship.tonnage, jumpPerformance, maneuverPerformance, shipDesign.ship.fuel_weeks);

  const handleSaveDesign = async () => {
    if (!shipDesign.ship.name.trim()) {
      setSaveMessage('Please enter a ship name before saving.');
      setTimeout(() => setSaveMessage(null), 3000);
      return;
    }

    try {
      setSaving(true);
      setSaveMessage(null);
      await databaseService.initialize();
      await databaseService.saveShip(shipDesign);
      setSaveMessage('Ship design saved successfully!');
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error) {
      console.error('Error saving ship:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to save ship design. Please try again.';
      setSaveMessage(errorMessage);
      setTimeout(() => setSaveMessage(null), 5000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="panel-content">
      <div className="ship-title-line">
        <h3>{shipDesign.ship.name}, {shipDesign.ship.configuration} configuration, {shipDesign.ship.tonnage} tons, Tech Level {shipDesign.ship.tech_level}</h3>
      </div>

      <div className="ship-components-table">
        <table>
          <thead>
            <tr>
              <th>Category</th>
              <th>Item</th>
              <th>Mass</th>
              <th>Cost</th>
            </tr>
          </thead>
          <tbody>
            {/* Engines */}
            {(() => {
              // Filter out M-0 maneuver drives and create engine rows
              const validEngines = shipDesign.engines.filter(engine => 
                !(engine.engine_type === 'maneuver_drive' && engine.performance === 0)
              );
              
              return validEngines.map((engine, index) => {
                const engineName = engine.engine_type === 'power_plant' ? 'Power Plant' :
                                 engine.engine_type === 'jump_drive' ? 'Jump Drive' :
                                 'Maneuver Drive';
                const performanceCode = engine.engine_type === 'power_plant' ? 'P' :
                                      engine.engine_type === 'jump_drive' ? 'J' :
                                      'M';
                
                return (
                  <tr key={engine.engine_type}>
                    <td>{index === 0 ? 'Engines' : ''}</td>
                    <td>{engineName} {performanceCode}-{engine.performance}</td>
                    <td>{engine.mass.toFixed(1)} tons</td>
                    <td>{engine.cost.toFixed(2)} MCr</td>
                  </tr>
                );
              });
            })()}
            
            {/* Fittings */}
            {(() => {
              const rows = [];
              let fittingRowIndex = 0;
              const hasBridge = shipDesign.fittings.some(f => f.fitting_type === 'bridge');
              const hasHalfBridge = shipDesign.fittings.some(f => f.fitting_type === 'half_bridge');
              const launchTubes = shipDesign.fittings.filter(f => f.fitting_type === 'launch_tube');
              const commsSensors = shipDesign.fittings.find(f => f.fitting_type === 'comms_sensors');
              
              // Bridge (always show if present)
              if (hasBridge || hasHalfBridge) {
                const bridgeType = hasBridge ? 'Bridge' : 'Half Bridge';
                const bridgeData = shipDesign.fittings.find(f => f.fitting_type === 'bridge' || f.fitting_type === 'half_bridge');
                if (bridgeData) {
                  rows.push(
                    <tr key="bridge">
                      <td>{fittingRowIndex === 0 ? 'Fittings' : ''}</td>
                      <td>{bridgeType}</td>
                      <td>{bridgeData.mass.toFixed(1)} tons</td>
                      <td>{bridgeData.cost.toFixed(2)} MCr</td>
                    </tr>
                  );
                  fittingRowIndex++;
                }
              }
              
              // Launch Tubes
              launchTubes.forEach((tube, index) => {
                rows.push(
                  <tr key={`launch_tube_${index}`}>
                    <td>{fittingRowIndex === 0 ? 'Fittings' : ''}</td>
                    <td>Launch Tube ({tube.launch_vehicle_mass || 1} ton vehicle)</td>
                    <td>{tube.mass.toFixed(1)} tons</td>
                    <td>{tube.cost.toFixed(2)} MCr</td>
                  </tr>
                );
                fittingRowIndex++;
              });
              
              // Comms & Sensors
              if (commsSensors) {
                const sensorType = COMMS_SENSORS_TYPES.find(t => t.type === commsSensors.comms_sensors_type);
                rows.push(
                  <tr key="comms_sensors">
                    <td>{fittingRowIndex === 0 ? 'Fittings' : ''}</td>
                    <td>{sensorType?.name || 'Standard'} Comms & Sensors</td>
                    <td>{commsSensors.mass.toFixed(1)} tons</td>
                    <td>{commsSensors.cost.toFixed(2)} MCr</td>
                  </tr>
                );
                fittingRowIndex++;
              }
              
              return rows;
            })()}
            
            {/* Weapons */}
            {(() => {
              const rows = [];
              let weaponRowIndex = 0;
              const activeWeapons = shipDesign.weapons.filter(weapon => weapon.quantity > 0);
              
              // Only add weapons section if there are active weapons
              if (activeWeapons.length > 0) {
                activeWeapons.forEach(weapon => {
                  const weaponDisplay = weapon.quantity === 1 ? weapon.weapon_name : `${weapon.weapon_name} (x${weapon.quantity})`;
                  
                  rows.push(
                    <tr key={`weapon_${weapon.weapon_name}`}>
                      <td>{weaponRowIndex === 0 ? 'Weapons' : ''}</td>
                      <td>{weaponDisplay}</td>
                      <td>{(weapon.mass * weapon.quantity).toFixed(1)} tons</td>
                      <td>{(weapon.cost * weapon.quantity).toFixed(2)} MCr</td>
                    </tr>
                  );
                  weaponRowIndex++;
                });
              }
              
              return rows;
            })()}
            
            {/* Defenses */}
            {(() => {
              const rows = [];
              let defenseRowIndex = 0;
              const activeDefenses = shipDesign.defenses.filter(defense => defense.quantity > 0);
              const hasSand = shipDesign.ship.sand_reloads > 0;
              
              // Only add defenses section if there are active defenses or sand
              if (activeDefenses.length > 0 || hasSand) {
                activeDefenses.forEach(defense => {
                  const defenseType = DEFENSE_TYPES.find(dt => dt.type === defense.defense_type);
                  const defenseName = defenseType?.name || defense.defense_type;
                  const defenseDisplay = defense.quantity === 1 ? defenseName : `${defenseName} (x${defense.quantity})`;
                  
                  rows.push(
                    <tr key={`defense_${defense.defense_type}`}>
                      <td>{defenseRowIndex === 0 ? 'Defenses' : ''}</td>
                      <td>{defenseDisplay}</td>
                      <td>{(defense.mass * defense.quantity).toFixed(1)} tons</td>
                      <td>{(defense.cost * defense.quantity).toFixed(2)} MCr</td>
                    </tr>
                  );
                  defenseRowIndex++;
                });
                
                // Add sand if any is configured
                if (hasSand) {
                  rows.push(
                    <tr key="defense_sand">
                      <td>{defenseRowIndex === 0 ? 'Defenses' : ''}</td>
                      <td>Sand</td>
                      <td>{shipDesign.ship.sand_reloads.toFixed(1)} tons</td>
                      <td></td>
                    </tr>
                  );
                  defenseRowIndex++;
                }
              }
              
              return rows;
            })()}
            
            {/* Berths */}
            {(() => {
              const rows = [];
              let berthRowIndex = 0;
              const activeBerths = shipDesign.berths.filter(berth => berth.quantity > 0);
              
              // Only add Berths section if there are active berths
              if (activeBerths.length > 0) {
                activeBerths.forEach(berth => {
                  const berthType = BERTH_TYPES.find(bt => bt.type === berth.berth_type);
                  const berthName = berthType?.name || berth.berth_type;
                  const berthDisplay = berth.quantity === 1 ? berthName : `${berthName} (x${berth.quantity})`;
                  
                  rows.push(
                    <tr key={`berth_${berth.berth_type}`}>
                      <td>{berthRowIndex === 0 ? 'Berths' : ''}</td>
                      <td>{berthDisplay}</td>
                      <td>{(berth.mass * berth.quantity).toFixed(1)} tons</td>
                      <td>{(berth.cost * berth.quantity).toFixed(2)} MCr</td>
                    </tr>
                  );
                  berthRowIndex++;
                });
              }
              
              return rows;
            })()}
            
            {/* Rec/Health */}
            {(() => {
              const rows = [];
              let facilityRowIndex = 0;
              const activeFacilities = shipDesign.facilities.filter(facility => facility.quantity > 0);
              
              // Only add Rec/Health section if there are active facilities
              if (activeFacilities.length > 0) {
                // Sort facilities to show Commissary first, then the rest
                const sortedFacilities = activeFacilities.sort((a, b) => {
                  if (a.facility_type === 'commissary') return -1;
                  if (b.facility_type === 'commissary') return 1;
                  return 0;
                });
                
                sortedFacilities.forEach(facility => {
                  const facilityType = FACILITY_TYPES.find(ft => ft.type === facility.facility_type);
                  const facilityName = facilityType?.name || facility.facility_type;
                  const facilityDisplay = facility.quantity === 1 ? facilityName : `${facilityName} (x${facility.quantity})`;
                  
                  rows.push(
                    <tr key={`facility_${facility.facility_type}`}>
                      <td>{facilityRowIndex === 0 ? 'Rec/Health' : ''}</td>
                      <td>{facilityDisplay}</td>
                      <td>{(facility.mass * facility.quantity).toFixed(1)} tons</td>
                      <td>{(facility.cost * facility.quantity).toFixed(2)} MCr</td>
                    </tr>
                  );
                  facilityRowIndex++;
                });
              }
              
              return rows;
            })()}
            
            {/* Cargo */}
            {(() => {
              const rows = [];
              let cargoRowIndex = 0;
              const activeCargo = shipDesign.cargo.filter(cargo => cargo.tonnage > 0);
              
              // Only add Cargo section if there are active cargo items
              if (activeCargo.length > 0) {
                activeCargo.forEach(cargo => {
                  const cargoType = CARGO_TYPES.find(ct => ct.type === cargo.cargo_type);
                  const cargoName = cargoType?.name || cargo.cargo_type;
                  
                  rows.push(
                    <tr key={`cargo_${cargo.cargo_type}`}>
                      <td>{cargoRowIndex === 0 ? 'Cargo' : ''}</td>
                      <td>{cargoName}</td>
                      <td>{cargo.tonnage.toFixed(1)} tons</td>
                      <td>{cargo.cost.toFixed(2)} MCr</td>
                    </tr>
                  );
                  cargoRowIndex++;
                });
              }
              
              return rows;
            })()}
            
            {/* Vehicles */}
            {(() => {
              const rows = [];
              let vehicleRowIndex = 0;
              const activeVehicles = shipDesign.vehicles.filter(vehicle => vehicle.quantity > 0);
              
              // Only add Vehicles section if there are active vehicles
              if (activeVehicles.length > 0) {
                activeVehicles.forEach(vehicle => {
                  const vehicleType = VEHICLE_TYPES.find(vt => vt.type === vehicle.vehicle_type);
                  let vehicleName = vehicleType?.name || vehicle.vehicle_type;
                  
                  // Remove tonnage information from vehicle names (e.g., "4 ton", "65 ton", etc.)
                  vehicleName = vehicleName.replace(/\b\d+(\.\d+)?\s+ton\s+/gi, '');
                  
                  const vehicleDisplay = vehicle.quantity === 1 ? vehicleName : `${vehicleName} (x${vehicle.quantity})`;
                  
                  rows.push(
                    <tr key={`vehicle_${vehicle.vehicle_type}`}>
                      <td>{vehicleRowIndex === 0 ? 'Vehicles' : ''}</td>
                      <td>{vehicleDisplay}</td>
                      <td>{(vehicle.mass * vehicle.quantity).toFixed(1)} tons</td>
                      <td>{(vehicle.cost * vehicle.quantity).toFixed(2)} MCr</td>
                    </tr>
                  );
                  vehicleRowIndex++;
                });
              }
              
              return rows;
            })()}
            
            {/* Drones */}
            {(() => {
              const rows = [];
              let droneRowIndex = 0;
              const activeDrones = shipDesign.drones.filter(drone => drone.quantity > 0);
              
              // Only add Drones section if there are active drones
              if (activeDrones.length > 0) {
                activeDrones.forEach(drone => {
                  const droneType = DRONE_TYPES.find(dt => dt.type === drone.drone_type);
                  let droneName = droneType?.name || drone.drone_type;
                  
                  // Remove tonnage information from drone names (e.g., "0.5 ton", "1.0 ton", etc.)
                  droneName = droneName.replace(/\b\d+(\.\d+)?\s+ton\s+/gi, '');
                  
                  const droneDisplay = drone.quantity === 1 ? droneName : `${droneName} (x${drone.quantity})`;
                  
                  rows.push(
                    <tr key={`drone_${drone.drone_type}`}>
                      <td>{droneRowIndex === 0 ? 'Drones' : ''}</td>
                      <td>{droneDisplay}</td>
                      <td>{(drone.mass * drone.quantity).toFixed(1)} tons</td>
                      <td>{(drone.cost * drone.quantity).toFixed(2)} MCr</td>
                    </tr>
                  );
                  droneRowIndex++;
                });
              }
              
              return rows;
            })()}
            
            {/* Totals Row */}
            <tr>
              <td></td>
              <td><strong>Total</strong></td>
              <td><strong>{mass.used.toFixed(1)} tons</strong></td>
              <td><strong>{cost.total.toFixed(2)} MCr</strong></td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div className="summary-section">
        <p><strong>Pilot:</strong> {staff.pilot}</p>
        <p><strong>Navigator:</strong> {staff.navigator}</p>
        <p><strong>Engineers:</strong> {staff.engineers}</p>
        {staff.gunners > 0 && <p><strong>Gunners:</strong> {staff.gunners}</p>}
        {staff.service > 0 && <p><strong>Service Staff:</strong> {staff.service}</p>}
        <p><strong>Stewards:</strong> {staff.stewards}</p>
        {staff.nurses > 0 && <p><strong>Nurses:</strong> {staff.nurses}</p>}
        {staff.surgeons > 0 && <p><strong>Surgeons:</strong> {staff.surgeons}</p>}
        {staff.techs > 0 && <p><strong>Medical Techs:</strong> {staff.techs}</p>}
        <p><strong>Total Staff:</strong> {staff.total}</p>
      </div>

      {saveMessage && (
        <div className={`save-message ${saveMessage.includes('successfully') ? 'success' : 'error'}`}>
          {saveMessage}
        </div>
      )}

      <div className="summary-actions">
        <button 
          className="save-btn" 
          onClick={handleSaveDesign} 
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Save Design'}
        </button>
        {onBackToShipSelect && (
          <button className="load-btn" onClick={onBackToShipSelect}>
            Load Different Ship
          </button>
        )}
      </div>

    </div>
  );
};

export default SummaryPanel;