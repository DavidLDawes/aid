import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { databaseService } from '../services/database';
import { initialDataService } from '../services/initialDataService';
export default function SelectShipPanel({ onNewShip, onLoadShip }) {
    const [ships, setShips] = useState([]);
    const [selectedShipId, setSelectedShipId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    useEffect(() => {
        loadShips();
    }, []);
    const createDefaultShips = () => {
        // Fallback: create default ships in memory if all loading fails
        const defaultFreeTrader = {
            id: -1, // Temporary ID
            ship: {
                name: 'Free Trader',
                tech_level: 'C',
                tonnage: 400,
                configuration: 'standard',
                fuel_weeks: 4,
                missile_reloads: 0,
                sand_reloads: 0,
                description: 'Merchant vessel'
            },
            engines: [
                { engine_type: 'power_plant', drive_code: 'D', performance: 2, mass: 13, cost: 32 },
                { engine_type: 'jump_drive', drive_code: 'D', performance: 2, mass: 25, cost: 40 },
                { engine_type: 'maneuver_drive', drive_code: 'D', performance: 2, mass: 7, cost: 16 }
            ],
            fittings: [
                { fitting_type: 'bridge', mass: 10, cost: 2 },
                { fitting_type: 'comms_sensors', comms_sensors_type: 'standard', mass: 0, cost: 0 }
            ],
            weapons: [{ weapon_name: 'Hard Point', mass: 1, cost: 1, quantity: 4 }],
            defenses: [],
            berths: [],
            facilities: [{ facility_type: 'commissary', quantity: 1, mass: 2, cost: 0.2 }],
            cargo: [
                { cargo_type: 'cargo_bay', tonnage: 132, cost: 0 },
                { cargo_type: 'spares', tonnage: 4, 'cost': 2 },
                { cargo_type: 'cold_storage_bay', tonnage: 2, cost: 0.4 },
                { cargo_type: 'secure_storage_bay', tonnage: 1, cost: 0.7 }
            ],
            vehicles: [{ vehicle_type: 'air_raft_truck', quantity: 1, mass: 5, cost: 0.55 }],
            drones: [],
            createdAt: new Date(),
            updatedAt: new Date()
        };
        const defaultScout = {
            id: -2, // Temporary ID
            ship: {
                name: 'Scout',
                tech_level: 'E',
                tonnage: 100,
                configuration: 'standard',
                fuel_weeks: 4,
                missile_reloads: 0,
                sand_reloads: 0,
                description: 'Fast long ranged ship, low crew overhead'
            },
            engines: [
                { engine_type: 'power_plant', drive_code: 'B', performance: 4, mass: 7, cost: 16 },
                { engine_type: 'jump_drive', drive_code: 'B', performance: 4, mass: 15, cost: 20 },
                { engine_type: 'maneuver_drive', drive_code: 'B', performance: 4, mass: 3, cost: 8 }
            ],
            fittings: [
                { fitting_type: 'bridge', mass: 10, cost: 2 },
                { fitting_type: 'comms_sensors', comms_sensors_type: 'standard', mass: 0, cost: 0 }
            ],
            weapons: [],
            defenses: [],
            berths: [],
            facilities: [],
            cargo: [{ cargo_type: 'cargo_bay', tonnage: 3, cost: 0 }],
            vehicles: [],
            drones: [],
            createdAt: new Date(),
            updatedAt: new Date()
        };
        const defaultFatTrader = {
            id: -3, // Temporary ID
            ship: { name: 'Fat Trader', tech_level: 'C', tonnage: 600, configuration: 'standard', fuel_weeks: 4,
                missile_reloads: 0, sand_reloads: 0, description: 'A larger merchant vessel' },
            engines: [
                { engine_type: 'power_plant', drive_code: 'D', performance: 2, mass: 13, cost: 32 },
                { engine_type: 'jump_drive', drive_code: 'D', performance: 2, mass: 25, cost: 40 },
                { engine_type: 'maneuver_drive', drive_code: 'D', performance: 2, mass: 7, cost: 16 }
            ],
            fittings: [
                { fitting_type: 'bridge', mass: 10, cost: 2 },
                { fitting_type: 'comms_sensors', comms_sensors_type: 'standard', mass: 0, cost: 0 }
            ],
            weapons: [
                { weapon_name: 'Hard Point', mass: 1, cost: 1, quantity: 6 }
            ],
            defenses: [],
            berths: [],
            facilities: [],
            cargo: [],
            vehicles: [],
            drones: [],
            createdAt: new Date(),
            updatedAt: new Date()
        };
        return [defaultScout, defaultFreeTrader, defaultFatTrader];
    };
    const loadShips = async () => {
        try {
            setLoading(true);
            setError(null);
            await databaseService.initialize();
            let savedShips = await databaseService.getAllShips();
            console.log('SelectShipPanel loaded ships from database:', savedShips.length);
            // If no ships exist, try to load initial data
            if (savedShips.length === 0) {
                console.log('No ships in database, attempting to load initial ships...');
                const loaded = await initialDataService.loadInitialDataIfNeeded();
                console.log('Initial data loading result:', loaded);
                if (loaded) {
                    // Try to get ships again after loading
                    savedShips = await databaseService.getAllShips();
                    console.log('After loading initial data, ships count:', savedShips.length);
                }
                // Final fallback: if still no ships, use hardcoded defaults
                if (savedShips.length === 0) {
                    console.log('⚠️ All ship loading methods failed, using hardcoded default ships');
                    savedShips = createDefaultShips();
                }
            }
            setShips(savedShips);
            console.log('Final ships array set:', savedShips.length, savedShips.map(s => s.ship.name));
        }
        catch (err) {
            console.error('SelectShipPanel error during ship loading:', err);
            // Final emergency fallback
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
