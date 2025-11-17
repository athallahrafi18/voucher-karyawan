const net = require('net');
const EscPosGenerator = require('../utils/escPosGenerator');
const VoucherModel = require('../models/voucherModel');

class PrintController {
  // POST /api/print/thermal
  static async printThermal(req, res, next) {
    try {
      const { vouchers, printer_ip, printer_port } = req.body;

      // Validation
      if (!vouchers || !Array.isArray(vouchers) || vouchers.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'vouchers harus berupa array yang tidak kosong'
        });
      }

      if (!printer_ip || !printer_port) {
        return res.status(400).json({
          success: false,
          message: 'printer_ip dan printer_port harus diisi'
        });
      }

      // Generate ESC/POS commands
      const printData = EscPosGenerator.generateMultipleVouchers(vouchers);

      // Send to printer via TCP socket
      const printedCount = await this.sendToPrinter(
        printer_ip,
        parseInt(printer_port),
        printData
      );

      res.json({
        success: true,
        message: 'Print job sent to printer',
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
        console.log(` printer Connected to printer ${ip}:${port}`);
        socket.write(data);
      });

      socket.on('data', (data) => {
        console.log('📄 Printer response:', data.toString());
        if (!isResolved) {
          isResolved = true;
          socket.end();
          resolve(data.length);
        }
      });

      socket.on('close', () => {
        console.log('🔌 Printer connection closed');
        if (!isResolved) {
          isResolved = true;
          resolve(data.length);
        }
      });

      socket.on('error', (error) => {
        console.error('❌ Printer error:', error);
        if (!isResolved) {
          isResolved = true;
          reject(new Error(`Failed to connect to printer: ${error.message}`));
        }
      });

      socket.on('timeout', () => {
        console.error('⏱️ Printer connection timeout');
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

