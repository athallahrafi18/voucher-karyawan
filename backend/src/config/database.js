const { Pool } = require('pg');
require('dotenv').config();

if (!process.env.DATABASE_URL) {
  console.warn('⚠️  DATABASE_URL is not set - database features will not work');
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  // Connection pool settings
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test connection
pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('❌ Database connection error:', err);
  // Don't exit process, let the app continue (might be temporary connection issue)
});

// Test connection on startup
(async () => {
  try {
    if (process.env.DATABASE_URL) {
      const client = await pool.connect();
      await client.query('SELECT NOW()');
      client.release();
      console.log('✅ Database connection test successful');
    }
  } catch (error) {
    console.error('❌ Database connection test failed:', error.message);
    console.warn('⚠️  Server will continue but database features may not work');
  }
})();

module.exports = pool;

