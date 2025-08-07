import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { DEFENSE_TYPES, getWeaponMountLimit } from '../data/constants';
const DefensesPanel = ({ defenses, shipTonnage, weaponsCount, sandReloads, remainingMass, onUpdate, onSandReloadsUpdate }) => {
    const maxMountLimit = getWeaponMountLimit(shipTonnage);
    const currentTurretCount = defenses.reduce((sum, defense) => sum + defense.quantity, 0);
    const availableSlots = maxMountLimit - weaponsCount - currentTurretCount;
    // Check if any sandcaster turrets are installed
    const hasSandcasters = defenses.some(defense => defense.defense_type.includes('sandcaster') && defense.quantity > 0);
    // Calculate maximum sand reloads based on remaining mass
    const maxSandReloads = Math.floor(remainingMass - sandReloads);
    const addDefense = (defenseType) => {
        if (availableSlots <= 0)
            return;
        const existingDefense = defenses.find(d => d.defense_type === defenseType.type);
        if (existingDefense) {
            const newDefenses = defenses.map(d => d.defense_type === defenseType.type
                ? { ...d, quantity: d.quantity + 1 }
                : d);
            onUpdate(newDefenses);
        }
        else {
            const newDefense = {
                defense_type: defenseType.type,
                quantity: 1,
                mass: defenseType.mass,
                cost: defenseType.cost
            };
            onUpdate([...defenses, newDefense]);
        }
    };
    const removeDefense = (defenseType) => {
        const newDefenses = defenses.map(d => d.defense_type === defenseType
            ? { ...d, quantity: Math.max(0, d.quantity - 1) }
            : d).filter(d => d.quantity > 0);
        onUpdate(newDefenses);
    };
    return (_jsxs("div", { className: "panel-content", children: [_jsxs("p", { children: ["Available defense turret mounts: ", maxMountLimit, " (Used: ", weaponsCount + currentTurretCount, ", Remaining: ", availableSlots, ")"] }), _jsxs("div", { className: "defenses-grouped-layout", children: [_jsx("div", { className: "defense-group-row", children: DEFENSE_TYPES.filter(d => d.name.includes('Sandcaster')).map(defenseType => {
                            const currentDefense = defenses.find(d => d.defense_type === defenseType.type);
                            const quantity = currentDefense?.quantity || 0;
                            const canAdd = availableSlots > 0;
                            return (_jsxs("div", { className: "component-item", children: [_jsx("div", { className: "component-info", children: _jsxs("h4", { children: [defenseType.name, ", ", defenseType.mass, " tons, ", defenseType.cost, " MCr"] }) }), _jsxs("div", { className: "quantity-control", children: [_jsx("button", { onClick: () => removeDefense(defenseType.type), disabled: quantity === 0, children: "-" }), _jsx("span", { children: quantity }), _jsx("button", { onClick: () => addDefense(defenseType), disabled: !canAdd, children: "+" })] })] }, defenseType.type));
                        }) }), _jsx("div", { className: "defense-group-row", children: DEFENSE_TYPES.filter(d => d.name.includes('Point Defense')).map(defenseType => {
                            const currentDefense = defenses.find(d => d.defense_type === defenseType.type);
                            const quantity = currentDefense?.quantity || 0;
                            const canAdd = availableSlots > 0;
                            return (_jsxs("div", { className: "component-item", children: [_jsx("div", { className: "component-info", children: _jsxs("h4", { children: [defenseType.name, ", ", defenseType.mass, " tons, ", defenseType.cost, " MCr"] }) }), _jsxs("div", { className: "quantity-control", children: [_jsx("button", { onClick: () => removeDefense(defenseType.type), disabled: quantity === 0, children: "-" }), _jsx("span", { children: quantity }), _jsx("button", { onClick: () => addDefense(defenseType), disabled: !canAdd, children: "+" })] })] }, defenseType.type));
                        }) })] }), hasSandcasters && (_jsxs("div", { className: "sand-reloads-section", children: [_jsx("h3", { children: "Sand Reloads" }), _jsx("p", { children: "Sandcaster turrets detected. You can allocate tonnage for sand reloads." }), _jsxs("div", { className: "form-group", children: [_jsx("label", { htmlFor: "sand-reloads", children: "Sand Reload Tonnage" }), _jsx("input", { id: "sand-reloads", type: "number", min: "0", max: maxSandReloads + sandReloads, value: sandReloads, onChange: (e) => onSandReloadsUpdate(Math.max(0, parseInt(e.target.value) || 0)) }), _jsxs("small", { children: ["0 - ", maxSandReloads + sandReloads, " tons available. Cost: ", (sandReloads * 0.1).toFixed(1), " MCr (0.1 MCr per ton)"] })] }), sandReloads > 0 && (_jsxs("div", { className: "sand-summary", children: [_jsxs("p", { children: [_jsx("strong", { children: "Sand Reloads:" }), " ", sandReloads, " tons (", (sandReloads * 0.1).toFixed(1), " MCr)"] }), _jsx("p", { children: _jsx("small", { children: "Provides additional sand ammunition for sandcaster turrets" }) })] }))] }))] }));
};
export default DefensesPanel;
