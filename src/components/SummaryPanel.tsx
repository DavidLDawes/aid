import { useState } from 'react';
import type { ShipDesign, MassCalculation, CostCalculation, StaffRequirements } from '../types/ship';
import { COMMS_SENSORS_TYPES, DEFENSE_TYPES, FACILITY_TYPES, CARGO_TYPES, VEHICLE_TYPES, DRONE_TYPES, BERTH_TYPES, getTonnageCode, getNumberOfSections, calculateTotalFuelMass } from '../data/constants';
import { databaseService } from '../services/database';

interface SummaryPanelProps {
  shipDesign: ShipDesign;
  mass: MassCalculation;
  cost: CostCalculation;
  staff: StaffRequirements;
  combinePilotNavigator: boolean;
  noStewards: boolean;
  activeRules: Set<string>;
  onBackToShipSelect?: () => void;
}

const SummaryPanel: React.FC<SummaryPanelProps> = ({ shipDesign, mass, cost, staff, combinePilotNavigator, noStewards, activeRules, onBackToShipSelect }) => {
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [showCsvModal, setShowCsvModal] = useState(false);
  const [csvData, setCsvData] = useState<string>('');
  const [showOverwriteDialog, setShowOverwriteDialog] = useState(false);
  const [pendingShipName, setPendingShipName] = useState<string>('');

  const handleSaveDesign = async () => {
    if (!shipDesign.ship.name.trim()) {
      setSaveMessage('Please enter a ship name before saving.');
      setTimeout(() => setSaveMessage(null), 3000);
      return;
    }

    try {
      setSaving(true);
      setSaveMessage(null);
      await databaseService.saveShip(shipDesign);
      setSaveMessage('Ship design saved successfully!');
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error) {
      console.error('Error saving ship:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to save ship design. Please try again.';

      if (errorMessage.includes('already exists')) {
        setPendingShipName(shipDesign.ship.name);
        setShowOverwriteDialog(true);
      } else {
        setSaveMessage(errorMessage);
        setTimeout(() => setSaveMessage(null), 5000);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleOverwriteConfirm = async () => {
    try {
      setSaving(true);
      setShowOverwriteDialog(false);
      setSaveMessage(null);
      await databaseService.saveOrUpdateShipByName(shipDesign);
      setSaveMessage('Ship design saved successfully!');
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error) {
      console.error('Error overwriting ship:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to save ship design. Please try again.';
      setSaveMessage(errorMessage);
      setTimeout(() => setSaveMessage(null), 5000);
    } finally {
      setSaving(false);
      setPendingShipName('');
    }
  };

  const handleOverwriteCancel = () => {
    setShowOverwriteDialog(false);
    setPendingShipName('');
    setSaving(false);
  };

  const generateCsvData = () => {
    const lines: string[] = [];

    const tonnageCode = getTonnageCode(shipDesign.ship.tonnage);
    const sections = getNumberOfSections(shipDesign.ship.tonnage);
    const hullInfo = tonnageCode && sections ? ` (hull code ${tonnageCode}, ${sections} sections)` : tonnageCode ? ` (${tonnageCode})` : '';
    lines.push(`${shipDesign.ship.name}, ${shipDesign.ship.configuration} configuration, ${shipDesign.ship.tonnage} tons${hullInfo}, Tech Level ${shipDesign.ship.tech_level}`);
    lines.push('Category,Item,Mass,Cost');

    const allRows: { category: string; item: string; mass: number; cost: number }[] = [];

    // Engines
    const validEngines = shipDesign.engines.filter(engine =>
      !(engine.engine_type === 'maneuver_drive' && engine.performance === 0)
    );
    validEngines.forEach((engine, index) => {
      const engineName = engine.engine_type === 'power_plant' ? 'Power Plant' :
                       engine.engine_type === 'jump_drive' ? 'Jump Drive' :
                       'Maneuver Drive';
      const performanceCode = engine.engine_type === 'power_plant' ? 'P' :
                            engine.engine_type === 'jump_drive' ? 'J' :
                            'M';
      allRows.push({ category: index === 0 ? 'Engines' : '', item: `${engineName} ${performanceCode}-${engine.performance}`, mass: engine.mass, cost: engine.cost });
    });

    // Fuel
    const jumpPerf = shipDesign.engines.find(e => e.engine_type === 'jump_drive')?.performance || 0;
    const maneuverPerf = shipDesign.engines.find(e => e.engine_type === 'maneuver_drive')?.performance || 0;
    const fuelMass = calculateTotalFuelMass(shipDesign.ship.tonnage, jumpPerf, maneuverPerf, shipDesign.ship.fuel_weeks, activeRules.has('antimatter'));
    allRows.push({ category: '', item: 'Fuel', mass: fuelMass, cost: 0 });

    // Fittings
    let fittingRowIndex = 0;
    const hasBridge = shipDesign.fittings.some(f => f.fitting_type === 'bridge');
    const hasHalfBridge = shipDesign.fittings.some(f => f.fitting_type === 'half_bridge');
    const launchTubes = shipDesign.fittings.filter(f => f.fitting_type === 'launch_tube');
    const commsSensors = shipDesign.fittings.find(f => f.fitting_type === 'comms_sensors');

    if (hasBridge || hasHalfBridge) {
      const bridgeData = shipDesign.fittings.find(f => f.fitting_type === 'bridge' || f.fitting_type === 'half_bridge');
      if (bridgeData) {
        allRows.push({ category: fittingRowIndex++ === 0 ? 'Fittings' : '', item: hasBridge ? 'Bridge' : 'Half Bridge', mass: bridgeData.mass, cost: bridgeData.cost });
      }
    }
    launchTubes.forEach(tube => {
      allRows.push({ category: fittingRowIndex++ === 0 ? 'Fittings' : '', item: `Launch Tube (${tube.launch_vehicle_mass || 1} ton vehicle)`, mass: tube.mass, cost: tube.cost });
    });
    if (commsSensors) {
      const sensorType = COMMS_SENSORS_TYPES.find(t => t.type === commsSensors.comms_sensors_type);
      allRows.push({ category: fittingRowIndex++ === 0 ? 'Fittings' : '', item: `${sensorType?.name || 'Standard'} Comms & Sensors`, mass: commsSensors.mass, cost: commsSensors.cost });
    }

    // Weapons
    shipDesign.weapons.filter(w => w.quantity > 0).forEach((weapon, index) => {
      const display = weapon.quantity === 1 ? weapon.weapon_name : `${weapon.weapon_name} (x${weapon.quantity})`;
      allRows.push({ category: index === 0 ? 'Weapons' : '', item: display, mass: weapon.mass * weapon.quantity, cost: weapon.cost * weapon.quantity });
    });

    // Defenses
    let defenseRowIndex = 0;
    const activeDefenses = shipDesign.defenses.filter(d => d.quantity > 0);
    if (activeDefenses.length > 0 || shipDesign.ship.sand_reloads > 0) {
      activeDefenses.forEach(defense => {
        const defenseType = DEFENSE_TYPES.find(dt => dt.type === defense.defense_type);
        const display = defense.quantity === 1 ? (defenseType?.name || defense.defense_type) : `${defenseType?.name || defense.defense_type} (x${defense.quantity})`;
        allRows.push({ category: defenseRowIndex++ === 0 ? 'Defenses' : '', item: display, mass: defense.mass * defense.quantity, cost: defense.cost * defense.quantity });
      });
      if (shipDesign.ship.sand_reloads > 0) {
        allRows.push({ category: defenseRowIndex++ === 0 ? 'Defenses' : '', item: 'Sand', mass: shipDesign.ship.sand_reloads, cost: 0 });
      }
    }

    // Berths
    shipDesign.berths.filter(b => b.quantity > 0).forEach((berth, index) => {
      const berthType = BERTH_TYPES.find(bt => bt.type === berth.berth_type);
      const display = berth.quantity === 1 ? (berthType?.name || berth.berth_type) : `${berthType?.name || berth.berth_type} (x${berth.quantity})`;
      allRows.push({ category: index === 0 ? 'Berths' : '', item: display, mass: berth.mass * berth.quantity, cost: berth.cost * berth.quantity });
    });

    // Rec/Health
    const activeFacilities = shipDesign.facilities.filter(f => f.quantity > 0)
      .sort((a, b) => a.facility_type === 'commissary' ? -1 : b.facility_type === 'commissary' ? 1 : 0);
    activeFacilities.forEach((facility, index) => {
      const facilityType = FACILITY_TYPES.find(ft => ft.type === facility.facility_type);
      const display = facility.quantity === 1 ? (facilityType?.name || facility.facility_type) : `${facilityType?.name || facility.facility_type} (x${facility.quantity})`;
      allRows.push({ category: index === 0 ? 'Rec/Health' : '', item: display, mass: facility.mass * facility.quantity, cost: facility.cost * facility.quantity });
    });

    // Cargo
    shipDesign.cargo.filter(c => c.tonnage > 0).forEach((cargo, index) => {
      const cargoType = CARGO_TYPES.find(ct => ct.type === cargo.cargo_type);
      allRows.push({ category: index === 0 ? 'Cargo' : '', item: cargoType?.name || cargo.cargo_type, mass: cargo.tonnage, cost: cargo.cost });
    });

    // Vehicles
    shipDesign.vehicles.filter(v => v.quantity > 0).forEach((vehicle, index) => {
      const vehicleType = VEHICLE_TYPES.find(vt => vt.type === vehicle.vehicle_type);
      const name = (vehicleType?.name || vehicle.vehicle_type).replace(/\b\d+(\.\d+)?\s+ton\s+/gi, '');
      const display = vehicle.quantity === 1 ? name : `${name} (x${vehicle.quantity})`;
      allRows.push({ category: index === 0 ? 'Vehicles' : '', item: display, mass: vehicle.mass * vehicle.quantity, cost: vehicle.cost * vehicle.quantity });
    });

    // Drones
    shipDesign.drones.filter(d => d.quantity > 0).forEach((drone, index) => {
      const droneType = DRONE_TYPES.find(dt => dt.type === drone.drone_type);
      const name = (droneType?.name || drone.drone_type).replace(/\b\d+(\.\d+)?\s+ton\s+/gi, '');
      const display = drone.quantity === 1 ? name : `${name} (x${drone.quantity})`;
      allRows.push({ category: index === 0 ? 'Drones' : '', item: display, mass: drone.mass * drone.quantity, cost: drone.cost * drone.quantity });
    });

    // Custom Items
    shipDesign.custom_items.forEach((item, index) => {
      allRows.push({ category: index === 0 ? 'Custom' : '', item: item.name, mass: item.mass, cost: item.cost });
    });

    allRows.forEach(row => {
      lines.push(`${row.category},${row.item},${row.mass.toFixed(1)},${row.cost.toFixed(2)}`);
    });
    lines.push(`Total,,${mass.used.toFixed(1)},${cost.total.toFixed(2)}`);

    if (shipDesign.ship.tonnage < 3000) {
      lines.push('');
      lines.push('Non-standard capital ship design < 3,000 tons');
    }

    return lines.join('\n');
  };

  const handleCsvExport = () => {
    setCsvData(generateCsvData());
    setShowCsvModal(true);
  };

  const handleLaunchArchitect = () => {
    const encodedCsv = encodeURIComponent(generateCsvData());
    window.open(`../StarshipArchitect/index.html?csv=${encodedCsv}`, '_blank');
  };

  const tonnageCodeDisplay = getTonnageCode(shipDesign.ship.tonnage);
  const sectionsDisplay = getNumberOfSections(shipDesign.ship.tonnage);
  const hullInfoDisplay = tonnageCodeDisplay && sectionsDisplay
    ? ` (hull code ${tonnageCodeDisplay}, ${sectionsDisplay} sections)`
    : tonnageCodeDisplay ? ` (${tonnageCodeDisplay})` : '';

  const isNonStandardSize = shipDesign.ship.tonnage < 3000;

  return (
    <div className="panel-content">
      <div className="ship-title-line">
        <h3>{shipDesign.ship.name}, {shipDesign.ship.configuration} configuration, {shipDesign.ship.tonnage.toLocaleString()} tons{hullInfoDisplay}, Tech Level {shipDesign.ship.tech_level}</h3>
        {isNonStandardSize && (
          <p className="nonstandard-notice">Non-standard capital ship design &lt; 3,000 tons</p>
        )}
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

            {/* Fuel */}
            {(() => {
              const jumpPerf = shipDesign.engines.find(e => e.engine_type === 'jump_drive')?.performance || 0;
              const maneuverPerf = shipDesign.engines.find(e => e.engine_type === 'maneuver_drive')?.performance || 0;
              const fuelMass = calculateTotalFuelMass(shipDesign.ship.tonnage, jumpPerf, maneuverPerf, shipDesign.ship.fuel_weeks, activeRules.has('antimatter'));
              return (
                <tr key="fuel">
                  <td></td>
                  <td>Fuel</td>
                  <td>{fuelMass.toFixed(1)} tons</td>
                  <td></td>
                </tr>
              );
            })()}

            {/* Fittings */}
            {(() => {
              const rows: React.ReactElement[] = [];
              let fittingRowIndex = 0;
              const hasBridge = shipDesign.fittings.some(f => f.fitting_type === 'bridge');
              const hasHalfBridge = shipDesign.fittings.some(f => f.fitting_type === 'half_bridge');
              const launchTubes = shipDesign.fittings.filter(f => f.fitting_type === 'launch_tube');
              const commsSensors = shipDesign.fittings.find(f => f.fitting_type === 'comms_sensors');

              if (hasBridge || hasHalfBridge) {
                const bridgeData = shipDesign.fittings.find(f => f.fitting_type === 'bridge' || f.fitting_type === 'half_bridge');
                if (bridgeData) {
                  rows.push(
                    <tr key="bridge">
                      <td>{fittingRowIndex === 0 ? 'Fittings' : ''}</td>
                      <td>{hasBridge ? 'Bridge' : 'Half Bridge'}</td>
                      <td>{bridgeData.mass.toFixed(1)} tons</td>
                      <td>{bridgeData.cost.toFixed(2)} MCr</td>
                    </tr>
                  );
                  fittingRowIndex++;
                }
              }
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
              }
              return rows;
            })()}

            {/* Weapons */}
            {(() => {
              const rows: React.ReactElement[] = [];
              let weaponRowIndex = 0;
              shipDesign.weapons.filter(w => w.quantity > 0).forEach(weapon => {
                const display = weapon.quantity === 1 ? weapon.weapon_name : `${weapon.weapon_name} (x${weapon.quantity})`;
                rows.push(
                  <tr key={`weapon_${weapon.weapon_name}`}>
                    <td>{weaponRowIndex === 0 ? 'Weapons' : ''}</td>
                    <td>{display}</td>
                    <td>{(weapon.mass * weapon.quantity).toFixed(1)} tons</td>
                    <td>{(weapon.cost * weapon.quantity).toFixed(2)} MCr</td>
                  </tr>
                );
                weaponRowIndex++;
              });
              return rows;
            })()}

            {/* Defenses */}
            {(() => {
              const rows: React.ReactElement[] = [];
              let defenseRowIndex = 0;
              const activeDefenses = shipDesign.defenses.filter(d => d.quantity > 0);
              const hasSand = shipDesign.ship.sand_reloads > 0;

              if (activeDefenses.length > 0 || hasSand) {
                activeDefenses.forEach(defense => {
                  const defenseType = DEFENSE_TYPES.find(dt => dt.type === defense.defense_type);
                  const name = defenseType?.name || defense.defense_type;
                  const display = defense.quantity === 1 ? name : `${name} (x${defense.quantity})`;
                  rows.push(
                    <tr key={`defense_${defense.defense_type}`}>
                      <td>{defenseRowIndex === 0 ? 'Defenses' : ''}</td>
                      <td>{display}</td>
                      <td>{(defense.mass * defense.quantity).toFixed(1)} tons</td>
                      <td>{(defense.cost * defense.quantity).toFixed(2)} MCr</td>
                    </tr>
                  );
                  defenseRowIndex++;
                });
                if (hasSand) {
                  rows.push(
                    <tr key="defense_sand">
                      <td>{defenseRowIndex === 0 ? 'Defenses' : ''}</td>
                      <td>Sand</td>
                      <td>{shipDesign.ship.sand_reloads.toFixed(1)} tons</td>
                      <td></td>
                    </tr>
                  );
                }
              }
              return rows;
            })()}

            {/* Berths */}
            {(() => {
              const rows: React.ReactElement[] = [];
              let berthRowIndex = 0;
              shipDesign.berths.filter(b => b.quantity > 0).forEach(berth => {
                const berthType = BERTH_TYPES.find(bt => bt.type === berth.berth_type);
                const name = berthType?.name || berth.berth_type;
                const display = berth.quantity === 1 ? name : `${name} (x${berth.quantity})`;
                rows.push(
                  <tr key={`berth_${berth.berth_type}`}>
                    <td>{berthRowIndex === 0 ? 'Berths' : ''}</td>
                    <td>{display}</td>
                    <td>{(berth.mass * berth.quantity).toFixed(1)} tons</td>
                    <td>{(berth.cost * berth.quantity).toFixed(2)} MCr</td>
                  </tr>
                );
                berthRowIndex++;
              });
              return rows;
            })()}

            {/* Rec/Health */}
            {(() => {
              const rows: React.ReactElement[] = [];
              let facilityRowIndex = 0;
              const activeFacilities = shipDesign.facilities
                .filter(f => f.quantity > 0)
                .sort((a, b) => a.facility_type === 'commissary' ? -1 : b.facility_type === 'commissary' ? 1 : 0);

              activeFacilities.forEach(facility => {
                const facilityType = FACILITY_TYPES.find(ft => ft.type === facility.facility_type);
                const name = facilityType?.name || facility.facility_type;
                const display = facility.quantity === 1 ? name : `${name} (x${facility.quantity})`;
                rows.push(
                  <tr key={`facility_${facility.facility_type}`}>
                    <td>{facilityRowIndex === 0 ? 'Rec/Health' : ''}</td>
                    <td>{display}</td>
                    <td>{(facility.mass * facility.quantity).toFixed(1)} tons</td>
                    <td>{(facility.cost * facility.quantity).toFixed(2)} MCr</td>
                  </tr>
                );
                facilityRowIndex++;
              });
              return rows;
            })()}

            {/* Cargo */}
            {(() => {
              const rows: React.ReactElement[] = [];
              let cargoRowIndex = 0;
              shipDesign.cargo.filter(c => c.tonnage > 0).forEach(cargo => {
                const cargoType = CARGO_TYPES.find(ct => ct.type === cargo.cargo_type);
                rows.push(
                  <tr key={`cargo_${cargo.cargo_type}`}>
                    <td>{cargoRowIndex === 0 ? 'Cargo' : ''}</td>
                    <td>{cargoType?.name || cargo.cargo_type}</td>
                    <td>{cargo.tonnage.toFixed(1)} tons</td>
                    <td>{cargo.cost.toFixed(2)} MCr</td>
                  </tr>
                );
                cargoRowIndex++;
              });
              return rows;
            })()}

            {/* Vehicles */}
            {(() => {
              const rows: React.ReactElement[] = [];
              let vehicleRowIndex = 0;
              shipDesign.vehicles.filter(v => v.quantity > 0).forEach(vehicle => {
                const vehicleType = VEHICLE_TYPES.find(vt => vt.type === vehicle.vehicle_type);
                const name = (vehicleType?.name || vehicle.vehicle_type).replace(/\b\d+(\.\d+)?\s+ton\s+/gi, '');
                const display = vehicle.quantity === 1 ? name : `${name} (x${vehicle.quantity})`;
                rows.push(
                  <tr key={`vehicle_${vehicle.vehicle_type}`}>
                    <td>{vehicleRowIndex === 0 ? 'Vehicles' : ''}</td>
                    <td>{display}</td>
                    <td>{(vehicle.mass * vehicle.quantity).toFixed(1)} tons</td>
                    <td>{(vehicle.cost * vehicle.quantity).toFixed(2)} MCr</td>
                  </tr>
                );
                vehicleRowIndex++;
              });
              return rows;
            })()}

            {/* Drones */}
            {(() => {
              const rows: React.ReactElement[] = [];
              let droneRowIndex = 0;
              shipDesign.drones.filter(d => d.quantity > 0).forEach(drone => {
                const droneType = DRONE_TYPES.find(dt => dt.type === drone.drone_type);
                const name = (droneType?.name || drone.drone_type).replace(/\b\d+(\.\d+)?\s+ton\s+/gi, '');
                const display = drone.quantity === 1 ? name : `${name} (x${drone.quantity})`;
                rows.push(
                  <tr key={`drone_${drone.drone_type}`}>
                    <td>{droneRowIndex === 0 ? 'Drones' : ''}</td>
                    <td>{display}</td>
                    <td>{(drone.mass * drone.quantity).toFixed(1)} tons</td>
                    <td>{(drone.cost * drone.quantity).toFixed(2)} MCr</td>
                  </tr>
                );
                droneRowIndex++;
              });
              return rows;
            })()}

            {/* Custom Items */}
            {shipDesign.custom_items.length > 0 && shipDesign.custom_items.map((item, index) => (
              <tr key={`custom_${item.name}-${index}`}>
                <td>{index === 0 ? 'Custom' : ''}</td>
                <td>{item.name}</td>
                <td>{item.mass.toFixed(1)} tons</td>
                <td>{item.cost.toFixed(2)} MCr</td>
              </tr>
            ))}

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
        <h4>Crew</h4>
        {combinePilotNavigator ? (
          <p><strong>Pilot/Navigator:</strong> 1</p>
        ) : (
          <>
            <p><strong>Pilot:</strong> {staff.pilot}</p>
            <p><strong>Navigator:</strong> {staff.navigator}</p>
          </>
        )}
        <p><strong>Engineers:</strong> {staff.engineers}</p>
        {staff.gunners > 0 && <p><strong>Gunners:</strong> {staff.gunners}</p>}
        {staff.service > 0 && <p><strong>Service Staff:</strong> {staff.service}</p>}
        <p><strong>Stewards:</strong> {noStewards ? 0 : staff.stewards}</p>
        {staff.nurses > 0 && <p><strong>Nurses:</strong> {staff.nurses}</p>}
        {staff.surgeons > 0 && <p><strong>Surgeons:</strong> {staff.surgeons}</p>}
        {staff.techs > 0 && <p><strong>Medical Techs:</strong> {staff.techs}</p>}
        <p><strong>Total:</strong> {
          combinePilotNavigator && noStewards
            ? staff.total - 1 - staff.stewards
            : combinePilotNavigator
              ? staff.total - 1
              : noStewards
                ? staff.total - staff.stewards
                : staff.total
        }</p>
      </div>

      {isNonStandardSize && (
        <p className="nonstandard-notice">Non-standard capital ship design &lt; 3,000 tons</p>
      )}

      {saveMessage && (
        <div className={`save-message ${saveMessage.includes('successfully') ? 'success' : 'error'}`}>
          {saveMessage}
        </div>
      )}

      <div className="summary-actions">
        <button className="save-btn" onClick={handleSaveDesign} disabled={saving}>
          {saving ? 'Saving...' : 'Save Design'}
        </button>
        <button className="load-btn" onClick={handleLaunchArchitect}>
          Launch Starship Architect
        </button>
        <button className="load-btn" onClick={handleCsvExport}>
          CSV
        </button>
        {onBackToShipSelect && (
          <button className="load-btn" onClick={onBackToShipSelect}>
            Load Different Ship
          </button>
        )}
      </div>

      {showCsvModal && (
        <div className="ship-name-conflict-dialog">
          <div className="conflict-dialog-content">
            <h3>CSV Export</h3>
            <textarea
              value={csvData}
              readOnly
              style={{ width: '100%', height: '400px', fontFamily: 'monospace', fontSize: '12px', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}
            />
            <div className="conflict-dialog-actions">
              <button className="change-name-btn" onClick={() => setShowCsvModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {showOverwriteDialog && (
        <div className="ship-name-conflict-dialog">
          <div className="conflict-dialog-content">
            <h3>Ship Name Conflict</h3>
            <p>A ship named "{pendingShipName}" already exists. Do you want to overwrite it?</p>
            <div className="conflict-dialog-actions">
              <button className="overwrite-btn" onClick={handleOverwriteConfirm} disabled={saving}>
                {saving ? 'Overwriting...' : 'Overwrite'}
              </button>
              <button className="change-name-btn" onClick={handleOverwriteCancel} disabled={saving}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SummaryPanel;
