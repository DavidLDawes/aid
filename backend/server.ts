import express from 'express';
import cors from 'cors';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'whuUd-23my-secret',
  database: process.env.DB_NAME || 'starship_designer'
};

let db: mysql.Connection;

async function initDatabase() {
  try {
    db = await mysql.createConnection(dbConfig);
    console.log('Connected to MySQL database');
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
}

// Ship routes
app.get('/api/ships', async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT id, name, tech_level, tonnage, configuration, description, created_at FROM ships ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching ships:', error);
    res.status(500).json({ error: 'Failed to fetch ships' });
  }
});

app.get('/api/ships/:id', async (req, res) => {
  try {
    const shipId = req.params.id;
    
    // Get ship basic info
    const [shipRows] = await db.execute('SELECT * FROM ships WHERE id = ?', [shipId]);
    if ((shipRows as any[]).length === 0) {
      return res.status(404).json({ error: 'Ship not found' });
    }
    
    const ship = (shipRows as any[])[0];
    
    // Get all components
    const [engines] = await db.execute('SELECT * FROM engines WHERE ship_id = ?', [shipId]);
    const [fittings] = await db.execute('SELECT * FROM fittings WHERE ship_id = ?', [shipId]);
    const [weapons] = await db.execute('SELECT * FROM weapons WHERE ship_id = ?', [shipId]);
    const [defenses] = await db.execute('SELECT * FROM defenses WHERE ship_id = ?', [shipId]);
    const [berths] = await db.execute('SELECT * FROM berths WHERE ship_id = ?', [shipId]);
    const [facilities] = await db.execute('SELECT * FROM facilities WHERE ship_id = ?', [shipId]);
    const [cargo] = await db.execute('SELECT * FROM cargo WHERE ship_id = ?', [shipId]);
    const [vehicles] = await db.execute('SELECT * FROM vehicles WHERE ship_id = ?', [shipId]);
    const [drones] = await db.execute('SELECT * FROM drones WHERE ship_id = ?', [shipId]);
    
    const fullShip = {
      ...ship,
      engines,
      fittings,
      weapons,
      defenses,
      berths,
      facilities,
      cargo,
      vehicles,
      drones
    };
    
    res.json(fullShip);
  } catch (error) {
    console.error('Error fetching ship:', error);
    res.status(500).json({ error: 'Failed to fetch ship' });
  }
});

app.post('/api/ships', async (req, res) => {
  try {
    const { ship, engines, fittings, weapons, defenses, berths, facilities, cargo, vehicles, drones } = req.body;
    
    // Start transaction
    await db.beginTransaction();
    
    try {
      // Insert ship
      const [shipResult] = await db.execute(
        'INSERT INTO ships (name, tech_level, tonnage, configuration, description) VALUES (?, ?, ?, ?, ?)',
        [ship.name, ship.tech_level, ship.tonnage, ship.configuration, ship.description || null]
      );
      
      const shipId = (shipResult as any).insertId;
      
      // Insert engines
      if (engines && engines.length > 0) {
        for (const engine of engines) {
          await db.execute(
            'INSERT INTO engines (ship_id, engine_type, drive_code, performance, mass, cost) VALUES (?, ?, ?, ?, ?, ?)',
            [shipId, engine.engine_type, engine.drive_code, engine.performance, engine.mass, engine.cost]
          );
        }
      }
      
      // Insert fittings
      if (fittings && fittings.length > 0) {
        for (const fitting of fittings) {
          await db.execute(
            'INSERT INTO fittings (ship_id, fitting_type, mass, cost, launch_vehicle_mass) VALUES (?, ?, ?, ?, ?)',
            [shipId, fitting.fitting_type, fitting.mass, fitting.cost, fitting.launch_vehicle_mass || null]
          );
        }
      }
      
      // Insert weapons
      if (weapons && weapons.length > 0) {
        for (const weapon of weapons) {
          await db.execute(
            'INSERT INTO weapons (ship_id, weapon_name, mass, cost, quantity) VALUES (?, ?, ?, ?, ?)',
            [shipId, weapon.weapon_name, weapon.mass, weapon.cost, weapon.quantity]
          );
        }
      }
      
      // Insert defenses
      if (defenses && defenses.length > 0) {
        for (const defense of defenses) {
          await db.execute(
            'INSERT INTO defenses (ship_id, defense_type, mass, cost, quantity) VALUES (?, ?, ?, ?, ?)',
            [shipId, defense.defense_type, defense.mass, defense.cost, defense.quantity]
          );
        }
      }
      
      // Insert berths
      if (berths && berths.length > 0) {
        for (const berth of berths) {
          await db.execute(
            'INSERT INTO berths (ship_id, berth_type, quantity, mass, cost) VALUES (?, ?, ?, ?, ?)',
            [shipId, berth.berth_type, berth.quantity, berth.mass, berth.cost]
          );
        }
      }
      
      // Insert facilities
      if (facilities && facilities.length > 0) {
        for (const facility of facilities) {
          await db.execute(
            'INSERT INTO facilities (ship_id, facility_type, quantity, mass, cost) VALUES (?, ?, ?, ?, ?)',
            [shipId, facility.facility_type, facility.quantity, facility.mass, facility.cost]
          );
        }
      }
      
      // Insert cargo
      if (cargo && cargo.length > 0) {
        for (const cargoItem of cargo) {
          await db.execute(
            'INSERT INTO cargo (ship_id, cargo_type, tonnage, cost) VALUES (?, ?, ?, ?)',
            [shipId, cargoItem.cargo_type, cargoItem.tonnage, cargoItem.cost]
          );
        }
      }
      
      // Insert vehicles
      if (vehicles && vehicles.length > 0) {
        for (const vehicle of vehicles) {
          await db.execute(
            'INSERT INTO vehicles (ship_id, vehicle_type, quantity, mass, cost) VALUES (?, ?, ?, ?, ?)',
            [shipId, vehicle.vehicle_type, vehicle.quantity, vehicle.mass, vehicle.cost]
          );
        }
      }
      
      // Insert drones
      if (drones && drones.length > 0) {
        for (const drone of drones) {
          await db.execute(
            'INSERT INTO drones (ship_id, drone_type, quantity, mass, cost) VALUES (?, ?, ?, ?, ?)',
            [shipId, drone.drone_type, drone.quantity, drone.mass, drone.cost]
          );
        }
      }
      
      await db.commit();
      res.json({ id: shipId, message: 'Ship saved successfully' });
      
    } catch (error) {
      await db.rollback();
      throw error;
    }
    
  } catch (error) {
    console.error('Error saving ship:', error);
    res.status(500).json({ error: 'Failed to save ship' });
  }
});

app.delete('/api/ships/:id', async (req, res) => {
  try {
    const shipId = req.params.id;
    await db.execute('DELETE FROM ships WHERE id = ?', [shipId]);
    res.json({ message: 'Ship deleted successfully' });
  } catch (error) {
    console.error('Error deleting ship:', error);
    res.status(500).json({ error: 'Failed to delete ship' });
  }
});

app.listen(PORT, async () => {
  await initDatabase();
  console.log(`Server running on port ${PORT}`);
});
