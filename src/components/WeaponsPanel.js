import { jsxs as _jsxs, jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import { WEAPON_TYPES, getWeaponMountLimit, getAvailableSpinalWeapons } from '../data/constants';
const WeaponsPanel = ({ weapons, shipTonnage, shipTechLevel, engines, spinalWeapon, missileReloads, remainingMass, onUpdate, onSpinalWeaponUpdate, onMissileReloadsUpdate }) => {
    const mountLimit = getWeaponMountLimit(shipTonnage);
    const usedMounts = weapons.reduce((sum, weapon) => sum + weapon.quantity, 0);
    // Check if any missile launchers are installed
    const hasMissileLaunchers = weapons.some(weapon => weapon.weapon_name.toLowerCase().includes('missile launcher') && weapon.quantity > 0);
    // Calculate maximum missile reloads based on remaining mass
    const maxMissileReloads = Math.floor(remainingMass - missileReloads);
    const addWeapon = (weaponType) => {
        const existingWeapon = weapons.find(w => w.weapon_name === weaponType.name);
        if (existingWeapon) {
            const newWeapons = weapons.map(w => w.weapon_name === weaponType.name
                ? { ...w, quantity: w.quantity + 1 }
                : w);
            onUpdate(newWeapons);
        }
        else {
            onUpdate([...weapons, {
                    weapon_name: weaponType.name,
                    mass: weaponType.mass,
                    cost: weaponType.cost,
                    quantity: 1
                }]);
        }
    };
    const removeWeapon = (weaponName) => {
        const newWeapons = weapons.map(w => w.weapon_name === weaponName
            ? { ...w, quantity: Math.max(0, w.quantity - 1) }
            : w).filter(w => w.quantity > 0);
        onUpdate(newWeapons);
    };
    return (_jsxs("div", { className: "panel-content", children: [_jsxs("p", { children: ["Available weapon mounts: ", mountLimit, " (Used: ", usedMounts, ", Remaining: ", mountLimit - usedMounts, ")"] }), _jsxs("div", { className: "weapons-grouped-layout", children: [_jsx("div", { className: "weapon-group-row", children: WEAPON_TYPES.filter(w => w.name.includes('Pulse Laser')).map(weaponType => {
                            const currentWeapon = weapons.find(w => w.weapon_name === weaponType.name);
                            const quantity = currentWeapon?.quantity || 0;
                            const canAdd = usedMounts < mountLimit;
                            return (_jsxs("div", { className: "component-item", children: [_jsx("div", { className: "component-info", children: _jsxs("h4", { children: [weaponType.name, ", ", weaponType.mass, " tons, ", weaponType.cost, " MCr"] }) }), _jsxs("div", { className: "quantity-control", children: [_jsx("button", { onClick: () => removeWeapon(weaponType.name), disabled: quantity === 0, children: "-" }), _jsx("span", { children: quantity }), _jsx("button", { onClick: () => addWeapon(weaponType), disabled: !canAdd, children: "+" })] })] }, weaponType.name));
                        }) }), _jsx("div", { className: "weapon-group-row", children: WEAPON_TYPES.filter(w => w.name.includes('Beam Laser')).map(weaponType => {
                            const currentWeapon = weapons.find(w => w.weapon_name === weaponType.name);
                            const quantity = currentWeapon?.quantity || 0;
                            const canAdd = usedMounts < mountLimit;
                            return (_jsxs("div", { className: "component-item", children: [_jsx("div", { className: "component-info", children: _jsxs("h4", { children: [weaponType.name, ", ", weaponType.mass, " tons, ", weaponType.cost, " MCr"] }) }), _jsxs("div", { className: "quantity-control", children: [_jsx("button", { onClick: () => removeWeapon(weaponType.name), disabled: quantity === 0, children: "-" }), _jsx("span", { children: quantity }), _jsx("button", { onClick: () => addWeapon(weaponType), disabled: !canAdd, children: "+" })] })] }, weaponType.name));
                        }) }), _jsx("div", { className: "weapon-group-row", children: WEAPON_TYPES.filter(w => w.name.includes('Plasma Beam')).map(weaponType => {
                            const currentWeapon = weapons.find(w => w.weapon_name === weaponType.name);
                            const quantity = currentWeapon?.quantity || 0;
                            const canAdd = usedMounts < mountLimit;
                            return (_jsxs("div", { className: "component-item", children: [_jsx("div", { className: "component-info", children: _jsxs("h4", { children: [weaponType.name, ", ", weaponType.mass, " tons, ", weaponType.cost, " MCr"] }) }), _jsxs("div", { className: "quantity-control", children: [_jsx("button", { onClick: () => removeWeapon(weaponType.name), disabled: quantity === 0, children: "-" }), _jsx("span", { children: quantity }), _jsx("button", { onClick: () => addWeapon(weaponType), disabled: !canAdd, children: "+" })] })] }, weaponType.name));
                        }) }), _jsx("div", { className: "weapon-group-row", children: WEAPON_TYPES.filter(w => w.name.includes('Fusion Gun')).map(weaponType => {
                            const currentWeapon = weapons.find(w => w.weapon_name === weaponType.name);
                            const quantity = currentWeapon?.quantity || 0;
                            const canAdd = usedMounts < mountLimit;
                            return (_jsxs("div", { className: "component-item", children: [_jsx("div", { className: "component-info", children: _jsxs("h4", { children: [weaponType.name, ", ", weaponType.mass, " tons, ", weaponType.cost, " MCr"] }) }), _jsxs("div", { className: "quantity-control", children: [_jsx("button", { onClick: () => removeWeapon(weaponType.name), disabled: quantity === 0, children: "-" }), _jsx("span", { children: quantity }), _jsx("button", { onClick: () => addWeapon(weaponType), disabled: !canAdd, children: "+" })] })] }, weaponType.name));
                        }) }), _jsx("div", { className: "weapon-group-row", children: WEAPON_TYPES.filter(w => w.name.includes('Missile Launcher')).map(weaponType => {
                            const currentWeapon = weapons.find(w => w.weapon_name === weaponType.name);
                            const quantity = currentWeapon?.quantity || 0;
                            const canAdd = usedMounts < mountLimit;
                            return (_jsxs("div", { className: "component-item", children: [_jsx("div", { className: "component-info", children: _jsxs("h4", { children: [weaponType.name, ", ", weaponType.mass, " tons, ", weaponType.cost, " MCr"] }) }), _jsxs("div", { className: "quantity-control", children: [_jsx("button", { onClick: () => removeWeapon(weaponType.name), disabled: quantity === 0, children: "-" }), _jsx("span", { children: quantity }), _jsx("button", { onClick: () => addWeapon(weaponType), disabled: !canAdd, children: "+" })] })] }, weaponType.name));
                        }) }), _jsx("div", { className: "weapon-group-row", children: WEAPON_TYPES.filter(w => w.name === 'Hard Point' || w.name === 'Particle Beam Barbette').map(weaponType => {
                            const currentWeapon = weapons.find(w => w.weapon_name === weaponType.name);
                            const quantity = currentWeapon?.quantity || 0;
                            const canAdd = usedMounts < mountLimit;
                            return (_jsxs("div", { className: "component-item", children: [_jsx("div", { className: "component-info", children: _jsxs("h4", { children: [weaponType.name, ", ", weaponType.mass, " tons, ", weaponType.cost, " MCr"] }) }), _jsxs("div", { className: "quantity-control", children: [_jsx("button", { onClick: () => removeWeapon(weaponType.name), disabled: quantity === 0, children: "-" }), _jsx("span", { children: quantity }), _jsx("button", { onClick: () => addWeapon(weaponType), disabled: !canAdd, children: "+" })] })] }, weaponType.name));
                        }) })] }), _jsxs("div", { className: "spinal-weapon-section", children: [_jsx("h3", { children: "Spinal Weapon" }), (() => {
                        const powerPlant = engines.find(e => e.engine_type === 'power_plant');
                        const powerPlantPerformance = powerPlant?.performance || 0;
                        const availableSpinalWeapons = getAvailableSpinalWeapons(shipTechLevel, powerPlantPerformance);
                        if (powerPlantPerformance < 2) {
                            return _jsx("p", { className: "info-message", children: "Spinal weapons require a Power Plant with P-2 or higher performance." });
                        }
                        if (availableSpinalWeapons.length === 0) {
                            return _jsxs("p", { className: "info-message", children: ["No spinal weapons available at Tech Level ", shipTechLevel, " with P-", powerPlantPerformance, " power plant."] });
                        }
                        return (_jsxs(_Fragment, { children: [_jsx("p", { children: "Select a spinal weapon for your ship. Only one spinal weapon can be installed." }), _jsxs("div", { className: "form-group", children: [_jsx("label", { htmlFor: "spinal-weapon", children: "Spinal Weapon Selection" }), _jsxs("select", { id: "spinal-weapon", value: spinalWeapon || '', onChange: (e) => onSpinalWeaponUpdate(e.target.value || undefined), children: [_jsx("option", { value: "", children: "None" }), availableSpinalWeapons.map(weapon => (_jsxs("option", { value: weapon.name, children: [weapon.name, " - ", weapon.mass.toLocaleString(), "t, Damage ", weapon.damage, ", ", weapon.cost.toLocaleString(), " MCr", weapon.tlBonus ? ` (${weapon.tlBonus})` : ''] }, weapon.name)))] }), spinalWeapon && (() => {
                                            const selectedWeapon = availableSpinalWeapons.find(w => w.name === spinalWeapon);
                                            if (selectedWeapon) {
                                                return (_jsxs("small", { children: ["Mass: ", selectedWeapon.mass.toLocaleString(), " tons, Damage: ", selectedWeapon.damage, ", Cost: ", selectedWeapon.cost.toLocaleString(), " MCr", selectedWeapon.tlBonus && _jsxs("span", { children: [" (", selectedWeapon.tlBonus, " bonus applied)"] })] }));
                                            }
                                            return null;
                                        })()] })] }));
                    })()] }), hasMissileLaunchers && (_jsxs("div", { className: "missile-reloads-section", children: [_jsx("h3", { children: "Missile Reloads" }), _jsx("p", { children: "Missile launchers detected. You can allocate tonnage for missile reloads." }), _jsxs("div", { className: "form-group", children: [_jsx("label", { htmlFor: "missile-reloads", children: "Missile Reload Tonnage" }), _jsx("input", { id: "missile-reloads", type: "number", min: "0", max: maxMissileReloads + missileReloads, value: missileReloads, onChange: (e) => onMissileReloadsUpdate(Math.max(0, parseInt(e.target.value) || 0)) }), _jsxs("small", { children: ["0 - ", maxMissileReloads + missileReloads, " tons available. Cost: ", missileReloads, " MCr (1 MCr per ton)"] })] }), missileReloads > 0 && (_jsxs("div", { className: "missile-summary", children: [_jsxs("p", { children: [_jsx("strong", { children: "Missile Reloads:" }), " ", missileReloads, " tons (", missileReloads, " MCr)"] }), _jsx("p", { children: _jsx("small", { children: "Provides additional missile ammunition for extended operations" }) })] }))] }))] }));
};
export default WeaponsPanel;
