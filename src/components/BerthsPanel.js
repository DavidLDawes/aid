import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect } from 'react';
import { BERTH_TYPES } from '../data/constants';
const BerthsPanel = ({ berths, staffRequirements, adjustedCrewCount, onUpdate }) => {
    const updateBerthQuantity = (berthType, newQuantity) => {
        const newBerths = [...berths];
        const existingIndex = newBerths.findIndex(b => b.berth_type === berthType.type);
        if (newQuantity === 0) {
            // Remove berth if quantity is 0
            if (existingIndex >= 0) {
                newBerths.splice(existingIndex, 1);
            }
        }
        else {
            const berthData = {
                berth_type: berthType.type,
                quantity: newQuantity,
                mass: berthType.mass,
                cost: berthType.cost
            };
            if (existingIndex >= 0) {
                newBerths[existingIndex] = berthData;
            }
            else {
                newBerths.push(berthData);
            }
        }
        onUpdate(newBerths);
    };
    const getBerthQuantity = (berthType) => {
        const berth = berths.find(b => b.berth_type === berthType);
        return berth?.quantity || 0;
    };
    const getTotalStaterooms = () => {
        return getBerthQuantity('staterooms') + getBerthQuantity('luxury_staterooms');
    };
    const getEffectiveCrewCount = () => {
        return adjustedCrewCount !== undefined ? adjustedCrewCount : staffRequirements.total;
    };
    const hasEnoughStaterooms = () => {
        return getTotalStaterooms() >= getEffectiveCrewCount();
    };
    const getPassengerCount = () => {
        const totalStaterooms = getTotalStaterooms();
        const crewCount = getEffectiveCrewCount();
        return Math.max(0, totalStaterooms - crewCount);
    };
    // Ensure minimum staterooms match crew requirements
    useEffect(() => {
        const totalStaterooms = getTotalStaterooms();
        const crewCount = getEffectiveCrewCount();
        if (totalStaterooms < crewCount && crewCount > 0) {
            const shortfall = crewCount - totalStaterooms;
            const currentStaterooms = getBerthQuantity('staterooms');
            updateBerthQuantity(BERTH_TYPES.find(bt => bt.type === 'staterooms'), currentStaterooms + shortfall);
        }
    }, [staffRequirements.total, adjustedCrewCount]);
    return (_jsxs("div", { className: "panel-content", children: [_jsx("p", { children: "Configure crew and passenger accommodations. Staterooms are required for all crew members." }), _jsxs("div", { className: "berth-requirements", children: [_jsx("h3", { children: "Accommodations" }), _jsxs("p", { children: [_jsx("strong", { children: "Total Crew:" }), " ", getEffectiveCrewCount()] }), getPassengerCount() >= 1 && (_jsxs("p", { children: [_jsx("strong", { children: "Passengers:" }), " ", getPassengerCount()] })), _jsxs("p", { children: [_jsx("strong", { children: "Total Staterooms:" }), " ", getTotalStaterooms()] }), _jsx("p", { className: hasEnoughStaterooms() ? 'valid' : 'invalid', children: hasEnoughStaterooms() ? '✓ Sufficient staterooms' : '⚠️ Need more staterooms for crew' })] }), _jsx("div", { className: "berths-grouped-layout", children: _jsx("div", { className: "berth-group-row", children: BERTH_TYPES.map(berthType => {
                        const quantity = getBerthQuantity(berthType.type);
                        return (_jsxs("div", { className: "component-item", children: [_jsxs("div", { className: "component-info", children: [_jsxs("h4", { children: [berthType.name, " ", berthType.required && '(Required)'] }), _jsxs("p", { children: [berthType.mass, " tons, ", berthType.cost, " MCr each"] }), quantity > 0 && (_jsxs("p", { children: [_jsx("strong", { children: "Total:" }), " ", (berthType.mass * quantity).toFixed(1), " tons, ", (berthType.cost * quantity).toFixed(2), " MCr"] }))] }), _jsx("div", { className: "quantity-control", children: _jsxs("label", { children: ["Quantity:", _jsx("input", { type: "number", min: "0", value: quantity, onChange: (e) => updateBerthQuantity(berthType, parseInt(e.target.value) || 0), style: { width: '60px', marginLeft: '0.5rem' } })] }) })] }, berthType.type));
                    }) }) }), _jsxs("div", { className: "berth-summary", children: [_jsx("h3", { children: "Berth Summary" }), berths.length === 0 ? (_jsx("p", { children: "No berths configured." })) : (_jsxs("table", { children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "Berth Type" }), _jsx("th", { children: "Quantity" }), _jsx("th", { children: "Mass (t)" }), _jsx("th", { children: "Cost (MCr)" })] }) }), _jsx("tbody", { children: berths.map(berth => (_jsxs("tr", { children: [_jsx("td", { children: BERTH_TYPES.find(bt => bt.type === berth.berth_type)?.name || berth.berth_type }), _jsx("td", { children: berth.quantity }), _jsx("td", { children: (berth.mass * berth.quantity).toFixed(1) }), _jsx("td", { children: (berth.cost * berth.quantity).toFixed(2) })] }, berth.berth_type))) })] }))] }), _jsxs("div", { className: "validation-info", children: [_jsx("h3", { children: "Requirements:" }), _jsx("ul", { children: _jsxs("li", { className: hasEnoughStaterooms() ? 'valid' : 'invalid', children: [hasEnoughStaterooms() ? '✓' : '✗', " At least ", getEffectiveCrewCount(), " staterooms for crew"] }) })] })] }));
};
export default BerthsPanel;
