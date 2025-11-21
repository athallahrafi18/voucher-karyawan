/**
 * Production-ready logger
 * Only logs errors in production, verbose logs only in development
 */

const isDevelopment = process.env.NODE_ENV === 'development';

const logger = {
  // Always log errors
  error: (...args) => {
    console.error('[ERROR]', ...args);
  },

  // Log warnings (only in development)
  warn: (...args) => {
    if (isDevelopment) {
      console.warn('[WARN]', ...args);
    }
  },

  // Log info (only in development)
  info: (...args) => {
    if (isDevelopment) {
      console.log('[INFO]', ...args);
    }
  },

  // Log debug (only in development)
  debug: (...args) => {
    if (isDevelopment) {
      console.log('[DEBUG]', ...args);
    }
  },
};

module.exports = logger;

