const express = require('express');
const cors = require('cors');
const voucherRoutes = require('./routes/voucherRoutes');
const logger = require('./utils/logger');

const app = express();

// Security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// CORS configuration for React Native
app.use(cors({
  origin: '*', // Allow all origins (React Native apps)
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false
}));

// Request logging middleware (only in development)
app.use((req, res, next) => {
  logger.debug(`${req.method} ${req.path}`);
  next();
});

// Body parser with size limit
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Root route - API info (simplified for production)
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Voucher Karyawan API',
    version: '1.0.0',
    status: 'running'
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Voucher API is running' });
});

// Routes
app.use('/api/vouchers', voucherRoutes);
app.use('/api/employees', require('./routes/employeeRoutes'));
app.use('/api/print', require('./routes/printRoutes'));

// Error handling middleware
app.use((err, req, res, next) => {
  const ErrorHandler = require('./utils/errorHandler');

  // Handle database errors (PostgreSQL error codes)
  if (err.code && err.code.match(/^[0-9A-Z]{5}$/)) {
    return ErrorHandler.handleDatabaseError(err, req, res);
  }

  // Handle validation errors
  if (err.name === 'ValidationError' || err.status === 400) {
    return ErrorHandler.handleValidationError(err, req, res);
  }

  // Handle network errors
  if (err.code === 'ETIMEDOUT' || err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND') {
    return ErrorHandler.handleNetworkError(err, req, res);
  }

  // Generic error handling
  logger.error('Request error:', {
    method: req.method,
    path: req.path,
    error: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

module.exports = app;

