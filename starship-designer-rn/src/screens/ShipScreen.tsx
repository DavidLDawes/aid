// Ship Screen - Basic ship information input
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useShipDesign } from '../context/ShipDesignContext';
import { storageService } from '../services/storage';
import { TECH_LEVELS, HULL_SIZES } from '../data/constants';

const ShipScreen: React.FC = () => {
  const { shipDesign, updateShipDesign } = useShipDesign();
  const [saving, setSaving] = useState(false);
  const [nameConflict, setNameConflict] = useState(false);

  const handleNameChange = async (name: string) => {
    updateShipDesign({ 
      ship: { ...shipDesign.ship, name } 
    });

    // Check for name conflicts
    if (name.trim() && name.length >= 2) {
      try {
        const exists = await storageService.checkShipNameExists(name);
        setNameConflict(exists);
      } catch (error) {
        console.error('Error checking ship name:', error);
      }
    } else {
      setNameConflict(false);
    }
  };

  const handleSave = async () => {
    if (!shipDesign.ship.name.trim()) {
      Alert.alert('Error', 'Please enter a ship name');
      return;
    }

    try {
      setSaving(true);
      await storageService.saveShip(shipDesign);
      Alert.alert('Success', 'Ship saved successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to save ship');
      console.error('Save error:', error);
    } finally {
      setSaving(false);
    }
  };

  const selectedHull = HULL_SIZES.find(h => h.tonnage === shipDesign.ship.tonnage);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        <Text style={styles.title}>Ship Information</Text>
        
        <View style={styles.section}>
          <Text style={styles.label}>Ship Name *</Text>
          <TextInput
            style={[
              styles.input,
              nameConflict && styles.conflictInput
            ]}
            value={shipDesign.ship.name}
            onChangeText={handleNameChange}
            placeholder="Enter ship name"
            placeholderTextColor="#95a5a6"
          />
          {nameConflict && (
            <Text style={styles.conflictText}>
              ⚠️ A ship with this name already exists
            </Text>
          )}
        </View>

        <View style={styles.row}>
          <View style={styles.halfWidth}>
            <Text style={styles.label}>Tech Level</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={shipDesign.ship.tech_level}
                style={styles.picker}
                onValueChange={(value) => 
                  updateShipDesign({ 
                    ship: { ...shipDesign.ship, tech_level: value } 
                  })
                }
              >
                {TECH_LEVELS.map(level => (
                  <Picker.Item key={level} label={level} value={level} />
                ))}
              </Picker>
            </View>
          </View>

          <View style={styles.halfWidth}>
            <Text style={styles.label}>Hull Size</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={shipDesign.ship.tonnage}
                style={styles.picker}
                onValueChange={(value) => 
                  updateShipDesign({ 
                    ship: { ...shipDesign.ship, tonnage: value } 
                  })
                }
              >
                {HULL_SIZES.map(hull => (
                  <Picker.Item 
                    key={hull.tonnage} 
                    label={`${hull.tonnage} tons (${hull.code})`} 
                    value={hull.tonnage} 
                  />
                ))}
              </Picker>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Configuration</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={shipDesign.ship.configuration}
              style={styles.picker}
              onValueChange={(value) => 
                updateShipDesign({ 
                  ship: { ...shipDesign.ship, configuration: value } 
                })
              }
            >
              <Picker.Item label="Standard" value="standard" />
              <Picker.Item label="Streamlined" value="streamlined" />
              <Picker.Item label="Distributed" value="distributed" />
              <Picker.Item label="Planetoid" value="planetoid" />
              <Picker.Item label="Buffered Planetoid" value="buffered_planetoid" />
              <Picker.Item label="Sphere" value="sphere" />
              <Picker.Item label="Close Structure" value="close_structure" />
            </Picker>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Fuel Duration (Weeks)</Text>
          <TextInput
            style={styles.input}
            value={shipDesign.ship.fuel_weeks.toString()}
            onChangeText={(text) => {
              const weeks = parseInt(text) || 2;
              updateShipDesign({ 
                ship: { ...shipDesign.ship, fuel_weeks: weeks } 
              });
            }}
            keyboardType="numeric"
            placeholder="2"
            placeholderTextColor="#95a5a6"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Description (Optional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={shipDesign.ship.description || ''}
            onChangeText={(text) => 
              updateShipDesign({ 
                ship: { ...shipDesign.ship, description: text } 
              })
            }
            placeholder="Enter ship description"
            placeholderTextColor="#95a5a6"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {selectedHull && (
          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>Hull Information</Text>
            <Text style={styles.infoText}>
              Tonnage: {selectedHull.tonnage} tons
            </Text>
            <Text style={styles.infoText}>
              Hull Code: {selectedHull.code}
            </Text>
            <Text style={styles.infoText}>
              Base Cost: {selectedHull.cost} MCr
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.saveButton, saving && styles.disabledButton]}
          onPress={handleSave}
          disabled={saving || !shipDesign.ship.name.trim()}
        >
          {saving ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.saveButtonText}>Save Ship</Text>
          )}
        </TouchableOpacity>

        <View style={styles.attribution}>
          <Text style={styles.attributionText}>
            Based on the Traveller SRD Spacecraft Design page
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 30,
  },
  section: {
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 20,
  },
  halfWidth: {
    flex: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#bdc3c7',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#2c3e50',
  },
  conflictInput: {
    borderColor: '#f39c12',
    backgroundColor: '#fff3cd',
  },
  conflictText: {
    color: '#856404',
    fontSize: 12,
    marginTop: 5,
    fontWeight: '600',
  },
  textArea: {
    minHeight: 100,
  },
  pickerContainer: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#bdc3c7',
    borderRadius: 8,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    color: '#2c3e50',
  },
  infoBox: {
    backgroundColor: '#e8f4fd',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3498db',
    marginBottom: 20,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: '#2c3e50',
    marginBottom: 5,
  },
  saveButton: {
    backgroundColor: '#3498db',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  disabledButton: {
    backgroundColor: '#bdc3c7',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  attribution: {
    alignItems: 'center',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  attributionText: {
    fontSize: 12,
    color: '#7f8c8d',
    textAlign: 'center',
  },
});

export default ShipScreen;