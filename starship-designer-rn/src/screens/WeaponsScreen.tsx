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
import { Picker } from '@react-native-picker/picker';
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

  const addWeapon = () => {
    if (availableMounts <= 0) {
      Alert.alert(
        'Mount Limit Reached',
        `Ship can only have ${maxMountLimit} total weapons and defenses. Currently using ${totalMountsUsed} mounts.`,
        [{ text: 'OK' }]
      );
      return;
    }
    const weaponInfo = WEAPON_TYPES.find(w => w.name === 'Hard Point');
    const newWeapon: Weapon = {
      weapon_type: 'Hard Point',
      quantity: 1,
      mass: weaponInfo?.mass || 0,
      cost: weaponInfo?.cost || 0
    };

    updateShipDesign({
      ...shipDesign,
      weapons: [...shipDesign.weapons, newWeapon]
    });
  };

  const updateWeapon = (index: number, updatedWeapon: Weapon) => {
    const updatedWeapons = [...shipDesign.weapons];
    updatedWeapons[index] = updatedWeapon;
    
    updateShipDesign({
      ...shipDesign,
      weapons: updatedWeapons
    });
  };

  const removeWeapon = (index: number) => {
    Alert.alert(
      'Remove Weapon',
      'Are you sure you want to remove this weapon?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            const updatedWeapons = shipDesign.weapons.filter((_, i) => i !== index);
            updateShipDesign({
              ...shipDesign,
              weapons: updatedWeapons
            });
          }
        }
      ]
    );
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

  const getWeaponTypeInfo = (weaponName: string) => {
    return WEAPON_TYPES.find(w => w.name === weaponName);
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
          <TouchableOpacity 
            style={[styles.addButton, availableMounts <= 0 && styles.addButtonDisabled]} 
            onPress={addWeapon}
            disabled={availableMounts <= 0}
          >
            <MaterialIcons name="add" size={24} color="#fff" />
            <Text style={styles.addButtonText}>Add Weapon</Text>
          </TouchableOpacity>
        </View>

        {shipDesign.weapons.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialIcons name="gps-fixed" size={64} color="#bdc3c7" />
            <Text style={styles.emptyText}>No weapons configured</Text>
            <Text style={styles.emptySubtext}>Tap "Add Weapon" to get started</Text>
          </View>
        ) : (
          <>
            {shipDesign.weapons.map((weapon, index) => {
              const weaponInfo = getWeaponTypeInfo(weapon.weapon_type);
              return (
                <View key={index} style={styles.weaponCard}>
                  <View style={styles.weaponHeader}>
                    <Text style={styles.weaponTitle}>Weapon {index + 1}</Text>
                    <TouchableOpacity 
                      style={styles.removeButton}
                      onPress={() => removeWeapon(index)}
                    >
                      <MaterialIcons name="delete" size={20} color="#e74c3c" />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.formRow}>
                    <Text style={styles.label}>Type:</Text>
                    <View style={styles.pickerContainer}>
                      <Picker
                        selectedValue={weapon.weapon_type}
                        style={styles.picker}
                        onValueChange={(value) => {
                          const weaponInfo = WEAPON_TYPES.find(w => w.name === value);
                          updateWeapon(index, { 
                            ...weapon, 
                            weapon_type: value,
                            mass: weaponInfo?.mass || 0,
                            cost: weaponInfo?.cost || 0
                          });
                        }}
                      >
                        {WEAPON_TYPES.map(weaponType => (
                          <Picker.Item 
                            key={weaponType.name} 
                            label={weaponType.name} 
                            value={weaponType.name} 
                          />
                        ))}
                      </Picker>
                    </View>
                  </View>

                  <View style={styles.formRow}>
                    <Text style={styles.label}>Quantity:</Text>
                    <View style={styles.pickerContainer}>
                      <Picker
                        selectedValue={weapon.quantity}
                        style={styles.picker}
                        onValueChange={(value) => {
                          const quantityIncrease = value - weapon.quantity;
                          if (quantityIncrease > availableMounts) {
                            Alert.alert(
                              'Mount Limit Exceeded',
                              `Cannot add ${quantityIncrease} more weapons. Only ${availableMounts} mounts available.`,
                              [{ text: 'OK' }]
                            );
                            return;
                          }
                          updateWeapon(index, { ...weapon, quantity: value });
                        }}
                      >
                        {[1, 2, 3, 4, 5, 6, 8, 10].filter(qty => {
                          const quantityIncrease = qty - weapon.quantity;
                          return quantityIncrease <= availableMounts;
                        }).map(qty => (
                          <Picker.Item key={qty} label={`${qty}`} value={qty} />
                        ))}
                      </Picker>
                    </View>
                  </View>

                  {weaponInfo && (
                    <View style={styles.weaponInfo}>
                      <Text style={styles.infoLabel}>Weapon Details:</Text>
                      <Text style={styles.infoText}>
                        Unit Mass: {weaponInfo.mass} tons, Unit Cost: {weaponInfo.cost} MCr
                      </Text>
                    </View>
                  )}

                  <View style={styles.statsContainer}>
                    <View style={styles.statItem}>
                      <Text style={styles.statLabel}>Total Mass:</Text>
                      <Text style={styles.statValue}>{calculateWeaponMass(weapon).toFixed(1)} tons</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={styles.statLabel}>Total Cost:</Text>
                      <Text style={styles.statValue}>{calculateWeaponCost(weapon).toFixed(2)} MCr</Text>
                    </View>
                  </View>
                </View>
              );
            })}

            <View style={styles.totalsCard}>
              <Text style={styles.totalsTitle}>Total Weapons</Text>
              <View style={styles.totalsRow}>
                <Text style={styles.totalsLabel}>Total Mass:</Text>
                <Text style={styles.totalsValue}>{getTotalMass().toFixed(1)} tons</Text>
              </View>
              <View style={styles.totalsRow}>
                <Text style={styles.totalsLabel}>Total Cost:</Text>
                <Text style={styles.totalsValue}>{getTotalCost().toFixed(2)} MCr</Text>
              </View>
            </View>
          </>
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
  addButtonDisabled: {
    backgroundColor: '#bdc3c7',
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
  weaponCard: {
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
  weaponHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  weaponTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
  },
  removeButton: {
    padding: 8,
  },
  formRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#34495e',
    width: 80,
  },
  pickerContainer: {
    flex: 1,
    backgroundColor: '#ecf0f1',
    borderRadius: 8,
    marginLeft: 12,
  },
  picker: {
    height: 50,
  },
  weaponInfo: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#34495e',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 13,
    color: '#7f8c8d',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#ecf0f1',
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
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