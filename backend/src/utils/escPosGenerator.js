/**
 * Generate ESC/POS commands for thermal printer
 * Format struk voucher Rakan Kuphi
 */

class EscPosGenerator {
  // ESC/POS command constants
  static ESC = '\x1B';
  static GS = '\x1D';
  static LF = '\x0A';

  // Initialize printer
  static init() {
    return this.ESC + '@'; // Reset printer
  }

  // Set text alignment (left, center, right)
  static align(alignment = 'left') {
    const alignMap = {
      left: '\x00',
      center: '\x01',
      right: '\x02'
    };
    return this.ESC + 'a' + (alignMap[alignment] || alignMap.left);
  }

  // Set text size
  static textSize(width = 1, height = 1) {
    const size = ((width - 1) << 4) | (height - 1);
    return this.GS + '!' + String.fromCharCode(size);
  }

  // Set bold
  static bold(enabled = true) {
    return this.ESC + 'E' + (enabled ? '\x01' : '\x00');
  }

  // Print line
  static line() {
    return '================================' + this.LF;
  }

  // Generate voucher receipt
  static generateVoucherReceipt(voucher) {
    let commands = '';

    // Initialize printer
    commands += this.init();

    // Center alignment for header
    commands += this.align('center');
    commands += this.textSize(2, 2);
    commands += this.bold(true);
    commands += '      RAKAN KUPHI' + this.LF;
    commands += this.textSize(1, 1);
    commands += '   Voucher Makan Karyawan' + this.LF;
    commands += this.line();
    commands += this.LF;

    // Nominal (large, bold)
    commands += this.textSize(3, 3);
    commands += this.bold(true);
    commands += '      Rp 10.000' + this.LF;
    commands += this.LF;

    // Reset text size
    commands += this.textSize(1, 1);
    commands += this.bold(false);
    commands += '   Berlaku di:' + this.LF;
    commands += '   • Martabak Rakan' + this.LF;
    commands += '   • Mie Aceh Rakan' + this.LF;
    commands += this.LF;

    // Voucher details
    commands += this.align('left');
    
    // Employee name (if available)
    if (voucher.employee_name) {
      commands += this.bold(true);
      commands += 'Nama: ' + voucher.employee_name + this.LF;
      commands += this.bold(false);
      commands += this.LF;
    }
    
    // Voucher code (random code like Grab)
    if (voucher.voucher_code) {
      commands += this.textSize(2, 2);
      commands += this.bold(true);
      commands += 'Kode: ' + voucher.voucher_code + this.LF;
      commands += this.textSize(1, 1);
      commands += this.bold(false);
      commands += this.LF;
    }
    
    commands += 'No Voucher: ' + voucher.voucher_number + this.LF;
    
    // Format date: DD/MM/YYYY
    const date = new Date(voucher.issue_date);
    const formattedDate = String(date.getDate()).padStart(2, '0') + '/' +
                         String(date.getMonth() + 1).padStart(2, '0') + '/' +
                         date.getFullYear();
    commands += 'Tanggal: ' + formattedDate + this.LF;
    commands += 'Berlaku: Hari ini saja' + this.LF;
    commands += this.LF;

    // Barcode (center)
    commands += this.align('center');
    commands += '[BARCODE: ' + (voucher.voucher_code || voucher.barcode) + ']' + this.LF;
    commands += this.LF;

    // Footer line
    commands += this.line();
    commands += this.LF;
    commands += this.LF;
    commands += this.LF;

    // Cut paper (if supported)
    commands += this.GS + 'V' + '\x42' + '\x00'; // Partial cut

    return Buffer.from(commands, 'utf8');
  }

  // Generate multiple vouchers
  static generateMultipleVouchers(vouchers) {
    let allCommands = Buffer.alloc(0);

    vouchers.forEach((voucher, index) => {
      const voucherCommands = this.generateVoucherReceipt(voucher);
      allCommands = Buffer.concat([allCommands, voucherCommands]);
      
      // Add separator between vouchers (except last one)
      if (index < vouchers.length - 1) {
        allCommands = Buffer.concat([allCommands, Buffer.from(this.LF + this.LF, 'utf8')]);
      }
    });

    return allCommands;
  }
}

module.exports = EscPosGenerator;

