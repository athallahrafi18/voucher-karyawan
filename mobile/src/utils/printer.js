/**
 * Print directly to thermal printer via TCP/LAN connection
 * Using react-native-thermal-receipt-printer (compatible with Expo SDK 54)
 * 
 * Note: Requires development build or production build (EAS Build)
 * Will NOT work in Expo Go
 */

import EscPosGenerator from './escPosGenerator';

// Import thermal printer library
let ThermalPrinter = null;
let isThermalPrinterAvailable = false;

try {
  // react-native-thermal-receipt-printer requires native module
  // This will work in development build or production build (EAS Build)
  // Will NOT work in Expo Go
  const ThermalPrinterModule = require('react-native-thermal-receipt-printer');
  
  console.log('📦 ThermalPrinterModule:', ThermalPrinterModule);
  
  // react-native-thermal-receipt-printer exports NetPrinter for TCP/LAN connection
  if (ThermalPrinterModule && ThermalPrinterModule.NetPrinter) {
    ThermalPrinter = ThermalPrinterModule.NetPrinter;
    isThermalPrinterAvailable = true;
    console.log('✅ Found NetPrinter at ThermalPrinterModule.NetPrinter');
  } else if (ThermalPrinterModule && ThermalPrinterModule.default) {
    if (ThermalPrinterModule.default.NetPrinter) {
      ThermalPrinter = ThermalPrinterModule.default.NetPrinter;
      isThermalPrinterAvailable = true;
      console.log('✅ Found NetPrinter at ThermalPrinterModule.default.NetPrinter');
    } else {
      ThermalPrinter = ThermalPrinterModule.default;
      isThermalPrinterAvailable = true;
      console.log('✅ Found NetPrinter at ThermalPrinterModule.default');
    }
  } else if (ThermalPrinterModule) {
    ThermalPrinter = ThermalPrinterModule;
    isThermalPrinterAvailable = true;
    console.log('✅ Found NetPrinter as module');
  }
  
  if (isThermalPrinterAvailable) {
    console.log('✅ Thermal Printer library available and ready to use');
  } else {
    console.warn('⚠️ Thermal Printer not found in module');
  }
} catch (e) {
  console.warn('⚠️ Thermal Printer library not available:', e.message);
  console.warn('⚠️ Error details:', e);
  console.warn('⚠️ For direct TCP printing, build with EAS Build (not Expo Go).');
  ThermalPrinter = null;
  isThermalPrinterAvailable = false;
}

/**
 * Print voucher directly to printer via TCP/LAN
 * @param {Object} voucher - Voucher data
 * @param {string} printerIp - Printer IP address
 * @param {number} printerPort - Printer port (default: 9100)
 * @returns {Promise<void>}
 */
