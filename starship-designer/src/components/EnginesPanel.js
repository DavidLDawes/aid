import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { getAvailableEngines, calculateJumpFuel, calculateManeuverFuel } from '../data/constants';
const EnginesPanel = ({ engines, shipTonnage, fuelWeeks, onUpdate, onFuelWeeksUpdate }) => {
    const getEngine = (type) => {
        const defaultEngine = engines.find(e => e.engine_type === type);
        if (defaultEngine) {
            // Validate that the stored engine data is consistent with current ENGINE_DRIVES data
            if (defaultEngine.drive_code && defaultEngine.drive_code !== '' && defaultEngine.drive_code !== 'M-0') {
                const availableEngines = getAvailableEngines(shipTonnage, type, undefined);
                const expectedEngine = availableEngines.find(eng => eng.code === defaultEngine.drive_code);
                if (expectedEngine && expectedEngine.performance !== defaultEngine.performance) {
                    // Fix inconsistent data by returning corrected engine data
                    return {
                        ...defaultEngine,
                        performance: expectedEngine.performance,
                        mass: expectedEngine.mass,
                        cost: expectedEngine.cost
                    };
                }
            }
            return defaultEngine;
        }
        // For maneuver drive, if not configured, return M-0 performance
        if (type === 'maneuver_drive') {
            return {
                engine_type: type,
                drive_code: 'M-0',
                performance: 0,
                mass: 0,
                cost: 0
            };
        }
        return {
            engine_type: type,
            drive_code: '',
            performance: 1,
            mass: 0.1,
            cost: 0
        };
    };
    const updateEngine = (type, updates) => {
        const newEngines = [...engines];
        const existingIndex = newEngines.findIndex(e => e.engine_type === type);
        const updatedEngine = {
            ...getEngine(type),
            ...updates,
            engine_type: type
        };
        if (existingIndex >= 0) {
            newEngines[existingIndex] = updatedEngine;
        }
        else {
            newEngines.push(updatedEngine);
        }
        onUpdate(newEngines);
    };
    const renderEngineInput = (type, label) => {
        const engine = getEngine(type);
        const powerPlant = getEngine('power_plant');
        // Only apply power plant performance filtering if a specific power plant drive is selected
        const powerPlantPerformance = (powerPlant.drive_code && powerPlant.performance > 0) ? powerPlant.performance : undefined;
        const availableEngines = getAvailableEngines(shipTonnage, type, powerPlantPerformance);
        return (_jsxs("div", { className: "engine-group", children: [_jsx("h3", { children: label }), _jsx("div", { className: "form-row", children: _jsxs("div", { className: "form-group", children: [_jsxs("label", { children: ["Drive Selection ", type === 'maneuver_drive' ? '' : '*'] }), _jsxs("select", { value: engine.drive_code, onChange: (e) => {
                                    if (e.target.value === 'M-0' && type === 'maneuver_drive') {
                                        updateEngine(type, {
                                            drive_code: 'M-0',
                                            performance: 0,
                                            mass: 0,
                                            cost: 0
                                        });
                                    }
                                    else {
                                        const selectedEngine = availableEngines.find(eng => eng.code === e.target.value);
                                        if (selectedEngine) {
                                            updateEngine(type, {
                                                drive_code: selectedEngine.code,
                                                performance: selectedEngine.performance,
                                                mass: selectedEngine.mass,
                                                cost: selectedEngine.cost
                                            });
                                        }
                                    }
                                }, children: [_jsx("option", { value: "", children: "Select a drive..." }), type === 'maneuver_drive' && (_jsx("option", { value: "M-0", children: "None (M-0 performance, 0 tons, 0 MCr)" })), availableEngines.map(availEngine => (_jsx("option", { value: availEngine.code, children: availEngine.label }, availEngine.code)))] }), (type === 'jump_drive' || type === 'maneuver_drive') && powerPlantPerformance && (_jsxs("small", { children: ["Limited by Power Plant P-", powerPlantPerformance] })), (type === 'jump_drive' || type === 'maneuver_drive') && !powerPlantPerformance && (_jsx("small", { className: "info", children: "Select Power Plant first to see power-limited options" }))] }) }), engine.drive_code && (_jsx("div", { className: "engine-info", children: _jsxs("small", { children: ["Performance: ", engine.performance, " (", type === 'jump_drive' ? 'J' : type === 'maneuver_drive' ? 'M' : 'P', "-", engine.performance, ")"] }) }))] }, type));
    };
    const powerPlant = getEngine('power_plant');
    const jumpDrive = getEngine('jump_drive');
    const maneuverDrive = getEngine('maneuver_drive');
    const powerRequirementsMet = (!jumpDrive.drive_code || jumpDrive.performance <= powerPlant.performance) &&
        (!maneuverDrive.drive_code || maneuverDrive.performance <= powerPlant.performance);
    // Calculate fuel requirements
    const jumpFuel = jumpDrive.performance > 0 ? calculateJumpFuel(shipTonnage, jumpDrive.performance) : 0;
    const maneuverFuel = maneuverDrive.performance > 0 ? calculateManeuverFuel(shipTonnage, maneuverDrive.performance, fuelWeeks) : 0;
    const totalFuelMass = jumpFuel + maneuverFuel;
    // Calculate total engine mass
    const totalEngineMass = engines.reduce((sum, engine) => sum + engine.mass, 0);
    // Calculate remaining mass available for fuel (assuming we need some buffer)
    const usedMass = totalEngineMass; // This should include other ship components in a real calculation
    const remainingMass = shipTonnage - usedMass;
    const fuelFitsInShip = totalFuelMass <= remainingMass;
    // Calculate maximum weeks possible given remaining mass
    const maxPossibleWeeks = maneuverDrive.performance > 0
        ? Math.floor(2 * (remainingMass - jumpFuel) / (shipTonnage * 0.01 * maneuverDrive.performance))
        : 12;
    const effectiveMaxWeeks = Math.min(12, Math.max(2, maxPossibleWeeks));
    const requiredEnginesConfigured = engines.some(e => e.engine_type === 'power_plant' && e.drive_code && e.performance >= 1) &&
        engines.some(e => e.engine_type === 'jump_drive' && e.drive_code && e.performance >= 1);
    const allEnginesConfigured = requiredEnginesConfigured &&
        powerRequirementsMet &&
        fuelFitsInShip;
    return (_jsxs("div", { className: "panel-content", children: [_jsx("p", { children: "Configure the engine types for your starship. Power Plant and Jump Drive are required. Maneuver Drive is optional (defaults to M-0)." }), _jsx("p", { children: _jsxs("small", { children: [_jsx("strong", { children: "Note:" }), " Jump and Maneuver drives require a Power Plant with equal or higher performance rating."] }) }), _jsxs("div", { className: "engines-horizontal-layout", children: [renderEngineInput('power_plant', 'Power Plant'), renderEngineInput('maneuver_drive', 'Maneuver Drive'), renderEngineInput('jump_drive', 'Jump Drive')] }), _jsxs("div", { className: "fuel-section", children: [_jsx("h3", { children: "Fuel Requirements" }), _jsxs("div", { className: "fuel-horizontal-layout", children: [_jsx("div", { className: "fuel-selection", children: _jsxs("div", { className: "form-group", children: [_jsx("label", { htmlFor: "fuel-weeks", children: "Power Plant Fuel Duration" }), _jsx("select", { id: "fuel-weeks", value: fuelWeeks, onChange: (e) => onFuelWeeksUpdate(parseInt(e.target.value)), children: Array.from({ length: effectiveMaxWeeks - 1 }, (_, i) => i + 2).map(weeks => (_jsxs("option", { value: weeks, children: [weeks, " weeks"] }, weeks))) }), _jsxs("small", { children: ["Maximum ", effectiveMaxWeeks, " weeks based on available mass"] })] }) }), _jsxs("div", { className: "fuel-summary", children: [_jsx("h4", { children: "Fuel Mass Breakdown:" }), _jsx("table", { children: _jsxs("tbody", { children: [_jsxs("tr", { children: [_jsx("td", { children: "Jump Fuel (per jump):" }), _jsxs("td", { children: [jumpFuel.toFixed(1), " tons"] }), _jsx("td", { children: _jsxs("small", { children: ["(", jumpDrive.performance > 0 ? `J-${jumpDrive.performance}` : 'No Jump Drive', " \u00D7 0.1 \u00D7 ", shipTonnage, "t)"] }) })] }), _jsxs("tr", { children: [_jsxs("td", { children: ["Maneuver Fuel (", fuelWeeks, " weeks):"] }), _jsxs("td", { children: [maneuverFuel.toFixed(1), " tons"] }), _jsx("td", { children: _jsxs("small", { children: ["(", maneuverDrive.performance > 0 ? `M-${maneuverDrive.performance}` : 'No Maneuver Drive', " \u00D7 0.01 \u00D7 ", shipTonnage, "t \u00D7 ", fuelWeeks / 2, ")"] }) })] }), _jsxs("tr", { className: "total-row", children: [_jsx("td", { children: _jsx("strong", { children: "Total Fuel Mass:" }) }), _jsx("td", { children: _jsxs("strong", { children: [totalFuelMass.toFixed(1), " tons"] }) }), _jsx("td", { children: _jsxs("small", { children: [((totalFuelMass / shipTonnage) * 100).toFixed(1), "% of ship mass"] }) })] })] }) })] })] })] }), _jsxs("div", { className: "validation-info", children: [_jsx("h3", { children: "Requirements:" }), _jsxs("ul", { children: [_jsx("li", { className: engines.some(e => e.engine_type === 'power_plant') ? 'valid' : 'invalid', children: "\u2713 Power Plant configured" }), _jsx("li", { className: 'valid', children: "\u2713 Maneuver Drive configured (M-0 if none selected)" }), _jsx("li", { className: engines.some(e => e.engine_type === 'jump_drive') ? 'valid' : 'invalid', children: "\u2713 Jump Drive configured" }), _jsx("li", { className: powerRequirementsMet ? 'valid' : 'invalid', children: "\u2713 Power Plant provides sufficient power for Jump and Maneuver drives" }), _jsx("li", { className: fuelFitsInShip ? 'valid' : 'invalid', children: "\u2713 Fuel requirements fit within available ship mass" }), _jsx("li", { className: allEnginesConfigured ? 'valid' : 'invalid', children: "\u2713 Required engines have valid drive selection with automatic mass and cost" })] })] }), _jsxs("div", { className: "engine-summary", children: [_jsx("h3", { children: "Engine Summary:" }), _jsxs("table", { children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "Engine Type" }), _jsx("th", { children: "Drive" }), _jsx("th", { children: "Performance" }), _jsx("th", { children: "Mass (tons)" }), _jsx("th", { children: "Cost (MCr)" })] }) }), _jsx("tbody", { children: ['power_plant', 'maneuver_drive', 'jump_drive'].map(engineType => {
                                    const engine = getEngine(engineType);
                                    return (_jsxs("tr", { children: [_jsx("td", { children: engineType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) }), _jsx("td", { children: engine.drive_code || '-' }), _jsxs("td", { children: [engine.performance, " (", engineType === 'jump_drive' ? 'J' : engineType === 'maneuver_drive' ? 'M' : 'P', "-", engine.performance, ")"] }), _jsx("td", { children: engine.mass.toFixed(1) }), _jsx("td", { children: engine.cost.toFixed(2) })] }, engineType));
                                }) })] })] })] }));
};
export default EnginesPanel;
