import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { CARGO_TYPES } from '../data/constants';
import { calculateMonthsBetweenService, getSparesIncrement } from '../utils/sparesCalculation';
const CargoPanel = ({ cargo, remainingMass, shipTonnage, onUpdate }) => {
    const updateCargoTonnage = (cargoType, newTonnage) => {
        const newCargo = [...cargo];
        const existingIndex = newCargo.findIndex(c => c.cargo_type === cargoType.type);
        if (newTonnage === 0) {
            // Remove cargo if tonnage is 0
            if (existingIndex >= 0) {
                newCargo.splice(existingIndex, 1);
            }
        }
        else {
            const cargoData = {
                cargo_type: cargoType.type,
                tonnage: newTonnage,
                cost: cargoType.costPerTon * newTonnage
            };
            if (existingIndex >= 0) {
                newCargo[existingIndex] = cargoData;
            }
            else {
                newCargo.push(cargoData);
            }
        }
        onUpdate(newCargo);
    };
    const getCargoTonnage = (cargoType) => {
        const cargoItem = cargo.find(c => c.cargo_type === cargoType);
        return cargoItem?.tonnage || 0;
    };
    const getTotalCargoTonnage = () => {
        return cargo.reduce((sum, c) => sum + c.tonnage, 0);
    };
    const getSparesTonnage = () => {
        const sparesItem = cargo.find(c => c.cargo_type === 'spares');
        return sparesItem?.tonnage || 0;
    };
    return (_jsxs("div", { className: "panel-content", children: [_jsxs("p", { children: ["Configure cargo storage. Remaining mass: ", remainingMass.toFixed(1), " tons"] }), _jsxs("p", { children: ["Total cargo: ", getTotalCargoTonnage(), " tons"] }), _jsxs("div", { className: "cargo-grouped-layout", children: [_jsx("div", { className: "cargo-group-row", children: CARGO_TYPES.slice(0, 3).map(cargoType => {
                            const tonnage = getCargoTonnage(cargoType.type);
                            const maxTonnage = Math.floor(remainingMass + tonnage);
                            // Special handling for Spares
                            if (cargoType.type === 'spares') {
                                const increment = getSparesIncrement(tonnage, shipTonnage);
                                return (_jsxs("div", { className: "component-item", children: [_jsxs("div", { className: "component-info", children: [_jsx("h4", { children: cargoType.name }), _jsxs("p", { children: [cargoType.costPerTon, " MCr per ton"] }), tonnage > 0 && (_jsxs("p", { children: [_jsx("strong", { children: "Total:" }), " ", tonnage, " tons, ", (cargoType.costPerTon * tonnage).toFixed(2), " MCr"] }))] }), _jsxs("div", { className: "quantity-control", children: [_jsx("button", { onClick: () => updateCargoTonnage(cargoType, Math.max(0, tonnage - increment)), disabled: tonnage === 0, children: "-" }), _jsxs("span", { children: [tonnage, " tons"] }), _jsx("button", { onClick: () => updateCargoTonnage(cargoType, Math.min(maxTonnage, tonnage + increment)), disabled: tonnage + increment > maxTonnage, children: "+" })] })] }, cargoType.type));
                            }
                            return (_jsxs("div", { className: "component-item", children: [_jsxs("div", { className: "component-info", children: [_jsx("h4", { children: cargoType.name }), _jsxs("p", { children: [cargoType.costPerTon, " MCr per ton"] }), tonnage > 0 && (_jsxs("p", { children: [_jsx("strong", { children: "Total:" }), " ", tonnage, " tons, ", (cargoType.costPerTon * tonnage).toFixed(2), " MCr"] }))] }), _jsx("div", { className: "tonnage-control", children: _jsxs("label", { children: ["Tonnage:", _jsx("input", { type: "number", min: "0", max: maxTonnage, value: tonnage, onChange: (e) => updateCargoTonnage(cargoType, Math.max(0, Math.min(maxTonnage, parseInt(e.target.value) || 0))), style: { width: '60px', marginLeft: '0.5rem' } }), _jsxs("small", { children: ["/", maxTonnage] })] }) })] }, cargoType.type));
                        }) }), _jsx("div", { className: "cargo-group-row", children: CARGO_TYPES.slice(3, 6).map(cargoType => {
                            const tonnage = getCargoTonnage(cargoType.type);
                            const maxTonnage = Math.floor(remainingMass + tonnage);
                            return (_jsxs("div", { className: "component-item", children: [_jsxs("div", { className: "component-info", children: [_jsx("h4", { children: cargoType.name }), _jsxs("p", { children: [cargoType.costPerTon, " MCr per ton"] }), tonnage > 0 && (_jsxs("p", { children: [_jsx("strong", { children: "Total:" }), " ", tonnage, " tons, ", (cargoType.costPerTon * tonnage).toFixed(2), " MCr"] }))] }), _jsx("div", { className: "tonnage-control", children: _jsxs("label", { children: ["Tonnage:", _jsx("input", { type: "number", min: "0", max: maxTonnage, value: tonnage, onChange: (e) => updateCargoTonnage(cargoType, Math.max(0, Math.min(maxTonnage, parseInt(e.target.value) || 0))), style: { width: '60px', marginLeft: '0.5rem' } }), _jsxs("small", { children: ["/", maxTonnage] })] }) })] }, cargoType.type));
                        }) }), _jsx("div", { className: "cargo-group-row", children: CARGO_TYPES.slice(6, 8).map(cargoType => {
                            const tonnage = getCargoTonnage(cargoType.type);
                            const maxTonnage = Math.floor(remainingMass + tonnage);
                            return (_jsxs("div", { className: "component-item", children: [_jsxs("div", { className: "component-info", children: [_jsx("h4", { children: cargoType.name }), _jsxs("p", { children: [cargoType.costPerTon, " MCr per ton"] }), tonnage > 0 && (_jsxs("p", { children: [_jsx("strong", { children: "Total:" }), " ", tonnage, " tons, ", (cargoType.costPerTon * tonnage).toFixed(2), " MCr"] }))] }), _jsx("div", { className: "tonnage-control", children: _jsxs("label", { children: ["Tonnage:", _jsx("input", { type: "number", min: "0", max: maxTonnage, value: tonnage, onChange: (e) => updateCargoTonnage(cargoType, Math.max(0, Math.min(maxTonnage, parseInt(e.target.value) || 0))), style: { width: '60px', marginLeft: '0.5rem' } }), _jsxs("small", { children: ["/", maxTonnage] })] }) })] }, cargoType.type));
                        }) })] }), _jsxs("div", { className: "cargo-summary", children: [_jsx("h3", { children: "Cargo Summary" }), cargo.length === 0 ? (_jsx("p", { children: "No cargo configured." })) : (_jsxs("table", { children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "Cargo Type" }), _jsx("th", { children: "Tonnage" }), _jsx("th", { children: "Cost per Ton" }), _jsx("th", { children: "Total Cost (MCr)" })] }) }), _jsx("tbody", { children: cargo.map(cargoItem => (_jsxs("tr", { children: [_jsx("td", { children: CARGO_TYPES.find(ct => ct.type === cargoItem.cargo_type)?.name || cargoItem.cargo_type }), _jsx("td", { children: cargoItem.tonnage }), _jsx("td", { children: CARGO_TYPES.find(ct => ct.type === cargoItem.cargo_type)?.costPerTon || 0 }), _jsx("td", { children: cargoItem.cost.toFixed(2) })] }, cargoItem.cargo_type))) })] }))] }), _jsxs("div", { className: "service-interval", children: [_jsx("h3", { children: "Maintenance Schedule" }), _jsxs("div", { className: "service-info", children: [_jsxs("p", { children: [_jsx("strong", { children: "Months Between Service:" }), " ", calculateMonthsBetweenService(getSparesTonnage(), shipTonnage)] }), _jsxs("p", { className: "service-calculation", children: ["Based on: 1 + ", getSparesTonnage(), " spares \u00F7 ", shipTonnage, " ship tons \u00D7 100 = 1 + ", Math.floor(getSparesTonnage() / shipTonnage * 100)] })] })] })] }));
};
export default CargoPanel;
