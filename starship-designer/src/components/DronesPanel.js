import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { DRONE_TYPES } from '../data/constants';
const DronesPanel = ({ drones, onUpdate }) => {
    const addDrone = (droneType) => {
        const existingDrone = drones.find(d => d.drone_type === droneType.type);
        if (existingDrone) {
            const newDrones = drones.map(d => d.drone_type === droneType.type
                ? { ...d, quantity: d.quantity + 1 }
                : d);
            onUpdate(newDrones);
        }
        else {
            onUpdate([...drones, {
                    drone_type: droneType.type,
                    quantity: 1,
                    mass: droneType.mass,
                    cost: droneType.cost
                }]);
        }
    };
    const removeDrone = (droneType) => {
        const newDrones = drones.map(d => d.drone_type === droneType
            ? { ...d, quantity: Math.max(0, d.quantity - 1) }
            : d).filter(d => d.quantity > 0);
        onUpdate(newDrones);
    };
    const groupedDrones = [];
    for (let i = 0; i < DRONE_TYPES.length; i += 3) {
        groupedDrones.push(DRONE_TYPES.slice(i, i + 3));
    }
    return (_jsxs("div", { className: "panel-content", children: [_jsx("p", { children: "Configure drones and robotic units carried by the starship." }), _jsx("div", { className: "drones-grouped-layout", children: groupedDrones.map((droneGroup, groupIndex) => (_jsx("div", { className: "drone-group-row", children: droneGroup.map(droneType => {
                        const currentDrone = drones.find(d => d.drone_type === droneType.type);
                        const quantity = currentDrone?.quantity || 0;
                        return (_jsxs("div", { className: "component-item", children: [_jsxs("div", { className: "component-info", children: [_jsx("h4", { children: droneType.name }), _jsxs("p", { children: [droneType.mass, " tons, ", droneType.cost, " MCr"] }), quantity > 0 && (_jsxs("p", { children: [_jsx("strong", { children: "Total:" }), " ", (droneType.mass * quantity).toFixed(1), " tons, ", (droneType.cost * quantity).toFixed(3), " MCr"] }))] }), _jsxs("div", { className: "quantity-control", children: [_jsx("button", { onClick: () => removeDrone(droneType.type), disabled: quantity === 0, children: "-" }), _jsx("span", { children: quantity }), _jsx("button", { onClick: () => addDrone(droneType), children: "+" })] })] }, droneType.type));
                    }) }, groupIndex))) }), _jsxs("div", { className: "drone-summary", children: [_jsx("h3", { children: "Drone Summary" }), drones.length === 0 ? (_jsx("p", { children: "No drones configured." })) : (_jsxs("table", { children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "Drone Type" }), _jsx("th", { children: "Quantity" }), _jsx("th", { children: "Mass (t)" }), _jsx("th", { children: "Cost (MCr)" })] }) }), _jsx("tbody", { children: drones.map(drone => {
                                    const droneType = DRONE_TYPES.find(dt => dt.type === drone.drone_type);
                                    return (_jsxs("tr", { children: [_jsx("td", { children: droneType?.name || drone.drone_type }), _jsx("td", { children: drone.quantity }), _jsx("td", { children: (drone.mass * drone.quantity).toFixed(1) }), _jsx("td", { children: (drone.cost * drone.quantity).toFixed(3) })] }, drone.drone_type));
                                }) })] }))] })] }));
};
export default DronesPanel;
