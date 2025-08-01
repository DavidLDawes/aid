import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { databaseService } from './database';
import type { ShipDesign } from '../types/ship';

describe('Database Service', () => {
  const mockShipDesign: ShipDesign = {
    ship: {
      name: 'Test Ship',
      tech_level: 'A',
      tonnage: 400,
      configuration: 'standard',
      fuel_weeks: 2,
      missile_reloads: 0,
      sand_reloads: 0,
      description: 'Test ship description'
    },
    engines: [],
    fittings: [],
    weapons: [],
    defenses: [],
    berths: [],
    facilities: [],
    cargo: [],
    vehicles: [],
    drones: []
  };

  beforeEach(async () => {
    // Initialize database before each test
    await databaseService.initialize();
  });

  afterEach(async () => {
    // Clean up - delete all test ships
    try {
      const ships = await databaseService.getAllShips();
      for (const ship of ships) {
        if (ship.ship.name.includes('Test')) {
          await databaseService.deleteShip(ship.id);
        }
      }
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  describe('Ship Name Uniqueness', () => {
    it('should save a ship with a unique name', async () => {
      const shipId = await databaseService.saveShip(mockShipDesign);
      expect(shipId).toBeGreaterThan(0);
    });

    it('should reject saving a ship with a duplicate name', async () => {
      // Save the first ship
      await databaseService.saveShip(mockShipDesign);
      
      // Try to save another ship with the same name
      await expect(databaseService.saveShip(mockShipDesign))
        .rejects
        .toThrow('A ship named "Test Ship" already exists. Please choose a different name.');
    });

    it('should allow saving ships with different names', async () => {
      // Save first ship
      const shipId1 = await databaseService.saveShip(mockShipDesign);
      
      // Save second ship with different name
      const secondShip = { 
        ...mockShipDesign,
        ship: { ...mockShipDesign.ship, name: 'Test Ship 2' }
      };
      const shipId2 = await databaseService.saveShip(secondShip);
      
      expect(shipId1).toBeGreaterThan(0);
      expect(shipId2).toBeGreaterThan(0);
      expect(shipId1).not.toBe(shipId2);
    });

    it('should allow updating a ship without changing the name', async () => {
      // Save a ship
      const shipId = await databaseService.saveShip(mockShipDesign);
      
      // Update the ship (same name)
      const updatedShip = { 
        ...mockShipDesign,
        ship: { ...mockShipDesign.ship, description: 'Updated description' }
      };
      
      await expect(databaseService.updateShip(shipId, updatedShip))
        .resolves
        .not.toThrow();
    });

    it('should reject updating a ship to have a duplicate name', async () => {
      // Save two ships with different names
      const shipId1 = await databaseService.saveShip(mockShipDesign);
      
      const secondShip = { ...mockShipDesign };
      secondShip.ship = { ...mockShipDesign.ship, name: 'Test Ship 2' };
      const shipId2 = await databaseService.saveShip(secondShip);
      
      // Try to update second ship to have the same name as first ship
      const updatedShip = { ...secondShip };
      updatedShip.ship = { ...secondShip.ship, name: 'Test Ship' };
      
      await expect(databaseService.updateShip(shipId2, updatedShip))
        .rejects
        .toThrow('A ship named "Test Ship" already exists. Please choose a different name.');
    });

    it('should allow updating a ship to have a unique name', async () => {
      // Save a ship
      const shipId = await databaseService.saveShip(mockShipDesign);
      
      // Update the ship with a new unique name
      const updatedShip = { 
        ...mockShipDesign,
        ship: { ...mockShipDesign.ship, name: 'Test Ship Updated' }
      };
      
      await expect(databaseService.updateShip(shipId, updatedShip))
        .resolves
        .not.toThrow();
      
      // Verify the name was updated
      const retrievedShip = await databaseService.getShipById(shipId);
      expect(retrievedShip?.ship.name).toBe('Test Ship Updated');
    });
  });

  describe('Database Operations', () => {
    it('should retrieve all ships', async () => {
      await databaseService.saveShip(mockShipDesign);
      
      const ships = await databaseService.getAllShips();
      expect(ships.length).toBeGreaterThan(0);
      expect(ships.some(ship => ship.ship.name === 'Test Ship')).toBe(true);
    });

    it('should check if any ships exist', async () => {
      const hasShipsBefore = await databaseService.hasAnyShips();
      
      await databaseService.saveShip(mockShipDesign);
      
      const hasShipsAfter = await databaseService.hasAnyShips();
      expect(hasShipsAfter).toBe(true);
    });

    it('should delete a ship', async () => {
      const shipId = await databaseService.saveShip(mockShipDesign);
      
      await databaseService.deleteShip(shipId);
      
      const retrievedShip = await databaseService.getShipById(shipId);
      expect(retrievedShip).toBeNull();
    });
  });
});