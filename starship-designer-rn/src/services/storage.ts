// AsyncStorage service for React Native
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ShipDesign } from '../types/ship';

const SHIPS_KEY = 'starship_designs';

export class StorageService {
  private static instance: StorageService;

  static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  async initialize(): Promise<void> {
    // AsyncStorage doesn't need initialization like IndexedDB
    try {
      await AsyncStorage.getItem(SHIPS_KEY);
    } catch (error) {
      console.error('Error initializing storage:', error);
      throw error;
    }
  }

  async saveShip(shipDesign: ShipDesign): Promise<void> {
    try {
      const existingShips = await this.getAllShips();
      const shipIndex = existingShips.findIndex(ship => ship.ship.name === shipDesign.ship.name);
      
      if (shipIndex >= 0) {
        // Update existing ship
        existingShips[shipIndex] = shipDesign;
      } else {
        // Add new ship
        existingShips.push(shipDesign);
      }
      
      await AsyncStorage.setItem(SHIPS_KEY, JSON.stringify(existingShips));
    } catch (error) {
      console.error('Error saving ship:', error);
      throw new Error('Failed to save ship design');
    }
  }

  async getAllShips(): Promise<ShipDesign[]> {
    try {
      const shipsData = await AsyncStorage.getItem(SHIPS_KEY);
      if (shipsData) {
        return JSON.parse(shipsData);
      }
      return [];
    } catch (error) {
      console.error('Error getting all ships:', error);
      return [];
    }
  }

  async getShipByName(name: string): Promise<ShipDesign | null> {
    try {
      const ships = await this.getAllShips();
      return ships.find(ship => ship.ship.name === name) || null;
    } catch (error) {
      console.error('Error getting ship by name:', error);
      return null;
    }
  }

  async deleteShip(name: string): Promise<void> {
    try {
      const ships = await this.getAllShips();
      const filteredShips = ships.filter(ship => ship.ship.name !== name);
      await AsyncStorage.setItem(SHIPS_KEY, JSON.stringify(filteredShips));
    } catch (error) {
      console.error('Error deleting ship:', error);
      throw new Error('Failed to delete ship');
    }
  }

  async hasAnyShips(): Promise<boolean> {
    try {
      const ships = await this.getAllShips();
      return ships.length > 0;
    } catch (error) {
      console.error('Error checking for ships:', error);
      return false;
    }
  }

  async checkShipNameExists(name: string): Promise<boolean> {
    try {
      const ship = await this.getShipByName(name);
      return ship !== null;
    } catch (error) {
      console.error('Error checking ship name:', error);
      return false;
    }
  }

  async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.removeItem(SHIPS_KEY);
    } catch (error) {
      console.error('Error clearing data:', error);
      throw new Error('Failed to clear data');
    }
  }
}

export const storageService = StorageService.getInstance();