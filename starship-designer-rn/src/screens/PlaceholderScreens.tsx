import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const createPlaceholderScreen = (title: string) => {
  const PlaceholderScreen: React.FC = () => {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.placeholder}>{title} configuration coming soon...</Text>
      </View>
    );
  };
  return PlaceholderScreen;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 20,
  },
  placeholder: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
  },
});

export const RecHealthScreen = createPlaceholderScreen('Recreation & Health');
export const CargoScreen = createPlaceholderScreen('Cargo');
export const VehiclesScreen = createPlaceholderScreen('Vehicles');
export const DronesScreen = createPlaceholderScreen('Drones');
export const BerthsScreen = createPlaceholderScreen('Berths');
export const StaffScreen = createPlaceholderScreen('Staff');