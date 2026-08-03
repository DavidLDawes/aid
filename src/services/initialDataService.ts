import { databaseService } from './database';
import type { ShipDesign } from '../types/ship';
import { cleanInvalidCargo } from '../data/constants';
import { logger } from '../utils/logger';

interface InitialDataExport {
  exportDate: string;
  version: string;
  ships: Array<ShipDesign & { _metadata?: Record<string, unknown> }>;
}

class InitialDataService {
  private static readonly INITIAL_DATA_PATH = 'initial-ships.json';

  async loadInitialDataIfNeeded(): Promise<boolean> {
    logger.info('Checking whether initial data needs to be loaded');
    try {
      await databaseService.initialize();
      const hasShips = await databaseService.hasAnyShips();

      if (hasShips) {
        logger.info('Database already has ships, skipping initial data load');
        return false;
      }

      const initialData = await this.loadInitialData();
      if (!initialData || !initialData.ships || initialData.ships.length === 0) {
        logger.info('No initial data available');
        return false;
      }

      const { loaded, errors } = await this.preloadShips(initialData);
      logger.info(`Initial data load complete: ${loaded} loaded, ${errors} errors`);
      return loaded > 0;

    } catch (error) {
      logger.error('Error during initial data load', error);
      return false;
    }
  }

  // Deletes every ship in the database, then unconditionally reloads the
  // standard ships from initial-ships.json - unlike loadInitialDataIfNeeded,
  // which only loads when the database is empty. Used by the in-app
  // "Reset to Standard Ships" action (SelectShipPanel).
  async resetToStandardShips(): Promise<{ loaded: number; errors: number }> {
    logger.info('Resetting database to standard ships');
    await databaseService.initialize();
    await databaseService.flushAllShips();

    const initialData = await this.loadInitialData();
    if (!initialData || !initialData.ships || initialData.ships.length === 0) {
      logger.info('No standard ship data available to reload');
      return { loaded: 0, errors: 0 };
    }

    const { loaded, errors } = await this.preloadShips(initialData);
    logger.info(`Reset complete: ${loaded} loaded, ${errors} errors`);
    return { loaded, errors };
  }

  private async preloadShips(initialData: InitialDataExport): Promise<{ loaded: number; errors: number }> {
    logger.info(`Preloading ${initialData.ships.length} ships`);
    let loaded = 0;
    let errors = 0;

    for (const shipData of initialData.ships) {
      try {
        const { _metadata, ...shipDesign } = shipData;
        shipDesign.cargo = cleanInvalidCargo(shipDesign.cargo);
        await databaseService.saveOrUpdateShipByName(shipDesign);
        loaded++;
        logger.info(`Loaded ship "${shipDesign.ship.name}"`);
      } catch (error) {
        logger.error(`Failed to load ship "${shipData.ship?.name || 'Unknown'}"`, error);
        errors++;
      }
    }

    return { loaded, errors };
  }

  private async loadInitialData(): Promise<InitialDataExport | null> {
    try {
      const response = await fetch(InitialDataService.INITIAL_DATA_PATH);
      if (!response.ok) {
        return null;
      }
      const data = await response.json();
      return data;
    } catch {
      return null;
    }
  }

  async hasInitialData(): Promise<boolean> {
    try {
      const data = await this.loadInitialData();
      return !!(data && data.ships && data.ships.length > 0);
    } catch {
      return false;
    }
  }
}

export const initialDataService = new InitialDataService();
