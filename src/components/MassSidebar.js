import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { calculateTotalFuelMass } from '../data/constants';
const MassSidebar = ({ mass, cost, shipDesign }) => {
    const [expandedSections, setExpandedSections] = useState(new Set());
    const toggleSection = (sectionName) => {
        const newExpanded = new Set(expandedSections);
        if (newExpanded.has(sectionName)) {
            newExpanded.delete(sectionName);
        }
        else {
            newExpanded.add(sectionName);
        }
        setExpandedSections(newExpanded);
    };
    // Calculate masses for each category
    const enginesMass = shipDesign.engines.reduce((sum, engine) => sum + engine.mass, 0);
    const fittingsMass = shipDesign.fittings.reduce((sum, fitting) => sum + fitting.mass, 0);
    const weaponsMass = shipDesign.weapons.reduce((sum, weapon) => sum + (weapon.mass * weapon.quantity), 0);
    const defensesMass = shipDesign.defenses.reduce((sum, defense) => sum + (defense.mass * defense.quantity), 0);
    const facilitiesMass = shipDesign.facilities.reduce((sum, facility) => sum + (facility.mass * facility.quantity), 0);
    const cargoMass = shipDesign.cargo.reduce((sum, cargo) => sum + cargo.tonnage, 0);
    const vehiclesMass = shipDesign.vehicles.reduce((sum, vehicle) => sum + (vehicle.mass * vehicle.quantity), 0);
    const dronesMass = shipDesign.drones.reduce((sum, drone) => sum + (drone.mass * drone.quantity), 0);
    const berthsMass = shipDesign.berths.reduce((sum, berth) => sum + (berth.mass * berth.quantity), 0);
    // Calculate fuel mass
    const jumpDrive = shipDesign.engines.find(e => e.engine_type === 'jump_drive');
    const maneuverDrive = shipDesign.engines.find(e => e.engine_type === 'maneuver_drive');
    const jumpPerformance = jumpDrive?.performance || 0;
    const maneuverPerformance = maneuverDrive?.performance || 0;
    const fuelMass = calculateTotalFuelMass(shipDesign.ship.tonnage, jumpPerformance, maneuverPerformance, shipDesign.ship.fuel_weeks);
    // Calculate reload masses
    const missileReloadMass = shipDesign.ship.missile_reloads;
    const sandReloadMass = shipDesign.ship.sand_reloads;
    // Categories with their masses and visibility logic
    const categories = [
        {
            name: 'Engines',
            mass: enginesMass,
            alwaysVisible: true,
            items: shipDesign.engines.map(engine => ({
                name: `${engine.drive_code} ${engine.engine_type.replace('_', ' ')}`,
                mass: engine.mass
            }))
        },
        {
            name: 'Fittings',
            mass: fittingsMass,
            alwaysVisible: true,
            items: shipDesign.fittings.map(fitting => ({
                name: fitting.fitting_type.replace('_', ' '),
                mass: fitting.mass
            }))
        },
        {
            name: 'Weapons',
            mass: weaponsMass,
            alwaysVisible: false,
            items: shipDesign.weapons.filter(w => w.quantity > 0).map(weapon => ({
                name: `${weapon.weapon_name} (${weapon.quantity})`,
                mass: weapon.mass * weapon.quantity
            }))
        },
        {
            name: 'Defenses',
            mass: defensesMass,
            alwaysVisible: false,
            items: shipDesign.defenses.filter(d => d.quantity > 0).map(defense => ({
                name: `${defense.defense_type.replace('_', ' ')} (${defense.quantity})`,
                mass: defense.mass * defense.quantity
            }))
        },
        {
            name: 'Rec/Health',
            mass: facilitiesMass,
            alwaysVisible: false,
            items: shipDesign.facilities.filter(f => f.quantity > 0).map(facility => ({
                name: `${facility.facility_type.replace('_', ' ')} (${facility.quantity})`,
                mass: facility.mass * facility.quantity
            }))
        },
        {
            name: 'Cargo',
            mass: cargoMass,
            alwaysVisible: false,
            items: shipDesign.cargo.map(cargo => ({
                name: cargo.cargo_type.replace('_', ' '),
                mass: cargo.tonnage
            }))
        },
        {
            name: 'Vehicles',
            mass: vehiclesMass,
            alwaysVisible: false,
            items: shipDesign.vehicles.filter(v => v.quantity > 0).map(vehicle => ({
                name: `${vehicle.vehicle_type.replace('_', ' ')} (${vehicle.quantity})`,
                mass: vehicle.mass * vehicle.quantity
            }))
        },
        {
            name: 'Drones',
            mass: dronesMass,
            alwaysVisible: false,
            items: shipDesign.drones.filter(d => d.quantity > 0).map(drone => ({
                name: `${drone.drone_type.replace('_', ' ')} (${drone.quantity})`,
                mass: drone.mass * drone.quantity
            }))
        },
        {
            name: 'Berths',
            mass: berthsMass,
            alwaysVisible: true,
            items: shipDesign.berths.filter(b => b.quantity > 0).map(berth => ({
                name: `${berth.berth_type.replace('_', ' ')} (${berth.quantity})`,
                mass: berth.mass * berth.quantity
            }))
        }
    ];
    // Add fuel and reload categories if they have mass
    if (fuelMass > 0) {
        categories.push({
            name: 'Fuel',
            mass: fuelMass,
            alwaysVisible: false,
            items: [
                {
                    name: `Jump & Maneuver Fuel (${shipDesign.ship.fuel_weeks} weeks)`,
                    mass: fuelMass
                }
            ]
        });
    }
    if (missileReloadMass > 0) {
        categories.push({
            name: 'Missile Reloads',
            mass: missileReloadMass,
            alwaysVisible: false,
            items: [
                {
                    name: 'Missile Reloads',
                    mass: missileReloadMass
                }
            ]
        });
    }
    if (sandReloadMass > 0) {
        categories.push({
            name: 'Sand Reloads',
            mass: sandReloadMass,
            alwaysVisible: false,
            items: [
                {
                    name: 'Sand Reloads',
                    mass: sandReloadMass
                }
            ]
        });
    }
    return (_jsxs("aside", { className: "mass-sidebar", children: [_jsxs("div", { className: "mass-tracker", children: [_jsx("h3", { children: "Mass Tracker" }), categories.map(category => {
                        const shouldShow = category.alwaysVisible || category.mass > 0;
                        if (!shouldShow)
                            return null;
                        const isExpanded = expandedSections.has(category.name);
                        return (_jsxs("div", { className: "mass-category", children: [_jsxs("div", { className: "mass-category-header", onClick: () => toggleSection(category.name), style: { cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }, children: [_jsx("span", { style: { transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }, children: "\u25B6" }), _jsxs("span", { children: [category.name, ":"] }), _jsxs("span", { children: [category.mass.toFixed(1), " tons"] })] }), isExpanded && category.items.length > 0 && (_jsx("div", { className: "mass-category-details", style: { marginLeft: '20px', fontSize: '0.9em' }, children: category.items.map((item, index) => (_jsxs("div", { className: "mass-item-detail", children: [_jsxs("span", { children: [item.name, ":"] }), _jsxs("span", { children: [item.mass.toFixed(1), " tons"] })] }, index))) }))] }, category.name));
                    }), _jsxs("div", { className: "mass-totals", style: { borderTop: '1px solid #ccc', paddingTop: '10px', marginTop: '10px' }, children: [_jsxs("div", { className: "mass-item", children: [_jsx("span", { children: "Total:" }), _jsxs("span", { children: [mass.total.toFixed(1), " tons"] })] }), _jsxs("div", { className: "mass-item", children: [_jsx("span", { children: "Used:" }), _jsxs("span", { children: [mass.used.toFixed(1), " tons"] })] }), _jsxs("div", { className: `mass-item ${mass.isOverweight ? 'overweight' : ''}`, children: [_jsx("span", { children: "Remaining:" }), _jsxs("span", { children: [mass.remaining.toFixed(1), " tons"] })] })] }), mass.isOverweight && (_jsx("div", { className: "warning", children: "\u26A0\uFE0F Ship is overweight! Remove components." }))] }), _jsxs("div", { className: "cost-tracker", children: [_jsx("h3", { children: "Cost Tracker" }), _jsxs("div", { className: "cost-item", children: [_jsx("span", { children: "Total Cost:" }), _jsxs("span", { children: [Math.round(cost.total), " MCr"] })] })] })] }));
};
export default MassSidebar;
