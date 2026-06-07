import { databaseService } from './database';
import { cleanInvalidCargo } from '../data/constants';
import { logger } from '../utils/logger';
class InitialDataService {
    static INITIAL_DATA_PATH = '/initial-ships.json';
    async loadInitialDataIfNeeded() {
        logger.info('Checking whether initial data needs to be loaded');
        try {
            // Check if database is empty
            await databaseService.initialize();
            const hasShips = await databaseService.hasAnyShips();
            if (hasShips) {
                logger.info('Database already has ships, skipping initial data load');
                return false;
            }
            // Try to load initial data
            const initialData = await this.loadInitialData();
            if (!initialData || !initialData.ships || initialData.ships.length === 0) {
                logger.info('No initial data available');
                return false;
            }
            // Preload the initial ships
            logger.info(`Preloading ${initialData.ships.length} initial ships`);
            let loaded = 0;
            let errors = 0;
            for (const shipData of initialData.ships) {
                try {
                    // Remove metadata before saving and clean invalid cargo entries
                    const { _metadata: _m, ...shipDesign } = shipData;
                    shipDesign.cargo = cleanInvalidCargo(shipDesign.cargo);
                    await databaseService.saveOrUpdateShipByName(shipDesign);
                    loaded++;
                    logger.info(`Loaded initial ship "${shipDesign.ship.name}"`);
                }
                catch (error) {
                    logger.error(`Failed to load initial ship "${shipData.ship?.name || 'Unknown'}"`, error);
                    errors++;
                }
            }
            logger.info(`Initial data load complete: ${loaded} loaded, ${errors} errors`);
            return loaded > 0;
        }
        catch (error) {
            logger.error('Error during initial data load', error);
            return false;
        }
    }
    async loadInitialData() {
        try {
            // Try to fetch the initial data file
            const response = await fetch(InitialDataService.INITIAL_DATA_PATH);
            if (!response.ok) {
                // Initial data file doesn't exist
                return null;
            }
            const data = await response.json();
            return data;
        }
        catch {
            // Initial data file doesn't exist or couldn't be loaded
            return null;
        }
    }
    async hasInitialData() {
        try {
            const data = await this.loadInitialData();
            return !!(data && data.ships && data.ships.length > 0);
        }
        catch {
            return false;
        }
    }
}
export const initialDataService = new InitialDataService();
