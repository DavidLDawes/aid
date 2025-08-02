// Engines Screen - Engine configuration for starship design
import React, { useContext } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Alert 
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { ShipDesignContext } from '../context/ShipDesignContext';
import { Engine } from '../types/ship';

const EnginesScreen: React.FC = () => {
  const { shipDesign, updateShipDesign } = useContext(ShipDesignContext)!;

  const addEngine = () => {
    const newEngine: Engine = {
      engine_type: 'maneuver',
      performance: 1,
      quantity: 1
    };

    updateShipDesign({
      ...shipDesign,
      engines: [...shipDesign.engines, newEngine]
    });
  };

  const updateEngine = (index: number, updatedEngine: Engine) => {
    const updatedEngines = [...shipDesign.engines];
    updatedEngines[index] = updatedEngine;
    
    updateShipDesign({
      ...shipDesign,
      engines: updatedEngines
    });
  };

  const removeEngine = (index: number) => {
    Alert.alert(
      'Remove Engine',
      'Are you sure you want to remove this engine?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            const updatedEngines = shipDesign.engines.filter((_, i) => i !== index);
            updateShipDesign({
              ...shipDesign,
              engines: updatedEngines
            });
          }
        }
      ]
    );
  };

  const calculateEngineMass = (engine: Engine): number => {
    const shipTonnage = shipDesign.ship.tonnage;
    if (engine.engine_type === 'jump') {
      return (shipTonnage * engine.performance * 0.02) * engine.quantity;
    } else if (engine.engine_type === 'maneuver') {
      return (shipTonnage * engine.performance * 0.02) * engine.quantity;
    }
    return 0;
  };

  const calculateEngineCost = (engine: Engine): number => {
    const shipTonnage = shipDesign.ship.tonnage;
    if (engine.engine_type === 'jump') {
      return (shipTonnage * engine.performance * 0.02) * engine.quantity;
    } else if (engine.engine_type === 'maneuver') {
      return (shipTonnage * engine.performance * 0.01) * engine.quantity;
    }
    return 0;
  };

  const getTotalMass = (): number => {
    return shipDesign.engines.reduce((total, engine) => total + calculateEngineMass(engine), 0);
  };

  const getTotalCost = (): number => {
    return shipDesign.engines.reduce((total, engine) => total + calculateEngineCost(engine), 0);
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Engines</Text>
          <TouchableOpacity style={styles.addButton} onPress={addEngine}>
            <Icon name="add" size={24} color="#fff" />
            <Text style={styles.addButtonText}>Add Engine</Text>
          </TouchableOpacity>
        </View>

        {shipDesign.engines.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="settings" size={64} color="#bdc3c7" />
            <Text style={styles.emptyText}>No engines configured</Text>
            <Text style={styles.emptySubtext}>Tap "Add Engine" to get started</Text>
          </View>
        ) : (
          <>
            {shipDesign.engines.map((engine, index) => (
              <View key={index} style={styles.engineCard}>
                <View style={styles.engineHeader}>
                  <Text style={styles.engineTitle}>Engine {index + 1}</Text>
                  <TouchableOpacity 
                    style={styles.removeButton}
                    onPress={() => removeEngine(index)}
                  >
                    <Icon name="delete" size={20} color="#e74c3c" />
                  </TouchableOpacity>
                </View>

                <View style={styles.formRow}>
                  <Text style={styles.label}>Type:</Text>
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={engine.engine_type}
                      style={styles.picker}
                      onValueChange={(value) => 
                        updateEngine(index, { ...engine, engine_type: value as 'jump' | 'maneuver' })
                      }
                    >
                      <Picker.Item label="Maneuver Drive" value="maneuver" />
                      <Picker.Item label="Jump Drive" value="jump" />
                    </Picker>
                  </View>
                </View>

                <View style={styles.formRow}>
                  <Text style={styles.label}>Performance:</Text>
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={engine.performance}
                      style={styles.picker}
                      onValueChange={(value) => 
                        updateEngine(index, { ...engine, performance: value })
                      }
                    >
                      {[1, 2, 3, 4, 5, 6].map(perf => (
                        <Picker.Item key={perf} label={`${perf}`} value={perf} />
                      ))}
                    </Picker>
                  </View>
                </View>

                <View style={styles.formRow}>
                  <Text style={styles.label}>Quantity:</Text>
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={engine.quantity}
                      style={styles.picker}
                      onValueChange={(value) => 
                        updateEngine(index, { ...engine, quantity: value })
                      }
                    >
                      {[1, 2, 3, 4, 5].map(qty => (
                        <Picker.Item key={qty} label={`${qty}`} value={qty} />
                      ))}
                    </Picker>
                  </View>
                </View>

                <View style={styles.statsContainer}>
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Mass:</Text>
                    <Text style={styles.statValue}>{calculateEngineMass(engine).toFixed(1)} tons</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Cost:</Text>
                    <Text style={styles.statValue}>{calculateEngineCost(engine).toFixed(2)} MCr</Text>
                  </View>
                </View>
              </View>
            ))}

            <View style={styles.totalsCard}>
              <Text style={styles.totalsTitle}>Total Engines</Text>
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
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3498db',
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
  engineCard: {
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
  engineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  engineTitle: {
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
    width: 100,
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

export default EnginesScreen;