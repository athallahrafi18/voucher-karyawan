const net = require('net');
const EscPosGenerator = require('../utils/escPosGenerator');
const VoucherModel = require('../models/voucherModel');
const logger = require('../utils/logger');
const Validators = require('../utils/validators');

class PrintController {
  // POST /api/print/thermal
  static async printThermal(req, res, next) {
    try {
      const { vouchers, printer_ip, printer_port } = req.body;

      // Validate vouchers array
      if (!vouchers || !Array.isArray(vouchers) || vouchers.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'vouchers harus berupa array yang tidak kosong'
        });
      }

      if (vouchers.length > 100) {
        return res.status(400).json({
          success: false,
          message: 'Maksimal 100 voucher per batch'
        });
      }

      // Validate printer IP
      const ipValidation = Validators.validateIP(printer_ip);
      if (!ipValidation.valid) {
        return res.status(400).json({
          success: false,
          message: ipValidation.error
        });
      }

      // Validate printer port
      const portValidation = Validators.validatePort(printer_port);
      if (!portValidation.valid) {
        return res.status(400).json({
          success: false,
          message: portValidation.error
        });
      }

      // Print vouchers one by one to ensure each voucher is separated
      // This ensures each voucher is printed on separate paper with cut
      let printedCount = 0;
      
      for (let i = 0; i < vouchers.length; i++) {
        const voucher = vouchers[i];
        
        // Generate ESC/POS commands for single voucher
        const printData = EscPosGenerator.generateVoucherReceipt(voucher);
        
        // Send to printer via TCP socket
        await PrintController.sendToPrinter(
          ipValidation.ip,
          portValidation.port,
          printData
        );
        
        printedCount++;
        
        // Small delay between prints to ensure printer processes each voucher
        if (i < vouchers.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500)); // 500ms delay
        }
      }

      res.json({
        success: true,
        message: `${printedCount} voucher(s) printed successfully (each on separate paper)`,
        printed_count: printedCount
      });
    } catch (error) {
      next(error);
    }
  }

  // Send data to thermal printer via TCP socket
  static sendToPrinter(ip, port, data) {
    return new Promise((resolve, reject) => {
      const socket = new net.Socket();
      let isResolved = false;

      // Set timeout
      socket.setTimeout(10000); // 10 seconds

      socket.connect(port, ip, () => {
        logger.debug(`Connected to printer ${ip}:${port}`);
        socket.write(data);
      });

      socket.on('data', (data) => {
        logger.debug('Printer response received');
        if (!isResolved) {
          isResolved = true;
          socket.end();
          resolve(data.length);
        }
      });

      socket.on('close', () => {
        logger.debug('Printer connection closed');
        if (!isResolved) {
          isResolved = true;
          resolve(data.length);
        }
      });

      socket.on('error', (error) => {
        logger.error('Printer error:', error.message);
        if (!isResolved) {
          isResolved = true;
          reject(new Error(`Failed to connect to printer: ${error.message}`));
        }
      });

      socket.on('timeout', () => {
        logger.error('Printer connection timeout');
        socket.destroy();
        if (!isResolved) {
          isResolved = true;
          reject(new Error('Printer connection timeout'));
        }
      });
    });
  }
}

module.exports = PrintController;

