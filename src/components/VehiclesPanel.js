import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { getAvailableVehicles, calculateVehicleServiceStaff } from '../data/constants';
const VehiclesPanel = ({ vehicles, shipTechLevel, onUpdate }) => {
    const availableVehicles = getAvailableVehicles(shipTechLevel);
    const totalServiceStaff = calculateVehicleServiceStaff(vehicles);
    const updateVehicleQuantity = (vehicleType, quantity) => {
        const validQuantity = Math.max(0, Math.floor(quantity));
        const existingVehicle = vehicles.find(v => v.vehicle_type === vehicleType.type);
        if (validQuantity === 0) {
            onUpdate(vehicles.filter(v => v.vehicle_type !== vehicleType.type));
        }
        else if (existingVehicle) {
            const newVehicles = vehicles.map(v => v.vehicle_type === vehicleType.type
                ? { ...v, quantity: validQuantity }
                : v);
            onUpdate(newVehicles);
        }
        else {
            onUpdate([...vehicles, {
                    vehicle_type: vehicleType.type,
                    quantity: validQuantity,
                    mass: vehicleType.mass,
                    cost: vehicleType.cost
                }]);
        }
    };
    const groupedVehicles = [];
    for (let i = 0; i < availableVehicles.length; i += 3) {
        groupedVehicles.push(availableVehicles.slice(i, i + 3));
    }
    return (_jsxs("div", { className: "panel-content", children: [_jsxs("p", { children: ["Configure vehicles carried by the starship. Only vehicles compatible with TL-", shipTechLevel, " are available."] }), _jsxs("p", { children: [_jsx("strong", { children: "Total Service Staff Required:" }), " ", totalServiceStaff] }), _jsx("div", { className: "vehicles-grouped-layout", children: groupedVehicles.map((vehicleGroup, groupIndex) => (_jsx("div", { className: "vehicle-group-row", children: vehicleGroup.map(vehicleType => {
                        const currentVehicle = vehicles.find(v => v.vehicle_type === vehicleType.type);
                        const quantity = currentVehicle?.quantity || 0;
                        return (_jsxs("div", { className: "component-item", children: [_jsxs("div", { className: "component-info", children: [_jsx("h4", { children: vehicleType.name }), _jsxs("p", { children: [vehicleType.mass, " tons, ", vehicleType.cost, " MCr"] }), quantity > 0 && (_jsxs("p", { children: [_jsx("strong", { children: "Total:" }), " ", (vehicleType.mass * quantity).toFixed(1), " tons, ", (vehicleType.cost * quantity).toFixed(3), " MCr"] }))] }), _jsx("div", { className: "quantity-control", children: _jsxs("label", { children: ["Quantity:", _jsx("input", { type: "number", min: "0", value: quantity, onChange: (e) => updateVehicleQuantity(vehicleType, parseInt(e.target.value) || 0), style: { width: '60px', marginLeft: '0.5rem' } })] }) })] }, vehicleType.type));
                    }) }, groupIndex))) }), _jsxs("div", { className: "vehicle-summary", children: [_jsx("h3", { children: "Vehicle Summary" }), vehicles.length === 0 ? (_jsx("p", { children: "No vehicles configured." })) : (_jsxs("table", { children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "Vehicle Type" }), _jsx("th", { children: "Quantity" }), _jsx("th", { children: "Mass (t)" }), _jsx("th", { children: "Cost (MCr)" }), _jsx("th", { children: "Service Staff" })] }) }), _jsx("tbody", { children: vehicles.map(vehicle => {
                                    const vehicleType = availableVehicles.find(vt => vt.type === vehicle.vehicle_type);
                                    let serviceStaff = 0;
                                    if (vehicleType) {
                                        if (vehicleType.serviceStaff === 0.25) {
                                            serviceStaff = Math.ceil(vehicle.quantity * vehicleType.serviceStaff);
                                        }
                                        else if (vehicleType.serviceStaff === 0.5) {
                                            serviceStaff = Math.ceil(vehicle.quantity * vehicleType.serviceStaff);
                                        }
                                        else {
                                            serviceStaff = vehicle.quantity * vehicleType.serviceStaff;
                                        }
                                    }
                                    return (_jsxs("tr", { children: [_jsx("td", { children: vehicleType?.name || vehicle.vehicle_type }), _jsx("td", { children: vehicle.quantity }), _jsx("td", { children: (vehicle.mass * vehicle.quantity).toFixed(1) }), _jsx("td", { children: (vehicle.cost * vehicle.quantity).toFixed(3) }), _jsx("td", { children: serviceStaff })] }, vehicle.vehicle_type));
                                }) })] }))] }), _jsx("div", { className: "vehicle-attribution", children: _jsx("p", { children: _jsx("a", { href: "https://drive.google.com/drive/folders/1DKuxqeL2wTd8Hh9rsScdXkm2WdMubYps", target: "_blank", rel: "noopener noreferrer", children: "Vehicles from the MgT2 collection, jut used their data." }) }) })] }));
};
export default VehiclesPanel;