export const printVoucher = async (voucher, printerIp, printerPort = 9100) => {
  try {
      // Generate ESC/POS commands
      const printData = EscPosGenerator.generateVoucherReceipt(voucher);
      
      // Validate parameters
      const port = parseInt(printerPort, 10);
      const host = String(printerIp).trim();
      
      if (!host || host === '' || host === 'localhost' || host === '127.0.0.1') {
        reject(new Error(`Invalid printer IP: "${host}". Please set printer IP in Settings.`));
        return;
      }
      
      if (!port || port === 0 || isNaN(port) || port < 1 || port > 65535) {
        reject(new Error(`Invalid printer port: ${port}. Please set printer port in Settings (1-65535).`));
        return;
      }
      
      console.log(`🖨️ Attempting to connect to printer ${host}:${port}`);
      console.log(`📦 Data size: ${printData.length} bytes`);
      
      // Use thermal printer library if available
      if (isThermalPrinterAvailable && ThermalPrinter) {
        try {
          // react-native-thermal-receipt-printer NetPrinter format:
          // NetPrinter.printText({ host, port, text })
          // Or NetPrinter.printRaw({ host, port, data })
          
          // Convert ESC/POS string to base64 or use printRaw
          // For ESC/POS raw commands, use printRaw
          const printerConfig = {
            host: host,
            port: port,
          };
          
          console.log(`🔧 Connection config:`, JSON.stringify(printerConfig));
          
          // Use printRaw for ESC/POS commands
          // react-native-thermal-receipt-printer printRaw accepts base64 string
          const encoder = new TextEncoder();
          const dataBytes = encoder.encode(printData);
          
          // Convert Uint8Array to base64
          // React Native doesn't have Buffer or btoa, use alternative method
          let base64Data;
          try {
            // Method 1: Try using btoa if available (some React Native versions have it)
            const binaryString = Array.from(dataBytes, byte => String.fromCharCode(byte)).join('');
            if (typeof btoa !== 'undefined') {
              base64Data = btoa(binaryString);
            } else {
              // Method 2: Use base64 encoding library or manual conversion
              // For React Native, we can use a simple base64 encoder
              base64Data = require('base-64').encode(binaryString);
            }
          } catch (e) {
            // Fallback: Convert to base64 manually
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
            let result = '';
            let i = 0;
            while (i < dataBytes.length) {
              const a = dataBytes[i++];
              const b = i < dataBytes.length ? dataBytes[i++] : 0;
              const c = i < dataBytes.length ? dataBytes[i++] : 0;
              const bitmap = (a << 16) | (b << 8) | c;
              result += chars.charAt((bitmap >> 18) & 63);
              result += chars.charAt((bitmap >> 12) & 63);
              result += i - 2 < dataBytes.length ? chars.charAt((bitmap >> 6) & 63) : '=';
              result += i - 1 < dataBytes.length ? chars.charAt(bitmap & 63) : '=';
            }
            base64Data = result;
          }
          
          console.log(`📤 Sending ${dataBytes.length} bytes to printer...`);
          
          // Print using NetPrinter.printRaw
          // Format: printRaw({ host, port, data: base64String })
          await ThermalPrinter.printRaw({
            host: host,
            port: port,
            data: base64Data,
          });
          
          console.log(`✅ Successfully sent data to printer ${host}:${port}`);
          
        } catch (printError) {
          console.error('❌ ========== PRINTER ERROR ==========');
          console.error('❌ Printer error:', printError);
          console.error('❌ Error message:', printError.message);
          console.error('❌ Error details:', JSON.stringify(printError, null, 2));
          console.error('❌ Connection params:', { host, port });
          console.error('❌ ====================================');
          
          // Build detailed error message
          let errorMsg = 'Failed to connect to printer';
          if (printError.message) {
            errorMsg += `: ${printError.message}`;
          } else {
            errorMsg += ': Unknown error - Cek koneksi network dan IP printer';
          }
          
          throw new Error(errorMsg);
        }
      } else {
        // Fallback: Show error message if thermal printer not available
        console.warn('⚠️ Thermal Printer library not available. Cannot print directly.');
        throw new Error(
          `Printing tidak tersedia di Expo Go.\n\n` +
          `Untuk print langsung ke printer, Anda perlu:\n` +
          `1. Build aplikasi dengan EAS Build (development build)\n` +
          `2. Install APK yang sudah di-build\n\n` +
          `Voucher sudah berhasil dibuat di database, ` +
          `tapi tidak bisa di-print saat ini.\n\n` +
          `IP Printer: ${printerIp}:${printerPort}`
        );
      }
    } catch (error) {
      console.error('❌ Unexpected error in printVoucher:', error);
      throw error;
    }
};

/**
 * Print multiple vouchers one by one
 * @param {Array} vouchers - Array of voucher data
 * @param {string} printerIp - Printer IP address
 * @param {number} printerPort - Printer port
 * @returns {Promise<{printedCount: number, errors: Array}>} Number of vouchers printed and errors
 */
export const printVouchers = async (vouchers, printerIp, printerPort = 9100) => {
  let printedCount = 0;
  const errors = [];
  
  console.log('🖨️ ========== START PRINTING ==========');
  console.log(`🖨️ Starting to print ${vouchers.length} voucher(s) to ${printerIp}:${printerPort}`);
  console.log(`📡 Thermal Printer available: ${isThermalPrinterAvailable}`);
  console.log(`🔌 ThermalPrinter type: ${typeof ThermalPrinter}`);
  console.log('🖨️ ====================================');
  
  if (!isThermalPrinterAvailable || !ThermalPrinter) {
    const errorMsg = 'Thermal Printer library tidak tersedia. Pastikan menggunakan APK build (bukan Expo Go).';
    console.error('❌', errorMsg);
    throw new Error(errorMsg);
  }
  
  for (let i = 0; i < vouchers.length; i++) {
    const voucher = vouchers[i];
    
    try {
      console.log(`🖨️ Printing voucher ${i + 1}/${vouchers.length} - ${voucher.voucher_code || voucher.barcode}`);
      await printVoucher(voucher, printerIp, printerPort);
      printedCount++;
      console.log(`✅ Voucher ${i + 1} printed successfully`);
      
      // Small delay between prints
      if (i < vouchers.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    } catch (error) {
      const errorInfo = {
        voucherIndex: i + 1,
        voucherCode: voucher.voucher_code || voucher.barcode,
        error: error.message || error.toString(),
        errorCode: error.code
      };
      errors.push(errorInfo);
      console.error(`❌ Error printing voucher ${i + 1} (${voucher.voucher_code || voucher.barcode}):`, error);
      console.error(`❌ Error details:`, errorInfo);
      // Continue with next voucher even if one fails
    }
  }
  
  console.log(`📊 Print summary: ${printedCount}/${vouchers.length} successful, ${errors.length} failed`);
  
  if (errors.length > 0) {
    console.error('❌ Print errors:', errors);
  }
  
  return { printedCount, errors };
};
