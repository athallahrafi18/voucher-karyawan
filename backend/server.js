require('dotenv').config();
const { validateEnv } = require('./src/utils/envValidator');
const app = require('./src/app');
const logger = require('./src/utils/logger');

// Validate environment variables on startup
try {
  validateEnv();
} catch (error) {
  logger.error('Failed to start server:', error.message);
  process.exit(1);
}

const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Start server with error handling
const server = app.listen(PORT, '0.0.0.0', () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info(`Environment: ${NODE_ENV}`);
  
  // Check database connection
  if (process.env.DATABASE_URL) {
    logger.info('DATABASE_URL is set');
  } else {
    logger.warn('DATABASE_URL is not set - database features may not work');
  }
});

// Handle server errors
server.on('error', (error) => {
  logger.error('Server error:', error.message);
  if (error.code === 'EADDRINUSE') {
    logger.error(`Port ${PORT} is already in use`);
  }
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error.message);
  if (NODE_ENV === 'development') {
    logger.error('Stack:', error.stack);
  }
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection:', reason instanceof Error ? reason.message : reason);
  if (NODE_ENV === 'development' && reason instanceof Error) {
    logger.error('Stack:', reason.stack);
  }
  process.exit(1);
});

