import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import { FACILITY_TYPES } from '../data/constants';
const FacilitiesPanel = ({ facilities, onUpdate }) => {
    const hasCommissary = facilities.some(f => f.facility_type === 'commissary');
    // Auto-add commissary if it doesn't exist
    React.useEffect(() => {
        if (!hasCommissary) {
            const commissaryFacility = {
                facility_type: 'commissary',
                quantity: 1,
                mass: 2,
                cost: 0.2
            };
            const newFacilities = [...facilities, commissaryFacility];
            onUpdate(newFacilities);
        }
    }, [hasCommissary, facilities, onUpdate]);
    const addFacility = (facilityType) => {
        const existingFacility = facilities.find(f => f.facility_type === facilityType.type);
        if (existingFacility) {
            const newFacilities = facilities.map(f => f.facility_type === facilityType.type
                ? { ...f, quantity: f.quantity + 1 }
                : f);
            onUpdate(newFacilities);
        }
        else {
            onUpdate([...facilities, {
                    facility_type: facilityType.type,
                    quantity: 1,
                    mass: facilityType.mass,
                    cost: facilityType.cost
                }]);
        }
    };
    const removeFacility = (facilityType) => {
        const newFacilities = facilities.map(f => f.facility_type === facilityType
            ? { ...f, quantity: Math.max(0, f.quantity - 1) }
            : f).filter(f => f.quantity > 0);
        onUpdate(newFacilities);
    };
    return (_jsxs("div", { className: "panel-content", children: [_jsx("p", { children: "Recreation and health facilities. Commissary is required." }), _jsxs("div", { className: "facilities-grouped-layout", children: [_jsx("div", { className: "facility-group-row", children: FACILITY_TYPES.filter(f => ['gym', 'spa', 'garden'].includes(f.type)).map(facilityType => {
                            const currentFacility = facilities.find(f => f.facility_type === facilityType.type);
                            const quantity = currentFacility?.quantity || 0;
                            return (_jsxs("div", { className: "component-item", children: [_jsx("div", { className: "component-info", children: _jsxs("h4", { children: [facilityType.name, ", ", facilityType.mass, " tons, ", facilityType.cost, " MCr"] }) }), _jsxs("div", { className: "quantity-control", children: [_jsx("button", { onClick: () => removeFacility(facilityType.type), disabled: quantity === 0, children: "-" }), _jsx("span", { children: quantity }), _jsx("button", { onClick: () => addFacility(facilityType), children: "+" })] })] }, facilityType.type));
                        }) }), _jsx("div", { className: "facility-group-row", children: FACILITY_TYPES.filter(f => ['commissary', 'kitchens', 'officers_mess_bar'].includes(f.type)).map(facilityType => {
                            const currentFacility = facilities.find(f => f.facility_type === facilityType.type);
                            const quantity = currentFacility?.quantity || 0;
                            return (_jsxs("div", { className: "component-item", children: [_jsx("div", { className: "component-info", children: _jsxs("h4", { children: [facilityType.name, ", ", facilityType.mass, " tons, ", facilityType.cost, " MCr"] }) }), _jsxs("div", { className: "quantity-control", children: [_jsx("button", { onClick: () => removeFacility(facilityType.type), disabled: quantity === 0, children: "-" }), _jsx("span", { children: quantity }), _jsx("button", { onClick: () => addFacility(facilityType), children: "+" })] })] }, facilityType.type));
                        }) }), _jsx("div", { className: "facility-group-row", children: FACILITY_TYPES.filter(f => ['first_aid_station', 'autodoc', 'medical_bay', 'surgical_bay', 'medical_garden'].includes(f.type)).map(facilityType => {
                            const currentFacility = facilities.find(f => f.facility_type === facilityType.type);
                            const quantity = currentFacility?.quantity || 0;
                            return (_jsxs("div", { className: "component-item", children: [_jsx("div", { className: "component-info", children: _jsxs("h4", { children: [facilityType.name, ", ", facilityType.mass, " tons, ", facilityType.cost, " MCr"] }) }), _jsxs("div", { className: "quantity-control", children: [_jsx("button", { onClick: () => removeFacility(facilityType.type), disabled: quantity === 0, children: "-" }), _jsx("span", { children: quantity }), _jsx("button", { onClick: () => addFacility(facilityType), children: "+" })] })] }, facilityType.type));
                        }) }), _jsx("div", { className: "facility-group-row", children: FACILITY_TYPES.filter(f => !['gym', 'spa', 'garden', 'commissary', 'kitchens', 'officers_mess_bar', 'first_aid_station', 'autodoc', 'medical_bay', 'surgical_bay', 'medical_garden'].includes(f.type)).map(facilityType => {
                            const currentFacility = facilities.find(f => f.facility_type === facilityType.type);
                            const quantity = currentFacility?.quantity || 0;
                            return (_jsxs("div", { className: "component-item", children: [_jsx("div", { className: "component-info", children: _jsxs("h4", { children: [facilityType.name, ", ", facilityType.mass, " tons, ", facilityType.cost, " MCr"] }) }), _jsxs("div", { className: "quantity-control", children: [_jsx("button", { onClick: () => removeFacility(facilityType.type), disabled: quantity === 0, children: "-" }), _jsx("span", { children: quantity }), _jsx("button", { onClick: () => addFacility(facilityType), children: "+" })] })] }, facilityType.type));
                        }) })] }), _jsxs("div", { className: "validation-info", children: [_jsx("h3", { children: "Requirements:" }), _jsx("ul", { children: _jsx("li", { className: hasCommissary ? 'valid' : 'invalid', children: "\u2713 Commissary is required" }) })] })] }));
};
export default FacilitiesPanel;
