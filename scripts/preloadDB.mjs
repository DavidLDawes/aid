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

const INPUT_DIR = resolve(projectRoot, 'data-dumps');
const INPUT_FILE = resolve(INPUT_DIR, 'ships-export.json');

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

  async getShipByName(name) {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['ship_ships'], 'readonly');
      const store = transaction.objectStore('ship_ships');
      const nameIndex = store.index('name');
      const request = nameIndex.get(name);

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

  async deleteShip(id) {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['ship_ships'], 'readwrite');
      const store = transaction.objectStore('ship_ships');
      const request = store.delete(id);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async saveShip(shipDesign) {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['ship_ships'], 'readwrite');
      const store = transaction.objectStore('ship_ships');
      
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

async function preloadDatabase() {
  try {
    console.log('🚀 Starting database preload...');
    
    try {
      await fs.access(INPUT_FILE);
    } catch (error) {
      console.error(`❌ Export file not found: ${INPUT_FILE}`);
      console.log('💡 Run "npm run extractDB" first to create the export file');
      process.exit(1);
    }
    
    const exportDataText = await fs.readFile(INPUT_FILE, 'utf8');
    let exportData;
    
    try {
      exportData = JSON.parse(exportDataText);
    } catch (error) {
      console.error('❌ Failed to parse export file:', error);
      process.exit(1);
    }
    
    if (!exportData.ships || !Array.isArray(exportData.ships)) {
      console.error('❌ Invalid export file format: missing ships array');
      process.exit(1);
    }
    
    console.log(`📦 Found ${exportData.ships.length} ships in export file`);
    console.log(`📅 Export date: ${exportData.exportDate}`);
    console.log(`📋 Export version: ${exportData.version}`);
    
    if (exportData.ships.length === 0) {
      console.log('⚠️  No ships in export file. Nothing to import.');
      return;
    }
    
    const dbService = new NodeDatabaseService();
    await dbService.initialize();
    console.log('✅ Database initialized');
    
    let imported = 0;
    let updated = 0;
    let errors = 0;
    
    for (const shipData of exportData.ships) {
      try {
        const { _metadata, ...shipDesign } = shipData;
        
        const existingShip = await dbService.getShipByName(shipDesign.ship.name);
        
        if (existingShip) {
          await dbService.deleteShip(existingShip.id);
          console.log(`🔄 Deleted existing ship: ${shipDesign.ship.name}`);
          updated++;
        } else {
          imported++;
        }
        
        await dbService.saveShip(shipDesign);
        console.log(`✅ Imported: ${shipDesign.ship.name} (${shipDesign.ship.tonnage} tons, TL${shipDesign.ship.tech_level})`);
        
      } catch (error) {
        console.error(`❌ Failed to import ship "${shipData.ship?.name || 'Unknown'}":`, error.message);
        errors++;
      }
    }
    
    console.log('\n📊 Import Summary:');
    console.log(`   📥 New ships imported: ${imported}`);
    console.log(`   🔄 Existing ships updated: ${updated}`);
    console.log(`   ❌ Errors: ${errors}`);
    console.log(`   📦 Total processed: ${exportData.ships.length}`);
    
    if (errors > 0) {
      console.log('\n⚠️  Some ships failed to import. Check the error messages above.');
      process.exit(1);
    } else {
      console.log('\n🎉 Database preload completed successfully!');
    }
    
  } catch (error) {
    console.error('❌ Error during database preload:', error);
    process.exit(1);
  }
}

preloadDatabase();