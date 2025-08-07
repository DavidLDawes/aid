#!/usr/bin/env node

import { promises as fs } from 'fs';
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

const OUTPUT_DIR = resolve(projectRoot, 'data-dumps');
const OUTPUT_FILE = resolve(OUTPUT_DIR, 'ships-export.json');

// Simple database service implementation for Node.js
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

  async getAllShips() {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['ships'], 'readonly');
      const store = transaction.objectStore('ships');
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const ships = request.result.map(ship => ({
          ...ship,
          createdAt: new Date(ship.createdAt),
          updatedAt: new Date(ship.updatedAt)
        }));
        resolve(ships);
      };
    });
  }
}

async function extractDatabase() {
  try {
    console.log('🚀 Starting database extraction...');
    
    const dbService = new NodeDatabaseService();
    await dbService.initialize();
    console.log('✅ Database initialized');
    
    const ships = await dbService.getAllShips();
    console.log(`📦 Found ${ships.length} ships in database`);
    
    if (ships.length === 0) {
      console.log('⚠️  No ships found in database. Nothing to extract.');
      return;
    }
    
    await fs.mkdir(OUTPUT_DIR, { recursive: true });
    
    const exportData = {
      exportDate: new Date().toISOString(),
      version: '1.0',
      ships: ships.map(ship => {
        const { id, createdAt, updatedAt, ...shipDesign } = ship;
        return {
          ...shipDesign,
          _metadata: {
            originalId: id,
            originalCreatedAt: createdAt.toISOString(),
            originalUpdatedAt: updatedAt.toISOString()
          }
        };
      })
    };
    
    await fs.writeFile(OUTPUT_FILE, JSON.stringify(exportData, null, 2), 'utf8');
    
    console.log(`✅ Database extracted successfully!`);
    console.log(`📁 Output file: ${OUTPUT_FILE}`);
    console.log(`📊 Exported ${exportData.ships.length} ships`);
    
    exportData.ships.forEach((ship, index) => {
      console.log(`   ${index + 1}. ${ship.ship.name} (${ship.ship.tonnage} tons, TL${ship.ship.tech_level})`);
    });
    
  } catch (error) {
    console.error('❌ Error during database extraction:', error);
    process.exit(1);
  }
}

extractDatabase();