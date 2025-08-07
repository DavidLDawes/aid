#!/usr/bin/env node

// Test script for prepopulate functionality
import { promises as fs } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');

const TEST_DATA_DIR = resolve(projectRoot, 'data-dumps');
const TEST_DATA_FILE = resolve(TEST_DATA_DIR, 'ships-export.json');

// Create test data for setInitialDB
const testShipsData = {
  exportDate: new Date().toISOString(),
  version: '1.0',
  ships: [
    {
      ship: {
        name: 'Scout',
        tech_level: 'A',
        tonnage: 100,
        configuration: 'standard',
        fuel_weeks: 2,
        missile_reloads: 0,
        sand_reloads: 0,
        description: 'Fast patrol ship'
      },
      engines: [
        {
          engine_type: 'power_plant',
          drive_code: 'A',
          performance: 2,
          mass: 4,
          cost: 8
        },
        {
          engine_type: 'jump_drive',
          drive_code: 'A',
          performance: 2,
          mass: 10,
          cost: 20
        },
        {
          engine_type: 'maneuver_drive',
          drive_code: 'A',
          performance: 2,
          mass: 2,
          cost: 4
        }
      ],
      fittings: [
        {
          fitting_type: 'bridge',
          mass: 10,
          cost: 2
        },
        {
          fitting_type: 'comms_sensors',
          comms_sensors_type: 'standard',
          mass: 0,
          cost: 0
        }
      ],
      weapons: [],
      defenses: [],
      berths: [
        {
          berth_type: 'staterooms',
          quantity: 2,
          mass: 4,
          cost: 1
        }
      ],
      facilities: [],
      cargo: [
        {
          cargo_type: 'cargo_bay',
          tonnage: 44,
          cost: 0
        }
      ],
      vehicles: [],
      drones: [],
      _metadata: {
        originalId: 1,
        originalCreatedAt: '2025-08-05T17:00:00.000Z',
        originalUpdatedAt: '2025-08-05T17:00:00.000Z'
      }
    },
    {
      ship: {
        name: 'Free Trader',
        tech_level: 'A',
        tonnage: 200,
        configuration: 'standard',
        fuel_weeks: 2,
        missile_reloads: 0,
        sand_reloads: 0,
        description: 'Merchant vessel'
      },
      engines: [
        {
          engine_type: 'power_plant',
          drive_code: 'A',
          performance: 1,
          mass: 4,
          cost: 8
        },
        {
          engine_type: 'jump_drive',
          drive_code: 'A',
          performance: 1,
          mass: 10,
          cost: 20
        },
        {
          engine_type: 'maneuver_drive',
          drive_code: 'A',
          performance: 1,
          mass: 2,
          cost: 4
        }
      ],
      fittings: [
        {
          fitting_type: 'bridge',
          mass: 10,
          cost: 2
        },
        {
          fitting_type: 'comms_sensors',
          comms_sensors_type: 'standard',
          mass: 0,
          cost: 0
        }
      ],
      weapons: [],
      defenses: [],
      berths: [
        {
          berth_type: 'staterooms',
          quantity: 5,
          mass: 4,
          cost: 1
        }
      ],
      facilities: [],
      cargo: [
        {
          cargo_type: 'cargo_bay',
          tonnage: 132,
          cost: 0
        }
      ],
      vehicles: [],
      drones: [],
      _metadata: {
        originalId: 2,
        originalCreatedAt: '2025-08-05T17:00:00.000Z',
        originalUpdatedAt: '2025-08-05T17:00:00.000Z'
      }
    }
  ]
};

async function createTestData() {
  try {
    console.log('📝 Creating test data for setInitialDB...');
    
    // Create the data-dumps directory if it doesn't exist
    await fs.mkdir(TEST_DATA_DIR, { recursive: true });
    
    // Write test data
    await fs.writeFile(TEST_DATA_FILE, JSON.stringify(testShipsData, null, 2), 'utf8');
    
    console.log('✅ Test data created successfully!');
    console.log(`📁 File: ${TEST_DATA_FILE}`);
    console.log(`📦 Ships: ${testShipsData.ships.length}`);
    
    // Now we can run the setInitialDB command
    console.log('\n🚀 Running setInitialDB...');
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);
    
    await execAsync('npm run setInitialDB');
    
  } catch (error) {
    console.error('❌ Error creating test data:', error);
    process.exit(1);
  }
}

createTestData();