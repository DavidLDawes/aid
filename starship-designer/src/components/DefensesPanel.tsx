import React from 'react';
import type { Defense } from '../types/ship';
import { DEFENSE_TYPES, getWeaponMountLimit } from '../data/constants';

interface DefensesPanelProps {
  defenses: Defense[];
  shipTonnage: number;
  weaponsCount: number;
  onUpdate: (defenses: Defense[]) => void;
}

const DefensesPanel: React.FC<DefensesPanelProps> = ({ defenses, shipTonnage, weaponsCount, onUpdate }) => {
  const maxMountLimit = getWeaponMountLimit(shipTonnage);
  const currentTurretCount = defenses.reduce((sum, defense) => sum + defense.quantity, 0);
  const availableSlots = maxMountLimit - weaponsCount - currentTurretCount;

  const addDefense = (defenseType: typeof DEFENSE_TYPES[0]) => {
    if (availableSlots <= 0) return;
    
    const existingDefense = defenses.find(d => d.defense_type === defenseType.type);
    if (existingDefense) {
      const newDefenses = defenses.map(d =>
        d.defense_type === defenseType.type
          ? { ...d, quantity: d.quantity + 1, mass: defenseType.mass * (d.quantity + 1), cost: defenseType.cost * (d.quantity + 1) }
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
    const newDefenses = defenses.map(d => {
      if (d.defense_type === defenseType) {
        if (d.quantity <= 1) {
          return null;
        }
        return { ...d, quantity: d.quantity - 1, mass: d.mass - DEFENSE_TYPES.find(dt => dt.type === defenseType)!.mass, cost: d.cost - DEFENSE_TYPES.find(dt => dt.type === defenseType)!.cost };
      }
      return d;
    }).filter(Boolean) as Defense[];
    onUpdate(newDefenses);
  };

  return (
    <div className="panel-content">
      <p>Defense turrets for your starship. These use the same mount points as weapons.</p>
      
      <div className="mount-info">
        <p><strong>Mount Usage:</strong> {weaponsCount + currentTurretCount} / {maxMountLimit} slots used</p>
        <p><strong>Available Slots:</strong> {availableSlots}</p>
        {availableSlots <= 0 && <p className="warning">⚠️ No available mount slots for additional turrets</p>}
      </div>

      <div className="defense-selection">
        <h3>Available Defense Turrets</h3>
        {DEFENSE_TYPES.map(defenseType => {
          const currentDefense = defenses.find(d => d.defense_type === defenseType.type);
          const quantity = currentDefense?.quantity || 0;
          
          return (
            <div key={defenseType.type} className="defense-item">
              <div className="defense-info">
                <strong>{defenseType.name}</strong>
                <small>{defenseType.mass}t, {defenseType.cost}MCr each</small>
              </div>
              <div className="defense-controls">
                <button 
                  onClick={() => removeDefense(defenseType.type)}
                  disabled={quantity === 0}
                  className="remove-btn"
                >
                  -
                </button>
                <span className="quantity">{quantity}</span>
                <button 
                  onClick={() => addDefense(defenseType)}
                  disabled={availableSlots <= 0}
                  className="add-btn"
                >
                  +
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="defense-summary">
        <h3>Defense Summary</h3>
        {defenses.length === 0 ? (
          <p>No defense turrets installed.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Defense Type</th>
                <th>Quantity</th>
                <th>Mass (t)</th>
                <th>Cost (MCr)</th>
              </tr>
            </thead>
            <tbody>
              {defenses.map(defense => (
                <tr key={defense.defense_type}>
                  <td>{DEFENSE_TYPES.find(dt => dt.type === defense.defense_type)?.name || defense.defense_type}</td>
                  <td>{defense.quantity}</td>
                  <td>{defense.mass.toFixed(1)}</td>
                  <td>{defense.cost.toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default DefensesPanel;