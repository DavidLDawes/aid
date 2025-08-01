import type { ShipDesign } from '../types/ship';

export interface StoredShipDesign extends ShipDesign {
  id: number;
  createdAt: Date;
  updatedAt: Date;
}

class DatabaseService {
  private db: IDBDatabase | null = null;
  private readonly dbName = 'StarshipDesignerDB';
  private readonly version = 1;

  async initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        if (!db.objectStoreNames.contains('ships')) {
          const shipStore = db.createObjectStore('ships', { keyPath: 'id', autoIncrement: true });
          shipStore.createIndex('name', 'ship.name', { unique: false });
          shipStore.createIndex('createdAt', 'createdAt', { unique: false });
        }
      };
    });
  }

  async getAllShips(): Promise<StoredShipDesign[]> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['ships'], 'readonly');
      const store = transaction.objectStore('ships');
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const ships = request.result.map((ship: StoredShipDesign) => ({
          ...ship,
          createdAt: new Date(ship.createdAt),
          updatedAt: new Date(ship.updatedAt)
        }));
        resolve(ships);
      };
    });
  }

  async getShipById(id: number): Promise<StoredShipDesign | null> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['ships'], 'readonly');
      const store = transaction.objectStore('ships');
      const request = store.get(id);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const ship = request.result;
        if (ship) {
          resolve({
            ...ship,
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

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['ships'], 'readwrite');
      const store = transaction.objectStore('ships');
      
      const now = new Date();
      const shipToSave = {
        ...shipDesign,
        createdAt: now,
        updatedAt: now
      };

      const request = store.add(shipToSave);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result as number);
    });
  }

  async updateShip(id: number, shipDesign: ShipDesign): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['ships'], 'readwrite');
      const store = transaction.objectStore('ships');
      
      const getRequest = store.get(id);
      
      getRequest.onerror = () => reject(getRequest.error);
      getRequest.onsuccess = () => {
        const existingShip = getRequest.result;
        if (!existingShip) {
          reject(new Error('Ship not found'));
          return;
        }

        const updatedShip = {
          ...shipDesign,
          id,
          createdAt: existingShip.createdAt,
          updatedAt: new Date()
        };

        const putRequest = store.put(updatedShip);
        putRequest.onerror = () => reject(putRequest.error);
        putRequest.onsuccess = () => resolve();
      };
    });
  }

  async deleteShip(id: number): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['ships'], 'readwrite');
      const store = transaction.objectStore('ships');
      const request = store.delete(id);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async hasAnyShips(): Promise<boolean> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['ships'], 'readonly');
      const store = transaction.objectStore('ships');
      const request = store.count();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result > 0);
    });
  }
}

export const databaseService = new DatabaseService();