// Defenses Screen - Configure ship defensive systems with mount limits
import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useShipDesign } from '../context/ShipDesignContext';
import { Defense } from '../types/ship';
import { DEFENSE_TYPES, getWeaponMountLimit } from '../data/constants';

const DefensesScreen: React.FC = () => {
  const { shipDesign, updateShipDesign, calculateMass } = useShipDesign();

  // Calculate available mounts
  const maxMountLimit = getWeaponMountLimit(shipDesign.ship.tonnage);
  const weaponsCount = shipDesign.weapons.reduce((sum, weapon) => sum + weapon.quantity, 0);
  const currentDefenseCount = shipDesign.defenses.reduce((sum, defense) => sum + defense.quantity, 0);
  const availableMounts = maxMountLimit - weaponsCount - currentDefenseCount;
  const massInfo = calculateMass();

  // Check if any sandcasters are installed for sand reload UI
  const hasSandcasters = shipDesign.defenses.some(defense => 
    defense.defense_type.includes('sandcaster')
  );

  const addDefense = (defenseType: Defense['defense_type']) => {
    if (availableMounts <= 0) return;

    const existingDefense = shipDesign.defenses.find(d => d.defense_type === defenseType);
    const defenseInfo = DEFENSE_TYPES.find(d => d.type === defenseType);
    
    if (!defenseInfo) return;

    if (existingDefense) {
      // Increment existing defense
      const updatedDefenses = shipDesign.defenses.map(defense =>
        defense.defense_type === defenseType
          ? { ...defense, quantity: defense.quantity + 1 }
          : defense
      );
      updateShipDesign({
        ...shipDesign,
        defenses: updatedDefenses
      });
    } else {
      // Add new defense
      const newDefense: Defense = {
        defense_type: defenseType,
        quantity: 1,
        mass: defenseInfo.mass,
        cost: defenseInfo.cost
      };
      updateShipDesign({
        ...shipDesign,
        defenses: [...shipDesign.defenses, newDefense]
      });
    }
  };

  const removeDefense = (defenseType: Defense['defense_type']) => {
    const existingDefense = shipDesign.defenses.find(d => d.defense_type === defenseType);
    if (!existingDefense) return;

    if (existingDefense.quantity > 1) {
      // Decrement quantity
      const updatedDefenses = shipDesign.defenses.map(defense =>
        defense.defense_type === defenseType
          ? { ...defense, quantity: defense.quantity - 1 }
          : defense
      );
      updateShipDesign({
        ...shipDesign,
        defenses: updatedDefenses
      });
    } else {
      // Remove defense entirely
      const updatedDefenses = shipDesign.defenses.filter(d => d.defense_type !== defenseType);
      updateShipDesign({
        ...shipDesign,
        defenses: updatedDefenses
      });
    }
  };

  const updateSandReloads = (change: number) => {
    const newValue = Math.max(0, Math.min(massInfo.remaining, shipDesign.ship.sand_reloads + change));
    updateShipDesign({
      ...shipDesign,
      ship: {
        ...shipDesign.ship,
        sand_reloads: newValue
      }
    });
  };

  const getDefenseQuantity = (defenseType: Defense['defense_type']): number => {
    const defense = shipDesign.defenses.find(d => d.defense_type === defenseType);
    return defense ? defense.quantity : 0;
  };

  const getTotalDefenseMass = (): number => {
    return shipDesign.defenses.reduce((total, defense) => {
      const defenseInfo = DEFENSE_TYPES.find(d => d.type === defense.defense_type);
      return total + (defenseInfo ? defenseInfo.mass * defense.quantity : 0);
    }, 0);
  };

  const getTotalDefenseCost = (): number => {
    return shipDesign.defenses.reduce((total, defense) => {
      const defenseInfo = DEFENSE_TYPES.find(d => d.type === defense.defense_type);
      return total + (defenseInfo ? defenseInfo.cost * defense.quantity : 0);
    }, 0);
  };

  const sandcasterTypes = DEFENSE_TYPES.filter(d => d.type.includes('sandcaster'));
  const pointDefenseTypes = DEFENSE_TYPES.filter(d => d.type.includes('point_defense'));

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Defenses</Text>
          <View style={styles.statusContainer}>
            <Text style={styles.statusText}>
              Mounts: {availableMounts} / {maxMountLimit}
            </Text>
            <Text style={styles.statusSubtext}>
              (Shared with weapons)
            </Text>
          </View>
        </View>

        {availableMounts <= 0 && currentDefenseCount === 0 && (
          <View style={styles.emptyState}>
            <MaterialIcons name="security" size={64} color="#bdc3c7" />
            <Text style={styles.emptyText}>No turret mounts available</Text>
            <Text style={styles.emptySubtext}>Reduce weapons or increase ship size</Text>
          </View>
        )}

        {/* Sandcaster Turrets Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sandcaster Turrets</Text>
          {sandcasterTypes.map(defenseType => {
            const quantity = getDefenseQuantity(defenseType.type as Defense['defense_type']);
            const canAdd = availableMounts > 0;
            
            return (
              <View key={defenseType.type} style={styles.defenseRow}>
                <View style={styles.defenseInfo}>
                  <Text style={styles.defenseName}>{defenseType.name}</Text>
                  <Text style={styles.defenseStats}>
                    {defenseType.mass} ton • {defenseType.cost} MCr
                  </Text>
                </View>
                
                <View style={styles.quantityControls}>
                  <TouchableOpacity 
                    style={[styles.quantityButton, quantity === 0 && styles.quantityButtonDisabled]}
                    onPress={() => removeDefense(defenseType.type as Defense['defense_type'])}
                    disabled={quantity === 0}
                  >
                    <MaterialIcons name="remove" size={16} color={quantity === 0 ? "#bdc3c7" : "#e74c3c"} />
                  </TouchableOpacity>
                  
                  <Text style={styles.quantityText}>{quantity}</Text>
                  
                  <TouchableOpacity 
                    style={[styles.quantityButton, !canAdd && styles.quantityButtonDisabled]}
                    onPress={() => addDefense(defenseType.type as Defense['defense_type'])}
                    disabled={!canAdd}
                  >
                    <MaterialIcons name="add" size={16} color={canAdd ? "#27ae60" : "#bdc3c7"} />
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </View>

        {/* Point Defense Turrets Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Point Defense Laser Turrets</Text>
          {pointDefenseTypes.map(defenseType => {
            const quantity = getDefenseQuantity(defenseType.type as Defense['defense_type']);
            const canAdd = availableMounts > 0;
            
            return (
              <View key={defenseType.type} style={styles.defenseRow}>
                <View style={styles.defenseInfo}>
                  <Text style={styles.defenseName}>{defenseType.name}</Text>
                  <Text style={styles.defenseStats}>
                    {defenseType.mass} ton • {defenseType.cost} MCr
                  </Text>
                </View>
                
                <View style={styles.quantityControls}>
                  <TouchableOpacity 
                    style={[styles.quantityButton, quantity === 0 && styles.quantityButtonDisabled]}
                    onPress={() => removeDefense(defenseType.type as Defense['defense_type'])}
                    disabled={quantity === 0}
                  >
                    <MaterialIcons name="remove" size={16} color={quantity === 0 ? "#bdc3c7" : "#e74c3c"} />
                  </TouchableOpacity>
                  
                  <Text style={styles.quantityText}>{quantity}</Text>
                  
                  <TouchableOpacity 
                    style={[styles.quantityButton, !canAdd && styles.quantityButtonDisabled]}
                    onPress={() => addDefense(defenseType.type as Defense['defense_type'])}
                    disabled={!canAdd}
                  >
                    <MaterialIcons name="add" size={16} color={canAdd ? "#27ae60" : "#bdc3c7"} />
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </View>

        {/* Sand Reloads Section - Only show if sandcasters are installed */}
        {hasSandcasters && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Sand Reloads</Text>
            <View style={styles.sandReloadRow}>
              <View style={styles.defenseInfo}>
                <Text style={styles.defenseName}>Sand Ammunition</Text>
                <Text style={styles.defenseStats}>
                  1 ton per reload • 0.1 MCr per ton
                </Text>
                <Text style={styles.defenseStats}>
                  Available space: {massInfo.remaining} tons
                </Text>
              </View>
              
              <View style={styles.quantityControls}>
                <TouchableOpacity 
                  style={[styles.quantityButton, shipDesign.ship.sand_reloads === 0 && styles.quantityButtonDisabled]}
                  onPress={() => updateSandReloads(-1)}
                  disabled={shipDesign.ship.sand_reloads === 0}
                >
                  <MaterialIcons name="remove" size={16} color={shipDesign.ship.sand_reloads === 0 ? "#bdc3c7" : "#e74c3c"} />
                </TouchableOpacity>
                
                <Text style={styles.quantityText}>{shipDesign.ship.sand_reloads}</Text>
                
                <TouchableOpacity 
                  style={[styles.quantityButton, massInfo.remaining === 0 && styles.quantityButtonDisabled]}
                  onPress={() => updateSandReloads(1)}
                  disabled={massInfo.remaining === 0}
                >
                  <MaterialIcons name="add" size={16} color={massInfo.remaining > 0 ? "#27ae60" : "#bdc3c7"} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* Totals Section */}
        {currentDefenseCount > 0 && (
          <View style={styles.totalsCard}>
            <Text style={styles.totalsTitle}>Total Defenses</Text>
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>Defense Systems:</Text>
              <Text style={styles.totalsValue}>{currentDefenseCount}</Text>
            </View>
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>Total Mass:</Text>
              <Text style={styles.totalsValue}>{getTotalDefenseMass().toFixed(1)} tons</Text>
            </View>
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>Total Cost:</Text>
              <Text style={styles.totalsValue}>{getTotalDefenseCost().toFixed(2)} MCr</Text>
            </View>
            {hasSandcasters && shipDesign.ship.sand_reloads > 0 && (
              <>
                <View style={styles.totalsRow}>
                  <Text style={styles.totalsLabel}>Sand Reloads:</Text>
                  <Text style={styles.totalsValue}>{shipDesign.ship.sand_reloads} tons</Text>
                </View>
                <View style={styles.totalsRow}>
                  <Text style={styles.totalsLabel}>Sand Cost:</Text>
                  <Text style={styles.totalsValue}>{(shipDesign.ship.sand_reloads * 0.1).toFixed(1)} MCr</Text>
                </View>
              </>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  statusContainer: {
    alignItems: 'flex-end',
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3498db',
  },
  statusSubtext: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#7f8c8d',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#95a5a6',
    marginTop: 8,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 12,
  },
  defenseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  sandReloadRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  defenseInfo: {
    flex: 1,
    marginRight: 12,
  },
  defenseName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 2,
  },
  defenseStats: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ecf0f1',
    borderRadius: 8,
    padding: 4,
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonDisabled: {
    backgroundColor: '#f8f9fa',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginHorizontal: 16,
    minWidth: 20,
    textAlign: 'center',
  },
  totalsCard: {
    backgroundColor: '#3498db',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  totalsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 12,
  },
  totalsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  totalsLabel: {
    fontSize: 16,
    color: '#ecf0f1',
  },
  totalsValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

export default DefensesScreen;