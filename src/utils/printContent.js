import { COMMS_SENSORS_TYPES, DEFENSE_TYPES, FACILITY_TYPES, CARGO_TYPES, VEHICLE_TYPES, DRONE_TYPES, BERTH_TYPES, } from '../data/constants';
function escapeHtml(text) {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}
function row(category, item, mass, cost) {
    return `<tr>
    <td${category ? ' class="category-cell"' : ''}>${escapeHtml(category)}</td>
    <td>${escapeHtml(item)}</td>
    <td>${mass.toFixed(1)} tons</td>
    <td>${cost.toFixed(2)} MCr</td>
  </tr>`;
}
function buildTableRows(shipDesign, mass, cost, staff, combinePilotNavigator, noStewards) {
    const rows = [];
    // Engines
    const validEngines = shipDesign.engines.filter(e => !(e.engine_type === 'maneuver_drive' && e.performance === 0));
    validEngines.forEach((engine, i) => {
        const name = engine.engine_type === 'power_plant' ? 'Power Plant'
            : engine.engine_type === 'jump_drive' ? 'Jump Drive'
                : 'Maneuver Drive';
        const code = engine.engine_type === 'power_plant' ? 'P'
            : engine.engine_type === 'jump_drive' ? 'J' : 'M';
        rows.push(row(i === 0 ? 'Engines' : '', `${name} ${code}-${engine.performance}`, engine.mass, engine.cost));
    });
    // Fittings
    let fittingIdx = 0;
    const hasBridge = shipDesign.fittings.some(f => f.fitting_type === 'bridge');
    const hasHalfBridge = shipDesign.fittings.some(f => f.fitting_type === 'half_bridge');
    const bridgeData = shipDesign.fittings.find(f => f.fitting_type === 'bridge' || f.fitting_type === 'half_bridge');
    if ((hasBridge || hasHalfBridge) && bridgeData) {
        rows.push(row(fittingIdx++ === 0 ? 'Fittings' : '', hasBridge ? 'Bridge' : 'Half Bridge', bridgeData.mass, bridgeData.cost));
    }
    shipDesign.fittings.filter(f => f.fitting_type === 'launch_tube').forEach(tube => {
        rows.push(row(fittingIdx++ === 0 ? 'Fittings' : '', `Launch Tube (${tube.launch_vehicle_mass || 1} ton vehicle)`, tube.mass, tube.cost));
    });
    const commsSensors = shipDesign.fittings.find(f => f.fitting_type === 'comms_sensors');
    if (commsSensors) {
        const sensorType = COMMS_SENSORS_TYPES.find(t => t.type === commsSensors.comms_sensors_type);
        rows.push(row(fittingIdx++ === 0 ? 'Fittings' : '', `${sensorType?.name || 'Standard'} Comms & Sensors`, commsSensors.mass, commsSensors.cost));
    }
    // Weapons
    shipDesign.weapons.filter(w => w.quantity > 0).forEach((weapon, i) => {
        const display = weapon.quantity === 1 ? weapon.weapon_name : `${weapon.weapon_name} (x${weapon.quantity})`;
        rows.push(row(i === 0 ? 'Weapons' : '', display, weapon.mass * weapon.quantity, weapon.cost * weapon.quantity));
    });
    // Defenses
    const activeDefenses = shipDesign.defenses.filter(d => d.quantity > 0);
    const hasSand = shipDesign.ship.sand_reloads > 0;
    if (activeDefenses.length > 0 || hasSand) {
        let defIdx = 0;
        activeDefenses.forEach(defense => {
            const defType = DEFENSE_TYPES.find(dt => dt.type === defense.defense_type);
            const name = defType?.name || defense.defense_type;
            const display = defense.quantity === 1 ? name : `${name} (x${defense.quantity})`;
            rows.push(row(defIdx++ === 0 ? 'Defenses' : '', display, defense.mass * defense.quantity, defense.cost * defense.quantity));
        });
        if (hasSand) {
            rows.push(row(defIdx++ === 0 ? 'Defenses' : '', 'Sand', shipDesign.ship.sand_reloads, 0));
        }
    }
    // Berths
    shipDesign.berths.filter(b => b.quantity > 0).forEach((berth, i) => {
        const bType = BERTH_TYPES.find(bt => bt.type === berth.berth_type);
        const name = bType?.name || berth.berth_type;
        const display = berth.quantity === 1 ? name : `${name} (x${berth.quantity})`;
        rows.push(row(i === 0 ? 'Berths' : '', display, berth.mass * berth.quantity, berth.cost * berth.quantity));
    });
    // Rec/Health
    const activeFacilities = shipDesign.facilities.filter(f => f.quantity > 0)
        .sort((a, b) => (a.facility_type === 'commissary' ? -1 : b.facility_type === 'commissary' ? 1 : 0));
    activeFacilities.forEach((facility, i) => {
        const fType = FACILITY_TYPES.find(ft => ft.type === facility.facility_type);
        const name = fType?.name || facility.facility_type;
        const display = facility.quantity === 1 ? name : `${name} (x${facility.quantity})`;
        rows.push(row(i === 0 ? 'Rec/Health' : '', display, facility.mass * facility.quantity, facility.cost * facility.quantity));
    });
    // Cargo
    shipDesign.cargo.filter(c => c.tonnage > 0).forEach((cargo, i) => {
        const cType = CARGO_TYPES.find(ct => ct.type === cargo.cargo_type);
        rows.push(row(i === 0 ? 'Cargo' : '', cType?.name || cargo.cargo_type, cargo.tonnage, cargo.cost));
    });
    // Vehicles
    shipDesign.vehicles.filter(v => v.quantity > 0).forEach((vehicle, i) => {
        const vType = VEHICLE_TYPES.find(vt => vt.type === vehicle.vehicle_type);
        const name = (vType?.name || vehicle.vehicle_type).replace(/\b\d+(\.\d+)?\s+ton\s+/gi, '');
        const display = vehicle.quantity === 1 ? name : `${name} (x${vehicle.quantity})`;
        rows.push(row(i === 0 ? 'Vehicles' : '', display, vehicle.mass * vehicle.quantity, vehicle.cost * vehicle.quantity));
    });
    // Drones
    shipDesign.drones.filter(d => d.quantity > 0).forEach((drone, i) => {
        const dType = DRONE_TYPES.find(dt => dt.type === drone.drone_type);
        const name = (dType?.name || drone.drone_type).replace(/\b\d+(\.\d+)?\s+ton\s+/gi, '');
        const display = drone.quantity === 1 ? name : `${name} (x${drone.quantity})`;
        rows.push(row(i === 0 ? 'Drones' : '', display, drone.mass * drone.quantity, drone.cost * drone.quantity));
    });
    // Totals
    rows.push(`<tr class="totals-row">
    <td><strong>Total</strong></td>
    <td></td>
    <td><strong>${mass.used.toFixed(1)} tons</strong></td>
    <td><strong>${cost.total.toFixed(2)} MCr</strong></td>
  </tr>`);
    // Crew summary
    const crewTotal = combinePilotNavigator && noStewards
        ? staff.total - 1 - staff.stewards
        : combinePilotNavigator ? staff.total - 1
            : noStewards ? staff.total - staff.stewards
                : staff.total;
    const crewRows = [];
    if (combinePilotNavigator) {
        crewRows.push('<tr><td><strong>Crew</strong></td><td>Pilot/Navigator</td><td>1</td><td></td></tr>');
    }
    else {
        crewRows.push('<tr><td><strong>Crew</strong></td><td>Pilot</td><td>1</td><td></td></tr>');
        crewRows.push('<tr><td></td><td>Navigator</td><td>1</td><td></td></tr>');
    }
    crewRows.push(`<tr><td></td><td>Engineers</td><td>${staff.engineers}</td><td></td></tr>`);
    if (staff.gunners > 0)
        crewRows.push(`<tr><td></td><td>Gunners</td><td>${staff.gunners}</td><td></td></tr>`);
    if (staff.service > 0)
        crewRows.push(`<tr><td></td><td>Service Staff</td><td>${staff.service}</td><td></td></tr>`);
    if (!noStewards && staff.stewards > 0)
        crewRows.push(`<tr><td></td><td>Stewards</td><td>${staff.stewards}</td><td></td></tr>`);
    if (staff.nurses > 0)
        crewRows.push(`<tr><td></td><td>Nurses</td><td>${staff.nurses}</td><td></td></tr>`);
    if (staff.surgeons > 0)
        crewRows.push(`<tr><td></td><td>Surgeons</td><td>${staff.surgeons}</td><td></td></tr>`);
    if (staff.techs > 0)
        crewRows.push(`<tr><td></td><td>Medical Techs</td><td>${staff.techs}</td><td></td></tr>`);
    crewRows.push(`<tr class="totals-row"><td><strong>Total Crew</strong></td><td></td><td><strong>${crewTotal}</strong></td><td></td></tr>`);
    return rows.join('\n') + '\n' + crewRows.join('\n');
}
export function generateShipPrintContent(shipDesign, mass, cost, staff, combinePilotNavigator, noStewards) {
    const name = escapeHtml(shipDesign.ship.name);
    const title = `${name}, ${escapeHtml(shipDesign.ship.configuration)} configuration, ${shipDesign.ship.tonnage} tons, Tech Level ${escapeHtml(shipDesign.ship.tech_level)}`;
    return `<!DOCTYPE html>
<html>
  <head>
    <title>Ship Design - ${name}</title>
    <style>
      body { font-family: Arial, sans-serif; margin: 20px; }
      .ship-title { font-size: 18px; font-weight: bold; margin-bottom: 20px; }
      table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
      th, td { padding: 8px 12px; border: 1px solid #ccc; text-align: left; }
      th { background-color: #f0f0f0; font-weight: bold; }
      .category-cell { font-weight: bold; }
      .totals-row td { border-top: 2px solid #000; font-weight: bold; background-color: #f8f8f8; }
      @media print {
        body { margin: 0; }
        .ship-title { page-break-after: avoid; }
        table { page-break-inside: avoid; }
      }
    </style>
  </head>
  <body>
    <div class="ship-title">${title}</div>
    <table>
      <thead>
        <tr>
          <th>Category</th>
          <th>Item</th>
          <th>Mass / Count</th>
          <th>Cost</th>
        </tr>
      </thead>
      <tbody>
        ${buildTableRows(shipDesign, mass, cost, staff, combinePilotNavigator, noStewards)}
      </tbody>
    </table>
  </body>
</html>`;
}
