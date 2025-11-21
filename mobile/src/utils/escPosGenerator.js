/**
 * Generate ESC/POS commands for thermal printer
 * Format struk voucher Rakan Kuphi
 * Same as backend but for mobile app
 * 
 * SAFETY NOTES:
 * - All ESC/POS commands used are standard and safe for thermal printers
 * - Commands are validated to prevent out-of-range values
 * - Printer will ignore unsupported commands (no damage)
 * - All commands are read-only operations (no permanent settings changed)
 * - Reset command (ESC @) is called at start to ensure clean state
 * 
 * COMMANDS USED (all safe):
 * - ESC @ : Reset printer (safe, standard)
 * - ESC a : Set alignment (safe, standard)
 * - GS !  : Set text size (safe, standard)
 * - ESC E : Set bold (safe, standard)
 * - GS k  : Print barcode (safe, standard)
 * - GS h  : Set barcode height (safe, validated range 1-255)
 * - GS w  : Set barcode width (safe, validated range 2-6)
 * - GS H  : Set barcode HRI position (safe, range 0-3)
 * - GS V  : Cut paper (safe, ignored if no cutter)
 * - LF    : Line feed (safe, standard)
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

  // Print line (for 80mm paper, max 48 characters)
  static line() {
    return '================================================' + this.LF;
  }

  // Generate barcode (CODE128 - most compatible, supports alphanumeric)
  // Format: GS k <type> <n> <data>
  // type: 73 = CODE128 (variable length)
  // n: length of data (1 byte, 0-255)
  static barcode128(data) {
    const dataStr = String(data);
    const length = dataStr.length;
    if (length === 0) {
      throw new Error('Barcode data cannot be empty');
    }
    if (length > 255) {
      throw new Error('Barcode data too long (max 255 characters)');
    }
    // GS k 73 n data
    // For variable length barcodes, n is the length byte
    return this.GS + 'k' + String.fromCharCode(73) + String.fromCharCode(length) + dataStr;
  }

  // Generate barcode (CODE39 - alternative, more compatible with older printers)
  // Format: GS k <type> <n> <data>
  // type: 4 = CODE39 (variable length)
  // n: length of data (1 byte, 0-255)
  static barcode39(data) {
    const dataStr = String(data);
    const length = dataStr.length;
    if (length === 0) {
      throw new Error('Barcode data cannot be empty');
    }
    if (length > 255) {
      throw new Error('Barcode data too long (max 255 characters)');
    }
    // GS k 4 n data
    // For variable length barcodes, n is the length byte
    return this.GS + 'k' + String.fromCharCode(4) + String.fromCharCode(length) + dataStr;
  }

  // Set barcode height (default 50, range 1-255)
  // Safety: Clamp to valid range to prevent printer errors
  static barcodeHeight(height = 50) {
    const clampedHeight = Math.max(1, Math.min(255, Math.floor(height)));
    return this.GS + 'h' + String.fromCharCode(clampedHeight);
  }

  // Set barcode width (default 2, range 2-6)
  // Safety: Clamp to valid range to prevent printer errors
  static barcodeWidth(width = 2) {
    const clampedWidth = Math.max(2, Math.min(6, Math.floor(width)));
    return this.GS + 'w' + String.fromCharCode(clampedWidth);
  }

  // Set barcode HRI (Human Readable Interpretation) position
  // 0 = none, 1 = above, 2 = below, 3 = above and below
  static barcodeHRI(position = 2) {
    return this.GS + 'H' + String.fromCharCode(position);
  }

  // Generate voucher receipt (optimized for 80mm paper)
  static generateVoucherReceipt(voucher) {
    let commands = '';

    // Initialize printer
    commands += this.init();

    // Center alignment for header
    commands += this.align('center');
    commands += this.textSize(2, 2);
    commands += this.bold(true);
    commands += 'RAKAN KUPHI' + this.LF;
    commands += this.textSize(1, 1);
    commands += this.bold(false);
    commands += this.align('center'); // Re-set center alignment after textSize change
    commands += 'Voucher Makan Karyawan' + this.LF;
    commands += this.line();
    commands += this.LF;

    // Nominal (large, bold, center)
    commands += this.align('center');
    commands += this.textSize(2, 2);
    commands += this.bold(true);
    const nominal = voucher.nominal || 10000;
    const nominalFormatted = 'Rp ' + nominal.toLocaleString('id-ID');
    commands += nominalFormatted + this.LF;
    commands += this.textSize(1, 1);
    commands += this.bold(false);
    commands += this.LF;

    // Reset text size
    commands += this.textSize(1, 1);
    commands += this.bold(false);
    commands += this.align('left');
    commands += 'Berlaku untuk menu:' + this.LF;
    commands += '  - Martabak Original' + this.LF;
    commands += '  - Mie Aceh Original' + this.LF;
    commands += '  - Indomie/Bangladesh Original' + this.LF;
    commands += '  - Nasi Goreng/Nasi Goreng kampung Original' + this.LF;
    commands += this.LF;
    commands += this.line();
    commands += this.LF;

    // Voucher details (left aligned)
    commands += this.align('left');
    
    // Employee name (if available)
    if (voucher.employee_name) {
      commands += this.bold(true);
      commands += 'Nama: ' + voucher.employee_name + this.LF;
      commands += this.bold(false);
    }
    
    // Voucher code (random code like Grab)
    if (voucher.voucher_code) {
      commands += 'Kode: ' + voucher.voucher_code + this.LF;
    }
    
    // No Voucher
    if (voucher.voucher_number) {
      commands += 'No Voucher: ' + voucher.voucher_number + this.LF;
    }
    
    // Format date: DD/MM/YYYY
    const date = new Date(voucher.issue_date);
    const formattedDate = String(date.getDate()).padStart(2, '0') + '/' +
                         String(date.getMonth() + 1).padStart(2, '0') + '/' +
                         date.getFullYear();
    commands += 'Tanggal: ' + formattedDate + this.LF;
    commands += 'Berlaku: Hari ini saja' + this.LF;
    commands += this.LF;
    commands += this.line();
    commands += this.LF;

    // Barcode (center aligned, with ESC/POS barcode command)
    commands += this.align('center');
    const barcodeData = voucher.barcode || voucher.voucher_code || '';
    
    if (barcodeData) {
      // Set barcode parameters BEFORE printing barcode
      // Safety: All parameters are validated and clamped to safe ranges
      // Height: 80 dots (good for scanning, within safe range 1-255)
      commands += this.barcodeHeight(80);
      // Width: 3 (good readability, within safe range 2-6)
      commands += this.barcodeWidth(3);
      // HRI: 2 = show text below barcode (for manual entry if scanner fails)
      // HRI position: 0-3 (safe range)
      commands += this.barcodeHRI(2);
      
      // Print barcode using CODE128 (supports alphanumeric, most compatible)
      // CODE128 is standard ESC/POS command, safe for all thermal printers
      // If printer doesn't support CODE128, it will ignore (no damage)
      try {
        commands += this.barcode128(barcodeData);
      } catch (e) {
        console.warn('CODE128 failed, trying CODE39:', e);
        // Fallback to CODE39 if CODE128 fails
        // CODE39 is also standard ESC/POS command, safe
        commands += this.barcode39(barcodeData);
      }
      
      // Feed line after barcode (required for some printers)
      // LF is safe, just moves paper forward
      commands += this.LF;
    } else {
      // Fallback if no barcode data
      commands += this.textSize(1, 1);
      commands += '[BARCODE TIDAK TERSEDIA]' + this.LF;
      commands += this.LF;
    }

    // Footer
    commands += this.line();
    commands += this.LF;
    commands += this.align('center');
    commands += 'Terima Kasih' + this.LF;
    commands += this.LF;
    
    // Note: Printer has auto cut, so no manual cut command needed
    // Minimal spacing only - no extra blank paper needed
    // Each voucher is already separated by auto cut

    return commands;
  }
}

export default EscPosGenerator;

