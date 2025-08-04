// Engines Screen - Engine configuration for starship design
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
import { Engine } from '../types/ship';

const EnginesScreen: React.FC = () => {
  const { shipDesign, updateShipDesign } = useShipDesign();

  const addEngine = () => {
    // Calculate available tonnage for engines
    const totalEngineMass = getTotalMass();
    const shipTonnage = shipDesign.ship.tonnage;
    const remainingTonnage = shipTonnage - totalEngineMass;
    
    // Calculate mass for new engine with performance 1
    const newEngineMass = shipTonnage * 1 * 0.02;
    
    if (newEngineMass > remainingTonnage) {
      Alert.alert(
        'Insufficient Tonnage',
        `Cannot add engine. Need ${newEngineMass} tons but only ${remainingTonnage.toFixed(1)} tons available.`,
        [{ text: 'OK' }]
      );
      return;
    }
    
    // Show options for which engine type to add
    Alert.alert(
      'Add Engine',
      'Which type of engine would you like to add?',
      [
        {
          text: 'Power Plant',
          onPress: () => addEngineOfType('power_plant')
        },
        {
          text: 'Jump Drive', 
          onPress: () => addEngineOfType('jump')
        },
        {
          text: 'Maneuver Drive',
          onPress: () => addEngineOfType('maneuver')
        },
        {
          text: 'Cancel',
          style: 'cancel'
        }
      ]
    );
  };

  const addEngineOfType = (engineType: 'power_plant' | 'jump' | 'maneuver') => {
    const shipTonnage = shipDesign.ship.tonnage;
    const newEngineMass = shipTonnage * 1 * 0.02;
    
    const newEngine: Engine = {
      engine_type: engineType,
      performance: 1,
      mass: newEngineMass,
      cost: shipTonnage * 1 * (engineType === 'maneuver' ? 0.01 : 0.02)
    };

    updateShipDesign({
      ...shipDesign,
      engines: [...shipDesign.engines, newEngine]
    });
  };

  const updateEngine = (index: number, updatedEngine: Engine) => {
    const shipTonnage = shipDesign.ship.tonnage;
    
    // Check power plant constraints for jump drives and maneuver drives
    if (updatedEngine.engine_type === 'jump' || updatedEngine.engine_type === 'maneuver') {
      const powerPlants = shipDesign.engines.filter(e => e.engine_type === 'power_plant');
      const maxPowerPlantPerformance = powerPlants.length > 0 ? 
        Math.max(...powerPlants.map(p => p.performance)) : 1;
      
      if (updatedEngine.performance > maxPowerPlantPerformance) {
        Alert.alert(
          'Performance Too High',
          `${updatedEngine.engine_type === 'jump' ? 'Jump Drive' : 'Maneuver Drive'} performance cannot exceed the highest Power Plant performance (${maxPowerPlantPerformance}).`,
          [{ text: 'OK' }]
        );
        return;
      }
    }
    
    // Recalculate mass and cost based on new values
    const engineWithCalculatedValues: Engine = {
      ...updatedEngine,
      mass: shipTonnage * updatedEngine.performance * 0.02,
      cost: shipTonnage * updatedEngine.performance * (updatedEngine.engine_type === 'maneuver' ? 0.01 : 0.02)
    };
    
    const updatedEngines = [...shipDesign.engines];
    updatedEngines[index] = engineWithCalculatedValues;
    
    updateShipDesign({
      ...shipDesign,
      engines: updatedEngines
    });
  };

  const removeEngine = (index: number) => {
    const engineToRemove = shipDesign.engines[index];
    const powerPlants = shipDesign.engines.filter(e => e.engine_type === 'power_plant');
    const jumpDrives = shipDesign.engines.filter(e => e.engine_type === 'jump');
    
    // Prevent removing the last Power Plant or Jump Drive
    if (engineToRemove.engine_type === 'power_plant' && powerPlants.length === 1) {
      Alert.alert(
        'Cannot Remove Engine',
        'At least one Power Plant is required for the ship.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    if (engineToRemove.engine_type === 'jump' && jumpDrives.length === 1) {
      Alert.alert(
        'Cannot Remove Engine',
        'At least one Jump Drive is required for the ship.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    // Check if removing this power plant will require downgrading other engines
    let warningMessage = `Are you sure you want to remove this ${
      engineToRemove.engine_type === 'power_plant' ? 'Power Plant' : 
      engineToRemove.engine_type === 'jump' ? 'Jump Drive' : 'Maneuver Drive'
    }?`;
    
    if (engineToRemove.engine_type === 'power_plant') {
      // Calculate what the max power plant performance will be after removal
      const remainingPowerPlants = powerPlants.filter((_, i) => 
        shipDesign.engines.indexOf(powerPlants[i]) !== index
      );
      
      if (remainingPowerPlants.length > 0) {
        const maxRemainingPerformance = Math.max(...remainingPowerPlants.map(p => p.performance));
        
        // Check if any jump drives or maneuver drives exceed this
        const affectedEngines = shipDesign.engines.filter((engine, i) => 
          i !== index && 
          (engine.engine_type === 'jump' || engine.engine_type === 'maneuver') &&
          engine.performance > maxRemainingPerformance
        );
        
        if (affectedEngines.length > 0) {
          warningMessage += `\n\nWarning: This will downgrade ${affectedEngines.length} other engine(s) to performance ${maxRemainingPerformance} to match the remaining power plant capacity.`;
        }
      }
    }
    
    Alert.alert(
      'Remove Engine',
      warningMessage,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            removeEngineAndAdjustPerformance(index);
          }
        }
      ]
    );
  };

  const removeEngineAndAdjustPerformance = (indexToRemove: number) => {
    const engineToRemove = shipDesign.engines[indexToRemove];
    let updatedEngines = shipDesign.engines.filter((_, i) => i !== indexToRemove);
    
    // If we removed a power plant, check if we need to downgrade other engines
    if (engineToRemove.engine_type === 'power_plant') {
      const remainingPowerPlants = updatedEngines.filter(e => e.engine_type === 'power_plant');
      
      if (remainingPowerPlants.length > 0) {
        const maxPowerPlantPerformance = Math.max(...remainingPowerPlants.map(p => p.performance));
        
        // Downgrade any jump drives or maneuver drives that exceed the max power plant performance
        updatedEngines = updatedEngines.map(engine => {
          if ((engine.engine_type === 'jump' || engine.engine_type === 'maneuver') && 
              engine.performance > maxPowerPlantPerformance) {
            const shipTonnage = shipDesign.ship.tonnage;
            return {
              ...engine,
              performance: maxPowerPlantPerformance,
              mass: shipTonnage * maxPowerPlantPerformance * 0.02,
              cost: shipTonnage * maxPowerPlantPerformance * (engine.engine_type === 'maneuver' ? 0.01 : 0.02)
            };
          }
          return engine;
        });
      }
    }
    
    updateShipDesign({
      ...shipDesign,
      engines: updatedEngines
    });
  };

  const calculateEngineMass = (engine: Engine): number => {
    const shipTonnage = shipDesign.ship.tonnage;
    if (engine.engine_type === 'jump') {
      return shipTonnage * engine.performance * 0.02;
    } else if (engine.engine_type === 'maneuver') {
      return shipTonnage * engine.performance * 0.02;
    } else if (engine.engine_type === 'power_plant') {
      return shipTonnage * engine.performance * 0.02;
    }
    return 0;
  };

  const calculateEngineCost = (engine: Engine): number => {
    const shipTonnage = shipDesign.ship.tonnage;
    if (engine.engine_type === 'jump') {
      return shipTonnage * engine.performance * 0.02;
    } else if (engine.engine_type === 'maneuver') {
      return shipTonnage * engine.performance * 0.01;
    } else if (engine.engine_type === 'power_plant') {
      return shipTonnage * engine.performance * 0.02;
    }
    return 0;
  };

  const getTotalMass = (): number => {
    return shipDesign.engines.reduce((total, engine) => total + (engine.mass || calculateEngineMass(engine)), 0);
  };

  const getTotalCost = (): number => {
    return shipDesign.engines.reduce((total, engine) => total + (engine.cost || calculateEngineCost(engine)), 0);
  };

  const validateEngineRequirements = () => {
    const powerPlants = shipDesign.engines.filter(e => e.engine_type === 'power_plant');
    const jumpDrives = shipDesign.engines.filter(e => e.engine_type === 'jump');
    
    const errors = [];
    
    if (powerPlants.length === 0) {
      errors.push('At least one Power Plant is required');
    }
    
    if (jumpDrives.length === 0) {
      errors.push('At least one Jump Drive is required');
    }
    
    if (powerPlants.length > 0) {
      // Find the highest power plant performance
      const maxPowerPlantPerformance = Math.max(...powerPlants.map(p => p.performance));
      
      // Check all jump drives don't exceed max power plant performance
      for (const jumpDrive of jumpDrives) {
        if (jumpDrive.performance > maxPowerPlantPerformance) {
          errors.push(`Jump Drive performance (${jumpDrive.performance}) cannot exceed highest Power Plant performance (${maxPowerPlantPerformance})`);
        }
      }
      
      // Check maneuver drives don't exceed max power plant performance
      const maneuverDrives = shipDesign.engines.filter(e => e.engine_type === 'maneuver');
      for (const maneuver of maneuverDrives) {
        if (maneuver.performance > maxPowerPlantPerformance) {
          errors.push(`Maneuver Drive performance (${maneuver.performance}) cannot exceed highest Power Plant performance (${maxPowerPlantPerformance})`);
        }
      }
    }
    
    return errors;
  };

  const validationErrors = validateEngineRequirements();
  
  // Generate engine ID letters (A, B, C... skipping I and O)
  const getEngineIdLetter = (index: number): string => {
    const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
    return letters[index] || `${letters[letters.length - 1]}${index - letters.length + 1}`;
  };

  // Get performance prefix for engine type
  const getPerformancePrefix = (engineType: 'power_plant' | 'jump' | 'maneuver'): string => {
    switch (engineType) {
      case 'power_plant': return 'P-';
      case 'jump': return 'J-';
      case 'maneuver': return 'M-';
      default: return '';
    }
  };

  // Get display name for engine type
  const getEngineDisplayName = (engineType: 'power_plant' | 'jump' | 'maneuver'): string => {
    switch (engineType) {
      case 'power_plant': return 'Power Plant';
      case 'jump': return 'Jump Drive';
      case 'maneuver': return 'Maneuver Drive';
      default: return '';
    }
  };
  
  // Check if engines can be added
  const totalEngineMass = getTotalMass();
  const shipTonnage = shipDesign.ship.tonnage;
  const remainingTonnage = shipTonnage - totalEngineMass;
  const minEngineSize = shipTonnage * 1 * 0.02; // Smallest possible engine
  const canAddEngine = remainingTonnage >= minEngineSize;

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Engines</Text>
          <TouchableOpacity 
            style={[styles.addButton, !canAddEngine && styles.addButtonDisabled]} 
            onPress={addEngine}
            disabled={!canAddEngine}
          >
            <MaterialIcons name="add" size={24} color="#fff" />
            <Text style={styles.addButtonText}>Add Engine</Text>
          </TouchableOpacity>
        </View>

        {shipDesign.engines.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialIcons name="settings" size={64} color="#bdc3c7" />
            <Text style={styles.emptyText}>No engines configured</Text>
            <Text style={styles.emptySubtext}>Tap "Add Engine" to get started</Text>
          </View>
        ) : (
          <>
            {shipDesign.engines.map((engine, index) => (
              <View key={index} style={styles.engineCard}>
                <View style={styles.engineHeader}>
                  <Text style={styles.engineTitle}>
                    {getEngineDisplayName(engine.engine_type)} {getEngineIdLetter(index)} {getPerformancePrefix(engine.engine_type)}{engine.performance}
                  </Text>
                  <TouchableOpacity 
                    style={styles.removeButton}
                    onPress={() => removeEngine(index)}
                  >
                    <MaterialIcons name="delete" size={20} color="#e74c3c" />
                  </TouchableOpacity>
                </View>

                <View style={styles.formRow}>
                  <Text style={styles.label}>Type:</Text>
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={engine.engine_type}
                      style={styles.picker}
                      onValueChange={(value) => 
                        updateEngine(index, { ...engine, engine_type: value as 'jump' | 'maneuver' | 'power_plant' })
                      }
                    >
                      <Picker.Item label="Power Plant" value="power_plant" />
                      <Picker.Item label="Jump Drive" value="jump" />
                      <Picker.Item label="Maneuver Drive" value="maneuver" />
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

            {validationErrors.length > 0 && (
              <View style={styles.validationCard}>
                <Text style={styles.validationTitle}>⚠️ Engine Requirements</Text>
                {validationErrors.map((error, index) => (
                  <Text key={index} style={styles.validationError}>• {error}</Text>
                ))}
                <Text style={styles.validationNote}>
                  Complete engine requirements to access other sections.
                </Text>
              </View>
            )}
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
  validationCard: {
    backgroundColor: '#fff3cd',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#f39c12',
  },
  validationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#856404',
    marginBottom: 8,
  },
  validationError: {
    fontSize: 14,
    color: '#856404',
    marginBottom: 4,
  },
  validationNote: {
    fontSize: 12,
    color: '#6c757d',
    fontStyle: 'italic',
    marginTop: 8,
  },
});

export default EnginesScreen;