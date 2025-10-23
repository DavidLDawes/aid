import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { getBridgeMassAndCost, COMMS_SENSORS_TYPES, getAvailableComputers, getMinimumComputer, COMPUTER_TYPES } from '../data/constants';
const FittingsPanel = ({ fittings, shipTonnage, shipTechLevel, engines, onUpdate }) => {
    const hasBridge = fittings.some(f => f.fitting_type === 'bridge');
    const hasHalfBridge = fittings.some(f => f.fitting_type === 'half_bridge');
    const launchTubes = fittings.filter(f => f.fitting_type === 'launch_tube');
    const commsSensors = fittings.find(f => f.fitting_type === 'comms_sensors');
    const computer = fittings.find(f => f.fitting_type === 'computer');
    const setBridgeType = (isHalfBridge) => {
        const { mass, cost } = getBridgeMassAndCost(shipTonnage, isHalfBridge);
        const newFittings = fittings.filter(f => f.fitting_type !== 'bridge' && f.fitting_type !== 'half_bridge');
        newFittings.push({
            fitting_type: isHalfBridge ? 'half_bridge' : 'bridge',
            mass,
            cost
        });
        onUpdate(newFittings);
    };
    const addLaunchTube = () => {
        const newFittings = [...fittings];
        newFittings.push({
            fitting_type: 'launch_tube',
            mass: 25, // Default 1 ton vehicle = 25 tons tube
            cost: 0.5, // 0.5 MCr per ton
            launch_vehicle_mass: 1
        });
        onUpdate(newFittings);
    };
    const updateLaunchTube = (index, vehicleMass) => {
        const newFittings = [...fittings];
        const tubeIndex = fittings.findIndex((f, i) => f.fitting_type === 'launch_tube' && fittings.slice(0, i + 1).filter(fit => fit.fitting_type === 'launch_tube').length === index + 1);
        if (tubeIndex >= 0) {
            newFittings[tubeIndex] = {
                ...newFittings[tubeIndex],
                launch_vehicle_mass: vehicleMass,
                mass: vehicleMass * 25,
                cost: vehicleMass * 0.5
            };
            onUpdate(newFittings);
        }
    };
    const removeLaunchTube = (index) => {
        const newFittings = fittings.filter((f, i) => {
            if (f.fitting_type !== 'launch_tube')
                return true;
            const tubeIndex = fittings.slice(0, i + 1).filter(fit => fit.fitting_type === 'launch_tube').length - 1;
            return tubeIndex !== index;
        });
        onUpdate(newFittings);
    };
    const setCommsSensorsType = (sensorType) => {
        const newFittings = fittings.filter(f => f.fitting_type !== 'comms_sensors');
        newFittings.push({
            fitting_type: 'comms_sensors',
            comms_sensors_type: sensorType.type,
            mass: sensorType.mass,
            cost: sensorType.cost
        });
        onUpdate(newFittings);
    };
    const setComputerType = (computerModel) => {
        const newFittings = fittings.filter(f => f.fitting_type !== 'computer');
        if (computerModel) {
            const selectedComputer = COMPUTER_TYPES.find(c => c.model === computerModel);
            if (selectedComputer) {
                newFittings.push({
                    fitting_type: 'computer',
                    computer_model: computerModel,
                    mass: 0, // Computers don't take tonnage
                    cost: selectedComputer.cost
                });
            }
        }
        onUpdate(newFittings);
    };
    return (_jsxs("div", { className: "panel-content", children: [_jsxs("div", { className: "form-group", children: [_jsx("h3", { children: "Bridge Type (Required) *" }), _jsxs("div", { className: "radio-group", children: [_jsxs("label", { children: [_jsx("input", { type: "radio", checked: hasBridge, onChange: () => setBridgeType(false) }), "Full Bridge (", getBridgeMassAndCost(shipTonnage, false).mass, " tons, ", getBridgeMassAndCost(shipTonnage, false).cost, " MCr)"] }), _jsxs("label", { children: [_jsx("input", { type: "radio", checked: hasHalfBridge, onChange: () => setBridgeType(true) }), "Half Bridge (", getBridgeMassAndCost(shipTonnage, true).mass, " tons, ", getBridgeMassAndCost(shipTonnage, true).cost, " MCr)"] })] })] }), _jsxs("div", { className: "form-group", children: [_jsx("h3", { children: "Launch Tubes (Optional)" }), _jsx("p", { children: "Launch tubes allow deployment of vehicles. Each tube is sized for a specific vehicle mass." }), launchTubes.map((tube, index) => (_jsxs("div", { className: "component-item", children: [_jsx("div", { className: "component-info", children: _jsxs("h4", { children: ["Launch Tube ", index + 1, " for ", tube.launch_vehicle_mass || 1, " ton vehicle"] }) }), _jsxs("div", { className: "component-controls", children: [_jsxs("label", { children: ["Vehicle Mass:", _jsx("input", { type: "number", min: "0.1", step: "0.1", value: tube.launch_vehicle_mass || 1, onChange: (e) => updateLaunchTube(index, parseFloat(e.target.value) || 1), style: { width: '80px', marginLeft: '0.5rem' } }), "tons"] }), _jsx("button", { onClick: () => removeLaunchTube(index), className: "remove-btn", children: "Remove" })] })] }, index))), _jsx("button", { onClick: addLaunchTube, className: "add-btn", children: "Add Launch Tube" })] }), _jsxs("div", { className: "form-group", children: [_jsx("h3", { children: "Comms & Sensors" }), _jsx("p", { children: "Communications and sensor systems for the starship. Standard is included by default." }), _jsx("label", { htmlFor: "comms-sensors", children: "Comms & Sensors Type" }), _jsx("select", { id: "comms-sensors", value: commsSensors?.comms_sensors_type || 'standard', onChange: (e) => {
                            const selectedType = COMMS_SENSORS_TYPES.find(t => t.type === e.target.value);
                            if (selectedType) {
                                setCommsSensorsType(selectedType);
                            }
                        }, children: COMMS_SENSORS_TYPES.map(sensorType => (_jsxs("option", { value: sensorType.type, children: [sensorType.name, " (", sensorType.mass, " tons, ", sensorType.cost, " MCr)"] }, sensorType.type))) })] }), _jsxs("div", { className: "form-group", children: [_jsx("h3", { children: "Computer" }), (() => {
                        const jumpDrive = engines.find(e => e.engine_type === 'jump_drive');
                        const jumpPerformance = jumpDrive?.performance || 0;
                        const minimumComputer = getMinimumComputer(shipTonnage, jumpPerformance);
                        const availableComputers = getAvailableComputers(shipTonnage, jumpPerformance, shipTechLevel);
                        if (!minimumComputer) {
                            return _jsx("p", { className: "info-message", children: "No computer required for ships under 3,000 tons or without jump drives." });
                        }
                        if (availableComputers.length === 0) {
                            return _jsxs("p", { className: "info-message", children: ["Ship requires ", minimumComputer.name, " but current tech level is too low (TL ", minimumComputer.techLevel, " required)."] });
                        }
                        return (_jsxs(_Fragment, { children: [_jsxs("p", { children: ["Minimum required: ", _jsx("strong", { children: minimumComputer.name }), " (TL ", minimumComputer.techLevel, ", Rating ", minimumComputer.rating, ")", _jsx("br", {}), _jsxs("small", { children: ["Based on ship size (", shipTonnage.toLocaleString(), " tons) and jump performance (J-", jumpPerformance, ")"] })] }), _jsx("label", { htmlFor: "computer", children: "Computer Model" }), _jsxs("select", { id: "computer", value: computer?.computer_model || '', onChange: (e) => setComputerType(e.target.value || null), children: [_jsx("option", { value: "", children: "None" }), availableComputers.map(comp => (_jsxs("option", { value: comp.model, children: [comp.name, " - Rating ", comp.rating, ", TL ", comp.techLevel, ", ", comp.cost, " MCr"] }, comp.model)))] }), computer && (() => {
                                    const selectedComp = COMPUTER_TYPES.find(c => c.model === computer.computer_model);
                                    if (selectedComp) {
                                        return (_jsxs("small", { children: ["Selected: ", selectedComp.name, ", Rating ", selectedComp.rating, ", Cost: ", selectedComp.cost, " MCr (0 tons)"] }));
                                    }
                                    return null;
                                })()] }));
                    })()] }), _jsxs("div", { className: "validation-info", children: [_jsx("h3", { children: "Requirements:" }), _jsxs("ul", { children: [_jsx("li", { className: hasBridge || hasHalfBridge ? 'valid' : 'invalid', children: "\u2713 Bridge or Half Bridge selected" }), (() => {
                                const jumpDrive = engines.find(e => e.engine_type === 'jump_drive');
                                const jumpPerformance = jumpDrive?.performance || 0;
                                const minimumComputer = getMinimumComputer(shipTonnage, jumpPerformance);
                                if (minimumComputer) {
                                    const hasValidComputer = computer && COMPUTER_TYPES.findIndex(c => c.model === computer.computer_model) >=
                                        COMPUTER_TYPES.findIndex(c => c.name === minimumComputer.name);
                                    return (_jsxs("li", { className: hasValidComputer ? 'valid' : 'invalid', children: [hasValidComputer ? '✓' : '✗', " Computer (", minimumComputer.name, " or better required)"] }));
                                }
                                return null;
                            })()] })] })] }));
};
export default FittingsPanel;
