const express = require('express');
const router = express.Router();
const VoucherController = require('../controllers/voucherController');

// POST /api/vouchers/generate
router.post('/generate', VoucherController.generate);

// GET /api/vouchers/check/:barcode
router.get('/check/:barcode', VoucherController.check);

// PUT /api/vouchers/redeem/:barcode
router.put('/redeem/:barcode', VoucherController.redeem);

// GET /api/vouchers/report/daily
router.get('/report/daily', VoucherController.getDailyReport);

// GET /api/vouchers/print
router.get('/print', VoucherController.getVouchersForPrint);

// GET /api/vouchers/details (for report screen with details)
router.get('/details', VoucherController.getVoucherDetails);

// GET /api/vouchers/scan-history (for kitchen scan history)
router.get('/scan-history', VoucherController.getScanHistory);

module.exports = router;

