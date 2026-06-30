#!/usr/bin/env node

import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

// Import fake-indexeddb for Node.js environment
import fakeIndexedDB from 'fake-indexeddb/lib/fakeIndexedDB';
import FDBKeyRange from 'fake-indexeddb/lib/FDBKeyRange';

// Setup global indexedDB for Node.js
global.indexedDB = fakeIndexedDB;
global.IDBKeyRange = FDBKeyRange;

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');

// Simple database service implementation for Node.js
class NodeDatabaseService {
  constructor() {
    this.db = null;
    this.dbName = 'StarshipDesignerDB';
    this.version = 3;
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

        if (oldVersion < 3) {
          if (!db.objectStoreNames.contains('ship_ships')) {
            const newStore = db.createObjectStore('ship_ships', { keyPath: 'id', autoIncrement: true });
            newStore.createIndex('name', 'ship.name', { unique: true });
            newStore.createIndex('createdAt', 'createdAt', { unique: false });
          }
          if (db.objectStoreNames.contains('ships')) {
            db.deleteObjectStore('ships');
          }
        }
      };
    });
  }

  async getAllShips() {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['ship_ships'], 'readonly');
      const store = transaction.objectStore('ship_ships');
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  async flushAllShips() {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['ship_ships'], 'readwrite');
      const store = transaction.objectStore('ship_ships');
      const request = store.clear();

      transaction.onerror = () => reject(transaction.error);
      transaction.onsuccess = () => resolve();
    });
  }
}

async function flushDatabase() {
  try {
    console.log('🧹 Starting database flush...');
    
    const dbService = new NodeDatabaseService();
    await dbService.initialize();
    console.log('✅ Database initialized');
    
    // Get ship count before flushing
    const shipsBefore = await dbService.getAllShips();
    console.log(`📦 Found ${shipsBefore.length} ships in database`);
    
    if (shipsBefore.length === 0) {
      console.log('ℹ️  Database is already empty. Nothing to flush.');
      return;
    }
    
    // List ships before flushing
    console.log('🗂️  Ships to be deleted:');
    shipsBefore.forEach((ship, index) => {
      console.log(`   ${index + 1}. ${ship.ship.name} (${ship.ship.tonnage} tons, TL${ship.ship.tech_level})`);
    });
    
    // Flush the database
    await dbService.flushAllShips();
    console.log('🗑️  All ships deleted from database');
    
    // Verify database is empty
    const shipsAfter = await dbService.getAllShips();
    console.log(`✅ Database flush complete! Ships remaining: ${shipsAfter.length}`);
    
    if (shipsAfter.length === 0) {
      console.log('🎉 Database successfully flushed!');
    } else {
      console.log(`⚠️  Warning: ${shipsAfter.length} ships still remain in database`);
    }
    
  } catch (error) {
    console.error('❌ Error during database flush:', error);
    process.exit(1);
  }
}

flushDatabase();