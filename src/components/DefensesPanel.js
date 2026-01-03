import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { DEFENSE_TYPES, getWeaponMountLimit, getAvailableArmorOptions, calculateArmorMass, calculateArmorCost, getArmorFactorPerIncrement, getMaxScreens, getScreenSpecs } from '../data/constants';
const DefensesPanel = ({ defenses, shipTonnage, shipTechLevel, weaponsCount, sandReloads, armorPercentage, remainingMass, onUpdate, onSandReloadsUpdate, onArmorUpdate }) => {
    const maxMountLimit = getWeaponMountLimit(shipTonnage);
    const currentTurretCount = defenses.reduce((sum, defense) => sum + defense.quantity, 0);
    const availableSlots = maxMountLimit - weaponsCount - currentTurretCount;
    // Check if any sandcaster turrets are installed
    const hasSandcasters = defenses.some(defense => defense.defense_type.includes('sandcaster') && defense.quantity > 0);
    // Calculate maximum sand reloads based on remaining mass
    const maxSandReloads = Math.floor(remainingMass - sandReloads);
    const updateDefenseQuantity = (defenseType, quantity) => {
        const validQuantity = Math.max(0, Math.floor(quantity));
        const existingDefense = defenses.find(d => d.defense_type === defenseType.type);
        if (validQuantity === 0) {
            // Remove the defense if quantity is 0
            onUpdate(defenses.filter(d => d.defense_type !== defenseType.type));
        }
        else if (existingDefense) {
            // Update existing defense
            const newDefenses = defenses.map(d => d.defense_type === defenseType.type
                ? { ...d, quantity: validQuantity }
                : d);
            onUpdate(newDefenses);
        }
        else {
            // Add new defense
            const newDefense = {
                defense_type: defenseType.type,
                quantity: validQuantity,
                mass: defenseType.mass,
                cost: defenseType.cost
            };
            onUpdate([...defenses, newDefense]);
        }
    };
    const updateScreenQuantity = (screenType, quantity) => {
        const specs = getScreenSpecs(screenType, shipTonnage);
        if (!specs)
            return;
        const newDefenses = defenses.filter(d => d.defense_type !== screenType);
        if (quantity > 0) {
            newDefenses.push({
                defense_type: screenType,
                mass: specs.mass * quantity,
                cost: specs.cost * quantity,
                quantity
            });
        }
        onUpdate(newDefenses);
    };
    return (_jsxs("div", { className: "panel-content", children: [_jsxs("p", { children: ["Available defense turret mounts: ", maxMountLimit, " (Used: ", weaponsCount + currentTurretCount, ", Remaining: ", availableSlots, ")"] }), _jsxs("div", { className: "defenses-grouped-layout", children: [_jsx("div", { className: "defense-group-row", children: DEFENSE_TYPES.filter(d => d.name.includes('Sandcaster')).map(defenseType => {
                            const currentDefense = defenses.find(d => d.defense_type === defenseType.type);
                            const quantity = currentDefense?.quantity || 0;
                            return (_jsxs("div", { className: "component-item", children: [_jsx("div", { className: "component-info", children: _jsxs("h4", { children: [defenseType.name, ", ", defenseType.mass, " tons, ", defenseType.cost, " MCr"] }) }), _jsx("div", { className: "quantity-control", children: _jsxs("label", { children: ["Quantity:", _jsx("input", { type: "number", min: "0", value: quantity, onChange: (e) => updateDefenseQuantity(defenseType, parseInt(e.target.value) || 0), style: { width: '60px', marginLeft: '0.5rem' } })] }) })] }, defenseType.type));
                        }) }), _jsx("div", { className: "defense-group-row", children: DEFENSE_TYPES.filter(d => d.name.includes('Point Defense')).map(defenseType => {
                            const currentDefense = defenses.find(d => d.defense_type === defenseType.type);
                            const quantity = currentDefense?.quantity || 0;
                            return (_jsxs("div", { className: "component-item", children: [_jsx("div", { className: "component-info", children: _jsxs("h4", { children: [defenseType.name, ", ", defenseType.mass, " tons, ", defenseType.cost, " MCr"] }) }), _jsx("div", { className: "quantity-control", children: _jsxs("label", { children: ["Quantity:", _jsx("input", { type: "number", min: "0", value: quantity, onChange: (e) => updateDefenseQuantity(defenseType, parseInt(e.target.value) || 0), style: { width: '60px', marginLeft: '0.5rem' } })] }) })] }, defenseType.type));
                        }) })] }), _jsxs("div", { className: "armor-section", children: [_jsx("h3", { children: "Armor" }), _jsxs("p", { children: ["Tech Level ", shipTechLevel, " armor provides AF-", getArmorFactorPerIncrement(shipTechLevel), " per 5% of ship tonnage.", getArmorFactorPerIncrement(shipTechLevel) === 4 ? ' (Crystaliron)' : ' (Advanced Armor)'] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { htmlFor: "armor-percentage", children: "Armor Coverage" }), _jsxs("select", { id: "armor-percentage", value: armorPercentage || 0, onChange: (e) => onArmorUpdate(parseInt(e.target.value)), children: [_jsx("option", { value: "0", children: "No Armor (AF-0)" }), getAvailableArmorOptions(shipTechLevel).map(option => (_jsx("option", { value: option.percentage, children: option.label }, option.percentage)))] }), armorPercentage > 0 && (_jsxs("small", { children: ["Mass: ", calculateArmorMass(shipTonnage, armorPercentage).toFixed(1), " tons, Cost: ", calculateArmorCost(calculateArmorMass(shipTonnage, armorPercentage)).toFixed(2), " MCr"] }))] })] }), hasSandcasters && (_jsxs("div", { className: "sand-reloads-section", children: [_jsx("h3", { children: "Sand Reloads" }), _jsx("p", { children: "Sandcaster turrets detected. You can allocate tonnage for sand reloads." }), _jsxs("div", { className: "form-group", children: [_jsx("label", { htmlFor: "sand-reloads", children: "Sand Reload Tonnage" }), _jsx("input", { id: "sand-reloads", type: "number", min: "0", max: maxSandReloads + sandReloads, value: sandReloads, onChange: (e) => onSandReloadsUpdate(Math.max(0, parseInt(e.target.value) || 0)) }), _jsxs("small", { children: ["0 - ", maxSandReloads + sandReloads, " tons available. Cost: ", (sandReloads * 0.1).toFixed(1), " MCr (0.1 MCr per ton)"] })] }), sandReloads > 0 && (_jsxs("div", { className: "sand-summary", children: [_jsxs("p", { children: [_jsx("strong", { children: "Sand Reloads:" }), " ", sandReloads, " tons (", (sandReloads * 0.1).toFixed(1), " MCr)"] }), _jsx("p", { children: _jsx("small", { children: "Provides additional sand ammunition for sandcaster turrets" }) })] }))] })), _jsxs("div", { className: "screens-section", children: [_jsx("h3", { children: "Defensive Screens" }), _jsx("p", { children: "Advanced defensive systems for capital ships. Availability depends on tech level and hull size." }), (() => {
                        const maxNuclearDampers = getMaxScreens('nuclear_damper', shipTechLevel);
                        const nuclearDamperSpecs = getScreenSpecs('nuclear_damper', shipTonnage);
                        const currentNuclearDampers = defenses.find(d => d.defense_type === 'nuclear_damper')?.quantity || 0;
                        if (maxNuclearDampers === 0 || !nuclearDamperSpecs) {
                            return (_jsxs("div", { className: "screen-item", children: [_jsx("h4", { children: "Nuclear Dampers" }), _jsx("p", { className: "info-message", children: "Not available (requires TL 12+ and hull code CA+)" })] }));
                        }
                        return (_jsxs("div", { className: "screen-item", children: [_jsx("h4", { children: "Nuclear Dampers" }), _jsxs("p", { children: ["Max allowed: ", maxNuclearDampers, " | Per screen: ", nuclearDamperSpecs.mass, " tons, ", nuclearDamperSpecs.cost, " MCr"] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { htmlFor: "nuclear-dampers", children: "Number of Nuclear Dampers" }), _jsx("input", { id: "nuclear-dampers", type: "number", min: "0", max: maxNuclearDampers, value: currentNuclearDampers, onChange: (e) => updateScreenQuantity('nuclear_damper', Math.min(maxNuclearDampers, Math.max(0, parseInt(e.target.value) || 0))) }), currentNuclearDampers > 0 && (_jsxs("small", { children: ["Total: ", nuclearDamperSpecs.mass * currentNuclearDampers, " tons, ", nuclearDamperSpecs.cost * currentNuclearDampers, " MCr"] }))] })] }));
                    })(), (() => {
                        const maxMesonScreens = getMaxScreens('meson_screen', shipTechLevel);
                        const mesonScreenSpecs = getScreenSpecs('meson_screen', shipTonnage);
                        const currentMesonScreens = defenses.find(d => d.defense_type === 'meson_screen')?.quantity || 0;
                        if (maxMesonScreens === 0 || !mesonScreenSpecs) {
                            return (_jsxs("div", { className: "screen-item", children: [_jsx("h4", { children: "Meson Screens" }), _jsx("p", { className: "info-message", children: "Not available (requires TL 12+ and hull code CA+)" })] }));
                        }
                        return (_jsxs("div", { className: "screen-item", children: [_jsx("h4", { children: "Meson Screens" }), _jsxs("p", { children: ["Max allowed: ", maxMesonScreens, " | Per screen: ", mesonScreenSpecs.mass, " tons, ", mesonScreenSpecs.cost, " MCr"] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { htmlFor: "meson-screens", children: "Number of Meson Screens" }), _jsx("input", { id: "meson-screens", type: "number", min: "0", max: maxMesonScreens, value: currentMesonScreens, onChange: (e) => updateScreenQuantity('meson_screen', Math.min(maxMesonScreens, Math.max(0, parseInt(e.target.value) || 0))) }), currentMesonScreens > 0 && (_jsxs("small", { children: ["Total: ", mesonScreenSpecs.mass * currentMesonScreens, " tons, ", mesonScreenSpecs.cost * currentMesonScreens, " MCr"] }))] })] }));
                    })(), (() => {
                        const maxBlackGlobes = getMaxScreens('black_globe', shipTechLevel);
                        const blackGlobeSpecs = getScreenSpecs('black_globe', shipTonnage);
                        const currentBlackGlobes = defenses.find(d => d.defense_type === 'black_globe')?.quantity || 0;
                        if (maxBlackGlobes === 0 || !blackGlobeSpecs) {
                            return (_jsxs("div", { className: "screen-item", children: [_jsx("h4", { children: "Black Globes (Force Fields)" }), _jsx("p", { className: "info-message", children: "Not available (requires TL 15+ and hull code CA+)" })] }));
                        }
                        return (_jsxs("div", { className: "screen-item", children: [_jsx("h4", { children: "Black Globes (Force Fields)" }), _jsxs("p", { children: ["Max allowed: ", maxBlackGlobes, " | Per field: ", blackGlobeSpecs.mass, " tons, ", blackGlobeSpecs.cost, " MCr"] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { htmlFor: "black-globes", children: "Number of Black Globes" }), _jsx("input", { id: "black-globes", type: "number", min: "0", max: maxBlackGlobes, value: currentBlackGlobes, onChange: (e) => updateScreenQuantity('black_globe', Math.min(maxBlackGlobes, Math.max(0, parseInt(e.target.value) || 0))) }), currentBlackGlobes > 0 && (_jsxs("small", { children: ["Total: ", blackGlobeSpecs.mass * currentBlackGlobes, " tons, ", blackGlobeSpecs.cost * currentBlackGlobes, " MCr"] }))] })] }));
                    })()] })] }));
};
export default DefensesPanel;
