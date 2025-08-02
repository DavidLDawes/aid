// Fittings Screen - Configure ship fittings like bridge, fuel tanks, sensors, etc.
import React, { useContext } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity 
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { ShipDesignContext } from '../context/ShipDesignContext';
import { Fitting } from '../types/ship';
import { getBridgeMassAndCost, COMMS_SENSORS_TYPES } from '../data/constants';

const FittingsScreen: React.FC = () => {
  const { shipDesign, updateShipDesign } = useContext(ShipDesignContext)!;

  const updateFitting = (fittingType: string, updatedFitting: Fitting) => {
    const updatedFittings = shipDesign.fittings.map(fitting => 
      fitting.fitting_type === fittingType ? updatedFitting : fitting
    );
    
    updateShipDesign({
      ...shipDesign,
      fittings: updatedFittings
    });
  };

  const getBridgeFitting = (): Fitting => {
    return shipDesign.fittings.find(f => f.fitting_type === 'bridge') || {
      fitting_type: 'bridge',
      is_half_bridge: false,
      quantity: 1
    };
  };

  const getFuelTankFitting = (): Fitting => {
    return shipDesign.fittings.find(f => f.fitting_type === 'fuel_tank') || {
      fitting_type: 'fuel_tank',
      fuel_weeks: 4,
      quantity: 1
    };
  };

  const getCommsSensorsFitting = (): Fitting => {
    return shipDesign.fittings.find(f => f.fitting_type === 'comms_sensors') || {
      fitting_type: 'comms_sensors',
      comms_sensors_type: 'standard',
      quantity: 1
    };
  };

  const calculateBridgeMassAndCost = () => {
    const bridgeFitting = getBridgeFitting();
    return getBridgeMassAndCost(shipDesign.ship.tonnage, bridgeFitting.is_half_bridge || false);
  };

  const calculateFuelMass = () => {
    const fuelFitting = getFuelTankFitting();
    const weeks = fuelFitting.fuel_weeks || 4;
    const jumpPerformance = shipDesign.engines.find(e => e.engine_type === 'jump')?.performance || 0;
    const maneuverPerformance = shipDesign.engines.find(e => e.engine_type === 'maneuver')?.performance || 0;
    
    const jumpFuel = shipDesign.ship.tonnage * jumpPerformance * 0.1;
    const maneuverFuel = (shipDesign.ship.tonnage * maneuverPerformance * 0.01) * weeks;
    
    return jumpFuel + maneuverFuel;
  };

  const calculateCommsSensorsMassAndCost = () => {
    const commsFitting = getCommsSensorsFitting();
    const sensorType = COMMS_SENSORS_TYPES.find(s => s.type === commsFitting.comms_sensors_type);
    return sensorType || { mass: 0, cost: 0 };
  };

  const ensureFittingExists = (fittingType: string, defaultFitting: Fitting) => {
    const exists = shipDesign.fittings.some(f => f.fitting_type === fittingType);
    if (!exists) {
      updateShipDesign({
        ...shipDesign,
        fittings: [...shipDesign.fittings, defaultFitting]
      });
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Ship Fittings</Text>

        {/* Bridge Section */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Icon name="account-balance" size={24} color="#3498db" />
            <Text style={styles.sectionTitle}>Bridge</Text>
          </View>

          <View style={styles.formRow}>
            <Text style={styles.label}>Type:</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={getBridgeFitting().is_half_bridge ? 'half' : 'full'}
                style={styles.picker}
                onValueChange={(value) => {
                  const bridgeFitting = getBridgeFitting();
                  const updatedFitting = {
                    ...bridgeFitting,
                    is_half_bridge: value === 'half'
                  };
                  ensureFittingExists('bridge', updatedFitting);
                  updateFitting('bridge', updatedFitting);
                }}
              >
                <Picker.Item label="Full Bridge" value="full" />
                <Picker.Item label="Half Bridge" value="half" />
              </Picker>
            </View>
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Mass:</Text>
              <Text style={styles.statValue}>{calculateBridgeMassAndCost().mass} tons</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Cost:</Text>
              <Text style={styles.statValue}>{calculateBridgeMassAndCost().cost} MCr</Text>
            </View>
          </View>
        </View>

        {/* Fuel Tanks Section */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Icon name="local-gas-station" size={24} color="#e67e22" />
            <Text style={styles.sectionTitle}>Fuel Tanks</Text>
          </View>

          <View style={styles.formRow}>
            <Text style={styles.label}>Fuel Duration:</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={getFuelTankFitting().fuel_weeks || 4}
                style={styles.picker}
                onValueChange={(value) => {
                  const fuelFitting = getFuelTankFitting();
                  const updatedFitting = {
                    ...fuelFitting,
                    fuel_weeks: value
                  };
                  ensureFittingExists('fuel_tank', updatedFitting);
                  updateFitting('fuel_tank', updatedFitting);
                }}
              >
                <Picker.Item label="1 Week" value={1} />
                <Picker.Item label="2 Weeks" value={2} />
                <Picker.Item label="3 Weeks" value={3} />
                <Picker.Item label="4 Weeks" value={4} />
                <Picker.Item label="5 Weeks" value={5} />
                <Picker.Item label="6 Weeks" value={6} />
                <Picker.Item label="8 Weeks" value={8} />
                <Picker.Item label="12 Weeks" value={12} />
              </Picker>
            </View>
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Fuel Mass:</Text>
              <Text style={styles.statValue}>{calculateFuelMass().toFixed(1)} tons</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Cost:</Text>
              <Text style={styles.statValue}>0.00 MCr</Text>
            </View>
          </View>
        </View>

        {/* Communications & Sensors Section */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Icon name="wifi" size={24} color="#9b59b6" />
            <Text style={styles.sectionTitle}>Communications & Sensors</Text>
          </View>

          <View style={styles.formRow}>
            <Text style={styles.label}>Type:</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={getCommsSensorsFitting().comms_sensors_type || 'standard'}
                style={styles.picker}
                onValueChange={(value) => {
                  const commsFitting = getCommsSensorsFitting();
                  const updatedFitting = {
                    ...commsFitting,
                    comms_sensors_type: value
                  };
                  ensureFittingExists('comms_sensors', updatedFitting);
                  updateFitting('comms_sensors', updatedFitting);
                }}
              >
                {COMMS_SENSORS_TYPES.map(sensor => (
                  <Picker.Item 
                    key={sensor.type} 
                    label={sensor.name} 
                    value={sensor.type} 
                  />
                ))}
              </Picker>
            </View>
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Mass:</Text>
              <Text style={styles.statValue}>{calculateCommsSensorsMassAndCost().mass} tons</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Cost:</Text>
              <Text style={styles.statValue}>{calculateCommsSensorsMassAndCost().cost} MCr</Text>
            </View>
          </View>
        </View>

        {/* Total Summary */}
        <View style={styles.totalsCard}>
          <Text style={styles.totalsTitle}>Total Fittings</Text>
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>Total Mass:</Text>
            <Text style={styles.totalsValue}>
              {(calculateBridgeMassAndCost().mass + calculateFuelMass() + calculateCommsSensorsMassAndCost().mass).toFixed(1)} tons
            </Text>
          </View>
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>Total Cost:</Text>
            <Text style={styles.totalsValue}>
              {(calculateBridgeMassAndCost().cost + calculateCommsSensorsMassAndCost().cost).toFixed(2)} MCr
            </Text>
          </View>
        </View>
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
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 20,
    textAlign: 'center',
  },
  sectionCard: {
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
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2c3e50',
    marginLeft: 12,
  },
  formRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#34495e',
    width: 120,
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
    justifyContent: 'space-around',
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
    backgroundColor: '#27ae60',
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

export default FittingsScreen;