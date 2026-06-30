import type { ShipDesign, MassCalculation, CostCalculation, StaffRequirements } from '../types/ship';
import {
  COMMS_SENSORS_TYPES, DEFENSE_TYPES, FACILITY_TYPES, CARGO_TYPES,
  VEHICLE_TYPES, DRONE_TYPES, BERTH_TYPES, ZONE_SECTION_TYPES,
  calculateManeuverFuel, calculateControlCenterMass, calculateControlCenterCost,
  getMegastructureSections, PLANT_PER_SCOOP
} from '../data/constants';

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function generateShipPrintContent(
  shipDesign: ShipDesign,
  mass: MassCalculation,
  cost: CostCalculation,
  staff: StaffRequirements,
  combinePilotNavigator: boolean,
  noStewards: boolean,
  _activeRules: Set<string>
): string {
  const sections = getMegastructureSections(shipDesign.ship.tonnage);
  const shipTitle = escapeHtml(
    `${shipDesign.ship.name} — ${shipDesign.ship.tonnage.toLocaleString()} tons ` +
    `(${sections} section${sections !== 1 ? 's' : ''}), Tech Level ${shipDesign.ship.tech_level}`
  );

  const rows: string[] = [];

  const addRow = (category: string, item: string, rowMass: number, rowCost: number) => {
    const cat = category ? `<td class="category-cell">${escapeHtml(category)}</td>` : '<td></td>';
    rows.push(`<tr>${cat}<td>${escapeHtml(item)}</td><td>${rowMass.toFixed(1)} tons</td><td>${rowCost.toFixed(2)} MCr</td></tr>`);
  };

  // Control Center
  const controlCenterMass = calculateControlCenterMass(shipDesign.ship.tonnage);
  const controlCenterCost = calculateControlCenterCost(shipDesign.ship.tonnage);
  addRow('Control Center', `${sections} section${sections !== 1 ? 's' : ''} × 100 tons @ 0.5 MCr/ton`, controlCenterMass, controlCenterCost);

  // Engines (no jump drives on megastructures)
  const validEngines = shipDesign.engines.filter(e =>
    !(e.engine_type === 'maneuver_drive' && e.performance === 0)
  );
  validEngines.forEach((engine, index) => {
    const name = engine.engine_type === 'power_plant' ? 'Power Plant' : 'Maneuver Drive';
    const code = engine.engine_type === 'power_plant' ? 'P' : 'M';
    addRow(index === 0 ? 'Engines' : '', `${name} ${code}-${engine.performance}`, engine.mass, engine.cost);
  });

  // Maneuver fuel only
  const manPerf = shipDesign.engines.find(e => e.engine_type === 'maneuver_drive')?.performance || 0;
  const manFuelMass = manPerf > 0
    ? calculateManeuverFuel(shipDesign.ship.tonnage, manPerf, shipDesign.ship.fuel_weeks)
    : 0;
  if (manFuelMass > 0) {
    addRow('', `Maneuver Fuel (M-${manPerf}, ${shipDesign.ship.fuel_weeks} weeks)`, manFuelMass, 0);
  }

  // Fittings (control_center is auto-calculated above; skip it here)
  let fittingIdx = 0;
  shipDesign.fittings.filter(f => f.fitting_type === 'launch_tube').forEach(tube => {
    addRow(fittingIdx++ === 0 ? 'Fittings' : '', `Launch Tube (${tube.launch_vehicle_mass || 1} ton vehicle)`, tube.mass, tube.cost);
  });
  const comms = shipDesign.fittings.find(f => f.fitting_type === 'comms_sensors');
  if (comms) {
    const sensorType = COMMS_SENSORS_TYPES.find(t => t.type === comms.comms_sensors_type);
    addRow(fittingIdx++ === 0 ? 'Fittings' : '', `${sensorType?.name || 'Standard'} Sensors`, comms.mass, comms.cost);
  }
  const computer = shipDesign.fittings.find(f => f.fitting_type === 'computer');
  if (computer && computer.computer_model) {
    const modelDisplay = computer.computer_model.replace('core_', 'Core/');
    addRow(fittingIdx++ === 0 ? 'Fittings' : '', `Computer ${modelDisplay}`, 0, computer.cost);
  }

  // Weapons
  shipDesign.weapons.filter(w => w.quantity > 0).forEach((weapon, index) => {
    const display = weapon.quantity === 1 ? weapon.weapon_name : `${weapon.weapon_name} (x${weapon.quantity})`;
    addRow(index === 0 ? 'Weapons' : '', display, weapon.mass * weapon.quantity, weapon.cost * weapon.quantity);
  });

  // Defenses
  let defenseIdx = 0;
  const activeDefenses = shipDesign.defenses.filter(d => d.quantity > 0);
  if (activeDefenses.length > 0 || shipDesign.ship.sand_reloads > 0) {
    activeDefenses.forEach(defense => {
      const defenseType = DEFENSE_TYPES.find(dt => dt.type === defense.defense_type);
      const name = defenseType?.name || defense.defense_type;
      const display = defense.quantity === 1 ? name : `${name} (x${defense.quantity})`;
      addRow(defenseIdx++ === 0 ? 'Defenses' : '', display, defense.mass * defense.quantity, defense.cost * defense.quantity);
    });
    if (shipDesign.ship.sand_reloads > 0) {
      addRow(defenseIdx++ === 0 ? 'Defenses' : '', 'Sand', shipDesign.ship.sand_reloads, 0);
    }
  }

  // Berths
  shipDesign.berths.filter(b => b.quantity > 0).forEach((berth, index) => {
    const berthType = BERTH_TYPES.find(bt => bt.type === berth.berth_type);
    const name = berthType?.name || berth.berth_type;
    const display = berth.quantity === 1 ? name : `${name} (x${berth.quantity})`;
    addRow(index === 0 ? 'Berths' : '', display, berth.mass * berth.quantity, berth.cost * berth.quantity);
  });

  // Rec/Health
  const activeFacilities = shipDesign.facilities
    .filter(f => f.quantity > 0)
    .sort((a, b) => a.facility_type === 'commissary' ? -1 : b.facility_type === 'commissary' ? 1 : 0);
  activeFacilities.forEach((facility, index) => {
    const facilityType = FACILITY_TYPES.find(ft => ft.type === facility.facility_type);
    const name = facilityType?.name || facility.facility_type;
    const display = facility.quantity === 1 ? name : `${name} (x${facility.quantity})`;
    addRow(index === 0 ? 'Rec/Health' : '', display, facility.mass * facility.quantity, facility.cost * facility.quantity);
  });

  // Cargo
  shipDesign.cargo.filter(c => c.tonnage > 0).forEach((cargo, index) => {
    const cargoType = CARGO_TYPES.find(ct => ct.type === cargo.cargo_type);
    addRow(index === 0 ? 'Cargo' : '', cargoType?.name || cargo.cargo_type, cargo.tonnage, cargo.cost);
  });

  // Vehicles
  shipDesign.vehicles.filter(v => v.quantity > 0).forEach((vehicle, index) => {
    const vehicleType = VEHICLE_TYPES.find(vt => vt.type === vehicle.vehicle_type);
    const name = (vehicleType?.name || vehicle.vehicle_type).replace(/\b\d+(\.\d+)?\s+ton\s+/gi, '');
    const display = vehicle.quantity === 1 ? name : `${name} (x${vehicle.quantity})`;
    addRow(index === 0 ? 'Vehicles' : '', display, vehicle.mass * vehicle.quantity, vehicle.cost * vehicle.quantity);
  });

  // Drones
  shipDesign.drones.filter(d => d.quantity > 0).forEach((drone, index) => {
    const droneType = DRONE_TYPES.find(dt => dt.type === drone.drone_type);
    const name = (droneType?.name || drone.drone_type).replace(/\b\d+(\.\d+)?\s+ton\s+/gi, '');
    const display = drone.quantity === 1 ? name : `${name} (x${drone.quantity})`;
    addRow(index === 0 ? 'Drones' : '', display, drone.mass * drone.quantity, drone.cost * drone.quantity);
  });

  // Custom Items
  shipDesign.custom_items.forEach((item, index) => {
    addRow(index === 0 ? 'Custom' : '', item.name, item.mass, item.cost);
  });

  // Fuel Systems
  const fuelSystems = shipDesign.fuel_systems || [];
  const scoopQty = fuelSystems.find(f => f.system_type === 'fuel_scoop')?.quantity ?? 0;
  const plantMass = scoopQty * PLANT_PER_SCOOP.mass;
  const plantCost = scoopQty * PLANT_PER_SCOOP.cost;
  let fuelIdx = 0;
  if (scoopQty > 0) {
    addRow(fuelIdx++ === 0 ? 'Fuel Systems' : '', `Fuel Scoops (${scoopQty.toLocaleString()})`, 0, scoopQty);
    addRow(fuelIdx++ === 0 ? 'Fuel Systems' : '', `Plant (${scoopQty.toLocaleString()} × 100 tons)`, plantMass, plantCost);
  }
  fuelSystems.filter(f => f.system_type !== 'fuel_scoop' && f.quantity > 0).forEach(f => {
    addRow(fuelIdx++ === 0 ? 'Fuel Systems' : '', `${f.system_type.replace(/_/g, ' ')} (${f.quantity})`, f.mass, f.cost);
  });

  // Zone Sections
  const zoneSections = shipDesign.zone_sections || [];
  zoneSections.filter(z => z.units > 0).forEach((zone, index) => {
    const spec = ZONE_SECTION_TYPES.find(z2 => z2.type === zone.zone_type);
    addRow(index === 0 ? 'Zone Sections' : '', `${spec?.name || zone.zone_type} (${zone.units} units)`, zone.mass, zone.cost);
  });

  rows.push(
    `<tr class="totals-row"><td><strong>Total</strong></td><td></td>` +
    `<td><strong>${mass.used.toLocaleString()} tons</strong></td>` +
    `<td><strong>${Math.round(cost.total).toLocaleString()} MCr</strong></td></tr>`
  );

  const adjustedTotal = combinePilotNavigator && noStewards
    ? staff.total - 1 - staff.stewards
    : combinePilotNavigator ? staff.total - 1
    : noStewards ? staff.total - staff.stewards
    : staff.total;

  const crewLines: string[] = [];
  if (combinePilotNavigator) {
    crewLines.push('<p><strong>Pilot/Navigator:</strong> 1</p>');
  } else {
    crewLines.push(`<p><strong>Pilot:</strong> ${staff.pilot}</p>`);
    crewLines.push(`<p><strong>Navigator:</strong> ${staff.navigator}</p>`);
  }
  crewLines.push(`<p><strong>Engineers:</strong> ${staff.engineers}</p>`);
  if (staff.gunners > 0) crewLines.push(`<p><strong>Gunners:</strong> ${staff.gunners}</p>`);
  if (staff.service > 0) crewLines.push(`<p><strong>Service Staff:</strong> ${staff.service}</p>`);
  crewLines.push(`<p><strong>Stewards:</strong> ${noStewards ? 0 : staff.stewards}</p>`);
  if (staff.nurses > 0) crewLines.push(`<p><strong>Nurses:</strong> ${staff.nurses}</p>`);
  if (staff.surgeons > 0) crewLines.push(`<p><strong>Surgeons:</strong> ${staff.surgeons}</p>`);
  if (staff.techs > 0) crewLines.push(`<p><strong>Medical Techs:</strong> ${staff.techs}</p>`);
  crewLines.push(`<p><strong>Total Crew:</strong> ${adjustedTotal}</p>`);

  return `<!DOCTYPE html>
<html>
  <head>
    <title>Megastructure Design - ${escapeHtml(shipDesign.ship.name)}</title>
    <style>
      body { font-family: Arial, sans-serif; margin: 20px; }
      .ship-title { font-size: 18px; font-weight: bold; margin-bottom: 20px; }
      table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
      th, td { padding: 8px 12px; border: 1px solid #ccc; text-align: left; }
      th { background-color: #f0f0f0; font-weight: bold; }
      .category-cell { font-weight: bold; }
      .totals-row { border-top: 2px solid #000; font-weight: bold; }
      .totals-row td { background-color: #f8f8f8; }
      @media print { body { margin: 0; } table { page-break-inside: avoid; } }
    </style>
  </head>
  <body>
    <div class="ship-title">${shipTitle}</div>
    <table>
      <thead><tr><th>Category</th><th>Item</th><th>Mass</th><th>Cost</th></tr></thead>
      <tbody>${rows.join('')}</tbody>
    </table>
    <div class="crew-summary">
      <h3>Crew</h3>
      ${crewLines.join('')}
    </div>
  </body>
</html>`;
}
