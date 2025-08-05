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

    it('should get ship by name', async () => {
      await databaseService.saveShip(mockShipDesign);
      
      const retrievedShip = await databaseService.getShipByName('Test Ship');
      expect(retrievedShip).not.toBeNull();
      expect(retrievedShip?.ship.name).toBe('Test Ship');
    });

    it('should return null for non-existent ship name', async () => {
      const retrievedShip = await databaseService.getShipByName('Non-existent Ship');
      expect(retrievedShip).toBeNull();
    });

    it('should check if ship name exists', async () => {
      await databaseService.saveShip(mockShipDesign);
      
      const exists = await databaseService.shipNameExists('Test Ship');
      expect(exists).toBe(true);
      
      const notExists = await databaseService.shipNameExists('Non-existent Ship');
      expect(notExists).toBe(false);
    });

    it('should return false for empty ship names', async () => {
      const exists1 = await databaseService.shipNameExists('');
      const exists2 = await databaseService.shipNameExists('   ');
      
      expect(exists1).toBe(false);
      expect(exists2).toBe(false);
    });
  });

  describe('Save or Update by Name', () => {
    it('should save a new ship when name does not exist', async () => {
      const shipId = await databaseService.saveOrUpdateShipByName(mockShipDesign);
      expect(shipId).toBeGreaterThan(0);
      
      const retrievedShip = await databaseService.getShipById(shipId);
      expect(retrievedShip?.ship.name).toBe('Test Ship');
    });

    it('should update existing ship when name already exists', async () => {
      // First save a ship
      const originalShipId = await databaseService.saveShip(mockShipDesign);
      
      // Create a modified version with the same name but different properties
      const updatedShip = {
        ...mockShipDesign,
        ship: {
          ...mockShipDesign.ship,
          description: 'Updated description'
        }
      };
      
      // Use saveOrUpdateShipByName - should update the existing ship
      const returnedId = await databaseService.saveOrUpdateShipByName(updatedShip);
      expect(returnedId).toBe(originalShipId); // Should return the same ID
      
      // Verify the ship was updated
      const retrievedShip = await databaseService.getShipById(originalShipId);
      expect(retrievedShip?.ship.description).toBe('Updated description');
      expect(retrievedShip?.updatedAt).toBeInstanceOf(Date);
      
      // Verify there's still only one ship with this name
      const allShips = await databaseService.getAllShips();
      const shipsWithName = allShips.filter(ship => ship.ship.name === 'Test Ship');
      expect(shipsWithName).toHaveLength(1);
    });

    it('should preserve original createdAt when updating', async () => {
      // Save original ship
      const originalShipId = await databaseService.saveShip(mockShipDesign);
      const originalShip = await databaseService.getShipById(originalShipId);
      const originalCreatedAt = originalShip!.createdAt;
      
      // Wait a bit to ensure different timestamps
      await new Promise(resolve => setTimeout(resolve, 10));
      
      // Update with saveOrUpdateShipByName
      const updatedShip = {
        ...mockShipDesign,
        ship: { ...mockShipDesign.ship, description: 'Updated' }
      };
      await databaseService.saveOrUpdateShipByName(updatedShip);
      
      // Verify createdAt is preserved but updatedAt is newer
      const retrievedShip = await databaseService.getShipById(originalShipId);
      expect(retrievedShip!.createdAt).toEqual(originalCreatedAt);
      expect(retrievedShip!.updatedAt.getTime()).toBeGreaterThan(originalCreatedAt.getTime());
    });
  });
});