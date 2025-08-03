// Select Ship Screen - Choose existing ship or create new one
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useShipDesign } from '../context/ShipDesignContext';
import { storageService } from '../services/storage';
import { ShipDesign } from '../types/ship';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'SelectShip'>;

const SelectShipScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { resetShipDesign, setShipDesign } = useShipDesign();
  const [ships, setShips] = useState<ShipDesign[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedShip, setSelectedShip] = useState<ShipDesign | null>(null);

  useEffect(() => {
    loadShips();
  }, []);

  const loadShips = async () => {
    try {
      setLoading(true);
      await storageService.initialize();
      const allShips = await storageService.getAllShips();
      setShips(allShips);
    } catch (error) {
      Alert.alert('Error', 'Failed to load ships');
      console.error('Error loading ships:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewShip = () => {
    resetShipDesign();
    navigation.navigate('ShipDesigner', {});
  };

  const handleLoadShip = () => {
    if (selectedShip) {
      setShipDesign(selectedShip);
      navigation.navigate('ShipDesigner', { shipName: selectedShip.ship.name });
    }
  };

  const handleDeleteShip = async (shipName: string) => {
    Alert.alert(
      'Delete Ship',
      `Are you sure you want to delete "${shipName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await storageService.deleteShip(shipName);
              await loadShips();
              if (selectedShip?.ship.name === shipName) {
                setSelectedShip(null);
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to delete ship');
            }
          }
        }
      ]
    );
  };

  const renderShipItem = ({ item }: { item: ShipDesign }) => (
    <TouchableOpacity
      style={[
        styles.shipItem,
        selectedShip?.ship.name === item.ship.name && styles.selectedShipItem
      ]}
      onPress={() => setSelectedShip(item)}
      onLongPress={() => handleDeleteShip(item.ship.name)}
    >
      <Text style={styles.shipName}>{item.ship.name}</Text>
      <Text style={styles.shipDetails}>
        {item.ship.configuration} configuration, {item.ship.tonnage} tons, TL {item.ship.tech_level}
      </Text>
      {item.ship.description && (
        <Text style={styles.shipDescription} numberOfLines={2}>
          {item.ship.description}
        </Text>
      )}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={styles.loadingText}>Loading ships...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Starship Designer</Text>
      
      {ships.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Select a Ship</Text>
          <FlatList
            data={ships}
            renderItem={renderShipItem}
            keyExtractor={(item) => item.ship.name}
            style={styles.shipList}
            showsVerticalScrollIndicator={false}
          />
          
          {selectedShip && (
            <View style={styles.selectedShipPreview}>
              <Text style={styles.previewTitle}>Selected Ship</Text>
              <Text style={styles.previewName}>{selectedShip.ship.name}</Text>
              <Text style={styles.previewDetails}>
                {selectedShip.ship.configuration} configuration, {selectedShip.ship.tonnage} tons, Tech Level {selectedShip.ship.tech_level}
              </Text>
            </View>
          )}
        </>
      )}

      <View style={styles.buttonContainer}>
        {ships.length > 0 && (
          <TouchableOpacity
            style={[styles.button, styles.loadButton, !selectedShip && styles.disabledButton]}
            onPress={handleLoadShip}
            disabled={!selectedShip}
          >
            <Text style={[styles.buttonText, !selectedShip && styles.disabledButtonText]}>
              Load Ship
            </Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity
          style={[styles.button, styles.newButton]}
          onPress={handleNewShip}
        >
          <Text style={styles.buttonText}>New Ship</Text>
        </TouchableOpacity>
      </View>

      {ships.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No ships found</Text>
          <Text style={styles.emptyStateSubtext}>Create your first starship design</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#7f8c8d',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 15,
  },
  shipList: {
    flex: 1,
    marginBottom: 20,
  },
  shipItem: {
    backgroundColor: '#ffffff',
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  selectedShipItem: {
    borderColor: '#3498db',
    borderWidth: 2,
    backgroundColor: '#f0f8ff',
  },
  shipName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5,
  },
  shipDetails: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 5,
  },
  shipDescription: {
    fontSize: 12,
    color: '#95a5a6',
    fontStyle: 'italic',
  },
  selectedShipPreview: {
    backgroundColor: '#ffffff',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3498db',
    marginBottom: 20,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3498db',
    marginBottom: 5,
  },
  previewName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5,
  },
  previewDetails: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 15,
  },
  button: {
    flex: 1,
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  loadButton: {
    backgroundColor: '#3498db',
  },
  newButton: {
    backgroundColor: '#27ae60',
  },
  disabledButton: {
    backgroundColor: '#bdc3c7',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  disabledButtonText: {
    color: '#95a5a6',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#7f8c8d',
    marginBottom: 10,
  },
  emptyStateSubtext: {
    fontSize: 16,
    color: '#95a5a6',
    textAlign: 'center',
  },
});

export default SelectShipScreen;