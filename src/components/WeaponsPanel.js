import { jsxs as _jsxs, jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import { WEAPON_TYPES, getWeaponMountLimit, getAvailableSpinalWeapons, getSpinalWeaponMountUsage } from '../data/constants';
const WeaponsPanel = ({ weapons, shipTonnage, shipTechLevel, engines, spinalWeapon, missileReloads, remainingMass, onUpdate, onSpinalWeaponUpdate, onMissileReloadsUpdate }) => {
    const mountLimit = getWeaponMountLimit(shipTonnage);
    const spinalMountUsage = getSpinalWeaponMountUsage(spinalWeapon, shipTechLevel);
    const usedMounts = weapons.reduce((sum, weapon) => sum + weapon.quantity, 0) + spinalMountUsage;
    // Check if any missile launchers are installed
    const hasMissileLaunchers = weapons.some(weapon => weapon.weapon_name.toLowerCase().includes('missile launcher') && weapon.quantity > 0);
    // Calculate maximum missile reloads based on remaining mass
    const maxMissileReloads = Math.floor(remainingMass - missileReloads);
    const updateWeaponQuantity = (weaponType, requestedQuantity) => {
        const validQuantity = Math.max(0, Math.floor(requestedQuantity));
        const existingWeapon = weapons.find(w => w.weapon_name === weaponType.name);
        const currentQuantity = existingWeapon?.quantity || 0;
        const quantityChange = validQuantity - currentQuantity;
        // Get current hard points
        const hardPointWeapon = weapons.find(w => w.weapon_name === 'Hard Point');
        const currentHardPoints = hardPointWeapon?.quantity || 0;
        // Calculate available slots
        const usedMountsExcludingCurrent = weapons.reduce((sum, w) => w.weapon_name === weaponType.name ? sum : sum + w.quantity, 0);
        const availableSlots = mountLimit - usedMountsExcludingCurrent;
        // If we're adding weapons (quantityChange > 0)
        if (quantityChange > 0) {
            // Calculate how many can fit in available slots + hard points
            const maxPossible = weaponType.name === 'Hard Point' ? availableSlots : availableSlots + currentHardPoints;
            const actualQuantity = currentQuantity + Math.min(quantityChange, maxPossible);
            // Calculate how many hard points to convert (if this isn't a hard point itself)
            let hardPointsToConvert = 0;
            if (weaponType.name !== 'Hard Point') {
                const slotsNeeded = actualQuantity - currentQuantity;
                const availableFreeSlots = availableSlots - currentHardPoints;
                if (slotsNeeded > availableFreeSlots) {
                    hardPointsToConvert = Math.min(slotsNeeded - availableFreeSlots, currentHardPoints);
                }
            }
            // Update weapons
            let newWeapons = weapons;
            // Remove hard points if needed
            if (hardPointsToConvert > 0) {
                newWeapons = newWeapons.map(w => w.weapon_name === 'Hard Point'
                    ? { ...w, quantity: currentHardPoints - hardPointsToConvert }
                    : w).filter(w => w.quantity > 0);
            }
            // Update or add the weapon
            if (actualQuantity === 0) {
                newWeapons = newWeapons.filter(w => w.weapon_name !== weaponType.name);
            }
            else if (existingWeapon) {
                newWeapons = newWeapons.map(w => w.weapon_name === weaponType.name
                    ? { ...w, quantity: actualQuantity }
                    : w);
            }
            else {
                newWeapons = [...newWeapons, {
                        weapon_name: weaponType.name,
                        mass: weaponType.mass,
                        cost: weaponType.cost,
                        quantity: actualQuantity
                    }];
            }
            onUpdate(newWeapons);
        }
        else {
            // Removing weapons - simple case
            if (validQuantity === 0) {
                onUpdate(weapons.filter(w => w.weapon_name !== weaponType.name));
            }
            else if (existingWeapon) {
                const newWeapons = weapons.map(w => w.weapon_name === weaponType.name
                    ? { ...w, quantity: validQuantity }
                    : w);
                onUpdate(newWeapons);
            }
        }
    };
    const maxOutHardPoints = () => {
        const availableSlots = mountLimit - usedMounts;
        if (availableSlots > 0) {
            const hardPointType = WEAPON_TYPES.find(w => w.name === 'Hard Point');
            if (hardPointType) {
                updateWeaponQuantity(hardPointType, availableSlots);
            }
        }
    };
    const hardPointWeapon = weapons.find(w => w.weapon_name === 'Hard Point');
    const currentHardPoints = hardPointWeapon?.quantity || 0;
    const availableSlots = mountLimit - usedMounts;
    return (_jsxs("div", { className: "panel-content", children: [_jsxs("p", { children: ["Available weapon mounts: ", mountLimit, " (Used: ", usedMounts, ", Remaining: ", availableSlots, ")", spinalMountUsage > 0 && _jsxs("span", { children: [" | Spinal weapon: ", spinalMountUsage, " mounts"] }), currentHardPoints > 0 && _jsxs("span", { children: [" | Hard Points: ", currentHardPoints] })] }), _jsx("div", { style: { marginBottom: '10px' }, children: _jsxs("button", { onClick: maxOutHardPoints, disabled: availableSlots === 0, style: { padding: '5px 10px' }, children: ["Max Hard Points (", availableSlots, " available)"] }) }), _jsxs("div", { className: "weapons-grouped-layout", children: [_jsx("div", { className: "weapon-group-row", children: WEAPON_TYPES.filter(w => w.name.includes('Pulse Laser')).map(weaponType => {
                            const currentWeapon = weapons.find(w => w.weapon_name === weaponType.name);
                            const quantity = currentWeapon?.quantity || 0;
                            return (_jsxs("div", { className: "component-item", children: [_jsx("div", { className: "component-info", children: _jsxs("h4", { children: [weaponType.name, ", ", weaponType.mass, " tons, ", weaponType.cost, " MCr"] }) }), _jsx("div", { className: "quantity-control", children: _jsxs("label", { children: ["Quantity:", _jsx("input", { type: "number", min: "0", value: quantity, onChange: (e) => updateWeaponQuantity(weaponType, parseInt(e.target.value) || 0), style: { width: '60px', marginLeft: '0.5rem' } })] }) })] }, weaponType.name));
                        }) }), _jsx("div", { className: "weapon-group-row", children: WEAPON_TYPES.filter(w => w.name.includes('Beam Laser')).map(weaponType => {
                            const currentWeapon = weapons.find(w => w.weapon_name === weaponType.name);
                            const quantity = currentWeapon?.quantity || 0;
                            return (_jsxs("div", { className: "component-item", children: [_jsx("div", { className: "component-info", children: _jsxs("h4", { children: [weaponType.name, ", ", weaponType.mass, " tons, ", weaponType.cost, " MCr"] }) }), _jsx("div", { className: "quantity-control", children: _jsxs("label", { children: ["Quantity:", _jsx("input", { type: "number", min: "0", value: quantity, onChange: (e) => updateWeaponQuantity(weaponType, parseInt(e.target.value) || 0), style: { width: '60px', marginLeft: '0.5rem' } })] }) })] }, weaponType.name));
                        }) }), _jsx("div", { className: "weapon-group-row", children: WEAPON_TYPES.filter(w => w.name.includes('Plasma Beam')).map(weaponType => {
                            const currentWeapon = weapons.find(w => w.weapon_name === weaponType.name);
                            const quantity = currentWeapon?.quantity || 0;
                            return (_jsxs("div", { className: "component-item", children: [_jsx("div", { className: "component-info", children: _jsxs("h4", { children: [weaponType.name, ", ", weaponType.mass, " tons, ", weaponType.cost, " MCr"] }) }), _jsx("div", { className: "quantity-control", children: _jsxs("label", { children: ["Quantity:", _jsx("input", { type: "number", min: "0", value: quantity, onChange: (e) => updateWeaponQuantity(weaponType, parseInt(e.target.value) || 0), style: { width: '60px', marginLeft: '0.5rem' } })] }) })] }, weaponType.name));
                        }) }), _jsx("div", { className: "weapon-group-row", children: WEAPON_TYPES.filter(w => w.name.includes('Fusion Gun')).map(weaponType => {
                            const currentWeapon = weapons.find(w => w.weapon_name === weaponType.name);
                            const quantity = currentWeapon?.quantity || 0;
                            return (_jsxs("div", { className: "component-item", children: [_jsx("div", { className: "component-info", children: _jsxs("h4", { children: [weaponType.name, ", ", weaponType.mass, " tons, ", weaponType.cost, " MCr"] }) }), _jsx("div", { className: "quantity-control", children: _jsxs("label", { children: ["Quantity:", _jsx("input", { type: "number", min: "0", value: quantity, onChange: (e) => updateWeaponQuantity(weaponType, parseInt(e.target.value) || 0), style: { width: '60px', marginLeft: '0.5rem' } })] }) })] }, weaponType.name));
                        }) }), _jsx("div", { className: "weapon-group-row", children: WEAPON_TYPES.filter(w => w.name.includes('Missile Launcher')).map(weaponType => {
                            const currentWeapon = weapons.find(w => w.weapon_name === weaponType.name);
                            const quantity = currentWeapon?.quantity || 0;
                            return (_jsxs("div", { className: "component-item", children: [_jsx("div", { className: "component-info", children: _jsxs("h4", { children: [weaponType.name, ", ", weaponType.mass, " tons, ", weaponType.cost, " MCr"] }) }), _jsx("div", { className: "quantity-control", children: _jsxs("label", { children: ["Quantity:", _jsx("input", { type: "number", min: "0", value: quantity, onChange: (e) => updateWeaponQuantity(weaponType, parseInt(e.target.value) || 0), style: { width: '60px', marginLeft: '0.5rem' } })] }) })] }, weaponType.name));
                        }) }), _jsx("div", { className: "weapon-group-row", children: WEAPON_TYPES.filter(w => w.name === 'Hard Point' || w.name === 'Particle Beam Barbette').map(weaponType => {
                            const currentWeapon = weapons.find(w => w.weapon_name === weaponType.name);
                            const quantity = currentWeapon?.quantity || 0;
                            return (_jsxs("div", { className: "component-item", children: [_jsx("div", { className: "component-info", children: _jsxs("h4", { children: [weaponType.name, ", ", weaponType.mass, " tons, ", weaponType.cost, " MCr"] }) }), _jsx("div", { className: "quantity-control", children: _jsxs("label", { children: ["Quantity:", _jsx("input", { type: "number", min: "0", value: quantity, onChange: (e) => updateWeaponQuantity(weaponType, parseInt(e.target.value) || 0), style: { width: '60px', marginLeft: '0.5rem' } })] }) })] }, weaponType.name));
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
