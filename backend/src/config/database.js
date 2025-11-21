const { Pool } = require('pg');
require('dotenv').config();
const logger = require('../utils/logger');

if (!process.env.DATABASE_URL) {
  logger.warn('DATABASE_URL is not set - database features will not work');
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  // Connection pool settings - optimized for production
  max: process.env.NODE_ENV === 'production' ? 10 : 20, // Lower in production to save resources
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000, // Reduced timeout for faster failure detection
  // Additional settings
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000,
});

// Test connection
pool.on('connect', () => {
  logger.info('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  logger.error('Database connection error:', err.message);
  // Don't exit process, let the app continue (might be temporary connection issue)
});

// Test connection on startup (with retry)
(async () => {
  if (!process.env.DATABASE_URL) {
    return;
  }

  const maxRetries = 3;
  const retryDelay = 5000; // 5 seconds

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      logger.info(`Attempting database connection (${attempt}/${maxRetries})...`);
      const client = await pool.connect();
      await client.query('SELECT NOW()');
      client.release();
      logger.info('Database connection test successful');
      return; // Success, exit function
    } catch (error) {
      logger.error(`Database connection test failed (attempt ${attempt}/${maxRetries}):`, error.message);
      
      if (attempt < maxRetries) {
        logger.debug(`Retrying in ${retryDelay/1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      } else {
        logger.warn('Server will continue but database features may not work');
        logger.warn('Please check DATABASE_URL and ensure database service is running');
      }
    }
  }
})();

module.exports = pool;

