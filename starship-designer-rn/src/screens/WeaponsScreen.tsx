// Weapons Screen - Configure ship weapons and turrets
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Alert,
  Modal,
  TextInput
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { MaterialIcons } from '@expo/vector-icons';
import { useShipDesign } from '../context/ShipDesignContext';
import { Weapon } from '../types/ship';
import { WEAPON_TYPES, getWeaponMountLimit } from '../data/constants';

const WeaponsScreen: React.FC = () => {
  const { shipDesign, updateShipDesign } = useShipDesign();
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedWeaponType, setSelectedWeaponType] = useState(WEAPON_TYPES[0].name);
  const [weaponQuantity, setWeaponQuantity] = useState('1');

  // Calculate mount limits
  const maxMountLimit = getWeaponMountLimit(shipDesign.ship.tonnage);
  const weaponsCount = shipDesign.weapons.reduce((sum, weapon) => sum + weapon.quantity, 0);
  const defensesCount = shipDesign.defenses.reduce((sum, defense) => sum + defense.quantity, 0);
  const totalMountsUsed = weaponsCount + defensesCount;
  const availableMounts = maxMountLimit - totalMountsUsed;

  const showAddWeaponModal = () => {
    if (availableMounts <= 0) {
      Alert.alert(
        'Mount Limit Reached',
        `Ship can only have ${maxMountLimit} total weapons and defenses. Currently using ${totalMountsUsed} mounts.`,
        [{ text: 'OK' }]
      );
      return;
    }
    setShowAddModal(true);
  };

  const addWeapon = () => {
    const quantity = parseInt(weaponQuantity);
    if (isNaN(quantity) || quantity <= 0) {
      Alert.alert('Invalid Quantity', 'Please enter a valid number greater than 0.');
      return;
    }

    if (quantity > availableMounts) {
      Alert.alert(
        'Insufficient Mounts',
        `Cannot add ${quantity} weapons. Only ${availableMounts} mount(s) available.`,
        [{ text: 'OK' }]
      );
      return;
    }

    const existingWeapon = shipDesign.weapons.find(w => w.weapon_type === selectedWeaponType);
    const weaponInfo = WEAPON_TYPES.find(w => w.name === selectedWeaponType);
    
    if (!weaponInfo) return;

    if (existingWeapon) {
      // Update existing weapon quantity
      const updatedWeapons = shipDesign.weapons.map(weapon =>
        weapon.weapon_type === selectedWeaponType
          ? { ...weapon, quantity: weapon.quantity + quantity }
          : weapon
      );
      updateShipDesign({
        ...shipDesign,
        weapons: updatedWeapons
      });
    } else {
      // Add new weapon
      const newWeapon: Weapon = {
        weapon_type: selectedWeaponType,
        quantity: quantity,
        mass: weaponInfo.mass,
        cost: weaponInfo.cost
      };
      updateShipDesign({
        ...shipDesign,
        weapons: [...shipDesign.weapons, newWeapon]
      });
    }

    setShowAddModal(false);
    setWeaponQuantity('1');
  };


  const removeWeapon = (weaponType: string) => {
    Alert.alert(
      'Remove Weapon',
      `Remove all ${weaponType}s from the ship?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            const updatedWeapons = shipDesign.weapons.filter(w => w.weapon_type !== weaponType);
            updateShipDesign({
              ...shipDesign,
              weapons: updatedWeapons
            });
          }
        }
      ]
    );
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
          <TouchableOpacity 
            style={[styles.addButton, availableMounts <= 0 && styles.addButtonDisabled]}
            onPress={showAddWeaponModal}
            disabled={availableMounts <= 0}
          >
            <MaterialIcons name="add" size={24} color="#fff" />
            <Text style={styles.addButtonText}>Add Weapons</Text>
          </TouchableOpacity>
        </View>

        {availableMounts <= 0 && weaponsCount === 0 && (
          <View style={styles.emptyState}>
            <MaterialIcons name="gps-fixed" size={64} color="#bdc3c7" />
            <Text style={styles.emptyText}>No turret mounts available</Text>
            <Text style={styles.emptySubtext}>Reduce defenses or increase ship size</Text>
          </View>
        )}

        {/* Current Weapons Section */}
        {shipDesign.weapons.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Installed Weapons</Text>
            {shipDesign.weapons.map((weapon, index) => (
              <View key={index} style={styles.weaponRow}>
                <View style={styles.weaponInfo}>
                  <Text style={styles.weaponName}>{weapon.weapon_type}</Text>
                  <Text style={styles.weaponStats}>
                    Qty: {weapon.quantity} • {weapon.mass * weapon.quantity} tons • {weapon.cost * weapon.quantity} MCr
                  </Text>
                </View>
                <TouchableOpacity 
                  style={styles.removeButton}
                  onPress={() => removeWeapon(weapon.weapon_type)}
                >
                  <MaterialIcons name="delete" size={24} color="#e74c3c" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

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

      {/* Add Weapon Modal */}
      <Modal
        visible={showAddModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Weapons</Text>
            
            <Text style={styles.modalLabel}>Weapon Type:</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={selectedWeaponType}
                onValueChange={setSelectedWeaponType}
                style={styles.picker}
              >
                {WEAPON_TYPES.map(weaponType => (
                  <Picker.Item 
                    key={weaponType.name}
                    label={`${weaponType.name} (${weaponType.mass} ton, ${weaponType.cost} MCr)`}
                    value={weaponType.name}
                  />
                ))}
              </Picker>
            </View>

            <Text style={styles.modalLabel}>Quantity:</Text>
            <TextInput
              style={styles.quantityInput}
              value={weaponQuantity}
              onChangeText={setWeaponQuantity}
              keyboardType="numeric"
              placeholder="Enter quantity"
              maxLength={3}
            />

            <Text style={styles.availableText}>
              Available mounts: {availableMounts}
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowAddModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.confirmButton]}
                onPress={addWeapon}
              >
                <Text style={styles.confirmButtonText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  removeButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e74c3c',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
    marginTop: 12,
  },
  pickerContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  picker: {
    height: 50,
  },
  quantityInput: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#2c3e50',
  },
  availableText: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 8,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  cancelButtonText: {
    color: '#6c757d',
    fontWeight: '600',
  },
  confirmButton: {
    backgroundColor: '#e74c3c',
  },
  confirmButtonText: {
    color: '#fff',
    fontWeight: '600',
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