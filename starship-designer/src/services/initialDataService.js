import { databaseService } from './database';
import { cleanInvalidCargo } from '../data/constants';
class InitialDataService {
    static INITIAL_DATA_PATH = '/initial-ships.json';
    async loadInitialDataIfNeeded() {
        try {
            // Check if database is empty
            await databaseService.initialize();
            const hasShips = await databaseService.hasAnyShips();
            if (hasShips) {
                // Database already has ships, no need to preload
                return false;
            }
            // Try to load initial data
            const initialData = await this.loadInitialData();
            if (!initialData || !initialData.ships || initialData.ships.length === 0) {
                // No initial data available
                return false;
            }
            // Preload the initial ships
            console.log(`🚀 Preloading ${initialData.ships.length} initial ships...`);
            let loaded = 0;
            let errors = 0;
            for (const shipData of initialData.ships) {
                try {
                    // Remove metadata before saving and clean invalid cargo entries
                    const { _metadata, ...shipDesign } = shipData;
                    shipDesign.cargo = cleanInvalidCargo(shipDesign.cargo);
                    await databaseService.saveOrUpdateShipByName(shipDesign);
                    loaded++;
                    console.log(`✅ Loaded: ${shipDesign.ship.name}`);
                }
                catch (error) {
                    console.error(`❌ Failed to load ship "${shipData.ship?.name || 'Unknown'}":`, error);
                    errors++;
                }
            }
            console.log(`📊 Initial data preload complete: ${loaded} loaded, ${errors} errors`);
            return loaded > 0;
        }
        catch (error) {
            console.error('Error during initial data preload:', error);
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
        catch (error) {
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
