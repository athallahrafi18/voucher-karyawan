/**
 * Production-ready error handling utilities
 */

const logger = require('./logger');

class ErrorHandler {
  // Handle database errors
  static handleDatabaseError(error, req, res) {
    // PostgreSQL error codes
    const errorCodes = {
      '23505': { // Unique violation
        status: 400,
        message: 'Data sudah ada di database'
      },
      '23503': { // Foreign key violation
        status: 400,
        message: 'Data terkait tidak ditemukan'
      },
      '23502': { // Not null violation
        status: 400,
        message: 'Data yang diperlukan tidak boleh kosong'
      },
      '42P01': { // Undefined table
        status: 500,
        message: 'Database table tidak ditemukan'
      },
      '08003': { // Connection does not exist
        status: 503,
        message: 'Koneksi database terputus'
      },
      '57P01': { // Admin shutdown
        status: 503,
        message: 'Database sedang maintenance'
      }
    };

    const errorCode = error.code;
    const errorInfo = errorCodes[errorCode];

    if (errorInfo) {
      logger.error('Database error:', {
        code: errorCode,
        message: error.message,
        path: req.path
      });
      return res.status(errorInfo.status).json({
        success: false,
        message: errorInfo.message
      });
    }

    // Generic database error
    logger.error('Database error:', {
      code: errorCode || 'UNKNOWN',
      message: error.message,
      path: req.path
    });

    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada database'
    });
  }

  // Handle validation errors
  static handleValidationError(error, req, res) {
    logger.warn('Validation error:', {
      message: error.message,
      path: req.path
    });

    return res.status(400).json({
      success: false,
      message: error.message || 'Data yang dikirim tidak valid'
    });
  }

  // Handle network errors (for printer, etc.)
  static handleNetworkError(error, req, res) {
    logger.error('Network error:', {
      message: error.message,
      path: req.path
    });

    if (error.code === 'ETIMEDOUT' || error.code === 'ECONNREFUSED') {
      return res.status(503).json({
        success: false,
        message: 'Tidak dapat terhubung ke perangkat eksternal'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada koneksi jaringan'
    });
  }
}

module.exports = ErrorHandler;

