import type { ShipDesign } from '../types/ship';
import { cleanInvalidCargo } from '../data/constants';
import { logger } from '../utils/logger';

export interface StoredShipDesign extends ShipDesign {
  id: number;
  createdAt: Date;
  updatedAt: Date;
}

class DatabaseService {
  private db: IDBDatabase | null = null;
  private readonly dbName = 'StarshipDesignerDB';
  private readonly version = 3;

  async initialize(): Promise<void> {
    if (this.db) {
      logger.info('Database already initialized');
      return;
    }

    logger.info(`Opening database "${this.dbName}" v${this.version}`);

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => {
        logger.error('Failed to open database', request.error);
        reject(request.error);
      };
      request.onsuccess = () => {
        this.db = request.result;
        logger.info('Database initialized successfully');
        resolve();
      };

      // IMPORTANT: the versionchange transaction auto-commits once no requests
      // are pending, so all migration work must stay in synchronous code or
      // request callbacks — no async/await or foreign promises in here.
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        const transaction = (event.target as IDBOpenDBRequest).transaction!;
        const oldVersion = event.oldVersion;
        logger.info(`Upgrading database from v${oldVersion} to v${this.version}`);

        // Current schema: 'ship_ships' store (renamed from 'ships' in v3 so main
        // and capital branch records coexist in the same IndexedDB database).
        if (!db.objectStoreNames.contains('ship_ships')) {
          const newStore = db.createObjectStore('ship_ships', { keyPath: 'id', autoIncrement: true });
          newStore.createIndex('name', 'ship.name', { unique: true });
          newStore.createIndex('createdAt', 'createdAt', { unique: false });
        }

        // v1/v2 databases: migrate legacy 'ships' records (deduplicating names,
        // keeping the oldest — v1 lacked the unique name constraint).
        if (oldVersion >= 1 && oldVersion < 3 && db.objectStoreNames.contains('ships')) {
          const oldStore = transaction.objectStore('ships');
          const newStore = transaction.objectStore('ship_ships');
          const getAllRequest = oldStore.getAll();

          getAllRequest.onsuccess = () => {
            const records = getAllRequest.result as StoredShipDesign[];
            const oldestByName = new Map<string, StoredShipDesign>();
            for (const record of records) {
              const name = record.ship?.name;
              if (!name) continue;
              const existing = oldestByName.get(name);
              if (!existing || new Date(record.createdAt).getTime() < new Date(existing.createdAt).getTime()) {
                oldestByName.set(name, record);
              }
            }
            for (const record of oldestByName.values()) {
              newStore.add(record);
            }
            db.deleteObjectStore('ships');
            logger.info(`Migrated ${oldestByName.size} of ${records.length} legacy ship record(s) to ship_ships`);
          };
        }
      };
    });
  }

  async getAllShips(): Promise<StoredShipDesign[]> {
    if (!this.db) throw new Error('Database not initialized');

    logger.info('Loading all ships');
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['ship_ships'], 'readonly');
      const store = transaction.objectStore('ship_ships');
      const request = store.getAll();

      request.onerror = () => {
        logger.error('Failed to load ships', request.error);
        reject(request.error);
      };
      request.onsuccess = () => {
        const ships = request.result.map((ship: StoredShipDesign) => ({
          ...ship,
          cargo: cleanInvalidCargo(ship.cargo),
          modular_cutter_modules: ship.modular_cutter_modules || [],
          createdAt: new Date(ship.createdAt),
          updatedAt: new Date(ship.updatedAt)
        }));
        logger.info(`Loaded ${ships.length} ships`);
        resolve(ships);
      };
    });
  }

  async getShipById(id: number): Promise<StoredShipDesign | null> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['ship_ships'], 'readonly');
      const store = transaction.objectStore('ship_ships');
      const request = store.get(id);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const ship = request.result;
        if (ship) {
          resolve({
            ...ship,
            cargo: cleanInvalidCargo(ship.cargo),
            modular_cutter_modules: ship.modular_cutter_modules || [],
            createdAt: new Date(ship.createdAt),
            updatedAt: new Date(ship.updatedAt)
          });
        } else {
          resolve(null);
        }
      };
    });
  }

  async saveShip(shipDesign: ShipDesign): Promise<number> {
    if (!this.db) throw new Error('Database not initialized');

    logger.info(`Saving ship "${shipDesign.ship.name}"`);
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['ship_ships'], 'readwrite');
      const store = transaction.objectStore('ship_ships');

      // First check if a ship with this name already exists
      const nameIndex = store.index('name');
      const checkRequest = nameIndex.get(shipDesign.ship.name);

      checkRequest.onerror = () => {
        logger.error(`Failed to check name for "${shipDesign.ship.name}"`, checkRequest.error);
        reject(checkRequest.error);
      };
      checkRequest.onsuccess = () => {
        if (checkRequest.result) {
          const err = new Error(`A ship named "${shipDesign.ship.name}" already exists. Please choose a different name.`);
          logger.error(err.message);
          reject(err);
          return;
        }

        // Name is unique, proceed with saving
        const now = new Date();
        const shipToSave = {
          ...shipDesign,
          createdAt: now,
          updatedAt: now
        };

        const request = store.add(shipToSave);

        request.onerror = () => {
          // Handle the case where the unique constraint fails at the database level
          if (request.error?.name === 'ConstraintError') {
            const err = new Error(`A ship named "${shipDesign.ship.name}" already exists. Please choose a different name.`);
            logger.error(err.message);
            reject(err);
          } else {
            logger.error(`Failed to save ship "${shipDesign.ship.name}"`, request.error);
            reject(request.error);
          }
        };
        request.onsuccess = () => {
          logger.info(`Ship "${shipDesign.ship.name}" saved with id ${request.result}`);
          resolve(request.result as number);
        };
      };
    });
  }

  async updateShip(id: number, shipDesign: ShipDesign): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    logger.info(`Updating ship id=${id} "${shipDesign.ship.name}"`);
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['ship_ships'], 'readwrite');
      const store = transaction.objectStore('ship_ships');

      const getRequest = store.get(id);

      getRequest.onerror = () => {
        logger.error(`Failed to fetch ship id=${id} for update`, getRequest.error);
        reject(getRequest.error);
      };
      getRequest.onsuccess = () => {
        const existingShip = getRequest.result;
        if (!existingShip) {
          logger.error(`Update failed: ship id=${id} not found`);
          reject(new Error('Ship not found'));
          return;
        }

        // Check if name is changing and if new name already exists
        if (existingShip.ship.name !== shipDesign.ship.name) {
          const nameIndex = store.index('name');
          const checkRequest = nameIndex.get(shipDesign.ship.name);
          
          checkRequest.onerror = () => {
            logger.error(`Failed to check name "${shipDesign.ship.name}" during update`, checkRequest.error);
            reject(checkRequest.error);
          };
          checkRequest.onsuccess = () => {
            if (checkRequest.result) {
              const err = new Error(`A ship named "${shipDesign.ship.name}" already exists. Please choose a different name.`);
              logger.error(err.message);
              reject(err);
              return;
            }

            // Name is unique, proceed with update
            performUpdate();
          };
        } else {
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
              const err = new Error(`A ship named "${shipDesign.ship.name}" already exists. Please choose a different name.`);
              logger.error(err.message);
              reject(err);
            } else {
              logger.error(`Failed to update ship id=${id}`, putRequest.error);
              reject(putRequest.error);
            }
          };
          putRequest.onsuccess = () => {
            logger.info(`Ship id=${id} "${shipDesign.ship.name}" updated`);
            resolve();
          };
        }
      };
    });
  }

  async deleteShip(id: number): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    logger.info(`Deleting ship id=${id}`);
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['ship_ships'], 'readwrite');
      const store = transaction.objectStore('ship_ships');
      const request = store.delete(id);

      request.onerror = () => {
        logger.error(`Failed to delete ship id=${id}`, request.error);
        reject(request.error);
      };
      request.onsuccess = () => {
        logger.info(`Ship id=${id} deleted`);
        resolve();
      };
    });
  }

  async hasAnyShips(): Promise<boolean> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['ship_ships'], 'readonly');
      const store = transaction.objectStore('ship_ships');
      const request = store.count();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result > 0);
    });
  }

  async flushAllShips(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    logger.info('Flushing all ships from database');
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['ship_ships'], 'readwrite');
      const store = transaction.objectStore('ship_ships');
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

  async getShipByName(name: string): Promise<StoredShipDesign | null> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['ship_ships'], 'readonly');
      const store = transaction.objectStore('ship_ships');
      const nameIndex = store.index('name');
      const request = nameIndex.get(name);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const ship = request.result;
        if (ship) {
          resolve({
            ...ship,
            cargo: cleanInvalidCargo(ship.cargo),
            modular_cutter_modules: ship.modular_cutter_modules || [],
            createdAt: new Date(ship.createdAt),
            updatedAt: new Date(ship.updatedAt)
          });
        } else {
          resolve(null);
        }
      };
    });
  }

  async shipNameExists(name: string): Promise<boolean> {
    if (!this.db) throw new Error('Database not initialized');
    if (!name.trim()) return false;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['ship_ships'], 'readonly');
      const store = transaction.objectStore('ship_ships');
      const nameIndex = store.index('name');
      const request = nameIndex.get(name.trim());

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(!!request.result);
    });
  }

  async saveOrUpdateShipByName(shipDesign: ShipDesign): Promise<number> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['ship_ships'], 'readwrite');
      const store = transaction.objectStore('ship_ships');
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
        } else {
          // Ship doesn't exist, create new one
          const now = new Date();
          const shipToSave = {
            ...shipDesign,
            createdAt: now,
            updatedAt: now
          };

          const addRequest = store.add(shipToSave);
          addRequest.onerror = () => reject(addRequest.error);
          addRequest.onsuccess = () => resolve(addRequest.result as number);
        }
      };
    });
  }
}

export const databaseService = new DatabaseService();