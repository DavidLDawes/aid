import React from 'react';
import type { Weapon, Engine } from '../types/ship';
import { WEAPON_TYPES, BAY_WEAPON_TYPES, getWeaponMountLimit, getAvailableSpinalWeapons, getSpinalWeaponMountUsage, getMaxBayWeapons, getAvailableBayWeapons } from '../data/constants';

interface WeaponsPanelProps {
  weapons: Weapon[];
  shipTonnage: number;
  shipTechLevel: string;
  engines: Engine[];
  spinalWeapon: string | undefined;
  missileReloads: number;
  remainingMass: number;
  onUpdate: (weapons: Weapon[]) => void;
  onSpinalWeaponUpdate: (spinalWeapon: string | undefined) => void;
  onMissileReloadsUpdate: (reloads: number) => void;
}

const WeaponsPanel: React.FC<WeaponsPanelProps> = ({
  weapons,
  shipTonnage,
  shipTechLevel,
  engines,
  spinalWeapon,
  missileReloads,
  remainingMass,
  onUpdate,
  onSpinalWeaponUpdate,
  onMissileReloadsUpdate
}) => {
  const mountLimit = getWeaponMountLimit(shipTonnage);
  const spinalMountUsage = getSpinalWeaponMountUsage(spinalWeapon, shipTechLevel);

  // Separate bay weapons from turret/barbette weapons
  const bayWeaponNames = BAY_WEAPON_TYPES.map(b => b.name);
  const turretWeapons = weapons.filter(w => !bayWeaponNames.includes(w.weapon_name));
  const bayWeapons = weapons.filter(w => bayWeaponNames.includes(w.weapon_name));

  // Bay weapons also consume weapon mount slots (1 slot per bay weapon)
  const usedBayWeapons = bayWeapons.reduce((sum, weapon) => sum + weapon.quantity, 0);
  const usedMounts = turretWeapons.reduce((sum, weapon) => sum + weapon.quantity, 0) + usedBayWeapons + spinalMountUsage;

  // Calculate bay weapon limits (power/tonnage AND weapon mount slots)
  const powerPlant = engines.find(e => e.engine_type === 'power_plant');
  const powerPlantPerformance = powerPlant?.performance || 0;
  const maxBayWeaponsByPower = getMaxBayWeapons(powerPlantPerformance, shipTonnage);
  const availableMountSlots = mountLimit - usedMounts;
  // Bay weapons are limited by the LOWER of: power/tonnage limit OR available mount slots
  const maxBayWeapons = Math.min(maxBayWeaponsByPower, availableMountSlots + usedBayWeapons);
  
  // Check if any missile launchers are installed
  const hasMissileLaunchers = weapons.some(weapon => 
    weapon.weapon_name.toLowerCase().includes('missile launcher') && weapon.quantity > 0
  );
  
  // Calculate maximum missile reloads based on remaining mass
  const maxMissileReloads = Math.floor(remainingMass - missileReloads);

  const updateWeaponQuantity = (weaponType: typeof WEAPON_TYPES[0], requestedQuantity: number) => {
    const validQuantity = Math.max(0, Math.floor(requestedQuantity));
    const existingWeapon = weapons.find(w => w.weapon_name === weaponType.name);
    const currentQuantity = existingWeapon?.quantity || 0;
    const quantityChange = validQuantity - currentQuantity;

    // Get current hard points
    const hardPointWeapon = weapons.find(w => w.weapon_name === 'Hard Point');
    const currentHardPoints = hardPointWeapon?.quantity || 0;

    // Calculate available slots
    const usedMountsExcludingCurrent = weapons.reduce((sum, w) =>
      w.weapon_name === weaponType.name ? sum : sum + w.quantity, 0
    );
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
        newWeapons = newWeapons.map(w =>
          w.weapon_name === 'Hard Point'
            ? { ...w, quantity: currentHardPoints - hardPointsToConvert }
            : w
        ).filter(w => w.quantity > 0);
      }

      // Update or add the weapon
      if (actualQuantity === 0) {
        newWeapons = newWeapons.filter(w => w.weapon_name !== weaponType.name);
      } else if (existingWeapon) {
        newWeapons = newWeapons.map(w =>
          w.weapon_name === weaponType.name
            ? { ...w, quantity: actualQuantity }
            : w
        );
      } else {
        newWeapons = [...newWeapons, {
          weapon_name: weaponType.name,
          mass: weaponType.mass,
          cost: weaponType.cost,
          quantity: actualQuantity
        }];
      }

      onUpdate(newWeapons);
    } else {
      // Removing weapons - simple case
      if (validQuantity === 0) {
        onUpdate(weapons.filter(w => w.weapon_name !== weaponType.name));
      } else if (existingWeapon) {
        const newWeapons = weapons.map(w =>
          w.weapon_name === weaponType.name
            ? { ...w, quantity: validQuantity }
            : w
        );
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

  const updateBayWeaponQuantity = (bayWeaponType: typeof BAY_WEAPON_TYPES[0], requestedQuantity: number) => {
    const validQuantity = Math.max(0, Math.floor(requestedQuantity));

    // Don't allow exceeding max bay weapons
    const otherBayWeapons = bayWeapons.filter(w => w.weapon_name !== bayWeaponType.name);
    const otherBayWeaponsCount = otherBayWeapons.reduce((sum, w) => sum + w.quantity, 0);
    const maxAllowed = maxBayWeapons - otherBayWeaponsCount;
    const clampedQuantity = Math.min(validQuantity, maxAllowed);

    let newWeapons = weapons.filter(w => w.weapon_name !== bayWeaponType.name);

    if (clampedQuantity > 0) {
      newWeapons.push({
        weapon_name: bayWeaponType.name,
        mass: bayWeaponType.mass,
        cost: bayWeaponType.cost,
        quantity: clampedQuantity
      });
    }

    onUpdate(newWeapons);
  };

  const hardPointWeapon = weapons.find(w => w.weapon_name === 'Hard Point');
  const currentHardPoints = hardPointWeapon?.quantity || 0;
  const availableSlots = mountLimit - usedMounts;

  return (
    <div className="panel-content">
      <p>
        Available weapon mounts: {mountLimit} (Used: {usedMounts}, Remaining: {availableSlots})
        {spinalMountUsage > 0 && <span> | Spinal weapon: {spinalMountUsage} mounts</span>}
        {usedBayWeapons > 0 && <span> | Bay weapons: {usedBayWeapons} mounts</span>}
        {currentHardPoints > 0 && <span> | Hard Points: {currentHardPoints}</span>}
      </p>
      <div style={{ marginBottom: '10px' }}>
        <button
          onClick={maxOutHardPoints}
          disabled={availableSlots === 0}
          style={{ padding: '5px 10px' }}
        >
          Max Hard Points ({availableSlots} available)
        </button>
      </div>

      <div className="weapons-grouped-layout">
        {/* Pulse Laser Group */}
        <div className="weapon-group-row">
          {WEAPON_TYPES.filter(w => w.name.includes('Pulse Laser')).map(weaponType => {
            const currentWeapon = weapons.find(w => w.weapon_name === weaponType.name);
            const quantity = currentWeapon?.quantity || 0;

            return (
              <div key={weaponType.name} className="component-item">
                <div className="component-info">
                  <h4>{weaponType.name}, {weaponType.mass} tons, {weaponType.cost} MCr</h4>
                </div>
                <div className="quantity-control">
                  <label>
                    Quantity:
                    <input
                      type="number"
                      min="0"
                      value={quantity}
                      onChange={(e) => updateWeaponQuantity(weaponType, parseInt(e.target.value) || 0)}
                      style={{ width: '60px', marginLeft: '0.5rem' }}
                    />
                  </label>
                </div>
              </div>
            );
          })}
        </div>

        {/* Beam Laser Group */}
        <div className="weapon-group-row">
          {WEAPON_TYPES.filter(w => w.name.includes('Beam Laser')).map(weaponType => {
            const currentWeapon = weapons.find(w => w.weapon_name === weaponType.name);
            const quantity = currentWeapon?.quantity || 0;

            return (
              <div key={weaponType.name} className="component-item">
                <div className="component-info">
                  <h4>{weaponType.name}, {weaponType.mass} tons, {weaponType.cost} MCr</h4>
                </div>
                <div className="quantity-control">
                  <label>
                    Quantity:
                    <input
                      type="number"
                      min="0"
                      value={quantity}
                      onChange={(e) => updateWeaponQuantity(weaponType, parseInt(e.target.value) || 0)}
                      style={{ width: '60px', marginLeft: '0.5rem' }}
                    />
                  </label>
                </div>
              </div>
            );
          })}
        </div>

        {/* Plasma Beam Group */}
        <div className="weapon-group-row">
          {WEAPON_TYPES.filter(w => w.name.includes('Plasma Beam')).map(weaponType => {
            const currentWeapon = weapons.find(w => w.weapon_name === weaponType.name);
            const quantity = currentWeapon?.quantity || 0;

            return (
              <div key={weaponType.name} className="component-item">
                <div className="component-info">
                  <h4>{weaponType.name}, {weaponType.mass} tons, {weaponType.cost} MCr</h4>
                </div>
                <div className="quantity-control">
                  <label>
                    Quantity:
                    <input
                      type="number"
                      min="0"
                      value={quantity}
                      onChange={(e) => updateWeaponQuantity(weaponType, parseInt(e.target.value) || 0)}
                      style={{ width: '60px', marginLeft: '0.5rem' }}
                    />
                  </label>
                </div>
              </div>
            );
          })}
        </div>

        {/* Fusion Gun Group */}
        <div className="weapon-group-row">
          {WEAPON_TYPES.filter(w => w.name.includes('Fusion Gun')).map(weaponType => {
            const currentWeapon = weapons.find(w => w.weapon_name === weaponType.name);
            const quantity = currentWeapon?.quantity || 0;

            return (
              <div key={weaponType.name} className="component-item">
                <div className="component-info">
                  <h4>{weaponType.name}, {weaponType.mass} tons, {weaponType.cost} MCr</h4>
                </div>
                <div className="quantity-control">
                  <label>
                    Quantity:
                    <input
                      type="number"
                      min="0"
                      value={quantity}
                      onChange={(e) => updateWeaponQuantity(weaponType, parseInt(e.target.value) || 0)}
                      style={{ width: '60px', marginLeft: '0.5rem' }}
                    />
                  </label>
                </div>
              </div>
            );
          })}
        </div>

        {/* Missile Launcher Group */}
        <div className="weapon-group-row">
          {WEAPON_TYPES.filter(w => w.name.includes('Missile Launcher')).map(weaponType => {
            const currentWeapon = weapons.find(w => w.weapon_name === weaponType.name);
            const quantity = currentWeapon?.quantity || 0;

            return (
              <div key={weaponType.name} className="component-item">
                <div className="component-info">
                  <h4>{weaponType.name}, {weaponType.mass} tons, {weaponType.cost} MCr</h4>
                </div>
                <div className="quantity-control">
                  <label>
                    Quantity:
                    <input
                      type="number"
                      min="0"
                      value={quantity}
                      onChange={(e) => updateWeaponQuantity(weaponType, parseInt(e.target.value) || 0)}
                      style={{ width: '60px', marginLeft: '0.5rem' }}
                    />
                  </label>
                </div>
              </div>
            );
          })}
        </div>

        {/* Hard Point and Particle Beam Group */}
        <div className="weapon-group-row">
          {WEAPON_TYPES.filter(w => w.name === 'Hard Point' || w.name === 'Particle Beam Barbette').map(weaponType => {
            const currentWeapon = weapons.find(w => w.weapon_name === weaponType.name);
            const quantity = currentWeapon?.quantity || 0;

            return (
              <div key={weaponType.name} className="component-item">
                <div className="component-info">
                  <h4>{weaponType.name}, {weaponType.mass} tons, {weaponType.cost} MCr</h4>
                </div>
                <div className="quantity-control">
                  <label>
                    Quantity:
                    <input
                      type="number"
                      min="0"
                      value={quantity}
                      onChange={(e) => updateWeaponQuantity(weaponType, parseInt(e.target.value) || 0)}
                      style={{ width: '60px', marginLeft: '0.5rem' }}
                    />
                  </label>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bay-weapons-section">
        <h3>Bay Weapons</h3>
        {powerPlantPerformance < 1 ? (
          <p className="info-message">Bay weapons require a Power Plant with P-1 or higher performance.</p>
        ) : (
          <>
            <p>
              Available bay weapon slots: <strong>{maxBayWeapons}</strong> (Used: {usedBayWeapons}, Remaining: {maxBayWeapons - usedBayWeapons})
              <br />
              <small>
                Power/Tonnage limit: {maxBayWeaponsByPower} (P-{powerPlantPerformance} × {shipTonnage.toLocaleString()} tons ÷ 1,000)
                {availableMountSlots + usedBayWeapons < maxBayWeaponsByPower && (
                  <span> • Weapon mount limit: {availableMountSlots + usedBayWeapons} <strong>(limiting factor)</strong></span>
                )}
              </small>
              <br />
              <small>Each bay weapon: 50 tons, 1 weapon mount, 2 gunners</small>
            </p>

            <div className="weapons-grouped-layout">
              <div className="weapon-group-row">
                {getAvailableBayWeapons(shipTechLevel).map(bayWeaponType => {
                  const currentBayWeapon = bayWeapons.find(w => w.weapon_name === bayWeaponType.name);
                  const quantity = currentBayWeapon?.quantity || 0;

                  return (
                    <div key={bayWeaponType.name} className="component-item">
                      <div className="component-info">
                        <h4>{bayWeaponType.name}</h4>
                        <p>{bayWeaponType.mass} tons, {bayWeaponType.cost} MCr{bayWeaponType.minTechLevel ? `, TL-${bayWeaponType.minTechLevel}+` : ''}</p>
                        {quantity > 0 && (
                          <p><strong>Total:</strong> {(bayWeaponType.mass * quantity).toFixed(1)} tons, {(bayWeaponType.cost * quantity).toFixed(1)} MCr, {quantity * 2} gunners</p>
                        )}
                      </div>
                      <div className="quantity-control">
                        <label>
                          Quantity:
                          <input
                            type="number"
                            min="0"
                            max={maxBayWeapons}
                            value={quantity}
                            onChange={(e) => updateBayWeaponQuantity(bayWeaponType, parseInt(e.target.value) || 0)}
                            style={{ width: '60px', marginLeft: '0.5rem' }}
                          />
                        </label>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>

      <div className="spinal-weapon-section">
        <h3>Spinal Weapon</h3>
        {(() => {
          const powerPlant = engines.find(e => e.engine_type === 'power_plant');
          const powerPlantPerformance = powerPlant?.performance || 0;
          const availableSpinalWeapons = getAvailableSpinalWeapons(shipTechLevel, powerPlantPerformance);

          if (powerPlantPerformance < 2) {
            return <p className="info-message">Spinal weapons require a Power Plant with P-2 or higher performance.</p>;
          }

          if (availableSpinalWeapons.length === 0) {
            return <p className="info-message">No spinal weapons available at Tech Level {shipTechLevel} with P-{powerPlantPerformance} power plant.</p>;
          }

          return (
            <>
              <p>Select a spinal weapon for your ship. Only one spinal weapon can be installed.</p>
              <div className="form-group">
                <label htmlFor="spinal-weapon">Spinal Weapon Selection</label>
                <select
                  id="spinal-weapon"
                  value={spinalWeapon || ''}
                  onChange={(e) => onSpinalWeaponUpdate(e.target.value || undefined)}
                >
                  <option value="">None</option>
                  {availableSpinalWeapons.map(weapon => (
                    <option key={weapon.name} value={weapon.name}>
                      {weapon.name} - {weapon.mass.toLocaleString()}t, Damage {weapon.damage}, {weapon.cost.toLocaleString()} MCr{weapon.tlBonus ? ` (${weapon.tlBonus})` : ''}
                    </option>
                  ))}
                </select>
                {spinalWeapon && (() => {
                  const selectedWeapon = availableSpinalWeapons.find(w => w.name === spinalWeapon);
                  if (selectedWeapon) {
                    return (
                      <small>
                        Mass: {selectedWeapon.mass.toLocaleString()} tons,
                        Damage: {selectedWeapon.damage},
                        Cost: {selectedWeapon.cost.toLocaleString()} MCr
                        {selectedWeapon.tlBonus && <span> ({selectedWeapon.tlBonus} bonus applied)</span>}
                      </small>
                    );
                  }
                  return null;
                })()}
              </div>
            </>
          );
        })()}
      </div>

      {hasMissileLaunchers && (
        <div className="missile-reloads-section">
          <h3>Missile Reloads</h3>
          <p>Missile launchers detected. You can allocate tonnage for missile reloads.</p>
          <div className="form-group">
            <label htmlFor="missile-reloads">Missile Reload Tonnage</label>
            <input
              id="missile-reloads"
              type="number"
              min="0"
              max={maxMissileReloads + missileReloads}
              value={missileReloads}
              onChange={(e) => onMissileReloadsUpdate(Math.max(0, parseInt(e.target.value) || 0))}
            />
            <small>
              0 - {maxMissileReloads + missileReloads} tons available. 
              Cost: {missileReloads} MCr (1 MCr per ton)
            </small>
          </div>
          
          {missileReloads > 0 && (
            <div className="missile-summary">
              <p><strong>Missile Reloads:</strong> {missileReloads} tons ({missileReloads} MCr)</p>
              <p><small>Provides additional missile ammunition for extended operations</small></p>
            </div>
          )}
        </div>
      )}

    </div>
  );
};

export default WeaponsPanel;