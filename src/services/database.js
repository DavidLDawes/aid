import { cleanInvalidCargo } from '../data/constants';
import { logger } from '../utils/logger';
class DatabaseService {
    db = null;
    dbName = 'StarshipDesignerDB';
    version = 2;
    async initialize() {
        if (this.db) {
            logger.info('Database already initialized');
            return;
        }
        logger.info('Opening database...');
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);
            request.onerror = () => {
                logger.error('Database open failed', request.error);
                reject(request.error);
            };
            request.onsuccess = () => {
                this.db = request.result;
                logger.info('Database initialized successfully');
                resolve();
            };
            request.onupgradeneeded = async (event) => {
                const db = event.target.result;
                const transaction = event.target.transaction;
                const oldVersion = event.oldVersion;
                logger.info(`Upgrading database from v${oldVersion} to v${this.version}`);
                // Version 1: Initial database creation
                if (oldVersion < 1) {
                    if (!db.objectStoreNames.contains('ships')) {
                        const shipStore = db.createObjectStore('ships', { keyPath: 'id', autoIncrement: true });
                        shipStore.createIndex('name', 'ship.name', { unique: false });
                        shipStore.createIndex('createdAt', 'createdAt', { unique: false });
                    }
                }
                // Version 2: Add unique constraint and clean up duplicates
                if (oldVersion < 2) {
                    const shipStore = transaction.objectStore('ships');
                    // First, clean up duplicate "Fat Trader" ships
                    await this.cleanupDuplicateFatTraders(shipStore);
                    // Delete the old non-unique index
                    if (shipStore.indexNames.contains('name')) {
                        shipStore.deleteIndex('name');
                    }
                    // Create new unique index for ship names
                    shipStore.createIndex('name', 'ship.name', { unique: true });
                }
            };
        });
    }
    async cleanupDuplicateFatTraders(shipStore) {
        return new Promise((resolve, reject) => {
            const nameIndex = shipStore.index('name');
            const request = nameIndex.getAll('Fat Trader');
            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                const fatTraders = request.result;
                if (fatTraders.length > 1) {
                    // Sort by creation date and keep the oldest one
                    fatTraders.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
                    // Delete all but the first (oldest) one
                    for (let i = 1; i < fatTraders.length; i++) {
                        shipStore.delete(fatTraders[i].id);
                    }
                }
                resolve();
            };
        });
    }
    async getAllShips() {
        if (!this.db)
            throw new Error('Database not initialized');
        logger.info('Loading all ships');
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['ships'], 'readonly');
            const store = transaction.objectStore('ships');
            const request = store.getAll();
            request.onerror = () => {
                logger.error('Failed to load ships', request.error);
                reject(request.error);
            };
            request.onsuccess = () => {
                const ships = request.result.map((ship) => ({
                    ...ship,
                    cargo: cleanInvalidCargo(ship.cargo),
                    createdAt: new Date(ship.createdAt),
                    updatedAt: new Date(ship.updatedAt)
                }));
                logger.info(`Loaded ${ships.length} ships`);
                resolve(ships);
            };
        });
    }
    async getShipById(id) {
        if (!this.db)
            throw new Error('Database not initialized');
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['ships'], 'readonly');
            const store = transaction.objectStore('ships');
            const request = store.get(id);
            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                const ship = request.result;
                if (ship) {
                    resolve({
                        ...ship,
                        cargo: cleanInvalidCargo(ship.cargo),
                        createdAt: new Date(ship.createdAt),
                        updatedAt: new Date(ship.updatedAt)
                    });
                }
                else {
                    resolve(null);
                }
            };
        });
    }
    async saveShip(shipDesign) {
        if (!this.db)
            throw new Error('Database not initialized');
        logger.info(`Saving ship "${shipDesign.ship.name}"`);
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['ships'], 'readwrite');
            const store = transaction.objectStore('ships');
            // Rely on the unique 'name' index to enforce uniqueness atomically; a duplicate
            // name surfaces as a ConstraintError on add(), avoiding a check-then-add race.
            const now = new Date();
            const shipToSave = {
                ...shipDesign,
                createdAt: now,
                updatedAt: now
            };
            const request = store.add(shipToSave);
            request.onerror = () => {
                if (request.error?.name === 'ConstraintError') {
                    const msg = `A ship named "${shipDesign.ship.name}" already exists. Please choose a different name.`;
                    logger.error(msg);
                    reject(new Error(msg));
                }
                else {
                    logger.error('Failed to save ship', request.error);
                    reject(request.error);
                }
            };
            request.onsuccess = () => {
                logger.info(`Ship saved with id ${request.result}`);
                resolve(request.result);
            };
        });
    }
    async updateShip(id, shipDesign) {
        if (!this.db)
            throw new Error('Database not initialized');
        logger.info(`Updating ship id=${id} "${shipDesign.ship.name}"`);
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['ships'], 'readwrite');
            const store = transaction.objectStore('ships');
            const getRequest = store.get(id);
            getRequest.onerror = () => reject(getRequest.error);
            getRequest.onsuccess = () => {
                const existingShip = getRequest.result;
                if (!existingShip) {
                    logger.error('Update failed: ship not found');
                    reject(new Error('Ship not found'));
                    return;
                }
                // Check if name is changing and if new name already exists
                if (existingShip.ship.name !== shipDesign.ship.name) {
                    const nameIndex = store.index('name');
                    const checkRequest = nameIndex.get(shipDesign.ship.name);
                    checkRequest.onerror = () => reject(checkRequest.error);
                    checkRequest.onsuccess = () => {
                        if (checkRequest.result) {
                            const msg = `A ship named "${shipDesign.ship.name}" already exists. Please choose a different name.`;
                            logger.error(msg);
                            reject(new Error(msg));
                            return;
                        }
                        // Name is unique, proceed with update
                        performUpdate();
                    };
                }
                else {
                    // Name hasn't changed, proceed with update
                    performUpdate();
                }
                function performUpdate() {
                    const updatedShip = {
                        ...shipDesign,
                        id,
                        createdAt: existingShip.createdAt,
                        updatedAt: new Date()
                    };
                    const putRequest = store.put(updatedShip);
                    putRequest.onerror = () => {
                        // Handle the case where the unique constraint fails at the database level
                        if (putRequest.error?.name === 'ConstraintError') {
                            const msg = `A ship named "${shipDesign.ship.name}" already exists. Please choose a different name.`;
                            logger.error(msg);
                            reject(new Error(msg));
                        }
                        else {
                            logger.error('Failed to update ship', putRequest.error);
                            reject(putRequest.error);
                        }
                    };
                    putRequest.onsuccess = () => {
                        logger.info('Ship updated');
                        resolve();
                    };
                }
            };
        });
    }
    async deleteShip(id) {
        if (!this.db)
            throw new Error('Database not initialized');
        logger.info(`Deleting ship id=${id}`);
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['ships'], 'readwrite');
            const store = transaction.objectStore('ships');
            const request = store.delete(id);
            request.onerror = () => {
                logger.error('Failed to delete ship', request.error);
                reject(request.error);
            };
            request.onsuccess = () => {
                logger.info('Ship deleted');
                resolve();
            };
        });
    }
    async hasAnyShips() {
        if (!this.db)
            throw new Error('Database not initialized');
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['ships'], 'readonly');
            const store = transaction.objectStore('ships');
            const request = store.count();
            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result > 0);
        });
    }
    async flushAllShips() {
        if (!this.db)
            throw new Error('Database not initialized');
        logger.info('Flushing all ships from database');
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['ships'], 'readwrite');
            const store = transaction.objectStore('ships');
            const request = store.clear();
            request.onerror = () => {
                logger.error('Failed to flush ships', request.error);
                reject(request.error);
            };
            request.onsuccess = () => {
                logger.info('All ships flushed');
                resolve();
            };
        });
    }
    async getShipByName(name) {
        if (!this.db)
            throw new Error('Database not initialized');
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['ships'], 'readonly');
            const store = transaction.objectStore('ships');
            const nameIndex = store.index('name');
            const request = nameIndex.get(name);
            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                const ship = request.result;
                if (ship) {
                    resolve({
                        ...ship,
                        cargo: cleanInvalidCargo(ship.cargo),
                        createdAt: new Date(ship.createdAt),
                        updatedAt: new Date(ship.updatedAt)
                    });
                }
                else {
                    resolve(null);
                }
            };
        });
    }
    async shipNameExists(name) {
        if (!this.db)
            throw new Error('Database not initialized');
        if (!name.trim())
            return false;
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['ships'], 'readonly');
            const store = transaction.objectStore('ships');
            const nameIndex = store.index('name');
            const request = nameIndex.get(name.trim());
            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(!!request.result);
        });
    }
    async saveOrUpdateShipByName(shipDesign) {
        if (!this.db)
            throw new Error('Database not initialized');
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['ships'], 'readwrite');
            const store = transaction.objectStore('ships');
            const nameIndex = store.index('name');
            const checkRequest = nameIndex.get(shipDesign.ship.name);
            checkRequest.onerror = () => reject(checkRequest.error);
            checkRequest.onsuccess = () => {
                const existingShip = checkRequest.result;
                if (existingShip) {
                    // Ship exists, update it
                    const updatedShip = {
                        ...shipDesign,
                        id: existingShip.id,
                        createdAt: existingShip.createdAt,
                        updatedAt: new Date()
                    };
                    const putRequest = store.put(updatedShip);
                    putRequest.onerror = () => reject(putRequest.error);
                    putRequest.onsuccess = () => resolve(existingShip.id);
                }
                else {
                    // Ship doesn't exist, create new one
                    const now = new Date();
                    const shipToSave = {
                        ...shipDesign,
                        createdAt: now,
                        updatedAt: now
                    };
                    const addRequest = store.add(shipToSave);
                    addRequest.onerror = () => reject(addRequest.error);
                    addRequest.onsuccess = () => resolve(addRequest.result);
                }
            };
        });
    }
}
export const databaseService = new DatabaseService();
