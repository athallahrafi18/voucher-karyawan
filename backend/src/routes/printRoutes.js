const express = require('express');
const router = express.Router();
const PrintController = require('../controllers/printController');

// POST /api/print/thermal
router.post('/thermal', PrintController.printThermal);

module.exports = router;

