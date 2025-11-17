const express = require('express');
const cors = require('cors');
const voucherRoutes = require('./routes/voucherRoutes');

const app = express();

// Middleware
app.use(cors()); // Enable CORS for all origins (React Native)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root route - API info
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Voucher Karyawan API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      vouchers: {
        generate: 'POST /api/vouchers/generate',
        check: 'GET /api/vouchers/check/:barcode',
        redeem: 'PUT /api/vouchers/redeem/:barcode',
        report: 'GET /api/vouchers/report/daily?date=YYYY-MM-DD',
        print: 'GET /api/vouchers/print?date=YYYY-MM-DD',
        details: 'GET /api/vouchers/details?date=YYYY-MM-DD'
      },
      print: {
        thermal: 'POST /api/print/thermal'
      }
    }
  });
});

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

