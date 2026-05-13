import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
const CustomPanel = ({ custom_items, onUpdate }) => {
    const [newItemName, setNewItemName] = useState('');
    const [newItemMass, setNewItemMass] = useState('');
    const [newItemCost, setNewItemCost] = useState('');
    const handleAddItem = () => {
        if (!newItemName.trim()) {
            alert('Please enter an item name');
            return;
        }
        const mass = parseFloat(newItemMass) || 0;
        const cost = parseFloat(newItemCost) || 0;
        if (mass <= 0) {
            alert('Mass must be greater than 0');
            return;
        }
        const newItem = {
            name: newItemName.trim(),
            mass: mass,
            cost: cost
        };
        onUpdate([...custom_items, newItem]);
        // Reset form
        setNewItemName('');
        setNewItemMass('');
        setNewItemCost('');
    };
    const handleRemoveItem = (index) => {
        const newItems = custom_items.filter((_, i) => i !== index);
        onUpdate(newItems);
    };
    const totalMass = custom_items.reduce((sum, item) => sum + item.mass, 0);
    const totalCost = custom_items.reduce((sum, item) => sum + item.cost, 0);
    return (_jsxs("div", { className: "panel-content", children: [_jsx("p", { children: "Add custom components not included in the predefined lists." }), _jsxs("div", { className: "custom-item-form", children: [_jsx("h3", { children: "Add New Custom Item" }), _jsxs("div", { className: "form-row", children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { htmlFor: "item-name", children: "Item Name" }), _jsx("input", { id: "item-name", type: "text", value: newItemName, onChange: (e) => setNewItemName(e.target.value), placeholder: "e.g., Sensor Pod, Lab Module" })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { htmlFor: "item-mass", children: "Mass (tons)" }), _jsx("input", { id: "item-mass", type: "number", step: "0.1", min: "0", value: newItemMass, onChange: (e) => setNewItemMass(e.target.value), placeholder: "0.0" })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { htmlFor: "item-cost", children: "Cost (MCr)" }), _jsx("input", { id: "item-cost", type: "number", step: "0.1", min: "0", value: newItemCost, onChange: (e) => setNewItemCost(e.target.value), placeholder: "0.0" })] })] }), _jsx("button", { onClick: handleAddItem, className: "add-item-btn", children: "Add Item" })] }), _jsxs("div", { className: "custom-items-list", children: [_jsx("h3", { children: "Custom Items" }), custom_items.length === 0 ? (_jsx("p", { children: "No custom items added." })) : (_jsxs(_Fragment, { children: [_jsxs("table", { children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "Name" }), _jsx("th", { children: "Mass" }), _jsx("th", { children: "Cost" }), _jsx("th", { children: "Actions" })] }) }), _jsx("tbody", { children: custom_items.map((item, index) => (_jsxs("tr", { children: [_jsx("td", { children: item.name }), _jsxs("td", { children: [item.mass.toFixed(1), " tons"] }), _jsxs("td", { children: [item.cost.toFixed(2), " MCr"] }), _jsx("td", { children: _jsx("button", { onClick: () => handleRemoveItem(index), className: "remove-btn", children: "Remove" }) })] }, `${item.name}-${index}`))) })] }), _jsx("div", { className: "custom-items-totals", children: _jsxs("p", { children: [_jsx("strong", { children: "Total:" }), " ", totalMass.toFixed(1), " tons, ", totalCost.toFixed(2), " MCr"] }) })] }))] })] }));
};
export default CustomPanel;
