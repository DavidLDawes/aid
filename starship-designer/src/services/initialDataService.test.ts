import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { initialDataService } from './initialDataService';
import { databaseService } from './database';
import type { ShipDesign } from '../types/ship';

// Mock the database service
jest.mock('./database', () => ({
  databaseService: {
    initialize: jest.fn(),
    hasAnyShips: jest.fn(),
    saveOrUpdateShipByName: jest.fn(),
  }
}));

// Mock fetch
(globalThis as any).fetch = jest.fn();

describe('Initial Data Service', () => {
  const mockShipDesign: ShipDesign = {
    ship: {
      name: 'Test Initial Ship',
      tech_level: 'A',
      tonnage: 200,
      configuration: 'standard',
      fuel_weeks: 2,
      missile_reloads: 0,
      sand_reloads: 0,
      description: 'Test ship for initial data'
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

  const mockInitialData = {
    exportDate: '2025-08-05T16:00:00.000Z',
    version: '1.0',
    ships: [
      {
        ...mockShipDesign,
        _metadata: {
          originalId: 1,
          originalCreatedAt: '2025-08-05T15:00:00.000Z',
          originalUpdatedAt: '2025-08-05T15:00:00.000Z'
        }
      }
    ]
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Default mock implementations
    (databaseService.initialize as any).mockResolvedValue(undefined);
    (databaseService.hasAnyShips as any).mockResolvedValue(false);
    (databaseService.saveOrUpdateShipByName as any).mockResolvedValue(1);
    (globalThis.fetch as any).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockInitialData)
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('loadInitialDataIfNeeded', () => {
    it('should return false if database already has ships', async () => {
      (databaseService.hasAnyShips as any).mockResolvedValue(true);

      const result = await initialDataService.loadInitialDataIfNeeded();

      expect(result).toBe(false);
      expect(databaseService.initialize).toHaveBeenCalled();
      expect(databaseService.hasAnyShips).toHaveBeenCalled();
      expect(globalThis.fetch).not.toHaveBeenCalled();
    });

    it('should return false if no initial data is available', async () => {
      (globalThis.fetch as any).mockResolvedValue({
        ok: false,
        status: 404
      });

      const result = await initialDataService.loadInitialDataIfNeeded();

      expect(result).toBe(false);
      expect(databaseService.initialize).toHaveBeenCalled();
      expect(databaseService.hasAnyShips).toHaveBeenCalled();
      expect(globalThis.fetch).toHaveBeenCalled();
      expect(databaseService.saveOrUpdateShipByName).not.toHaveBeenCalled();
    });

    it('should return false if initial data has no ships', async () => {
      const emptyData = { ...mockInitialData, ships: [] };
      (globalThis.fetch as any).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(emptyData)
      });

      const result = await initialDataService.loadInitialDataIfNeeded();

      expect(result).toBe(false);
      expect(databaseService.saveOrUpdateShipByName).not.toHaveBeenCalled();
    });

    it('should load initial ships when database is empty and initial data is available', async () => {
      const result = await initialDataService.loadInitialDataIfNeeded();

      expect(result).toBe(true);
      expect(databaseService.initialize).toHaveBeenCalled();
      expect(databaseService.hasAnyShips).toHaveBeenCalled();
      expect(globalThis.fetch).toHaveBeenCalled();
      expect(databaseService.saveOrUpdateShipByName).toHaveBeenCalledTimes(1);
      
      // Should call saveOrUpdateShipByName with ship data without metadata
      expect(databaseService.saveOrUpdateShipByName).toHaveBeenCalledWith(mockShipDesign);
    });

    it('should handle errors during ship loading', async () => {
      (databaseService.saveOrUpdateShipByName as any).mockRejectedValue(new Error('Save failed'));
      
      // Mock console.error to suppress error output during tests
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      const result = await initialDataService.loadInitialDataIfNeeded();

      expect(result).toBe(false); // Returns false because no ships were successfully loaded
      expect(databaseService.saveOrUpdateShipByName).toHaveBeenCalledTimes(1);
      expect(consoleSpy).toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });

    it('should handle fetch errors gracefully', async () => {
      (globalThis.fetch as any).mockRejectedValue(new Error('Network error'));
      
      // Mock console.error to suppress error output during tests
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      const result = await initialDataService.loadInitialDataIfNeeded();

      expect(result).toBe(false);
      expect(databaseService.saveOrUpdateShipByName).not.toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });
  });

  describe('hasInitialData', () => {
    it('should return true if initial data is available', async () => {
      const result = await initialDataService.hasInitialData();

      expect(result).toBe(true);
      expect(globalThis.fetch).toHaveBeenCalled();
    });

    it('should return false if initial data is not available', async () => {
      (globalThis.fetch as any).mockResolvedValue({
        ok: false,
        status: 404
      });

      const result = await initialDataService.hasInitialData();

      expect(result).toBe(false);
    });

    it('should return false if initial data has no ships', async () => {
      const emptyData = { ...mockInitialData, ships: [] };
      (globalThis.fetch as any).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(emptyData)
      });

      const result = await initialDataService.hasInitialData();

      expect(result).toBe(false);
    });

    it('should handle fetch errors gracefully', async () => {
      (globalThis.fetch as any).mockRejectedValue(new Error('Network error'));

      const result = await initialDataService.hasInitialData();

      expect(result).toBe(false);
    });
  });
});