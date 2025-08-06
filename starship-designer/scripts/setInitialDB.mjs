#!/usr/bin/env node

import { promises as fs } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');

const EXPORT_DIR = resolve(projectRoot, 'data-dumps');
const EXPORT_FILE = resolve(EXPORT_DIR, 'ships-export.json');
const INITIAL_DATA_DIR = resolve(projectRoot, 'public');
const INITIAL_DATA_FILE = resolve(INITIAL_DATA_DIR, 'initial-ships.json');

async function setInitialDB() {
  try {
    console.log('🚀 Setting up initial database...');
    
    // Step 1: Run extractDB command
    console.log('📤 Running extractDB to export current ships...');
    await execAsync('npm run extractDB');
    console.log('✅ Database extracted successfully');
    
    // Step 2: Check if export file exists and has content
    try {
      await fs.access(EXPORT_FILE);
    } catch (error) {
      console.error('❌ No export file found. Make sure you have ships in the database first.');
      console.log('💡 Add some ships to the database and run this command again.');
      process.exit(1);
    }
    
    // Step 3: Read the exported data
    const exportData = JSON.parse(await fs.readFile(EXPORT_FILE, 'utf8'));
    
    if (!exportData.ships || exportData.ships.length === 0) {
      console.error('❌ No ships found in export file.');
      console.log('💡 Add some ships to the database and run this command again.');
      process.exit(1);
    }
    
    console.log(`📦 Found ${exportData.ships.length} ships to use as initial data`);
    
    // Step 4: Ensure the public directory exists (it should already exist)
    await fs.mkdir(INITIAL_DATA_DIR, { recursive: true });
    
    // Step 5: Copy the export data to the initial data location
    await fs.writeFile(INITIAL_DATA_FILE, JSON.stringify(exportData, null, 2), 'utf8');
    
    console.log('✅ Initial database setup completed!');
    console.log(`📁 Initial data saved to: ${INITIAL_DATA_FILE}`);
    console.log('📋 Ships included:');
    
    exportData.ships.forEach((ship, index) => {
      console.log(`   ${index + 1}. ${ship.ship.name} (${ship.ship.tonnage} tons, TL${ship.ship.tech_level})`);
    });
    
    console.log('');
    console.log('🎉 The app will now automatically load these ships when starting with an empty database!');
    
  } catch (error) {
    console.error('❌ Error setting up initial database:', error);
    process.exit(1);
  }
}

setInitialDB();