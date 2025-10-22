import React from 'react';
import type { Defense } from '../types/ship';
import { DEFENSE_TYPES, getWeaponMountLimit, getAvailableArmorOptions, calculateArmorMass, calculateArmorCost, getArmorFactorPerIncrement } from '../data/constants';

interface DefensesPanelProps {
  defenses: Defense[];
  shipTonnage: number;
  shipTechLevel: string;
  weaponsCount: number;
  sandReloads: number;
  armorPercentage: number;
  remainingMass: number;
  onUpdate: (defenses: Defense[]) => void;
  onSandReloadsUpdate: (reloads: number) => void;
  onArmorUpdate: (percentage: number) => void;
}

const DefensesPanel: React.FC<DefensesPanelProps> = ({
  defenses,
  shipTonnage,
  shipTechLevel,
  weaponsCount,
  sandReloads,
  armorPercentage,
  remainingMass,
  onUpdate,
  onSandReloadsUpdate,
  onArmorUpdate
}) => {
  const maxMountLimit = getWeaponMountLimit(shipTonnage);
  const currentTurretCount = defenses.reduce((sum, defense) => sum + defense.quantity, 0);
  const availableSlots = maxMountLimit - weaponsCount - currentTurretCount;

  // Check if any sandcaster turrets are installed
  const hasSandcasters = defenses.some(defense => 
    defense.defense_type.includes('sandcaster') && defense.quantity > 0
  );
  
  // Calculate maximum sand reloads based on remaining mass
  const maxSandReloads = Math.floor(remainingMass - sandReloads);

  const addDefense = (defenseType: typeof DEFENSE_TYPES[0]) => {
    if (availableSlots <= 0) return;
    
    const existingDefense = defenses.find(d => d.defense_type === defenseType.type);
    if (existingDefense) {
      const newDefenses = defenses.map(d =>
        d.defense_type === defenseType.type
          ? { ...d, quantity: d.quantity + 1 }
          : d
      );
      onUpdate(newDefenses);
    } else {
      const newDefense: Defense = {
        defense_type: defenseType.type as Defense['defense_type'],
        quantity: 1,
        mass: defenseType.mass,
        cost: defenseType.cost
      };
      onUpdate([...defenses, newDefense]);
    }
  };

  const removeDefense = (defenseType: string) => {
    const newDefenses = defenses.map(d =>
      d.defense_type === defenseType
        ? { ...d, quantity: Math.max(0, d.quantity - 1) }
        : d
    ).filter(d => d.quantity > 0);
    onUpdate(newDefenses);
  };

  return (
    <div className="panel-content">
      <p>Available defense turret mounts: {maxMountLimit} (Used: {weaponsCount + currentTurretCount}, Remaining: {availableSlots})</p>
      
      <div className="defenses-grouped-layout">
        {/* Sandcaster Turret Group */}
        <div className="defense-group-row">
          {DEFENSE_TYPES.filter(d => d.name.includes('Sandcaster')).map(defenseType => {
            const currentDefense = defenses.find(d => d.defense_type === defenseType.type);
            const quantity = currentDefense?.quantity || 0;
            const canAdd = availableSlots > 0;

            return (
              <div key={defenseType.type} className="component-item">
                <div className="component-info">
                  <h4>{defenseType.name}, {defenseType.mass} tons, {defenseType.cost} MCr</h4>
                </div>
                <div className="quantity-control">
                  <button 
                    onClick={() => removeDefense(defenseType.type)}
                    disabled={quantity === 0}
                  >
                    -
                  </button>
                  <span>{quantity}</span>
                  <button 
                    onClick={() => addDefense(defenseType)}
                    disabled={!canAdd}
                  >
                    +
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Point Defense Laser Turret Group */}
        <div className="defense-group-row">
          {DEFENSE_TYPES.filter(d => d.name.includes('Point Defense')).map(defenseType => {
            const currentDefense = defenses.find(d => d.defense_type === defenseType.type);
            const quantity = currentDefense?.quantity || 0;
            const canAdd = availableSlots > 0;

            return (
              <div key={defenseType.type} className="component-item">
                <div className="component-info">
                  <h4>{defenseType.name}, {defenseType.mass} tons, {defenseType.cost} MCr</h4>
                </div>
                <div className="quantity-control">
                  <button 
                    onClick={() => removeDefense(defenseType.type)}
                    disabled={quantity === 0}
                  >
                    -
                  </button>
                  <span>{quantity}</span>
                  <button 
                    onClick={() => addDefense(defenseType)}
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

      <div className="armor-section">
        <h3>Armor</h3>
        <p>
          Tech Level {shipTechLevel} armor provides AF-{getArmorFactorPerIncrement(shipTechLevel)} per 5% of ship tonnage.
          {getArmorFactorPerIncrement(shipTechLevel) === 4 ? ' (Crystaliron)' : ' (Advanced Armor)'}
        </p>
        <div className="form-group">
          <label htmlFor="armor-percentage">Armor Coverage</label>
          <select
            id="armor-percentage"
            value={armorPercentage || 0}
            onChange={(e) => onArmorUpdate(parseInt(e.target.value))}
          >
            <option value="0">No Armor (AF-0)</option>
            {getAvailableArmorOptions(shipTechLevel).map(option => (
              <option key={option.percentage} value={option.percentage}>
                {option.label}
              </option>
            ))}
          </select>
          {armorPercentage > 0 && (
            <small>
              Mass: {calculateArmorMass(shipTonnage, armorPercentage).toFixed(1)} tons,
              Cost: {calculateArmorCost(calculateArmorMass(shipTonnage, armorPercentage)).toFixed(2)} MCr
            </small>
          )}
        </div>
      </div>

      {hasSandcasters && (
        <div className="sand-reloads-section">
          <h3>Sand Reloads</h3>
          <p>Sandcaster turrets detected. You can allocate tonnage for sand reloads.</p>
          <div className="form-group">
            <label htmlFor="sand-reloads">Sand Reload Tonnage</label>
            <input
              id="sand-reloads"
              type="number"
              min="0"
              max={maxSandReloads + sandReloads}
              value={sandReloads}
              onChange={(e) => onSandReloadsUpdate(Math.max(0, parseInt(e.target.value) || 0))}
            />
            <small>
              0 - {maxSandReloads + sandReloads} tons available.
              Cost: {(sandReloads * 0.1).toFixed(1)} MCr (0.1 MCr per ton)
            </small>
          </div>

          {sandReloads > 0 && (
            <div className="sand-summary">
              <p><strong>Sand Reloads:</strong> {sandReloads} tons ({(sandReloads * 0.1).toFixed(1)} MCr)</p>
              <p><small>Provides additional sand ammunition for sandcaster turrets</small></p>
            </div>
          )}
        </div>
      )}

    </div>
  );
};

export default DefensesPanel;