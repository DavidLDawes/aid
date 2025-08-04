// Weapons Screen - Configure ship weapons and turrets
import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Alert 
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useShipDesign } from '../context/ShipDesignContext';
import { Weapon } from '../types/ship';
import { WEAPON_TYPES, getWeaponMountLimit } from '../data/constants';

const WeaponsScreen: React.FC = () => {
  const { shipDesign, updateShipDesign } = useShipDesign();

  // Calculate mount limits
  const maxMountLimit = getWeaponMountLimit(shipDesign.ship.tonnage);
  const weaponsCount = shipDesign.weapons.reduce((sum, weapon) => sum + weapon.quantity, 0);
  const defensesCount = shipDesign.defenses.reduce((sum, defense) => sum + defense.quantity, 0);
  const totalMountsUsed = weaponsCount + defensesCount;
  const availableMounts = maxMountLimit - totalMountsUsed;

  const addWeapon = (weaponType: string) => {
    if (availableMounts <= 0) {
      Alert.alert(
        'Mount Limit Reached',
        `Ship can only have ${maxMountLimit} total weapons and defenses. Currently using ${totalMountsUsed} mounts.`,
        [{ text: 'OK' }]
      );
      return;
    }

    const existingWeapon = shipDesign.weapons.find(w => w.weapon_type === weaponType);
    const weaponInfo = WEAPON_TYPES.find(w => w.name === weaponType);
    
    if (!weaponInfo) return;

    if (existingWeapon) {
      // Increment existing weapon
      const updatedWeapons = shipDesign.weapons.map(weapon =>
        weapon.weapon_type === weaponType
          ? { ...weapon, quantity: weapon.quantity + 1 }
          : weapon
      );
      updateShipDesign({
        ...shipDesign,
        weapons: updatedWeapons
      });
    } else {
      // Add new weapon
      const newWeapon: Weapon = {
        weapon_type: weaponType,
        quantity: 1,
        mass: weaponInfo.mass,
        cost: weaponInfo.cost
      };
      updateShipDesign({
        ...shipDesign,
        weapons: [...shipDesign.weapons, newWeapon]
      });
    }
  };


  const removeWeapon = (weaponType: string) => {
    const existingWeapon = shipDesign.weapons.find(w => w.weapon_type === weaponType);
    if (!existingWeapon) return;

    if (existingWeapon.quantity > 1) {
      // Decrement quantity
      const updatedWeapons = shipDesign.weapons.map(weapon =>
        weapon.weapon_type === weaponType
          ? { ...weapon, quantity: weapon.quantity - 1 }
          : weapon
      );
      updateShipDesign({
        ...shipDesign,
        weapons: updatedWeapons
      });
    } else {
      // Remove weapon entirely
      const updatedWeapons = shipDesign.weapons.filter(w => w.weapon_type !== weaponType);
      updateShipDesign({
        ...shipDesign,
        weapons: updatedWeapons
      });
    }
  };

  const getWeaponQuantity = (weaponType: string): number => {
    const weapon = shipDesign.weapons.find(w => w.weapon_type === weaponType);
    return weapon ? weapon.quantity : 0;
  };

  const calculateWeaponMass = (weapon: Weapon): number => {
    return weapon.mass * weapon.quantity;
  };

  const calculateWeaponCost = (weapon: Weapon): number => {
    return weapon.cost * weapon.quantity;
  };

  const getTotalMass = (): number => {
    return shipDesign.weapons.reduce((total, weapon) => total + calculateWeaponMass(weapon), 0);
  };

  const getTotalCost = (): number => {
    return shipDesign.weapons.reduce((total, weapon) => total + calculateWeaponCost(weapon), 0);
  };


  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Weapons</Text>
            <View style={styles.statusContainer}>
              <Text style={styles.statusText}>
                Mounts: {availableMounts} / {maxMountLimit}
              </Text>
              <Text style={styles.statusSubtext}>
                (Shared with defenses)
              </Text>
            </View>
          </View>
        </View>

        {availableMounts <= 0 && weaponsCount === 0 && (
          <View style={styles.emptyState}>
            <MaterialIcons name="gps-fixed" size={64} color="#bdc3c7" />
            <Text style={styles.emptyText}>No turret mounts available</Text>
            <Text style={styles.emptySubtext}>Reduce defenses or increase ship size</Text>
          </View>
        )}

        {/* Weapons Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Available Weapons</Text>
          {WEAPON_TYPES.map(weaponType => {
            const quantity = getWeaponQuantity(weaponType.name);
            const canAdd = availableMounts > 0;
            
            return (
              <View key={weaponType.name} style={styles.weaponRow}>
                <View style={styles.weaponInfo}>
                  <Text style={styles.weaponName}>{weaponType.name}</Text>
                  <Text style={styles.weaponStats}>
                    {weaponType.mass} ton • {weaponType.cost} MCr
                  </Text>
                </View>
                
                <View style={styles.quantityControls}>
                  <TouchableOpacity 
                    style={[styles.quantityButton, quantity === 0 && styles.quantityButtonDisabled]}
                    onPress={() => removeWeapon(weaponType.name)}
                    disabled={quantity === 0}
                  >
                    <MaterialIcons name="remove" size={16} color={quantity === 0 ? "#bdc3c7" : "#e74c3c"} />
                  </TouchableOpacity>
                  
                  <Text style={styles.quantityText}>{quantity}</Text>
                  
                  <TouchableOpacity 
                    style={[styles.quantityButton, !canAdd && styles.quantityButtonDisabled]}
                    onPress={() => addWeapon(weaponType.name)}
                    disabled={!canAdd}
                  >
                    <MaterialIcons name="add" size={16} color={canAdd ? "#27ae60" : "#bdc3c7"} />
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </View>

        {/* Totals Section */}
        {weaponsCount > 0 && (
          <View style={styles.totalsCard}>
            <Text style={styles.totalsTitle}>Total Weapons</Text>
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>Weapon Systems:</Text>
              <Text style={styles.totalsValue}>{weaponsCount}</Text>
            </View>
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>Total Mass:</Text>
              <Text style={styles.totalsValue}>{getTotalMass().toFixed(1)} tons</Text>
            </View>
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>Total Cost:</Text>
              <Text style={styles.totalsValue}>{getTotalCost().toFixed(2)} MCr</Text>
            </View>
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
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  statusContainer: {
    marginTop: 4,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#e74c3c',
  },
  statusSubtext: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e74c3c',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 8,
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
  weaponRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  weaponInfo: {
    flex: 1,
    marginRight: 12,
  },
  weaponName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 2,
  },
  weaponStats: {
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
    backgroundColor: '#e74c3c',
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

export default WeaponsScreen;