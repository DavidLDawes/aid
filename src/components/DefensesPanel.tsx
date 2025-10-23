import React from 'react';
import type { Defense } from '../types/ship';
import { DEFENSE_TYPES, getWeaponMountLimit, getAvailableArmorOptions, calculateArmorMass, calculateArmorCost, getArmorFactorPerIncrement, getMaxScreens, getScreenSpecs } from '../data/constants';

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

  const updateDefenseQuantity = (defenseType: typeof DEFENSE_TYPES[0], quantity: number) => {
    const validQuantity = Math.max(0, Math.floor(quantity));
    const existingDefense = defenses.find(d => d.defense_type === defenseType.type);

    if (validQuantity === 0) {
      // Remove the defense if quantity is 0
      onUpdate(defenses.filter(d => d.defense_type !== defenseType.type));
    } else if (existingDefense) {
      // Update existing defense
      const newDefenses = defenses.map(d =>
        d.defense_type === defenseType.type
          ? { ...d, quantity: validQuantity }
          : d
      );
      onUpdate(newDefenses);
    } else {
      // Add new defense
      const newDefense: Defense = {
        defense_type: defenseType.type as Defense['defense_type'],
        quantity: validQuantity,
        mass: defenseType.mass,
        cost: defenseType.cost
      };
      onUpdate([...defenses, newDefense]);
    }
  };

  const updateScreenQuantity = (screenType: 'nuclear_damper' | 'meson_screen' | 'black_globe', quantity: number) => {
    const specs = getScreenSpecs(screenType, shipTonnage);
    if (!specs) return;

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
                  <input
                    type="number"
                    min="0"
                    value={quantity}
                    onChange={(e) => updateDefenseQuantity(defenseType, parseInt(e.target.value) || 0)}
                    style={{ width: '60px', textAlign: 'center' }}
                  />
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
                  <input
                    type="number"
                    min="0"
                    value={quantity}
                    onChange={(e) => updateDefenseQuantity(defenseType, parseInt(e.target.value) || 0)}
                    style={{ width: '60px', textAlign: 'center' }}
                  />
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

      <div className="screens-section">
        <h3>Defensive Screens</h3>
        <p>Advanced defensive systems for capital ships. Availability depends on tech level and hull size.</p>

        {/* Nuclear Dampers */}
        {(() => {
          const maxNuclearDampers = getMaxScreens('nuclear_damper', shipTechLevel);
          const nuclearDamperSpecs = getScreenSpecs('nuclear_damper', shipTonnage);
          const currentNuclearDampers = defenses.find(d => d.defense_type === 'nuclear_damper')?.quantity || 0;

          if (maxNuclearDampers === 0 || !nuclearDamperSpecs) {
            return (
              <div className="screen-item">
                <h4>Nuclear Dampers</h4>
                <p className="info-message">Not available (requires TL 12+ and hull code CA+)</p>
              </div>
            );
          }

          return (
            <div className="screen-item">
              <h4>Nuclear Dampers</h4>
              <p>Max allowed: {maxNuclearDampers} | Per screen: {nuclearDamperSpecs.mass} tons, {nuclearDamperSpecs.cost} MCr</p>
              <div className="form-group">
                <label htmlFor="nuclear-dampers">Number of Nuclear Dampers</label>
                <input
                  id="nuclear-dampers"
                  type="number"
                  min="0"
                  max={maxNuclearDampers}
                  value={currentNuclearDampers}
                  onChange={(e) => updateScreenQuantity('nuclear_damper', Math.min(maxNuclearDampers, Math.max(0, parseInt(e.target.value) || 0)))}
                />
                {currentNuclearDampers > 0 && (
                  <small>
                    Total: {nuclearDamperSpecs.mass * currentNuclearDampers} tons, {nuclearDamperSpecs.cost * currentNuclearDampers} MCr
                  </small>
                )}
              </div>
            </div>
          );
        })()}

        {/* Meson Screens */}
        {(() => {
          const maxMesonScreens = getMaxScreens('meson_screen', shipTechLevel);
          const mesonScreenSpecs = getScreenSpecs('meson_screen', shipTonnage);
          const currentMesonScreens = defenses.find(d => d.defense_type === 'meson_screen')?.quantity || 0;

          if (maxMesonScreens === 0 || !mesonScreenSpecs) {
            return (
              <div className="screen-item">
                <h4>Meson Screens</h4>
                <p className="info-message">Not available (requires TL 12+ and hull code CA+)</p>
              </div>
            );
          }

          return (
            <div className="screen-item">
              <h4>Meson Screens</h4>
              <p>Max allowed: {maxMesonScreens} | Per screen: {mesonScreenSpecs.mass} tons, {mesonScreenSpecs.cost} MCr</p>
              <div className="form-group">
                <label htmlFor="meson-screens">Number of Meson Screens</label>
                <input
                  id="meson-screens"
                  type="number"
                  min="0"
                  max={maxMesonScreens}
                  value={currentMesonScreens}
                  onChange={(e) => updateScreenQuantity('meson_screen', Math.min(maxMesonScreens, Math.max(0, parseInt(e.target.value) || 0)))}
                />
                {currentMesonScreens > 0 && (
                  <small>
                    Total: {mesonScreenSpecs.mass * currentMesonScreens} tons, {mesonScreenSpecs.cost * currentMesonScreens} MCr
                  </small>
                )}
              </div>
            </div>
          );
        })()}

        {/* Black Globes */}
        {(() => {
          const maxBlackGlobes = getMaxScreens('black_globe', shipTechLevel);
          const blackGlobeSpecs = getScreenSpecs('black_globe', shipTonnage);
          const currentBlackGlobes = defenses.find(d => d.defense_type === 'black_globe')?.quantity || 0;

          if (maxBlackGlobes === 0 || !blackGlobeSpecs) {
            return (
              <div className="screen-item">
                <h4>Black Globes (Force Fields)</h4>
                <p className="info-message">Not available (requires TL 15+ and hull code CA+)</p>
              </div>
            );
          }

          return (
            <div className="screen-item">
              <h4>Black Globes (Force Fields)</h4>
              <p>Max allowed: {maxBlackGlobes} | Per field: {blackGlobeSpecs.mass} tons, {blackGlobeSpecs.cost} MCr</p>
              <div className="form-group">
                <label htmlFor="black-globes">Number of Black Globes</label>
                <input
                  id="black-globes"
                  type="number"
                  min="0"
                  max={maxBlackGlobes}
                  value={currentBlackGlobes}
                  onChange={(e) => updateScreenQuantity('black_globe', Math.min(maxBlackGlobes, Math.max(0, parseInt(e.target.value) || 0)))}
                />
                {currentBlackGlobes > 0 && (
                  <small>
                    Total: {blackGlobeSpecs.mass * currentBlackGlobes} tons, {blackGlobeSpecs.cost * currentBlackGlobes} MCr
                  </small>
                )}
              </div>
            </div>
          );
        })()}
      </div>

    </div>
  );
};

export default DefensesPanel;