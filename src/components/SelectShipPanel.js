import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { databaseService } from '../services/database';
import { initialDataService } from '../services/initialDataService';
export default function SelectShipPanel({ onNewShip, onLoadShip }) {
    const [ships, setShips] = useState([]);
    const [selectedShipId, setSelectedShipId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [preloading, setPreloading] = useState(false);
    useEffect(() => {
        loadShips();
    }, []);
    const loadShips = async () => {
        try {
            setLoading(true);
            setError(null);
            await databaseService.initialize();
            let savedShips = await databaseService.getAllShips();
            // If no ships found, try to preload initial data
            if (savedShips.length === 0) {
                setPreloading(true);
                const preloaded = await initialDataService.loadInitialDataIfNeeded();
                if (preloaded) {
                    // Reload ships after preloading
                    savedShips = await databaseService.getAllShips();
                }
                setPreloading(false);
            }
            setShips(savedShips);
        }
        catch (err) {
            setError('Failed to load ships from database');
            console.error('Database error:', err);
            setPreloading(false);
        }
        finally {
            setLoading(false);
        }
    };
    const handleLoadSelectedShip = async () => {
        if (!selectedShipId)
            return;
        try {
            const ship = await databaseService.getShipById(selectedShipId);
            if (ship) {
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
    if (loading || preloading) {
        return (_jsx("div", { className: "select-ship-panel", children: _jsx("p", { children: preloading ? 'Preloading initial ships...' : 'Loading ships...' }) }));
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
