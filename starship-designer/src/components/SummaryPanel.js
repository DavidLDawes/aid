import { jsxs as _jsxs, jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { COMMS_SENSORS_TYPES, DEFENSE_TYPES, FACILITY_TYPES, CARGO_TYPES, VEHICLE_TYPES, DRONE_TYPES, BERTH_TYPES } from '../data/constants';
import { databaseService } from '../services/database';
const SummaryPanel = ({ shipDesign, mass, cost, staff, combinePilotNavigator, noStewards, onBackToShipSelect }) => {
    const [saving, setSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState(null);
    const [showCsvModal, setShowCsvModal] = useState(false);
    const [csvData, setCsvData] = useState('');
    const [showOverwriteDialog, setShowOverwriteDialog] = useState(false);
    const [pendingShipName, setPendingShipName] = useState('');
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
        }
        catch (error) {
            console.error('Error saving ship:', error);
            const errorMessage = error instanceof Error ? error.message : 'Failed to save ship design. Please try again.';
            // Check if this is a name collision error
            if (errorMessage.includes('already exists')) {
                setPendingShipName(shipDesign.ship.name);
                setShowOverwriteDialog(true);
            }
            else {
                setSaveMessage(errorMessage);
                setTimeout(() => setSaveMessage(null), 5000);
            }
        }
        finally {
            setSaving(false);
        }
    };
    const handleOverwriteConfirm = async () => {
        try {
            setSaving(true);
            setShowOverwriteDialog(false);
            setSaveMessage(null);
            await databaseService.initialize();
            await databaseService.saveOrUpdateShipByName(shipDesign);
            setSaveMessage('Ship design saved successfully!');
            setTimeout(() => setSaveMessage(null), 3000);
        }
        catch (error) {
            console.error('Error overwriting ship:', error);
            const errorMessage = error instanceof Error ? error.message : 'Failed to save ship design. Please try again.';
            setSaveMessage(errorMessage);
            setTimeout(() => setSaveMessage(null), 5000);
        }
        finally {
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
        const lines = [];
        // First line: ship info from the title line
        const shipInfoLine = `${shipDesign.ship.name}, ${shipDesign.ship.configuration} configuration, ${shipDesign.ship.tonnage} tons, Tech Level ${shipDesign.ship.tech_level}`;
        lines.push(shipInfoLine);
        // Second line: CSV headers
        lines.push('Category,Item,Mass,Cost');
        // Generate all table rows
        const allRows = [];
        // Engines
        const validEngines = shipDesign.engines.filter(engine => !(engine.engine_type === 'maneuver_drive' && engine.performance === 0));
        validEngines.forEach((engine, index) => {
            const engineName = engine.engine_type === 'power_plant' ? 'Power Plant' :
                engine.engine_type === 'jump_drive' ? 'Jump Drive' :
                    'Maneuver Drive';
            const performanceCode = engine.engine_type === 'power_plant' ? 'P' :
                engine.engine_type === 'jump_drive' ? 'J' :
                    'M';
            allRows.push({
                category: index === 0 ? 'Engines' : '',
                item: `${engineName} ${performanceCode}-${engine.performance}`,
                mass: engine.mass,
                cost: engine.cost
            });
        });
        // Fittings
        let fittingRowIndex = 0;
        const hasBridge = shipDesign.fittings.some(f => f.fitting_type === 'bridge');
        const hasHalfBridge = shipDesign.fittings.some(f => f.fitting_type === 'half_bridge');
        const launchTubes = shipDesign.fittings.filter(f => f.fitting_type === 'launch_tube');
        const commsSensors = shipDesign.fittings.find(f => f.fitting_type === 'comms_sensors');
        if (hasBridge || hasHalfBridge) {
            const bridgeType = hasBridge ? 'Bridge' : 'Half Bridge';
            const bridgeData = shipDesign.fittings.find(f => f.fitting_type === 'bridge' || f.fitting_type === 'half_bridge');
            if (bridgeData) {
                allRows.push({
                    category: fittingRowIndex === 0 ? 'Fittings' : '',
                    item: bridgeType,
                    mass: bridgeData.mass,
                    cost: bridgeData.cost
                });
                fittingRowIndex++;
            }
        }
        launchTubes.forEach((tube) => {
            allRows.push({
                category: fittingRowIndex === 0 ? 'Fittings' : '',
                item: `Launch Tube (${tube.launch_vehicle_mass || 1} ton vehicle)`,
                mass: tube.mass,
                cost: tube.cost
            });
            fittingRowIndex++;
        });
        if (commsSensors) {
            const sensorType = COMMS_SENSORS_TYPES.find(t => t.type === commsSensors.comms_sensors_type);
            allRows.push({
                category: fittingRowIndex === 0 ? 'Fittings' : '',
                item: `${sensorType?.name || 'Standard'} Comms & Sensors`,
                mass: commsSensors.mass,
                cost: commsSensors.cost
            });
        }
        // Weapons
        const activeWeapons = shipDesign.weapons.filter(weapon => weapon.quantity > 0);
        activeWeapons.forEach((weapon, index) => {
            const weaponDisplay = weapon.quantity === 1 ? weapon.weapon_name : `${weapon.weapon_name} (x${weapon.quantity})`;
            allRows.push({
                category: index === 0 ? 'Weapons' : '',
                item: weaponDisplay,
                mass: weapon.mass * weapon.quantity,
                cost: weapon.cost * weapon.quantity
            });
        });
        // Defenses
        let defenseRowIndex = 0;
        const activeDefenses = shipDesign.defenses.filter(defense => defense.quantity > 0);
        const hasSand = shipDesign.ship.sand_reloads > 0;
        if (activeDefenses.length > 0 || hasSand) {
            activeDefenses.forEach((defense) => {
                const defenseType = DEFENSE_TYPES.find(dt => dt.type === defense.defense_type);
                const defenseName = defenseType?.name || defense.defense_type;
                const defenseDisplay = defense.quantity === 1 ? defenseName : `${defenseName} (x${defense.quantity})`;
                allRows.push({
                    category: defenseRowIndex === 0 ? 'Defenses' : '',
                    item: defenseDisplay,
                    mass: defense.mass * defense.quantity,
                    cost: defense.cost * defense.quantity
                });
                defenseRowIndex++;
            });
            if (hasSand) {
                allRows.push({
                    category: defenseRowIndex === 0 ? 'Defenses' : '',
                    item: 'Sand',
                    mass: shipDesign.ship.sand_reloads,
                    cost: 0
                });
            }
        }
        // Berths
        const activeBerths = shipDesign.berths.filter(berth => berth.quantity > 0);
        activeBerths.forEach((berth, index) => {
            const berthType = BERTH_TYPES.find(bt => bt.type === berth.berth_type);
            const berthName = berthType?.name || berth.berth_type;
            const berthDisplay = berth.quantity === 1 ? berthName : `${berthName} (x${berth.quantity})`;
            allRows.push({
                category: index === 0 ? 'Berths' : '',
                item: berthDisplay,
                mass: berth.mass * berth.quantity,
                cost: berth.cost * berth.quantity
            });
        });
        // Rec/Health
        const activeFacilities = shipDesign.facilities.filter(facility => facility.quantity > 0);
        if (activeFacilities.length > 0) {
            const sortedFacilities = activeFacilities.sort((a, b) => {
                if (a.facility_type === 'commissary')
                    return -1;
                if (b.facility_type === 'commissary')
                    return 1;
                return 0;
            });
            sortedFacilities.forEach((facility, index) => {
                const facilityType = FACILITY_TYPES.find(ft => ft.type === facility.facility_type);
                const facilityName = facilityType?.name || facility.facility_type;
                const facilityDisplay = facility.quantity === 1 ? facilityName : `${facilityName} (x${facility.quantity})`;
                allRows.push({
                    category: index === 0 ? 'Rec/Health' : '',
                    item: facilityDisplay,
                    mass: facility.mass * facility.quantity,
                    cost: facility.cost * facility.quantity
                });
            });
        }
        // Cargo
        const activeCargo = shipDesign.cargo.filter(cargo => cargo.tonnage > 0);
        activeCargo.forEach((cargo, index) => {
            const cargoType = CARGO_TYPES.find(ct => ct.type === cargo.cargo_type);
            const cargoName = cargoType?.name || cargo.cargo_type;
            allRows.push({
                category: index === 0 ? 'Cargo' : '',
                item: cargoName,
                mass: cargo.tonnage,
                cost: cargo.cost
            });
        });
        // Vehicles
        const activeVehicles = shipDesign.vehicles.filter(vehicle => vehicle.quantity > 0);
        activeVehicles.forEach((vehicle, index) => {
            const vehicleType = VEHICLE_TYPES.find(vt => vt.type === vehicle.vehicle_type);
            let vehicleName = vehicleType?.name || vehicle.vehicle_type;
            vehicleName = vehicleName.replace(/\b\d+(\.\d+)?\s+ton\s+/gi, '');
            const vehicleDisplay = vehicle.quantity === 1 ? vehicleName : `${vehicleName} (x${vehicle.quantity})`;
            allRows.push({
                category: index === 0 ? 'Vehicles' : '',
                item: vehicleDisplay,
                mass: vehicle.mass * vehicle.quantity,
                cost: vehicle.cost * vehicle.quantity
            });
        });
        // Drones
        const activeDrones = shipDesign.drones.filter(drone => drone.quantity > 0);
        activeDrones.forEach((drone, index) => {
            const droneType = DRONE_TYPES.find(dt => dt.type === drone.drone_type);
            let droneName = droneType?.name || drone.drone_type;
            droneName = droneName.replace(/\b\d+(\.\d+)?\s+ton\s+/gi, '');
            const droneDisplay = drone.quantity === 1 ? droneName : `${droneName} (x${drone.quantity})`;
            allRows.push({
                category: index === 0 ? 'Drones' : '',
                item: droneDisplay,
                mass: drone.mass * drone.quantity,
                cost: drone.cost * drone.quantity
            });
        });
        // Add all rows to CSV
        allRows.forEach(row => {
            lines.push(`${row.category},${row.item},${row.mass.toFixed(1)},${row.cost.toFixed(2)}`);
        });
        // Add totals row
        lines.push(`Total,,${mass.used.toFixed(1)},${cost.total.toFixed(2)}`);
        return lines.join('\n');
    };
    const handleCsvExport = () => {
        const csvContent = generateCsvData();
        setCsvData(csvContent);
        setShowCsvModal(true);
    };
    const handlePrint = () => {
        const printWindow = window.open('', '_blank');
        if (!printWindow)
            return;
        const shipTitle = `${shipDesign.ship.name}, ${shipDesign.ship.configuration} configuration, ${shipDesign.ship.tonnage} tons, Tech Level ${shipDesign.ship.tech_level}`;
        // Generate the same table structure as displayed
        const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Ship Design - ${shipDesign.ship.name}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .ship-title { font-size: 18px; font-weight: bold; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th, td { padding: 8px 12px; border: 1px solid #ccc; text-align: left; }
            th { background-color: #f0f0f0; font-weight: bold; }
            .category-cell { font-weight: bold; }
            .totals-row { border-top: 2px solid #000; font-weight: bold; }
            .totals-row td { background-color: #f8f8f8; }
            @media print {
              body { margin: 0; }
              .ship-title { page-break-after: avoid; }
              table { page-break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          <div class="ship-title">${shipTitle}</div>
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
              ${generateTableRows()}
            </tbody>
          </table>
        </body>
      </html>
    `;
        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.close();
    };
    const generateTableRows = () => {
        const rows = [];
        // Helper function to add a row
        const addRow = (category, item, mass, cost) => {
            const categoryDisplay = category ? `<td class="category-cell">${category}</td>` : '<td></td>';
            rows.push(`
        <tr>
          ${categoryDisplay}
          <td>${item}</td>
          <td>${mass.toFixed(1)} tons</td>
          <td>${cost.toFixed(2)} MCr</td>
        </tr>
      `);
        };
        // Engines
        const validEngines = shipDesign.engines.filter(engine => !(engine.engine_type === 'maneuver_drive' && engine.performance === 0));
        validEngines.forEach((engine, index) => {
            const engineName = engine.engine_type === 'power_plant' ? 'Power Plant' :
                engine.engine_type === 'jump_drive' ? 'Jump Drive' :
                    'Maneuver Drive';
            const performanceCode = engine.engine_type === 'power_plant' ? 'P' :
                engine.engine_type === 'jump_drive' ? 'J' :
                    'M';
            addRow(index === 0 ? 'Engines' : '', `${engineName} ${performanceCode}-${engine.performance}`, engine.mass, engine.cost);
        });
        // Fittings
        let fittingRowIndex = 0;
        const hasBridge = shipDesign.fittings.some(f => f.fitting_type === 'bridge');
        const hasHalfBridge = shipDesign.fittings.some(f => f.fitting_type === 'half_bridge');
        const launchTubes = shipDesign.fittings.filter(f => f.fitting_type === 'launch_tube');
        const commsSensors = shipDesign.fittings.find(f => f.fitting_type === 'comms_sensors');
        if (hasBridge || hasHalfBridge) {
            const bridgeType = hasBridge ? 'Bridge' : 'Half Bridge';
            const bridgeData = shipDesign.fittings.find(f => f.fitting_type === 'bridge' || f.fitting_type === 'half_bridge');
            if (bridgeData) {
                addRow(fittingRowIndex === 0 ? 'Fittings' : '', bridgeType, bridgeData.mass, bridgeData.cost);
                fittingRowIndex++;
            }
        }
        launchTubes.forEach((tube) => {
            addRow(fittingRowIndex === 0 ? 'Fittings' : '', `Launch Tube (${tube.launch_vehicle_mass || 1} ton vehicle)`, tube.mass, tube.cost);
            fittingRowIndex++;
        });
        if (commsSensors) {
            const sensorType = COMMS_SENSORS_TYPES.find(t => t.type === commsSensors.comms_sensors_type);
            addRow(fittingRowIndex === 0 ? 'Fittings' : '', `${sensorType?.name || 'Standard'} Comms & Sensors`, commsSensors.mass, commsSensors.cost);
        }
        // Weapons
        const activeWeapons = shipDesign.weapons.filter(weapon => weapon.quantity > 0);
        activeWeapons.forEach((weapon, index) => {
            const weaponDisplay = weapon.quantity === 1 ? weapon.weapon_name : `${weapon.weapon_name} (x${weapon.quantity})`;
            addRow(index === 0 ? 'Weapons' : '', weaponDisplay, weapon.mass * weapon.quantity, weapon.cost * weapon.quantity);
        });
        // Defenses
        let defenseRowIndex = 0;
        const activeDefenses = shipDesign.defenses.filter(defense => defense.quantity > 0);
        const hasSand = shipDesign.ship.sand_reloads > 0;
        if (activeDefenses.length > 0 || hasSand) {
            activeDefenses.forEach((defense) => {
                const defenseType = DEFENSE_TYPES.find(dt => dt.type === defense.defense_type);
                const defenseName = defenseType?.name || defense.defense_type;
                const defenseDisplay = defense.quantity === 1 ? defenseName : `${defenseName} (x${defense.quantity})`;
                addRow(defenseRowIndex === 0 ? 'Defenses' : '', defenseDisplay, defense.mass * defense.quantity, defense.cost * defense.quantity);
                defenseRowIndex++;
            });
            if (hasSand) {
                addRow(defenseRowIndex === 0 ? 'Defenses' : '', 'Sand', shipDesign.ship.sand_reloads, 0);
            }
        }
        // Berths
        const activeBerths = shipDesign.berths.filter(berth => berth.quantity > 0);
        activeBerths.forEach((berth, index) => {
            const berthType = BERTH_TYPES.find(bt => bt.type === berth.berth_type);
            const berthName = berthType?.name || berth.berth_type;
            const berthDisplay = berth.quantity === 1 ? berthName : `${berthName} (x${berth.quantity})`;
            addRow(index === 0 ? 'Berths' : '', berthDisplay, berth.mass * berth.quantity, berth.cost * berth.quantity);
        });
        // Rec/Health
        const activeFacilities = shipDesign.facilities.filter(facility => facility.quantity > 0);
        if (activeFacilities.length > 0) {
            const sortedFacilities = activeFacilities.sort((a, b) => {
                if (a.facility_type === 'commissary')
                    return -1;
                if (b.facility_type === 'commissary')
                    return 1;
                return 0;
            });
            sortedFacilities.forEach((facility, index) => {
                const facilityType = FACILITY_TYPES.find(ft => ft.type === facility.facility_type);
                const facilityName = facilityType?.name || facility.facility_type;
                const facilityDisplay = facility.quantity === 1 ? facilityName : `${facilityName} (x${facility.quantity})`;
                addRow(index === 0 ? 'Rec/Health' : '', facilityDisplay, facility.mass * facility.quantity, facility.cost * facility.quantity);
            });
        }
        // Cargo
        const activeCargo = shipDesign.cargo.filter(cargo => cargo.tonnage > 0);
        activeCargo.forEach((cargo, index) => {
            const cargoType = CARGO_TYPES.find(ct => ct.type === cargo.cargo_type);
            const cargoName = cargoType?.name || cargo.cargo_type;
            addRow(index === 0 ? 'Cargo' : '', cargoName, cargo.tonnage, cargo.cost);
        });
        // Vehicles
        const activeVehicles = shipDesign.vehicles.filter(vehicle => vehicle.quantity > 0);
        activeVehicles.forEach((vehicle, index) => {
            const vehicleType = VEHICLE_TYPES.find(vt => vt.type === vehicle.vehicle_type);
            let vehicleName = vehicleType?.name || vehicle.vehicle_type;
            vehicleName = vehicleName.replace(/\b\d+(\.\d+)?\s+ton\s+/gi, '');
            const vehicleDisplay = vehicle.quantity === 1 ? vehicleName : `${vehicleName} (x${vehicle.quantity})`;
            addRow(index === 0 ? 'Vehicles' : '', vehicleDisplay, vehicle.mass * vehicle.quantity, vehicle.cost * vehicle.quantity);
        });
        // Drones
        const activeDrones = shipDesign.drones.filter(drone => drone.quantity > 0);
        activeDrones.forEach((drone, index) => {
            const droneType = DRONE_TYPES.find(dt => dt.type === drone.drone_type);
            let droneName = droneType?.name || drone.drone_type;
            droneName = droneName.replace(/\b\d+(\.\d+)?\s+ton\s+/gi, '');
            const droneDisplay = drone.quantity === 1 ? droneName : `${droneName} (x${drone.quantity})`;
            addRow(index === 0 ? 'Drones' : '', droneDisplay, drone.mass * drone.quantity, drone.cost * drone.quantity);
        });
        // Totals row
        rows.push(`
      <tr class="totals-row">
        <td><strong>Total</strong></td>
        <td></td>
        <td><strong>${mass.used.toFixed(1)} tons</strong></td>
        <td><strong>${cost.total.toFixed(2)} MCr</strong></td>
      </tr>
    `);
        return rows.join('');
    };
    // Add keyboard event listener for Ctrl+P
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.ctrlKey && event.key === 'p') {
                event.preventDefault();
                handlePrint();
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [shipDesign, mass, cost]);
    return (_jsxs("div", { className: "panel-content", children: [_jsx("div", { className: "ship-title-line", children: _jsxs("h3", { children: [shipDesign.ship.name, ", ", shipDesign.ship.configuration, " configuration, ", shipDesign.ship.tonnage, " tons, Tech Level ", shipDesign.ship.tech_level] }) }), _jsx("div", { className: "ship-components-table", children: _jsxs("table", { children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "Category" }), _jsx("th", { children: "Item" }), _jsx("th", { children: "Mass" }), _jsx("th", { children: "Cost" })] }) }), _jsxs("tbody", { children: [(() => {
                                    // Filter out M-0 maneuver drives and create engine rows
                                    const validEngines = shipDesign.engines.filter(engine => !(engine.engine_type === 'maneuver_drive' && engine.performance === 0));
                                    return validEngines.map((engine, index) => {
                                        const engineName = engine.engine_type === 'power_plant' ? 'Power Plant' :
                                            engine.engine_type === 'jump_drive' ? 'Jump Drive' :
                                                'Maneuver Drive';
                                        const performanceCode = engine.engine_type === 'power_plant' ? 'P' :
                                            engine.engine_type === 'jump_drive' ? 'J' :
                                                'M';
                                        return (_jsxs("tr", { children: [_jsx("td", { children: index === 0 ? 'Engines' : '' }), _jsxs("td", { children: [engineName, " ", performanceCode, "-", engine.performance] }), _jsxs("td", { children: [engine.mass.toFixed(1), " tons"] }), _jsxs("td", { children: [engine.cost.toFixed(2), " MCr"] })] }, engine.engine_type));
                                    });
                                })(), (() => {
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
                                            rows.push(_jsxs("tr", { children: [_jsx("td", { children: fittingRowIndex === 0 ? 'Fittings' : '' }), _jsx("td", { children: bridgeType }), _jsxs("td", { children: [bridgeData.mass.toFixed(1), " tons"] }), _jsxs("td", { children: [bridgeData.cost.toFixed(2), " MCr"] })] }, "bridge"));
                                            fittingRowIndex++;
                                        }
                                    }
                                    // Launch Tubes
                                    launchTubes.forEach((tube, index) => {
                                        rows.push(_jsxs("tr", { children: [_jsx("td", { children: fittingRowIndex === 0 ? 'Fittings' : '' }), _jsxs("td", { children: ["Launch Tube (", tube.launch_vehicle_mass || 1, " ton vehicle)"] }), _jsxs("td", { children: [tube.mass.toFixed(1), " tons"] }), _jsxs("td", { children: [tube.cost.toFixed(2), " MCr"] })] }, `launch_tube_${index}`));
                                        fittingRowIndex++;
                                    });
                                    // Comms & Sensors
                                    if (commsSensors) {
                                        const sensorType = COMMS_SENSORS_TYPES.find(t => t.type === commsSensors.comms_sensors_type);
                                        rows.push(_jsxs("tr", { children: [_jsx("td", { children: fittingRowIndex === 0 ? 'Fittings' : '' }), _jsxs("td", { children: [sensorType?.name || 'Standard', " Comms & Sensors"] }), _jsxs("td", { children: [commsSensors.mass.toFixed(1), " tons"] }), _jsxs("td", { children: [commsSensors.cost.toFixed(2), " MCr"] })] }, "comms_sensors"));
                                        fittingRowIndex++;
                                    }
                                    return rows;
                                })(), (() => {
                                    const rows = [];
                                    let weaponRowIndex = 0;
                                    const activeWeapons = shipDesign.weapons.filter(weapon => weapon.quantity > 0);
                                    // Only add weapons section if there are active weapons
                                    if (activeWeapons.length > 0) {
                                        activeWeapons.forEach(weapon => {
                                            const weaponDisplay = weapon.quantity === 1 ? weapon.weapon_name : `${weapon.weapon_name} (x${weapon.quantity})`;
                                            rows.push(_jsxs("tr", { children: [_jsx("td", { children: weaponRowIndex === 0 ? 'Weapons' : '' }), _jsx("td", { children: weaponDisplay }), _jsxs("td", { children: [(weapon.mass * weapon.quantity).toFixed(1), " tons"] }), _jsxs("td", { children: [(weapon.cost * weapon.quantity).toFixed(2), " MCr"] })] }, `weapon_${weapon.weapon_name}`));
                                            weaponRowIndex++;
                                        });
                                    }
                                    return rows;
                                })(), (() => {
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
                                            rows.push(_jsxs("tr", { children: [_jsx("td", { children: defenseRowIndex === 0 ? 'Defenses' : '' }), _jsx("td", { children: defenseDisplay }), _jsxs("td", { children: [(defense.mass * defense.quantity).toFixed(1), " tons"] }), _jsxs("td", { children: [(defense.cost * defense.quantity).toFixed(2), " MCr"] })] }, `defense_${defense.defense_type}`));
                                            defenseRowIndex++;
                                        });
                                        // Add sand if any is configured
                                        if (hasSand) {
                                            rows.push(_jsxs("tr", { children: [_jsx("td", { children: defenseRowIndex === 0 ? 'Defenses' : '' }), _jsx("td", { children: "Sand" }), _jsxs("td", { children: [shipDesign.ship.sand_reloads.toFixed(1), " tons"] }), _jsx("td", {})] }, "defense_sand"));
                                            defenseRowIndex++;
                                        }
                                    }
                                    return rows;
                                })(), (() => {
                                    const rows = [];
                                    let berthRowIndex = 0;
                                    const activeBerths = shipDesign.berths.filter(berth => berth.quantity > 0);
                                    // Only add Berths section if there are active berths
                                    if (activeBerths.length > 0) {
                                        activeBerths.forEach(berth => {
                                            const berthType = BERTH_TYPES.find(bt => bt.type === berth.berth_type);
                                            const berthName = berthType?.name || berth.berth_type;
                                            const berthDisplay = berth.quantity === 1 ? berthName : `${berthName} (x${berth.quantity})`;
                                            rows.push(_jsxs("tr", { children: [_jsx("td", { children: berthRowIndex === 0 ? 'Berths' : '' }), _jsx("td", { children: berthDisplay }), _jsxs("td", { children: [(berth.mass * berth.quantity).toFixed(1), " tons"] }), _jsxs("td", { children: [(berth.cost * berth.quantity).toFixed(2), " MCr"] })] }, `berth_${berth.berth_type}`));
                                            berthRowIndex++;
                                        });
                                    }
                                    return rows;
                                })(), (() => {
                                    const rows = [];
                                    let facilityRowIndex = 0;
                                    const activeFacilities = shipDesign.facilities.filter(facility => facility.quantity > 0);
                                    // Only add Rec/Health section if there are active facilities
                                    if (activeFacilities.length > 0) {
                                        // Sort facilities to show Commissary first, then the rest
                                        const sortedFacilities = activeFacilities.sort((a, b) => {
                                            if (a.facility_type === 'commissary')
                                                return -1;
                                            if (b.facility_type === 'commissary')
                                                return 1;
                                            return 0;
                                        });
                                        sortedFacilities.forEach(facility => {
                                            const facilityType = FACILITY_TYPES.find(ft => ft.type === facility.facility_type);
                                            const facilityName = facilityType?.name || facility.facility_type;
                                            const facilityDisplay = facility.quantity === 1 ? facilityName : `${facilityName} (x${facility.quantity})`;
                                            rows.push(_jsxs("tr", { children: [_jsx("td", { children: facilityRowIndex === 0 ? 'Rec/Health' : '' }), _jsx("td", { children: facilityDisplay }), _jsxs("td", { children: [(facility.mass * facility.quantity).toFixed(1), " tons"] }), _jsxs("td", { children: [(facility.cost * facility.quantity).toFixed(2), " MCr"] })] }, `facility_${facility.facility_type}`));
                                            facilityRowIndex++;
                                        });
                                    }
                                    return rows;
                                })(), (() => {
                                    const rows = [];
                                    let cargoRowIndex = 0;
                                    const activeCargo = shipDesign.cargo.filter(cargo => cargo.tonnage > 0);
                                    // Only add Cargo section if there are active cargo items
                                    if (activeCargo.length > 0) {
                                        activeCargo.forEach(cargo => {
                                            const cargoType = CARGO_TYPES.find(ct => ct.type === cargo.cargo_type);
                                            const cargoName = cargoType?.name || cargo.cargo_type;
                                            rows.push(_jsxs("tr", { children: [_jsx("td", { children: cargoRowIndex === 0 ? 'Cargo' : '' }), _jsx("td", { children: cargoName }), _jsxs("td", { children: [cargo.tonnage.toFixed(1), " tons"] }), _jsxs("td", { children: [cargo.cost.toFixed(2), " MCr"] })] }, `cargo_${cargo.cargo_type}`));
                                            cargoRowIndex++;
                                        });
                                    }
                                    return rows;
                                })(), (() => {
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
                                            rows.push(_jsxs("tr", { children: [_jsx("td", { children: vehicleRowIndex === 0 ? 'Vehicles' : '' }), _jsx("td", { children: vehicleDisplay }), _jsxs("td", { children: [(vehicle.mass * vehicle.quantity).toFixed(1), " tons"] }), _jsxs("td", { children: [(vehicle.cost * vehicle.quantity).toFixed(2), " MCr"] })] }, `vehicle_${vehicle.vehicle_type}`));
                                            vehicleRowIndex++;
                                        });
                                    }
                                    return rows;
                                })(), (() => {
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
                                            rows.push(_jsxs("tr", { children: [_jsx("td", { children: droneRowIndex === 0 ? 'Drones' : '' }), _jsx("td", { children: droneDisplay }), _jsxs("td", { children: [(drone.mass * drone.quantity).toFixed(1), " tons"] }), _jsxs("td", { children: [(drone.cost * drone.quantity).toFixed(2), " MCr"] })] }, `drone_${drone.drone_type}`));
                                            droneRowIndex++;
                                        });
                                    }
                                    return rows;
                                })(), _jsxs("tr", { children: [_jsx("td", {}), _jsx("td", { children: _jsx("strong", { children: "Total" }) }), _jsx("td", { children: _jsxs("strong", { children: [mass.used.toFixed(1), " tons"] }) }), _jsx("td", { children: _jsxs("strong", { children: [cost.total.toFixed(2), " MCr"] }) })] })] })] }) }), _jsxs("div", { className: "summary-section", children: [_jsx("h4", { children: "Crew" }), combinePilotNavigator ? (_jsxs("p", { children: [_jsx("strong", { children: "Pilot/Navigator:" }), " 1"] })) : (_jsxs(_Fragment, { children: [_jsxs("p", { children: [_jsx("strong", { children: "Pilot:" }), " ", staff.pilot] }), _jsxs("p", { children: [_jsx("strong", { children: "Navigator:" }), " ", staff.navigator] })] })), _jsxs("p", { children: [_jsx("strong", { children: "Engineers:" }), " ", staff.engineers] }), staff.gunners > 0 && _jsxs("p", { children: [_jsx("strong", { children: "Gunners:" }), " ", staff.gunners] }), staff.service > 0 && _jsxs("p", { children: [_jsx("strong", { children: "Service Staff:" }), " ", staff.service] }), _jsxs("p", { children: [_jsx("strong", { children: "Stewards:" }), " ", noStewards ? 0 : staff.stewards] }), staff.nurses > 0 && _jsxs("p", { children: [_jsx("strong", { children: "Nurses:" }), " ", staff.nurses] }), staff.surgeons > 0 && _jsxs("p", { children: [_jsx("strong", { children: "Surgeons:" }), " ", staff.surgeons] }), staff.techs > 0 && _jsxs("p", { children: [_jsx("strong", { children: "Medical Techs:" }), " ", staff.techs] }), _jsxs("p", { children: [_jsx("strong", { children: "Total:" }), " ", combinePilotNavigator && noStewards
                                ? staff.total - 1 - staff.stewards
                                : combinePilotNavigator
                                    ? staff.total - 1
                                    : noStewards
                                        ? staff.total - staff.stewards
                                        : staff.total] })] }), saveMessage && (_jsx("div", { className: `save-message ${saveMessage.includes('successfully') ? 'success' : 'error'}`, children: saveMessage })), _jsxs("div", { className: "summary-actions", children: [_jsx("button", { className: "save-btn", onClick: handleSaveDesign, disabled: saving, children: saving ? 'Saving...' : 'Save Design' }), _jsx("button", { className: "load-btn", onClick: handleCsvExport, children: "CSV" }), onBackToShipSelect && (_jsx("button", { className: "load-btn", onClick: onBackToShipSelect, children: "Load Different Ship" }))] }), showCsvModal && (_jsx("div", { className: "ship-name-conflict-dialog", children: _jsxs("div", { className: "conflict-dialog-content", children: [_jsx("h3", { children: "CSV Export" }), _jsx("textarea", { value: csvData, readOnly: true, style: {
                                width: '100%',
                                height: '400px',
                                fontFamily: 'monospace',
                                fontSize: '12px',
                                padding: '10px',
                                border: '1px solid #ccc',
                                borderRadius: '4px'
                            } }), _jsx("div", { className: "conflict-dialog-actions", children: _jsx("button", { className: "change-name-btn", onClick: () => setShowCsvModal(false), children: "Close" }) })] }) })), showOverwriteDialog && (_jsx("div", { className: "ship-name-conflict-dialog", children: _jsxs("div", { className: "conflict-dialog-content", children: [_jsx("h3", { children: "Ship Name Conflict" }), _jsxs("p", { children: ["A ship named \"", pendingShipName, "\" already exists. Do you want to overwrite it?"] }), _jsxs("div", { className: "conflict-dialog-actions", children: [_jsx("button", { className: "overwrite-btn", onClick: handleOverwriteConfirm, disabled: saving, children: saving ? 'Overwriting...' : 'Overwrite' }), _jsx("button", { className: "change-name-btn", onClick: handleOverwriteCancel, disabled: saving, children: "Cancel" })] })] }) }))] }));
};
export default SummaryPanel;
