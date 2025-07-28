import React from 'react';
import { Weapon } from '../types/ship';
import { WEAPON_TYPES, getWeaponMountLimit } from '../data/constants';

interface WeaponsPanelProps {
  weapons: Weapon[];
  shipTonnage: number;
  onUpdate: (weapons: Weapon[]) => void;
}

const WeaponsPanel: React.FC<WeaponsPanelProps> = ({ weapons, shipTonnage, onUpdate }) => {
  const mountLimit = getWeaponMountLimit(shipTonnage);
  const usedMounts = weapons.reduce((sum, weapon) => sum + weapon.quantity, 0);

  const addWeapon = (weaponType: typeof WEAPON_TYPES[0]) => {
    const existingWeapon = weapons.find(w => w.weapon_name === weaponType.name);
    if (existingWeapon) {
      const newWeapons = weapons.map(w =>
        w.weapon_name === weaponType.name
          ? { ...w, quantity: w.quantity + 1 }
          : w
      );
      onUpdate(newWeapons);
    } else {
      onUpdate([...weapons, {
        weapon_name: weaponType.name,
        mass: weaponType.mass,
        cost: weaponType.cost,
        quantity: 1
      }]);
    }
  };

  const removeWeapon = (weaponName: string) => {
    const newWeapons = weapons.map(w =>
      w.weapon_name === weaponName
        ? { ...w, quantity: Math.max(0, w.quantity - 1) }
        : w
    ).filter(w => w.quantity > 0);
    onUpdate(newWeapons);
  };

  return (
    <div className="panel-content">
      <p>Available weapon mounts: {mountLimit} (Used: {usedMounts}, Remaining: {mountLimit - usedMounts})</p>
      
      <div className="component-list">
        {WEAPON_TYPES.map(weaponType => {
          const currentWeapon = weapons.find(w => w.weapon_name === weaponType.name);
          const quantity = currentWeapon?.quantity || 0;
          const canAdd = usedMounts < mountLimit;

          return (
            <div key={weaponType.name} className="component-item">
              <div className="component-info">
                <h4>{weaponType.name}</h4>
                <p>Mass: {weaponType.mass} tons, Cost: {weaponType.cost} MCr</p>
              </div>
              <div className="quantity-control">
                <button 
                  onClick={() => removeWeapon(weaponType.name)}
                  disabled={quantity === 0}
                >
                  -
                </button>
                <span>{quantity}</span>
                <button 
                  onClick={() => addWeapon(weaponType)}
                  disabled={!canAdd}
                >
                  +
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WeaponsPanel;