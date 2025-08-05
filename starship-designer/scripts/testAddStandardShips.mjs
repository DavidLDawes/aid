#!/usr/bin/env node

// Import fake-indexeddb for Node.js environment
import fakeIndexedDB from 'fake-indexeddb/lib/fakeIndexedDB';
import FDBKeyRange from 'fake-indexeddb/lib/FDBKeyRange';

// Setup global indexedDB for Node.js
global.indexedDB = fakeIndexedDB;
global.IDBKeyRange = FDBKeyRange;

// Standard ships data (simplified)
const STANDARD_SHIPS = [
  {
    ship: {
      name: 'Test Scout',
      tech_level: 'A',
      tonnage: 100,
      configuration: 'standard',
      fuel_weeks: 2,
      missile_reloads: 0,
      sand_reloads: 0,
      description: 'Test scout ship'
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
  },
  {
    ship: {
      name: 'Test Trader',
      tech_level: 'A',
      tonnage: 200,
      configuration: 'standard',
      fuel_weeks: 2,
      missile_reloads: 0,
      sand_reloads: 0,
      description: 'Test trading vessel'
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
  }
];

class NodeDatabaseService {
  constructor() {
    this.db = null;
    this.dbName = 'StarshipDesignerDB';
    this.version = 2;
  }

  async initialize() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        const oldVersion = event.oldVersion;

        if (oldVersion < 1) {
          if (!db.objectStoreNames.contains('ships')) {
            const shipStore = db.createObjectStore('ships', { keyPath: 'id', autoIncrement: true });
            shipStore.createIndex('name', 'ship.name', { unique: false });
            shipStore.createIndex('createdAt', 'createdAt', { unique: false });
          }
        }

        if (oldVersion < 2) {
          const transaction = event.target.transaction;
          const shipStore = transaction.objectStore('ships');
          
          if (shipStore.indexNames.contains('name')) {
            shipStore.deleteIndex('name');
          }
          
          shipStore.createIndex('name', 'ship.name', { unique: true });
        }
      };
    });
  }

  async saveShip(shipDesign) {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['ships'], 'readwrite');
      const store = transaction.objectStore('ships');
      
      const now = new Date();
      const shipToSave = {
        ...shipDesign,
        createdAt: now,
        updatedAt: now
      };

      const request = store.add(shipToSave);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }
}

async function addTestShips() {
  try {
    console.log('🚀 Adding test ships to database...');
    
    const dbService = new NodeDatabaseService();
    await dbService.initialize();
    console.log('✅ Database initialized');
    
    for (const ship of STANDARD_SHIPS) {
      try {
        await dbService.saveShip(ship);
        console.log(`✅ Added: ${ship.ship.name}`);
      } catch (error) {
        console.error(`❌ Failed to add ${ship.ship.name}:`, error.message);
      }
    }
    
    console.log('🎉 Test ships added successfully!');
    
  } catch (error) {
    console.error('❌ Error adding test ships:', error);
    process.exit(1);
  }
}

addTestShips();