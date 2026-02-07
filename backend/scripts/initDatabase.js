const { Client } = require('pg');
require('dotenv').config();
const fs = require('fs');
const path = require('path');

/**
 * Initialize PostgreSQL database with required tables
 * Run this script once to set up your database: node scripts/initDatabase.js
 */

async function initializeDatabase() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
    database: 'postgres', // Connect to default postgres database first
  });

  try {
    await client.connect();
    console.log('Connected to PostgreSQL server');

    // Check if database exists
    const dbName = process.env.DB_NAME || 'music_playlist_db';
    const dbCheckResult = await client.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [dbName]
    );

    // Create database if it doesn't exist
    if (dbCheckResult.rows.length === 0) {
      console.log(`Creating database: ${dbName}`);
      await client.query(`CREATE DATABASE ${dbName}`);
      console.log(`✅ Database '${dbName}' created successfully`);
    } else {
      console.log(`Database '${dbName}' already exists`);
    }

    await client.end();

    // Now connect to the newly created database and run schema
    const dbClient = new Client({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD,
      database: dbName,
    });

    await dbClient.connect();
    console.log(`Connected to ${dbName} database`);

    // Read and execute schema file
    const schemaPath = path.join(__dirname, '..', 'config', 'init-db.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    console.log('Creating tables and indexes...');
    await dbClient.query(schema);
    console.log('✅ All tables and indexes created successfully');

    // Verify tables were created
    const tablesResult = await dbClient.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);

    console.log('\n📋 Created tables:');
    tablesResult.rows.forEach(row => {
      console.log(`   - ${row.table_name}`);
    });

    await dbClient.end();
    console.log('\n✨ Database initialization completed successfully!');
    console.log('You can now run: npm run dev');

  } catch (error) {
    console.error('❌ Error initializing database:', error.message);
    console.error('\nTroubleshooting:');
    console.error('1. Make sure PostgreSQL is installed and running');
    console.error('2. Check your .env file configuration');
    console.error('3. Verify the database user has CREATE DATABASE privileges');
    process.exit(1);
  }
}

// Run initialization
initializeDatabase();
