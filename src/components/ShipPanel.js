import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useCallback } from 'react';
import { TECH_LEVELS, HULL_SIZES } from '../data/constants';
import { databaseService } from '../services/database';
const ShipPanel = ({ ship, onUpdate, onLoadExistingShip }) => {
    const [nameCheckState, setNameCheckState] = useState({
        isChecking: false,
        existingShipFound: false,
        showConflictDialog: false,
        existingShip: null
    });
    const checkShipName = useCallback(async (name) => {
        if (!name.trim() || name.length < 2) {
            setNameCheckState(prev => ({ ...prev, existingShipFound: false, showConflictDialog: false }));
            return;
        }
        try {
            setNameCheckState(prev => ({ ...prev, isChecking: true }));
            await databaseService.initialize();
            const existingShip = await databaseService.getShipByName(name.trim());
            if (existingShip) {
                setNameCheckState({
                    isChecking: false,
                    existingShipFound: true,
                    showConflictDialog: true,
                    existingShip: {
                        ship: existingShip.ship,
                        engines: existingShip.engines,
                        fittings: existingShip.fittings,
                        weapons: existingShip.weapons,
                        defenses: existingShip.defenses,
                        berths: existingShip.berths,
                        facilities: existingShip.facilities,
                        cargo: existingShip.cargo,
                        vehicles: existingShip.vehicles,
                        drones: existingShip.drones
                    }
                });
            }
            else {
                setNameCheckState({
                    isChecking: false,
                    existingShipFound: false,
                    showConflictDialog: false,
                    existingShip: null
                });
            }
        }
        catch (error) {
            console.error('Error checking ship name:', error);
            setNameCheckState(prev => ({ ...prev, isChecking: false }));
        }
    }, []);
    useEffect(() => {
        // Check immediately when name changes
        if (ship.name.trim() && ship.name.length >= 2) {
            checkShipName(ship.name);
        }
        // Also check after a delay for final validation
        const timeoutId = setTimeout(() => {
            checkShipName(ship.name);
        }, 1500); // Debounce for 1500ms
        return () => clearTimeout(timeoutId);
    }, [ship.name, checkShipName]);
    const handleInputChange = (field, value) => {
        onUpdate({ ...ship, [field]: value });
    };
    const handleLoadExistingShip = () => {
        if (nameCheckState.existingShip && onLoadExistingShip) {
            onLoadExistingShip(nameCheckState.existingShip);
        }
        setNameCheckState(prev => ({ ...prev, showConflictDialog: false }));
    };
    const handleKeepNewName = () => {
        setNameCheckState(prev => ({ ...prev, showConflictDialog: false, existingShipFound: false }));
    };
    const handleChangeNameFocus = () => {
        // Focus the name input to allow user to change the name
        const nameInput = document.getElementById('ship-name');
        if (nameInput) {
            nameInput.focus();
        }
    };
    return (_jsxs("div", { className: "panel-content", children: [_jsxs("div", { className: "ship-basic-info-row", children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { htmlFor: "ship-name", children: "Ship Name *" }), _jsxs("div", { className: "ship-name-input-container", children: [_jsx("input", { id: "ship-name", type: "text", maxLength: 32, value: ship.name, onChange: (e) => handleInputChange('name', e.target.value), placeholder: "Enter ship name (max 32 characters)", className: nameCheckState.existingShipFound ? 'name-conflict' : '' }), nameCheckState.isChecking && (_jsx("span", { className: "name-check-status checking", children: "Checking..." })), nameCheckState.existingShipFound && !nameCheckState.showConflictDialog && (_jsx("span", { className: "name-check-status conflict", children: "Ship name already exists" }))] }), _jsxs("small", { children: [ship.name.length, "/32 characters"] })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { htmlFor: "tonnage", children: "Hull Size *" }), _jsx("select", { id: "tonnage", value: ship.tonnage, onChange: (e) => handleInputChange('tonnage', parseInt(e.target.value)), children: HULL_SIZES.map(hull => (_jsxs("option", { value: hull.tonnage, children: [hull.tonnage, " tons (Hull ", hull.code, ") - ", hull.cost, " MCr"] }, hull.tonnage))) })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { htmlFor: "tech-level", children: "Tech Level *" }), _jsx("select", { id: "tech-level", value: ship.tech_level, onChange: (e) => handleInputChange('tech_level', e.target.value), children: TECH_LEVELS.map(level => (_jsx("option", { value: level, children: level }, level))) })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { htmlFor: "configuration", children: "Configuration *" }), _jsxs("select", { id: "configuration", value: ship.configuration, onChange: (e) => handleInputChange('configuration', e.target.value), children: [_jsx("option", { value: "standard", children: "Standard (wedge, cone, sphere or cylinder)" }), _jsx("option", { value: "streamlined", children: "Streamlined (wing, disc or lifting body for atmospheric entry)" }), _jsx("option", { value: "distributed", children: "Distributed (multiple sections, atmosphere/gravity incompatible)" })] })] })] }), _jsx("div", { className: "ship-description-row", children: _jsxs("div", { className: "form-group", children: [_jsx("label", { htmlFor: "description", children: "Description (Optional)" }), _jsx("textarea", { id: "description", maxLength: 250, value: ship.description || '', onChange: (e) => handleInputChange('description', e.target.value), placeholder: "Enter ship description (max 250 characters)", rows: 4 }), _jsxs("small", { children: [(ship.description || '').length, "/250 characters"] })] }) }), nameCheckState.showConflictDialog && nameCheckState.existingShip && (_jsx("div", { className: "ship-name-conflict-dialog", children: _jsxs("div", { className: "conflict-dialog-content", children: [_jsx("h3", { children: "Ship Name Already Exists" }), _jsxs("p", { children: ["A ship named \"", _jsx("strong", { children: ship.name }), "\" already exists in your saved designs."] }), _jsxs("div", { className: "existing-ship-info", children: [_jsx("p", { children: _jsx("strong", { children: "Existing Ship Details:" }) }), _jsxs("ul", { children: [_jsxs("li", { children: ["Tonnage: ", nameCheckState.existingShip.ship.tonnage, " tons"] }), _jsxs("li", { children: ["Tech Level: ", nameCheckState.existingShip.ship.tech_level] }), _jsxs("li", { children: ["Configuration: ", nameCheckState.existingShip.ship.configuration] }), nameCheckState.existingShip.ship.description && (_jsxs("li", { children: ["Description: ", nameCheckState.existingShip.ship.description] }))] })] }), _jsxs("div", { className: "conflict-dialog-actions", children: [_jsx("button", { onClick: handleLoadExistingShip, className: "load-existing-btn", disabled: !onLoadExistingShip, children: "Load Existing Ship" }), _jsx("button", { onClick: handleChangeNameFocus, className: "change-name-btn", children: "Choose Different Name" }), _jsx("button", { onClick: handleKeepNewName, className: "keep-name-btn", children: "Keep This Name (Will Replace)" })] })] }) })), _jsxs("div", { className: "validation-info", children: [_jsx("h3", { children: "Requirements:" }), _jsxs("ul", { children: [_jsx("li", { className: ship.name.trim() ? 'valid' : 'invalid', children: "\u2713 Ship name is required" }), _jsx("li", { className: ship.tech_level ? 'valid' : 'invalid', children: "\u2713 Tech level is required" }), _jsx("li", { className: ship.tonnage >= 100 ? 'valid' : 'invalid', children: "\u2713 Hull size is required" }), _jsx("li", { className: ship.configuration ? 'valid' : 'invalid', children: "\u2713 Configuration is required" })] })] })] }));
};
export default ShipPanel;
