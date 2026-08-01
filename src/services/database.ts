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
  private readonly storeName = 'mega_ships';
  private readonly version = 3;

  async initialize(): Promise<void> {
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

      // IMPORTANT: the versionchange transaction auto-commits once no requests
      // are pending, so all migration work must stay in synchronous code or
      // request callbacks — no async/await or foreign promises in here.
      //
      // The legacy 'ships' store (v1/v2) is shared with the main Starship
      // Designer app at the same origin (srd-tools.com) and historically held
      // both apps' ships commingled with no way to tell them apart by data
      // alone. Megastructures now live in their own 'mega_ships' store so
      // future records never collide, and a schema bump in either app never
      // forces the other to open a database version it doesn't understand.
      // We deliberately do NOT read from or delete the legacy 'ships' store
      // here: this app cannot reliably tell which of those records are its
      // own, and main is responsible for migrating its own data out of it.
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        const oldVersion = event.oldVersion;
        logger.info(`Upgrading database from v${oldVersion} to v${this.version}`);

        if (!db.objectStoreNames.contains(this.storeName)) {
          const shipStore = db.createObjectStore(this.storeName, { keyPath: 'id', autoIncrement: true });
          shipStore.createIndex('name', 'ship.name', { unique: true });
          shipStore.createIndex('createdAt', 'createdAt', { unique: false });
        }
      };
    });
  }

  async getAllShips(): Promise<StoredShipDesign[]> {
    if (!this.db) throw new Error('Database not initialized');
    logger.info('Loading all ships');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.getAll();

      request.onerror = () => {
        logger.error('Failed to load ships', request.error);
        reject(request.error);
      };
      request.onsuccess = () => {
        const ships = request.result.map((ship: StoredShipDesign) => ({
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

  async getShipById(id: number): Promise<StoredShipDesign | null> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
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
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);

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
        } else {
          logger.error('Failed to save ship', request.error);
          reject(request.error);
        }
      };
      request.onsuccess = () => {
        logger.info(`Ship saved with id ${request.result}`);
        resolve(request.result as number);
      };
    });
  }

  async updateShip(id: number, shipDesign: ShipDesign): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    logger.info(`Updating ship id=${id} "${shipDesign.ship.name}"`);

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);

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
              const msg = `A ship named "${shipDesign.ship.name}" already exists. Please choose a different name.`;
              logger.error(msg);
              reject(new Error(msg));
            } else {
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

  async deleteShip(id: number): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    logger.info(`Deleting ship id=${id}`);

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
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

  async hasAnyShips(): Promise<boolean> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.count();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result > 0);
    });
  }

  async flushAllShips(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    logger.info('Flushing all ships from database');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
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
      const transaction = this.db!.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
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
      const transaction = this.db!.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const nameIndex = store.index('name');
      const request = nameIndex.get(name.trim());

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(!!request.result);
    });
  }

  async saveOrUpdateShipByName(shipDesign: ShipDesign): Promise<number> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
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