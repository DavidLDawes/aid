import { jsxs as _jsxs, jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { COMMS_SENSORS_TYPES, DEFENSE_TYPES, FACILITY_TYPES, CARGO_TYPES, VEHICLE_TYPES, DRONE_TYPES, BERTH_TYPES, getTonnageCode, getNumberOfSections, calculateTotalFuelMass } from '../data/constants';
import { databaseService } from '../services/database';
const SummaryPanel = ({ shipDesign, mass, cost, staff, combinePilotNavigator, noStewards, activeRules, onBackToShipSelect }) => {
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
            await databaseService.saveShip(shipDesign);
            setSaveMessage('Ship design saved successfully!');
            setTimeout(() => setSaveMessage(null), 3000);
        }
        catch (error) {
            console.error('Error saving ship:', error);
            const errorMessage = error instanceof Error ? error.message : 'Failed to save ship design. Please try again.';
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
        const tonnageCode = getTonnageCode(shipDesign.ship.tonnage);
        const sections = getNumberOfSections(shipDesign.ship.tonnage);
        const hullInfo = tonnageCode && sections ? ` (hull code ${tonnageCode}, ${sections} sections)` : tonnageCode ? ` (${tonnageCode})` : '';
        lines.push(`${shipDesign.ship.name}, ${shipDesign.ship.configuration} configuration, ${shipDesign.ship.tonnage} tons${hullInfo}, Tech Level ${shipDesign.ship.tech_level}`);
        lines.push('Category,Item,Mass,Cost');
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
    return (_jsxs("div", { className: "panel-content", children: [_jsxs("div", { className: "ship-title-line", children: [_jsxs("h3", { children: [shipDesign.ship.name, ", ", shipDesign.ship.configuration, " configuration, ", shipDesign.ship.tonnage.toLocaleString(), " tons", hullInfoDisplay, ", Tech Level ", shipDesign.ship.tech_level] }), isNonStandardSize && (_jsx("p", { className: "nonstandard-notice", children: "Non-standard capital ship design < 3,000 tons" }))] }), _jsx("div", { className: "ship-components-table", children: _jsxs("table", { children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "Category" }), _jsx("th", { children: "Item" }), _jsx("th", { children: "Mass" }), _jsx("th", { children: "Cost" })] }) }), _jsxs("tbody", { children: [(() => {
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
                                    const jumpPerf = shipDesign.engines.find(e => e.engine_type === 'jump_drive')?.performance || 0;
                                    const maneuverPerf = shipDesign.engines.find(e => e.engine_type === 'maneuver_drive')?.performance || 0;
                                    const fuelMass = calculateTotalFuelMass(shipDesign.ship.tonnage, jumpPerf, maneuverPerf, shipDesign.ship.fuel_weeks, activeRules.has('antimatter'));
                                    return (_jsxs("tr", { children: [_jsx("td", {}), _jsx("td", { children: "Fuel" }), _jsxs("td", { children: [fuelMass.toFixed(1), " tons"] }), _jsx("td", {})] }, "fuel"));
                                })(), (() => {
                                    const rows = [];
                                    let fittingRowIndex = 0;
                                    const hasBridge = shipDesign.fittings.some(f => f.fitting_type === 'bridge');
                                    const hasHalfBridge = shipDesign.fittings.some(f => f.fitting_type === 'half_bridge');
                                    const launchTubes = shipDesign.fittings.filter(f => f.fitting_type === 'launch_tube');
                                    const commsSensors = shipDesign.fittings.find(f => f.fitting_type === 'comms_sensors');
                                    if (hasBridge || hasHalfBridge) {
                                        const bridgeData = shipDesign.fittings.find(f => f.fitting_type === 'bridge' || f.fitting_type === 'half_bridge');
                                        if (bridgeData) {
                                            rows.push(_jsxs("tr", { children: [_jsx("td", { children: fittingRowIndex === 0 ? 'Fittings' : '' }), _jsx("td", { children: hasBridge ? 'Bridge' : 'Half Bridge' }), _jsxs("td", { children: [bridgeData.mass.toFixed(1), " tons"] }), _jsxs("td", { children: [bridgeData.cost.toFixed(2), " MCr"] })] }, "bridge"));
                                            fittingRowIndex++;
                                        }
                                    }
                                    launchTubes.forEach((tube, index) => {
                                        rows.push(_jsxs("tr", { children: [_jsx("td", { children: fittingRowIndex === 0 ? 'Fittings' : '' }), _jsxs("td", { children: ["Launch Tube (", tube.launch_vehicle_mass || 1, " ton vehicle)"] }), _jsxs("td", { children: [tube.mass.toFixed(1), " tons"] }), _jsxs("td", { children: [tube.cost.toFixed(2), " MCr"] })] }, `launch_tube_${index}`));
                                        fittingRowIndex++;
                                    });
                                    if (commsSensors) {
                                        const sensorType = COMMS_SENSORS_TYPES.find(t => t.type === commsSensors.comms_sensors_type);
                                        rows.push(_jsxs("tr", { children: [_jsx("td", { children: fittingRowIndex === 0 ? 'Fittings' : '' }), _jsxs("td", { children: [sensorType?.name || 'Standard', " Comms & Sensors"] }), _jsxs("td", { children: [commsSensors.mass.toFixed(1), " tons"] }), _jsxs("td", { children: [commsSensors.cost.toFixed(2), " MCr"] })] }, "comms_sensors"));
                                    }
                                    return rows;
                                })(), (() => {
                                    const rows = [];
                                    let weaponRowIndex = 0;
                                    shipDesign.weapons.filter(w => w.quantity > 0).forEach(weapon => {
                                        const display = weapon.quantity === 1 ? weapon.weapon_name : `${weapon.weapon_name} (x${weapon.quantity})`;
                                        rows.push(_jsxs("tr", { children: [_jsx("td", { children: weaponRowIndex === 0 ? 'Weapons' : '' }), _jsx("td", { children: display }), _jsxs("td", { children: [(weapon.mass * weapon.quantity).toFixed(1), " tons"] }), _jsxs("td", { children: [(weapon.cost * weapon.quantity).toFixed(2), " MCr"] })] }, `weapon_${weapon.weapon_name}`));
                                        weaponRowIndex++;
                                    });
                                    return rows;
                                })(), (() => {
                                    const rows = [];
                                    let defenseRowIndex = 0;
                                    const activeDefenses = shipDesign.defenses.filter(d => d.quantity > 0);
                                    const hasSand = shipDesign.ship.sand_reloads > 0;
                                    if (activeDefenses.length > 0 || hasSand) {
                                        activeDefenses.forEach(defense => {
                                            const defenseType = DEFENSE_TYPES.find(dt => dt.type === defense.defense_type);
                                            const name = defenseType?.name || defense.defense_type;
                                            const display = defense.quantity === 1 ? name : `${name} (x${defense.quantity})`;
                                            rows.push(_jsxs("tr", { children: [_jsx("td", { children: defenseRowIndex === 0 ? 'Defenses' : '' }), _jsx("td", { children: display }), _jsxs("td", { children: [(defense.mass * defense.quantity).toFixed(1), " tons"] }), _jsxs("td", { children: [(defense.cost * defense.quantity).toFixed(2), " MCr"] })] }, `defense_${defense.defense_type}`));
                                            defenseRowIndex++;
                                        });
                                        if (hasSand) {
                                            rows.push(_jsxs("tr", { children: [_jsx("td", { children: defenseRowIndex === 0 ? 'Defenses' : '' }), _jsx("td", { children: "Sand" }), _jsxs("td", { children: [shipDesign.ship.sand_reloads.toFixed(1), " tons"] }), _jsx("td", {})] }, "defense_sand"));
                                        }
                                    }
                                    return rows;
                                })(), (() => {
                                    const rows = [];
                                    let berthRowIndex = 0;
                                    shipDesign.berths.filter(b => b.quantity > 0).forEach(berth => {
                                        const berthType = BERTH_TYPES.find(bt => bt.type === berth.berth_type);
                                        const name = berthType?.name || berth.berth_type;
                                        const display = berth.quantity === 1 ? name : `${name} (x${berth.quantity})`;
                                        rows.push(_jsxs("tr", { children: [_jsx("td", { children: berthRowIndex === 0 ? 'Berths' : '' }), _jsx("td", { children: display }), _jsxs("td", { children: [(berth.mass * berth.quantity).toFixed(1), " tons"] }), _jsxs("td", { children: [(berth.cost * berth.quantity).toFixed(2), " MCr"] })] }, `berth_${berth.berth_type}`));
                                        berthRowIndex++;
                                    });
                                    return rows;
                                })(), (() => {
                                    const rows = [];
                                    let facilityRowIndex = 0;
                                    const activeFacilities = shipDesign.facilities
                                        .filter(f => f.quantity > 0)
                                        .sort((a, b) => a.facility_type === 'commissary' ? -1 : b.facility_type === 'commissary' ? 1 : 0);
                                    activeFacilities.forEach(facility => {
                                        const facilityType = FACILITY_TYPES.find(ft => ft.type === facility.facility_type);
                                        const name = facilityType?.name || facility.facility_type;
                                        const display = facility.quantity === 1 ? name : `${name} (x${facility.quantity})`;
                                        rows.push(_jsxs("tr", { children: [_jsx("td", { children: facilityRowIndex === 0 ? 'Rec/Health' : '' }), _jsx("td", { children: display }), _jsxs("td", { children: [(facility.mass * facility.quantity).toFixed(1), " tons"] }), _jsxs("td", { children: [(facility.cost * facility.quantity).toFixed(2), " MCr"] })] }, `facility_${facility.facility_type}`));
                                        facilityRowIndex++;
                                    });
                                    return rows;
                                })(), (() => {
                                    const rows = [];
                                    let cargoRowIndex = 0;
                                    shipDesign.cargo.filter(c => c.tonnage > 0).forEach(cargo => {
                                        const cargoType = CARGO_TYPES.find(ct => ct.type === cargo.cargo_type);
                                        rows.push(_jsxs("tr", { children: [_jsx("td", { children: cargoRowIndex === 0 ? 'Cargo' : '' }), _jsx("td", { children: cargoType?.name || cargo.cargo_type }), _jsxs("td", { children: [cargo.tonnage.toFixed(1), " tons"] }), _jsxs("td", { children: [cargo.cost.toFixed(2), " MCr"] })] }, `cargo_${cargo.cargo_type}`));
                                        cargoRowIndex++;
                                    });
                                    return rows;
                                })(), (() => {
                                    const rows = [];
                                    let vehicleRowIndex = 0;
                                    shipDesign.vehicles.filter(v => v.quantity > 0).forEach(vehicle => {
                                        const vehicleType = VEHICLE_TYPES.find(vt => vt.type === vehicle.vehicle_type);
                                        const name = (vehicleType?.name || vehicle.vehicle_type).replace(/\b\d+(\.\d+)?\s+ton\s+/gi, '');
                                        const display = vehicle.quantity === 1 ? name : `${name} (x${vehicle.quantity})`;
                                        rows.push(_jsxs("tr", { children: [_jsx("td", { children: vehicleRowIndex === 0 ? 'Vehicles' : '' }), _jsx("td", { children: display }), _jsxs("td", { children: [(vehicle.mass * vehicle.quantity).toFixed(1), " tons"] }), _jsxs("td", { children: [(vehicle.cost * vehicle.quantity).toFixed(2), " MCr"] })] }, `vehicle_${vehicle.vehicle_type}`));
                                        vehicleRowIndex++;
                                    });
                                    return rows;
                                })(), (() => {
                                    const rows = [];
                                    let droneRowIndex = 0;
                                    shipDesign.drones.filter(d => d.quantity > 0).forEach(drone => {
                                        const droneType = DRONE_TYPES.find(dt => dt.type === drone.drone_type);
                                        const name = (droneType?.name || drone.drone_type).replace(/\b\d+(\.\d+)?\s+ton\s+/gi, '');
                                        const display = drone.quantity === 1 ? name : `${name} (x${drone.quantity})`;
                                        rows.push(_jsxs("tr", { children: [_jsx("td", { children: droneRowIndex === 0 ? 'Drones' : '' }), _jsx("td", { children: display }), _jsxs("td", { children: [(drone.mass * drone.quantity).toFixed(1), " tons"] }), _jsxs("td", { children: [(drone.cost * drone.quantity).toFixed(2), " MCr"] })] }, `drone_${drone.drone_type}`));
                                        droneRowIndex++;
                                    });
                                    return rows;
                                })(), shipDesign.custom_items.length > 0 && shipDesign.custom_items.map((item, index) => (_jsxs("tr", { children: [_jsx("td", { children: index === 0 ? 'Custom' : '' }), _jsx("td", { children: item.name }), _jsxs("td", { children: [item.mass.toFixed(1), " tons"] }), _jsxs("td", { children: [item.cost.toFixed(2), " MCr"] })] }, `custom_${item.name}-${index}`))), _jsxs("tr", { children: [_jsx("td", {}), _jsx("td", { children: _jsx("strong", { children: "Total" }) }), _jsx("td", { children: _jsxs("strong", { children: [mass.used.toFixed(1), " tons"] }) }), _jsx("td", { children: _jsxs("strong", { children: [cost.total.toFixed(2), " MCr"] }) })] })] })] }) }), _jsxs("div", { className: "summary-section", children: [_jsx("h4", { children: "Crew" }), combinePilotNavigator ? (_jsxs("p", { children: [_jsx("strong", { children: "Pilot/Navigator:" }), " 1"] })) : (_jsxs(_Fragment, { children: [_jsxs("p", { children: [_jsx("strong", { children: "Pilot:" }), " ", staff.pilot] }), _jsxs("p", { children: [_jsx("strong", { children: "Navigator:" }), " ", staff.navigator] })] })), _jsxs("p", { children: [_jsx("strong", { children: "Engineers:" }), " ", staff.engineers] }), staff.gunners > 0 && _jsxs("p", { children: [_jsx("strong", { children: "Gunners:" }), " ", staff.gunners] }), staff.service > 0 && _jsxs("p", { children: [_jsx("strong", { children: "Service Staff:" }), " ", staff.service] }), _jsxs("p", { children: [_jsx("strong", { children: "Stewards:" }), " ", noStewards ? 0 : staff.stewards] }), staff.nurses > 0 && _jsxs("p", { children: [_jsx("strong", { children: "Nurses:" }), " ", staff.nurses] }), staff.surgeons > 0 && _jsxs("p", { children: [_jsx("strong", { children: "Surgeons:" }), " ", staff.surgeons] }), staff.techs > 0 && _jsxs("p", { children: [_jsx("strong", { children: "Medical Techs:" }), " ", staff.techs] }), _jsxs("p", { children: [_jsx("strong", { children: "Total:" }), " ", combinePilotNavigator && noStewards
                                ? staff.total - 1 - staff.stewards
                                : combinePilotNavigator
                                    ? staff.total - 1
                                    : noStewards
                                        ? staff.total - staff.stewards
                                        : staff.total] })] }), isNonStandardSize && (_jsx("p", { className: "nonstandard-notice", children: "Non-standard capital ship design < 3,000 tons" })), saveMessage && (_jsx("div", { className: `save-message ${saveMessage.includes('successfully') ? 'success' : 'error'}`, children: saveMessage })), _jsxs("div", { className: "summary-actions", children: [_jsx("button", { className: "save-btn", onClick: handleSaveDesign, disabled: saving, children: saving ? 'Saving...' : 'Save Design' }), _jsx("button", { className: "load-btn", onClick: handleLaunchArchitect, children: "Launch Starship Architect" }), _jsx("button", { className: "load-btn", onClick: handleCsvExport, children: "CSV" }), onBackToShipSelect && (_jsx("button", { className: "load-btn", onClick: onBackToShipSelect, children: "Load Different Ship" }))] }), showCsvModal && (_jsx("div", { className: "ship-name-conflict-dialog", children: _jsxs("div", { className: "conflict-dialog-content", children: [_jsx("h3", { children: "CSV Export" }), _jsx("textarea", { value: csvData, readOnly: true, style: { width: '100%', height: '400px', fontFamily: 'monospace', fontSize: '12px', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' } }), _jsx("div", { className: "conflict-dialog-actions", children: _jsx("button", { className: "change-name-btn", onClick: () => setShowCsvModal(false), children: "Close" }) })] }) })), showOverwriteDialog && (_jsx("div", { className: "ship-name-conflict-dialog", children: _jsxs("div", { className: "conflict-dialog-content", children: [_jsx("h3", { children: "Ship Name Conflict" }), _jsxs("p", { children: ["A ship named \"", pendingShipName, "\" already exists. Do you want to overwrite it?"] }), _jsxs("div", { className: "conflict-dialog-actions", children: [_jsx("button", { className: "overwrite-btn", onClick: handleOverwriteConfirm, disabled: saving, children: saving ? 'Overwriting...' : 'Overwrite' }), _jsx("button", { className: "change-name-btn", onClick: handleOverwriteCancel, disabled: saving, children: "Cancel" })] })] }) }))] }));
};
export default SummaryPanel;
