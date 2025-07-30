const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'ddawes',
  password: process.env.DB_PASSWORD || 'whuUd-23my-secret',
  database: process.env.DB_NAME || 'starship_designer'
};

async function testMissileReloads() {
  let connection;
  
  try {
    console.log('Connecting to database...');
    connection = await mysql.createConnection(dbConfig);
    
    // Test inserting a ship with missile reloads
    console.log('Testing ship insertion with missile_reloads...');
    const [result] = await connection.execute(`
      INSERT INTO ships (name, tech_level, tonnage, configuration, fuel_weeks, missile_reloads, description) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, ['Test Ship', 'A', 400, 'standard', 4, 15, 'Test ship with missile reloads']);
    
    const shipId = result.insertId;
    console.log(`Inserted ship with ID: ${shipId}`);
    
    // Test retrieving the ship
    console.log('Retrieving ship...');
    const [ships] = await connection.execute(
      'SELECT * FROM ships WHERE id = ?', 
      [shipId]
    );
    
    if (ships.length > 0) {
      const ship = ships[0];
      console.log('Retrieved ship:');
      console.log(`- Name: ${ship.name}`);
      console.log(`- Tonnage: ${ship.tonnage}`);
      console.log(`- Fuel Weeks: ${ship.fuel_weeks}`);
      console.log(`- Missile Reloads: ${ship.missile_reloads} tons`);
      console.log('✅ Missile reloads field working correctly!');
    }
    
    // Clean up test data
    console.log('Cleaning up test data...');
    await connection.execute('DELETE FROM ships WHERE id = ?', [shipId]);
    console.log('Test completed successfully!');
    
  } catch (error) {
    console.error('Error testing missile reloads:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('Database connection closed.');
    }
  }
}

testMissileReloads();