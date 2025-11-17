const express = require('express');
const cors = require('cors');
const voucherRoutes = require('./routes/voucherRoutes');

const app = express();

// Middleware
app.use(cors()); // Enable CORS for all origins (React Native)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Voucher API is running' });
});

// Routes
app.use('/api/vouchers', voucherRoutes);
app.use('/api/print', require('./routes/printRoutes'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
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

