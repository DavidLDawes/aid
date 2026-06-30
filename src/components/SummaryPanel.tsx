import { useState } from 'react';
import type { ShipDesign, MassCalculation, CostCalculation, StaffRequirements } from '../types/ship';
import {
  COMMS_SENSORS_TYPES, DEFENSE_TYPES, FACILITY_TYPES, CARGO_TYPES,
  VEHICLE_TYPES, DRONE_TYPES, BERTH_TYPES, ZONE_SECTION_TYPES,
  calculateManeuverFuel, calculateControlCenterMass, calculateControlCenterCost,
  getMegastructureSections, PLANT_PER_SCOOP
} from '../data/constants';
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

const SummaryPanel: React.FC<SummaryPanelProps> = ({ shipDesign, mass, cost, staff, combinePilotNavigator, noStewards, onBackToShipSelect }) => {
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [showCsvModal, setShowCsvModal] = useState(false);
  const [csvData, setCsvData] = useState<string>('');
  const [showOverwriteDialog, setShowOverwriteDialog] = useState(false);
  const [pendingShipName, setPendingShipName] = useState<string>('');

  const sections = getMegastructureSections(shipDesign.ship.tonnage);
  const controlCenterMass = calculateControlCenterMass(shipDesign.ship.tonnage);
  const controlCenterCost = calculateControlCenterCost(shipDesign.ship.tonnage);

  const maneuverDrive = shipDesign.engines.find(e => e.engine_type === 'maneuver_drive');
  const maneuverPerf = maneuverDrive?.performance || 0;
  const maneuverFuelMass = maneuverPerf > 0
    ? calculateManeuverFuel(shipDesign.ship.tonnage, maneuverPerf, shipDesign.ship.fuel_weeks)
    : 0;

  const fuelSystems = shipDesign.fuel_systems || [];
  const scoopQty = fuelSystems.find(f => f.system_type === 'fuel_scoop')?.quantity ?? 0;
  const plantMass = scoopQty * PLANT_PER_SCOOP.mass;
  const plantCost = scoopQty * PLANT_PER_SCOOP.cost;

  const zoneSections = shipDesign.zone_sections || [];

  const handleSaveDesign = async () => {
    if (!shipDesign.ship.name.trim()) {
      setSaveMessage('Please enter a megastructure name before saving.');
      setTimeout(() => setSaveMessage(null), 3000);
      return;
    }
    try {
      setSaving(true);
      setSaveMessage(null);
      await databaseService.saveShip(shipDesign);
      setSaveMessage('Megastructure design saved successfully!');
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error) {
      console.error('Error saving megastructure:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to save. Please try again.';
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
      setSaveMessage('Megastructure design saved successfully!');
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save.';
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
    lines.push(`${shipDesign.ship.name}, ${sections} sections, ${shipDesign.ship.tonnage.toLocaleString()} tons, Tech Level ${shipDesign.ship.tech_level}`);
    lines.push('Category,Item,Mass,Cost');

    const allRows: { category: string; item: string; mass: number; cost: number }[] = [];

    // Control Center
    allRows.push({ category: 'Control Center', item: `${sections} section(s) × 100 tons @ 0.5 MCr/ton`, mass: controlCenterMass, cost: controlCenterCost });

    // Engines
    const validEngines = shipDesign.engines.filter(e => !(e.engine_type === 'maneuver_drive' && e.performance === 0));
    validEngines.forEach((engine, index) => {
      const name = engine.engine_type === 'power_plant' ? 'Power Plant' : 'Maneuver Drive';
      const code = engine.engine_type === 'power_plant' ? 'P' : 'M';
      allRows.push({ category: index === 0 ? 'Engines' : '', item: `${name} ${code}-${engine.performance}`, mass: engine.mass, cost: engine.cost });
    });
    if (maneuverFuelMass > 0) {
      allRows.push({ category: '', item: `Maneuver Fuel (M-${maneuverPerf}, ${shipDesign.ship.fuel_weeks} weeks)`, mass: maneuverFuelMass, cost: 0 });
    }

    // Fittings (control_center excluded — shown above)
    let fittingIdx = 0;
    const launchTubes = shipDesign.fittings.filter(f => f.fitting_type === 'launch_tube');
    const commsSensors = shipDesign.fittings.find(f => f.fitting_type === 'comms_sensors');
    const computer = shipDesign.fittings.find(f => f.fitting_type === 'computer');
    launchTubes.forEach(tube => {
      allRows.push({ category: fittingIdx++ === 0 ? 'Fittings' : '', item: `Launch Tube (${tube.launch_vehicle_mass || 1} ton vehicle)`, mass: tube.mass, cost: tube.cost });
    });
    if (commsSensors) {
      const sensorType = COMMS_SENSORS_TYPES.find(t => t.type === commsSensors.comms_sensors_type);
      allRows.push({ category: fittingIdx++ === 0 ? 'Fittings' : '', item: `${sensorType?.name ?? 'Standard'} Sensors`, mass: commsSensors.mass, cost: commsSensors.cost });
    }
    if (computer) {
      allRows.push({ category: fittingIdx++ === 0 ? 'Fittings' : '', item: `Computer ${computer.computer_model ?? ''}`, mass: 0, cost: computer.cost });
    }

    // Weapons
    shipDesign.weapons.filter(w => w.quantity > 0).forEach((weapon, index) => {
      const display = weapon.quantity === 1 ? weapon.weapon_name : `${weapon.weapon_name} (x${weapon.quantity})`;
      allRows.push({ category: index === 0 ? 'Weapons' : '', item: display, mass: weapon.mass * weapon.quantity, cost: weapon.cost * weapon.quantity });
    });

    // Defenses
    let defenseIdx = 0;
    shipDesign.defenses.filter(d => d.quantity > 0).forEach(defense => {
      const defenseType = DEFENSE_TYPES.find(dt => dt.type === defense.defense_type);
      const display = defense.quantity === 1 ? (defenseType?.name ?? defense.defense_type) : `${defenseType?.name ?? defense.defense_type} (x${defense.quantity})`;
      allRows.push({ category: defenseIdx++ === 0 ? 'Defenses' : '', item: display, mass: defense.mass * defense.quantity, cost: defense.cost * defense.quantity });
    });

    // Berths
    shipDesign.berths.filter(b => b.quantity > 0).forEach((berth, index) => {
      const berthType = BERTH_TYPES.find(bt => bt.type === berth.berth_type);
      const display = berth.quantity === 1 ? (berthType?.name ?? berth.berth_type) : `${berthType?.name ?? berth.berth_type} (x${berth.quantity})`;
      allRows.push({ category: index === 0 ? 'Berths' : '', item: display, mass: berth.mass * berth.quantity, cost: berth.cost * berth.quantity });
    });

    // Rec/Health
    shipDesign.facilities.filter(f => f.quantity > 0).forEach((facility, index) => {
      const facilityType = FACILITY_TYPES.find(ft => ft.type === facility.facility_type);
      const display = facility.quantity === 1 ? (facilityType?.name ?? facility.facility_type) : `${facilityType?.name ?? facility.facility_type} (x${facility.quantity})`;
      allRows.push({ category: index === 0 ? 'Rec/Health' : '', item: display, mass: facility.mass * facility.quantity, cost: facility.cost * facility.quantity });
    });

    // Cargo
    shipDesign.cargo.filter(c => c.tonnage > 0).forEach((cargo, index) => {
      const cargoType = CARGO_TYPES.find(ct => ct.type === cargo.cargo_type);
      allRows.push({ category: index === 0 ? 'Cargo' : '', item: cargoType?.name ?? cargo.cargo_type, mass: cargo.tonnage, cost: cargo.cost });
    });

    // Vehicles
    shipDesign.vehicles.filter(v => v.quantity > 0).forEach((vehicle, index) => {
      const vehicleType = VEHICLE_TYPES.find(vt => vt.type === vehicle.vehicle_type);
      const name = (vehicleType?.name ?? vehicle.vehicle_type).replace(/\b\d+(\.\d+)?\s+ton\s+/gi, '');
      const display = vehicle.quantity === 1 ? name : `${name} (x${vehicle.quantity})`;
      allRows.push({ category: index === 0 ? 'Vehicles' : '', item: display, mass: vehicle.mass * vehicle.quantity, cost: vehicle.cost * vehicle.quantity });
    });

    // Drones
    shipDesign.drones.filter(d => d.quantity > 0).forEach((drone, index) => {
      const droneType = DRONE_TYPES.find(dt => dt.type === drone.drone_type);
      const name = (droneType?.name ?? drone.drone_type).replace(/\b\d+(\.\d+)?\s+ton\s+/gi, '');
      const display = drone.quantity === 1 ? name : `${name} (x${drone.quantity})`;
      allRows.push({ category: index === 0 ? 'Drones' : '', item: display, mass: drone.mass * drone.quantity, cost: drone.cost * drone.quantity });
    });

    // Custom
    shipDesign.custom_items.forEach((item, index) => {
      allRows.push({ category: index === 0 ? 'Custom' : '', item: item.name, mass: item.mass, cost: item.cost });
    });

    // Fuel Systems
    let fuelIdx = 0;
    if (scoopQty > 0) {
      allRows.push({ category: fuelIdx++ === 0 ? 'Fuel Systems' : '', item: `Fuel Scoops (${scoopQty})`, mass: 0, cost: scoopQty });
      allRows.push({ category: fuelIdx++ === 0 ? 'Fuel Systems' : '', item: `Plant (${scoopQty} × 100 tons, 1 MCr)`, mass: plantMass, cost: plantCost });
    }
    fuelSystems.filter(f => f.system_type !== 'fuel_scoop' && f.quantity > 0).forEach(f => {
      allRows.push({ category: fuelIdx++ === 0 ? 'Fuel Systems' : '', item: `${f.system_type.replace(/_/g, ' ')} (${f.quantity})`, mass: f.mass, cost: f.cost });
    });

    // Zone Sections
    zoneSections.filter(z => z.units > 0).forEach((zone, index) => {
      const spec = ZONE_SECTION_TYPES.find(z2 => z2.type === zone.zone_type);
      allRows.push({ category: index === 0 ? 'Zone Sections' : '', item: `${spec?.name ?? zone.zone_type} (${zone.units} units)`, mass: zone.mass, cost: zone.cost });
    });

    allRows.forEach(row => {
      lines.push(`${row.category},${row.item},${row.mass.toFixed(1)},${row.cost.toFixed(2)}`);
    });
    lines.push(`Total,,${mass.used.toFixed(1)},${cost.total.toFixed(2)}`);

    return lines.join('\n');
  };

  const handleCsvExport = () => {
    setCsvData(generateCsvData());
    setShowCsvModal(true);
  };

  return (
    <div className="panel-content">
      <div className="ship-title-line">
        <h3>
          {shipDesign.ship.name} — {shipDesign.ship.tonnage.toLocaleString()} tons ({sections} section{sections !== 1 ? 's' : ''}), Tech Level {shipDesign.ship.tech_level}
        </h3>
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
            {/* Control Center */}
            <tr>
              <td>Control Center</td>
              <td>{sections} section{sections !== 1 ? 's' : ''} × 100 tons @ 0.5 MCr/ton</td>
              <td>{controlCenterMass.toLocaleString()} tons</td>
              <td>{controlCenterCost.toLocaleString()} MCr</td>
            </tr>

            {/* Engines */}
            {(() => {
              const validEngines = shipDesign.engines.filter(e => !(e.engine_type === 'maneuver_drive' && e.performance === 0));
              const rows: React.ReactElement[] = validEngines.map((engine, index) => {
                const name = engine.engine_type === 'power_plant' ? 'Power Plant' : 'Maneuver Drive';
                const code = engine.engine_type === 'power_plant' ? 'P' : 'M';
                return (
                  <tr key={engine.engine_type}>
                    <td>{index === 0 ? 'Engines' : ''}</td>
                    <td>{name} {code}-{engine.performance}</td>
                    <td>{engine.mass.toFixed(1)} tons</td>
                    <td>{engine.cost.toFixed(2)} MCr</td>
                  </tr>
                );
              });
              if (maneuverFuelMass > 0) {
                rows.push(
                  <tr key="maneuver_fuel">
                    <td></td>
                    <td>Maneuver Fuel (M-{maneuverPerf}, {shipDesign.ship.fuel_weeks} weeks)</td>
                    <td>{maneuverFuelMass.toFixed(1)} tons</td>
                    <td></td>
                  </tr>
                );
              }
              return rows;
            })()}

            {/* Fittings */}
            {(() => {
              const rows: React.ReactElement[] = [];
              let idx = 0;
              const launchTubes = shipDesign.fittings.filter(f => f.fitting_type === 'launch_tube');
              const commsSensors = shipDesign.fittings.find(f => f.fitting_type === 'comms_sensors');
              const computer = shipDesign.fittings.find(f => f.fitting_type === 'computer');
              launchTubes.forEach((tube, i) => {
                rows.push(<tr key={`lt_${i}`}><td>{idx++ === 0 ? 'Fittings' : ''}</td><td>Launch Tube ({tube.launch_vehicle_mass || 1} ton vehicle)</td><td>{tube.mass.toFixed(1)} tons</td><td>{tube.cost.toFixed(2)} MCr</td></tr>);
              });
              if (commsSensors) {
                const sType = COMMS_SENSORS_TYPES.find(t => t.type === commsSensors.comms_sensors_type);
                rows.push(<tr key="sensors"><td>{idx++ === 0 ? 'Fittings' : ''}</td><td>{sType?.name ?? 'Standard'} Sensors</td><td>{commsSensors.mass.toFixed(1)} tons</td><td>{commsSensors.cost.toFixed(2)} MCr</td></tr>);
              }
              if (computer) {
                rows.push(<tr key="computer"><td>{idx++ === 0 ? 'Fittings' : ''}</td><td>Computer {computer.computer_model ?? ''}</td><td>0.0 tons</td><td>{computer.cost.toFixed(2)} MCr</td></tr>);
              }
              return rows;
            })()}

            {/* Weapons */}
            {(() => {
              const rows: React.ReactElement[] = [];
              let idx = 0;
              shipDesign.weapons.filter(w => w.quantity > 0).forEach(weapon => {
                const display = weapon.quantity === 1 ? weapon.weapon_name : `${weapon.weapon_name} (x${weapon.quantity})`;
                rows.push(<tr key={`w_${weapon.weapon_name}`}><td>{idx++ === 0 ? 'Weapons' : ''}</td><td>{display}</td><td>{(weapon.mass * weapon.quantity).toFixed(1)} tons</td><td>{(weapon.cost * weapon.quantity).toFixed(2)} MCr</td></tr>);
              });
              return rows;
            })()}

            {/* Defenses */}
            {(() => {
              const rows: React.ReactElement[] = [];
              let idx = 0;
              shipDesign.defenses.filter(d => d.quantity > 0).forEach(defense => {
                const defType = DEFENSE_TYPES.find(dt => dt.type === defense.defense_type);
                const display = defense.quantity === 1 ? (defType?.name ?? defense.defense_type) : `${defType?.name ?? defense.defense_type} (x${defense.quantity})`;
                rows.push(<tr key={`d_${defense.defense_type}`}><td>{idx++ === 0 ? 'Defenses' : ''}</td><td>{display}</td><td>{(defense.mass * defense.quantity).toFixed(1)} tons</td><td>{(defense.cost * defense.quantity).toFixed(2)} MCr</td></tr>);
              });
              if (shipDesign.ship.sand_reloads > 0) {
                rows.push(<tr key="sand"><td>{idx++ === 0 ? 'Defenses' : ''}</td><td>Sand</td><td>{shipDesign.ship.sand_reloads.toFixed(1)} tons</td><td></td></tr>);
              }
              return rows;
            })()}

            {/* Berths */}
            {shipDesign.berths.filter(b => b.quantity > 0).map((berth, index) => {
              const bType = BERTH_TYPES.find(bt => bt.type === berth.berth_type);
              const display = berth.quantity === 1 ? (bType?.name ?? berth.berth_type) : `${bType?.name ?? berth.berth_type} (x${berth.quantity})`;
              return <tr key={`berth_${berth.berth_type}`}><td>{index === 0 ? 'Berths' : ''}</td><td>{display}</td><td>{(berth.mass * berth.quantity).toFixed(1)} tons</td><td>{(berth.cost * berth.quantity).toFixed(2)} MCr</td></tr>;
            })}

            {/* Rec/Health */}
            {shipDesign.facilities.filter(f => f.quantity > 0).map((facility, index) => {
              const fType = FACILITY_TYPES.find(ft => ft.type === facility.facility_type);
              const display = facility.quantity === 1 ? (fType?.name ?? facility.facility_type) : `${fType?.name ?? facility.facility_type} (x${facility.quantity})`;
              return <tr key={`facility_${facility.facility_type}`}><td>{index === 0 ? 'Rec/Health' : ''}</td><td>{display}</td><td>{(facility.mass * facility.quantity).toFixed(1)} tons</td><td>{(facility.cost * facility.quantity).toFixed(2)} MCr</td></tr>;
            })}

            {/* Cargo */}
            {shipDesign.cargo.filter(c => c.tonnage > 0).map((cargo, index) => {
              const cType = CARGO_TYPES.find(ct => ct.type === cargo.cargo_type);
              return <tr key={`cargo_${cargo.cargo_type}`}><td>{index === 0 ? 'Cargo' : ''}</td><td>{cType?.name ?? cargo.cargo_type}</td><td>{cargo.tonnage.toFixed(1)} tons</td><td>{cargo.cost.toFixed(2)} MCr</td></tr>;
            })}

            {/* Vehicles */}
            {shipDesign.vehicles.filter(v => v.quantity > 0).map((vehicle, index) => {
              const vType = VEHICLE_TYPES.find(vt => vt.type === vehicle.vehicle_type);
              const name = (vType?.name ?? vehicle.vehicle_type).replace(/\b\d+(\.\d+)?\s+ton\s+/gi, '');
              const display = vehicle.quantity === 1 ? name : `${name} (x${vehicle.quantity})`;
              return <tr key={`vehicle_${vehicle.vehicle_type}`}><td>{index === 0 ? 'Vehicles' : ''}</td><td>{display}</td><td>{(vehicle.mass * vehicle.quantity).toFixed(1)} tons</td><td>{(vehicle.cost * vehicle.quantity).toFixed(2)} MCr</td></tr>;
            })}

            {/* Drones */}
            {shipDesign.drones.filter(d => d.quantity > 0).map((drone, index) => {
              const dType = DRONE_TYPES.find(dt => dt.type === drone.drone_type);
              const name = (dType?.name ?? drone.drone_type).replace(/\b\d+(\.\d+)?\s+ton\s+/gi, '');
              const display = drone.quantity === 1 ? name : `${name} (x${drone.quantity})`;
              return <tr key={`drone_${drone.drone_type}`}><td>{index === 0 ? 'Drones' : ''}</td><td>{display}</td><td>{(drone.mass * drone.quantity).toFixed(1)} tons</td><td>{(drone.cost * drone.quantity).toFixed(2)} MCr</td></tr>;
            })}

            {/* Custom Items */}
            {shipDesign.custom_items.map((item, index) => (
              <tr key={`custom_${item.name}-${index}`}>
                <td>{index === 0 ? 'Custom' : ''}</td>
                <td>{item.name}</td>
                <td>{item.mass.toFixed(1)} tons</td>
                <td>{item.cost.toFixed(2)} MCr</td>
              </tr>
            ))}

            {/* Fuel Systems */}
            {(() => {
              const rows: React.ReactElement[] = [];
              let idx = 0;
              if (scoopQty > 0) {
                rows.push(<tr key="scoops"><td>{idx++ === 0 ? 'Fuel Systems' : ''}</td><td>Fuel Scoops ({scoopQty.toLocaleString()})</td><td>0.0 tons</td><td>{scoopQty.toLocaleString()} MCr</td></tr>);
                rows.push(<tr key="plant"><td>{idx++ === 0 ? 'Fuel Systems' : ''}</td><td>Plant ({scoopQty.toLocaleString()} × 100 tons)</td><td>{plantMass.toLocaleString()} tons</td><td>{plantCost.toLocaleString()} MCr</td></tr>);
              }
              fuelSystems.filter(f => f.system_type !== 'fuel_scoop' && f.quantity > 0).forEach(f => {
                rows.push(<tr key={f.system_type}><td>{idx++ === 0 ? 'Fuel Systems' : ''}</td><td>{f.system_type.replace(/_/g, ' ')} ({f.quantity})</td><td>{f.mass.toLocaleString()} tons</td><td>{f.cost.toLocaleString()} MCr</td></tr>);
              });
              return rows;
            })()}

            {/* Zone Sections */}
            {zoneSections.filter(z => z.units > 0).map((zone, index) => {
              const spec = ZONE_SECTION_TYPES.find(z2 => z2.type === zone.zone_type);
              return (
                <tr key={`zone_${zone.zone_type}`}>
                  <td>{index === 0 ? 'Zone Sections' : ''}</td>
                  <td>{spec?.name ?? zone.zone_type} ({zone.units} units)</td>
                  <td>{zone.mass.toLocaleString()} tons</td>
                  <td>{zone.cost.toLocaleString()} MCr</td>
                </tr>
              );
            })}

            <tr>
              <td></td>
              <td><strong>Total</strong></td>
              <td><strong>{mass.used.toLocaleString()} tons</strong></td>
              <td><strong>{Math.round(cost.total).toLocaleString()} MCr</strong></td>
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

      {saveMessage && (
        <div className={`save-message ${saveMessage.includes('successfully') ? 'success' : 'error'}`}>
          {saveMessage}
        </div>
      )}

      <div className="summary-actions">
        <button className="save-btn" onClick={handleSaveDesign} disabled={saving}>
          {saving ? 'Saving...' : 'Save Design'}
        </button>
        <button className="load-btn" onClick={handleCsvExport}>
          CSV
        </button>
        {onBackToShipSelect && (
          <button className="load-btn" onClick={onBackToShipSelect}>
            Load Different Design
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
            <h3>Name Conflict</h3>
            <p>A design named "{pendingShipName}" already exists. Overwrite it?</p>
            <div className="conflict-dialog-actions">
              <button className="overwrite-btn" onClick={handleOverwriteConfirm} disabled={saving}>
                {saving ? 'Saving...' : 'Overwrite'}
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
