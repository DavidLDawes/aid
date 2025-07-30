const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'ddawes',
  password: process.env.DB_PASSWORD || 'whuUd-23my-secret',
  database: process.env.DB_NAME || 'starship_designer'
};

async function updateSchema() {
  let connection;
  
  try {
    console.log('Connecting to database...');
    connection = await mysql.createConnection(dbConfig);
    
    // Check if column already exists
    console.log('Checking if missile_reloads column exists...');
    const [columns] = await connection.execute(
      "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'ships' AND COLUMN_NAME = 'missile_reloads'",
      [dbConfig.database]
    );
    
    if (columns.length > 0) {
      console.log('missile_reloads column already exists!');
      return;
    }
    
    // Add the column
    console.log('Adding missile_reloads column to ships table...');
    await connection.execute(`
      ALTER TABLE ships 
      ADD COLUMN missile_reloads INT NOT NULL DEFAULT 0 
      COMMENT 'Tonnage of missile reloads (1 MCr per ton)'
    `);
    
    console.log('Successfully added missile_reloads column!');
    
    // Verify the column was added
    console.log('Verifying column structure...');
    const [tableInfo] = await connection.execute('DESCRIBE ships');
    console.log('\nShips table structure:');
    tableInfo.forEach(row => {
      console.log(`${row.Field}: ${row.Type} ${row.Null === 'NO' ? 'NOT NULL' : 'NULL'} ${row.Default !== null ? `DEFAULT ${row.Default}` : ''}`);
    });
    
  } catch (error) {
    console.error('Error updating schema:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\nDatabase connection closed.');
    }
  }
}

updateSchema();