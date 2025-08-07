import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
const StaffPanel = ({ staffRequirements, berths, shipTonnage, combinePilotNavigator, noStewards, onCombinePilotNavigatorChange, onNoStewardsChange }) => {
    const isSmallShip = shipTonnage === 100 || shipTonnage === 200;
    // Calculate if ship has passengers (more staterooms than crew)
    const totalStaterooms = berths
        .filter(berth => berth.berth_type === 'staterooms' || berth.berth_type === 'luxury_staterooms')
        .reduce((sum, berth) => sum + berth.quantity, 0);
    // Calculate if ship has passengers based on ORIGINAL crew count (not adjusted)
    // This ensures checkboxes don't disappear when selected
    const hasPassengers = totalStaterooms > staffRequirements.total;
    // Calculate actual crew count with adjustments
    const actualCrewCount = combinePilotNavigator && noStewards
        ? staffRequirements.total - 1 - staffRequirements.stewards
        : combinePilotNavigator
            ? staffRequirements.total - 1
            : noStewards
                ? staffRequirements.total - staffRequirements.stewards
                : staffRequirements.total;
    return (_jsxs("div", { className: "panel-content", children: [_jsx("h3", { children: "Staff Requirements" }), isSmallShip && (_jsxs("div", { className: "small-ship-options", children: [_jsx("h4", { children: "Small Ship Crew Options" }), _jsx("div", { className: "crew-option", children: _jsxs("label", { children: [_jsx("input", { type: "checkbox", checked: combinePilotNavigator, onChange: (e) => onCombinePilotNavigatorChange(e.target.checked) }), "Combine Pilot and Navigator"] }) }), !hasPassengers && (_jsx("div", { className: "crew-option", children: _jsxs("label", { children: [_jsx("input", { type: "checkbox", checked: noStewards, onChange: (e) => onNoStewardsChange(e.target.checked) }), "No Stewards"] }) }))] })), _jsxs("div", { className: "staff-breakdown", children: [combinePilotNavigator ? (_jsx("p", { children: "Pilot/Navigator: 1" })) : (_jsxs(_Fragment, { children: [_jsxs("p", { children: ["Pilot: ", staffRequirements.pilot] }), _jsxs("p", { children: ["Navigator: ", staffRequirements.navigator] })] })), _jsxs("p", { children: ["Engineers: ", staffRequirements.engineers] }), _jsxs("p", { children: ["Gunners: ", staffRequirements.gunners] }), _jsxs("p", { children: ["Service (Vehicle & Drone Maintenance): ", staffRequirements.service] }), _jsxs("p", { children: ["Stewards: ", noStewards ? 0 : staffRequirements.stewards] }), _jsxs("p", { children: ["Nurses: ", staffRequirements.nurses] }), _jsxs("p", { children: ["Surgeons: ", staffRequirements.surgeons] }), _jsxs("p", { children: ["Techs: ", staffRequirements.techs] }), _jsx("p", { children: _jsxs("strong", { children: ["Total Staff: ", actualCrewCount] }) })] }), _jsx("p", { children: "Staff accommodation validation coming soon..." })] }));
};
export default StaffPanel;
