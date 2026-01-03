import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { databaseService } from '../services/database';
export default function SelectShipPanel({ onNewShip, onLoadShip }) {
    const [ships, setShips] = useState([]);
    const [selectedShipId, setSelectedShipId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    useEffect(() => {
        loadShips();
    }, []);
    const createDefaultShips = () => {
        // Fallback: create default ship in memory if all loading fails
        const largeLiner = {
            id: -1, // Temporary ID
            ship: {
                name: 'Large Liner',
                tech_level: 'E',
                tonnage: 8000,
                configuration: 'standard',
                fuel_weeks: 2,
                missile_reloads: 0,
                sand_reloads: 0,
                sections: 2,
                description: 'Luxury passenger liner (hull code CE)'
            },
            engines: [
                { engine_type: 'power_plant', drive_code: 'P', performance: 2, mass: 160, cost: 320 },
                { engine_type: 'maneuver_drive', drive_code: 'M', performance: 2, mass: 100, cost: 200 },
                { engine_type: 'jump_drive', drive_code: 'J', performance: 2, mass: 240, cost: 240 }
            ],
            fittings: [
                { fitting_type: 'half_bridge', mass: 60, cost: 90 },
                { fitting_type: 'comms_sensors', comms_sensors_type: 'basic_civilian', mass: 1, cost: 0.05 }
            ],
            weapons: [
                { weapon_name: 'Hard Point', mass: 1, cost: 1, quantity: 80 }
            ],
            defenses: [],
            berths: [
                { berth_type: 'luxury_staterooms', quantity: 20, mass: 5, cost: 0.6 },
                { berth_type: 'low_berths', quantity: 200, mass: 0.5, cost: 0.05 },
                { berth_type: 'emergency_low_berths', quantity: 2, mass: 1, cost: 1 },
                { berth_type: 'staterooms', quantity: 1162, mass: 4, cost: 0.5 }
            ],
            facilities: [
                { facility_type: 'commissary', quantity: 4, mass: 2, cost: 0.2 },
                { facility_type: 'gym', quantity: 4, mass: 3, cost: 0.1 },
                { facility_type: 'spa', quantity: 6, mass: 1.5, cost: 0.2 },
                { facility_type: 'garden', quantity: 2, mass: 4, cost: 0.05 },
                { facility_type: 'officers_mess_bar', quantity: 1, mass: 4, cost: 0.3 },
                { facility_type: 'kitchens', quantity: 2, mass: 3, cost: 0.4 },
                { facility_type: 'first_aid_station', quantity: 4, mass: 0.5, cost: 0.1 },
                { facility_type: 'autodoc', quantity: 2, mass: 1.5, cost: 0.05 },
                { facility_type: 'med_bay', quantity: 1, mass: 4, cost: 2 },
                { facility_type: 'medical_garden', quantity: 1, mass: 4, cost: 1 },
                { facility_type: 'library', quantity: 2, mass: 1, cost: 0.1 },
                { facility_type: 'range', quantity: 1, mass: 2, cost: 2 },
                { facility_type: 'park', quantity: 2, mass: 6, cost: 1 },
                { facility_type: 'shrine', quantity: 4, mass: 1, cost: 1 },
                { facility_type: 'club', quantity: 4, mass: 3, cost: 0.1 }
            ],
            cargo: [
                { cargo_type: 'cargo_bay', tonnage: 320, cost: 0 },
                { cargo_type: 'spares', tonnage: 240, cost: 120 },
                { cargo_type: 'cold_storage_bay', tonnage: 10, cost: 2 },
                { cargo_type: 'data_storage_bay', tonnage: 2, cost: 0.6 },
                { cargo_type: 'secure_storage_bay', tonnage: 4, cost: 2.8 },
                { cargo_type: 'vacuum_bay', tonnage: 8, cost: 1.6 }
            ],
            vehicles: [
                { vehicle_type: 'air_raft_truck', quantity: 2, mass: 5, cost: 0.55 },
                { vehicle_type: 'pug_armored_car', quantity: 1, mass: 4, cost: 0.03 }
            ],
            drones: [
                { drone_type: 'comms', quantity: 10, mass: 0.1, cost: 0.2 },
                { drone_type: 'sensor', quantity: 4, mass: 1, cost: 1 },
                { drone_type: 'repair', quantity: 4, mass: 10, cost: 1 },
                { drone_type: 'rescue', quantity: 1, mass: 10, cost: 0.5 }
            ],
            custom_items: [
                { name: 'ATLAS Combat Droid', mass: 1, cost: 0.025 },
                { name: 'ATLAS Combat Droid', mass: 1, cost: 0.025 },
                { name: 'ATLAS Combat Droid', mass: 1, cost: 0.025 },
                { name: 'ATLAS Combat Droid', mass: 1, cost: 0.025 }
            ],
            createdAt: new Date(),
            updatedAt: new Date()
        };
        const destroyer = {
            id: -2, // Temporary ID
            ship: {
                name: 'Destroyer',
                tech_level: 'E',
                tonnage: 28000,
                configuration: 'standard',
                fuel_weeks: 2,
                missile_reloads: 0,
                sand_reloads: 0,
                sections: 3,
                description: 'Military warship (hull code CJ)'
            },
            engines: [
                { engine_type: 'power_plant', drive_code: 'P', performance: 6, mass: 1400, cost: 2800 },
                { engine_type: 'maneuver_drive', drive_code: 'M', performance: 6, mass: 910, cost: 1820 },
                { engine_type: 'jump_drive', drive_code: 'J', performance: 5, mass: 1680, cost: 1680 }
            ],
            fittings: [
                { fitting_type: 'bridge', mass: 180, cost: 90 },
                { fitting_type: 'comms_sensors', comms_sensors_type: 'very_advanced', mass: 5, cost: 4 }
            ],
            weapons: [
                { weapon_name: 'Dual Fusion Gun Barbette', mass: 10, cost: 16, quantity: 20 },
                { weapon_name: 'Triple Beam Laser Turret', mass: 2, cost: 4, quantity: 240 }
            ],
            defenses: [
                { defense_type: 'dual_point_defense_laser_turret', quantity: 80, mass: 1, cost: 1.5 },
                { defense_type: 'nuclear_damper', quantity: 4, mass: 120, cost: 160 },
                { defense_type: 'meson_screen', quantity: 4, mass: 240, cost: 320 }
            ],
            berths: [
                { berth_type: 'low_berths', quantity: 100, mass: 0.5, cost: 0.05 },
                { berth_type: 'emergency_low_berths', quantity: 8, mass: 1, cost: 1 },
                { berth_type: 'staterooms', quantity: 128, mass: 4, cost: 0.5 },
                { berth_type: 'luxury_staterooms', quantity: 8, mass: 5, cost: 0.6 }
            ],
            facilities: [
                { facility_type: 'commissary', quantity: 4, mass: 2, cost: 0.2 },
                { facility_type: 'gym', quantity: 4, mass: 3, cost: 0.1 },
                { facility_type: 'spa', quantity: 4, mass: 1.5, cost: 0.2 },
                { facility_type: 'garden', quantity: 4, mass: 4, cost: 0.05 },
                { facility_type: 'officers_mess_bar', quantity: 1, mass: 4, cost: 0.3 },
                { facility_type: 'kitchens', quantity: 2, mass: 3, cost: 0.4 },
                { facility_type: 'first_aid_station', quantity: 4, mass: 0.5, cost: 0.1 },
                { facility_type: 'autodoc', quantity: 2, mass: 1.5, cost: 0.05 },
                { facility_type: 'med_bay', quantity: 1, mass: 4, cost: 2 },
                { facility_type: 'medical_garden', quantity: 2, mass: 4, cost: 1 },
                { facility_type: 'library', quantity: 4, mass: 1, cost: 0.1 },
                { facility_type: 'range', quantity: 3, mass: 2, cost: 2 },
                { facility_type: 'shrine', quantity: 2, mass: 1, cost: 1 },
                { facility_type: 'surgical_bay', quantity: 1, mass: 5, cost: 8 }
            ],
            cargo: [
                { cargo_type: 'cargo_bay', tonnage: 240, cost: 0 },
                { cargo_type: 'spares', tonnage: 560, cost: 280 },
                { cargo_type: 'cold_storage_bay', tonnage: 24, cost: 4.8 },
                { cargo_type: 'data_storage_bay', tonnage: 4, cost: 1.2 },
                { cargo_type: 'secure_storage_bay', tonnage: 8, cost: 5.6 }
            ],
            vehicles: [
                { vehicle_type: 'air_raft_truck', quantity: 2, mass: 5, cost: 0.55 },
                { vehicle_type: 'pug_armored_car', quantity: 2, mass: 4, cost: 0.025 },
                { vehicle_type: 'aat_infantry_support', quantity: 1, mass: 22, cost: 2 },
                { vehicle_type: 'fury_helicopter_gunship', quantity: 4, mass: 8, cost: 1.2 }
            ],
            drones: [
                { drone_type: 'comms', quantity: 80, mass: 0.1, cost: 0.2 },
                { drone_type: 'sensor', quantity: 20, mass: 1, cost: 1 },
                { drone_type: 'repair', quantity: 8, mass: 10, cost: 1 },
                { drone_type: 'rescue', quantity: 1, mass: 10, cost: 0.5 },
                { drone_type: 'war', quantity: 56, mass: 10, cost: 2 }
            ],
            custom_items: Array(20).fill(null).map(() => ({
                name: 'ATLAS Combat Droid',
                mass: 1,
                cost: 0.024
            })),
            createdAt: new Date(),
            updatedAt: new Date()
        };
        return [largeLiner, destroyer];
    };
    const loadShips = async () => {
        try {
            setLoading(true);
            setError(null);
            await databaseService.initialize();
            let savedShips = await databaseService.getAllShips();
            console.log('SelectShipPanel loaded ships from database:', savedShips.length);
            // If no ships exist, use hardcoded defaults
            if (savedShips.length === 0) {
                console.log('No ships in database, using hardcoded default ships');
                savedShips = createDefaultShips();
            }
            setShips(savedShips);
            console.log('Final ships array set:', savedShips.length, savedShips.map(s => s.ship.name));
        }
        catch (err) {
            console.error('SelectShipPanel error during ship loading:', err);
            // Emergency fallback
            console.log('🚨 Emergency fallback: using hardcoded ships due to error');
            const defaultShips = createDefaultShips();
            setShips(defaultShips);
            setError(null); // Clear error since we have fallback ships
        }
        finally {
            setLoading(false);
        }
    };
    const handleLoadSelectedShip = async () => {
        if (!selectedShipId)
            return;
        try {
            // Check if this is a hardcoded ship (negative ID)
            if (selectedShipId < 0) {
                const ship = ships.find(s => s.id === selectedShipId);
                if (ship) {
                    console.log('Loading hardcoded ship:', ship.ship.name);
                    // Remove database-specific fields before passing to parent
                    const { id: _id, createdAt: _createdAt, updatedAt: _updatedAt, ...shipDesign } = ship;
                    onLoadShip(shipDesign);
                    return;
                }
            }
            // Regular database ship loading
            const ship = await databaseService.getShipById(selectedShipId);
            if (ship) {
                console.log('Loading database ship:', ship.ship.name);
                // Remove database-specific fields before passing to parent
                const { id: _id, createdAt: _createdAt, updatedAt: _updatedAt, ...shipDesign } = ship;
                onLoadShip(shipDesign);
            }
        }
        catch (err) {
            setError('Failed to load selected ship');
            console.error('Load ship error:', err);
        }
    };
    if (loading) {
        return (_jsx("div", { className: "select-ship-panel", children: _jsx("p", { children: "Loading ships..." }) }));
    }
    if (error) {
        return (_jsxs("div", { className: "select-ship-panel", children: [_jsxs("div", { className: "error-message", children: [_jsxs("p", { children: ["Error: ", error] }), _jsx("button", { onClick: loadShips, children: "Retry" })] }), _jsx("div", { className: "panel-actions", children: _jsx("button", { onClick: onNewShip, className: "new-ship-button", children: "New Ship" }) })] }));
    }
    if (ships.length === 0) {
        return (_jsxs("div", { className: "select-ship-panel", children: [_jsx("p", { children: "No saved ships found. Create your first ship design!" }), _jsx("div", { className: "panel-actions", children: _jsx("button", { onClick: onNewShip, className: "new-ship-button", children: "New Ship" }) })] }));
    }
    return (_jsxs("div", { className: "select-ship-panel", children: [_jsxs("div", { className: "ship-selection", children: [_jsx("label", { htmlFor: "ship-select", children: "Select a ship to load:" }), _jsxs("select", { id: "ship-select", value: selectedShipId || '', onChange: (e) => setSelectedShipId(e.target.value ? Number(e.target.value) : null), className: "ship-dropdown", children: [_jsx("option", { value: "", children: "-- Select a ship --" }), ships.map((ship) => (_jsxs("option", { value: ship.id, children: [ship.ship.name, " (", ship.ship.tonnage, " tons, TL", ship.ship.tech_level, ")"] }, ship.id)))] })] }), selectedShipId && (_jsxs("div", { className: "ship-preview", children: [_jsx("h3", { children: "Ship Details" }), (() => {
                        const selectedShip = ships.find(s => s.id === selectedShipId);
                        if (!selectedShip)
                            return null;
                        return (_jsxs("div", { className: "ship-details", children: [_jsxs("p", { children: [_jsx("strong", { children: "Name:" }), " ", selectedShip.ship.name] }), _jsxs("p", { children: [_jsx("strong", { children: "Tech Level:" }), " ", selectedShip.ship.tech_level] }), _jsxs("p", { children: [_jsx("strong", { children: "Tonnage:" }), " ", selectedShip.ship.tonnage] }), _jsxs("p", { children: [_jsx("strong", { children: "Configuration:" }), " ", selectedShip.ship.configuration] }), _jsxs("p", { children: [_jsx("strong", { children: "Created:" }), " ", selectedShip.createdAt.toLocaleDateString()] }), _jsxs("p", { children: [_jsx("strong", { children: "Last Modified:" }), " ", selectedShip.updatedAt.toLocaleDateString()] }), selectedShip.ship.description && (_jsxs("p", { children: [_jsx("strong", { children: "Description:" }), " ", selectedShip.ship.description] }))] }));
                    })()] })), _jsxs("div", { className: "panel-actions", children: [_jsx("button", { onClick: handleLoadSelectedShip, disabled: !selectedShipId, className: "load-ship-button", children: "Load Selected Ship" }), _jsx("button", { onClick: onNewShip, className: "new-ship-button", children: "New Ship" })] })] }));
}
