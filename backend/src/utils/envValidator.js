/**
 * Environment variable validation on startup
 */

const logger = require('./logger');

function validateEnv() {
  const errors = [];
  const warnings = [];

  // Required in production
  if (process.env.NODE_ENV === 'production') {
    if (!process.env.DATABASE_URL) {
      errors.push('DATABASE_URL is required in production');
    }
  } else {
    if (!process.env.DATABASE_URL) {
      warnings.push('DATABASE_URL is not set - database features will not work');
    }
  }

  // Validate PORT
  if (process.env.PORT) {
    const port = parseInt(process.env.PORT, 10);
    if (isNaN(port) || port < 1 || port > 65535) {
      errors.push(`Invalid PORT: ${process.env.PORT}. Must be between 1-65535`);
    }
  }

  // Log errors
  if (errors.length > 0) {
    logger.error('Environment validation errors:');
    errors.forEach(error => logger.error(`  - ${error}`));
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Environment validation failed. Please check your environment variables.');
    }
  }

  // Log warnings
  if (warnings.length > 0) {
    warnings.forEach(warning => logger.warn(warning));
  }

  return { errors, warnings };
}

module.exports = { validateEnv };

