/**
 * Print directly to thermal printer via TCP/LAN connection
 * Using react-native-thermal-receipt-printer (compatible with Expo SDK 54)
 * 
 * Note: Requires development build or production build (EAS Build)
 * Will NOT work in Expo Go
 */

import EscPosGenerator from './escPosGenerator';

// Import thermal printer library
let NetPrinter = null;
let isThermalPrinterAvailable = false;

try {
  // react-native-thermal-receipt-printer requires native module
  // This will work in development build or production build (EAS Build)
  // Will NOT work in Expo Go
  let ThermalPrinterModule;
  try {
    ThermalPrinterModule = require('react-native-thermal-receipt-printer');
  } catch (requireError) {
    console.error('❌ Failed to require thermal printer module:', requireError);
    throw requireError;
  }
  
  if (!ThermalPrinterModule) {
    throw new Error('ThermalPrinterModule is null or undefined');
  }
  
  console.log('📦 ThermalPrinterModule:', ThermalPrinterModule);
  console.log('📦 ThermalPrinterModule keys:', Object.keys(ThermalPrinterModule || {}));
  
  // react-native-thermal-receipt-printer exports NetPrinter for TCP/LAN connection
  // Structure: { NetPrinter: { printRaw, printText, ... }, BluetoothPrinter: {...}, ... }
  if (ThermalPrinterModule && ThermalPrinterModule.NetPrinter) {
    NetPrinter = ThermalPrinterModule.NetPrinter;
    isThermalPrinterAvailable = true;
    console.log('✅ Found NetPrinter at ThermalPrinterModule.NetPrinter');
    console.log('📦 NetPrinter keys:', Object.keys(NetPrinter || {}));
  } else if (ThermalPrinterModule && ThermalPrinterModule.default) {
    if (ThermalPrinterModule.default.NetPrinter) {
      NetPrinter = ThermalPrinterModule.default.NetPrinter;
      isThermalPrinterAvailable = true;
      console.log('✅ Found NetPrinter at ThermalPrinterModule.default.NetPrinter');
      console.log('📦 NetPrinter keys:', Object.keys(NetPrinter || {}));
    } else if (ThermalPrinterModule.default && typeof ThermalPrinterModule.default === 'object') {
      // If default is the module itself with NetPrinter inside
      NetPrinter = ThermalPrinterModule.default;
      isThermalPrinterAvailable = true;
      console.log('✅ Using ThermalPrinterModule.default as NetPrinter');
      console.log('📦 NetPrinter keys:', Object.keys(NetPrinter || {}));
    }
  } else if (ThermalPrinterModule && typeof ThermalPrinterModule === 'object') {
    // Module itself might be the object with NetPrinter
    if (ThermalPrinterModule.NetPrinter) {
      NetPrinter = ThermalPrinterModule.NetPrinter;
      isThermalPrinterAvailable = true;
      console.log('✅ Found NetPrinter in module object');
    } else {
      NetPrinter = ThermalPrinterModule;
      isThermalPrinterAvailable = true;
      console.log('✅ Using module as NetPrinter');
    }
    console.log('📦 NetPrinter keys:', Object.keys(NetPrinter || {}));
  }
  
  if (isThermalPrinterAvailable && NetPrinter) {
    console.log('✅ Thermal Printer library available and ready to use');
    console.log('📦 NetPrinter type:', typeof NetPrinter);
    console.log('📦 NetPrinter has printRaw:', typeof NetPrinter.printRaw);
    console.log('📦 NetPrinter has printText:', typeof NetPrinter.printText);
  } else {
    console.warn('⚠️ Thermal Printer not found in module');
  }
} catch (e) {
  console.warn('⚠️ Thermal Printer library not available:', e.message);
  console.warn('⚠️ Error details:', e);
  console.warn('⚠️ For direct TCP printing, build with EAS Build (not Expo Go).');
  NetPrinter = null;
  isThermalPrinterAvailable = false;
}

// Global init flag - track if printer has been initialized
let isPrinterInitialized = false;
let initPromise = null; // Store init promise to prevent multiple concurrent inits

/**
 * Initialize printer library (call once before first print)
 * This MUST be called successfully before connectPrinter() to avoid NullPointerException
 * @returns {Promise<void>}
 */
export const initPrinter = async () => {
  // If already initialized, return immediately
  if (isPrinterInitialized) {
    console.log('✅ Printer already initialized');
    return;
  }
  
  // If init is in progress, wait for it
  if (initPromise) {
    console.log('⏳ Printer initialization in progress, waiting...');
    await initPromise;
    return;
  }
  
  // Check if library is available
  if (!isThermalPrinterAvailable || !NetPrinter) {
    throw new Error('Thermal Printer library not available. Cannot initialize.');
  }
  
  // Check if init method exists
  if (!NetPrinter.init || typeof NetPrinter.init !== 'function') {
    throw new Error('NetPrinter.init() is not available. Library may not be properly installed.');
  }
  
  // Start initialization
  initPromise = (async () => {
    try {
      console.log('🔧 Initializing printer library...');
      console.log('📦 NetPrinter.init type:', typeof NetPrinter.init);
      
      // Call init() - this is CRITICAL to avoid NullPointerException
      await NetPrinter.init();
      
      // Delay to ensure adapter is ready (critical for native module)
      await new Promise(resolve => setTimeout(resolve, 300));
      
      isPrinterInitialized = true;
      console.log('✅ Printer library initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize printer library:', error);
      console.error('❌ Error message:', error.message);
      console.error('❌ Error stack:', error.stack);
      isPrinterInitialized = false;
      initPromise = null;
      throw new Error(`Failed to initialize printer library: ${error.message}`);
    }
  })();
  
  await initPromise;
};

/**
 * Print voucher directly to printer via TCP/LAN
 * @param {Object} voucher - Voucher data
 * @param {string} printerIp - Printer IP address
 * @param {number} printerPort - Printer port (default: 9100)
 * @returns {Promise<void>}
 */
export const printVoucher = async (voucher, printerIp, printerPort = 9100) => {
  // Guard: Ensure library is available before proceeding
  if (!isThermalPrinterAvailable || !NetPrinter) {
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
  
  try {
      // Generate ESC/POS commands
      const printData = EscPosGenerator.generateVoucherReceipt(voucher);
      
      // Validate parameters
      const port = parseInt(printerPort, 10);
      const host = String(printerIp).trim();
      
      if (!host || host === '' || host === 'localhost' || host === '127.0.0.1') {
        throw new Error(`Invalid printer IP: "${host}". Please set printer IP in Settings.`);
      }
      
      if (!port || port === 0 || isNaN(port) || port < 1 || port > 65535) {
        throw new Error(`Invalid printer port: ${port}. Please set printer port in Settings (1-65535).`);
      }
      
      console.log(`🖨️ Attempting to connect to printer ${host}:${port}`);
      console.log(`📦 Data size: ${printData.length} bytes`);
      console.log(`📦 NetPrinter available: ${!!NetPrinter}`);
      console.log(`📦 NetPrinter type: ${typeof NetPrinter}`);
      
      // Double check NetPrinter is still available
      if (!NetPrinter || typeof NetPrinter !== 'object') {
        throw new Error('NetPrinter is not available or invalid');
      }
      
      // Use thermal printer library if available
      if (isThermalPrinterAvailable && NetPrinter) {
        try {
          // react-native-thermal-receipt-printer NetPrinter API:
          // Methods available: init, getDeviceList, connectPrinter, closeConn, printText, printBill
          // Flow: init() -> connectPrinter(host: string, port: string) -> printText(text) or printBill(text) -> closeConn()
          
          console.log(`🔧 Connection config:`, JSON.stringify({ host, port }));
          
          // Step 0: Initialize printer library (CRITICAL - must be done before connectPrinter)
          // This prevents NullPointerException: PrinterAdapter.selectDevice() on null object
          if (!isPrinterInitialized) {
            console.log(`🔧 Step 0: Initializing printer library (required before connect)...`);
            await initPrinter();
            console.log(`✅ Printer library ready for connection`);
          } else {
            console.log(`✅ Printer library already initialized`);
          }
          
          // Step 1: Connect to printer
          // connectPrinter expects (host: string, port: number) as separate parameters
          // Port MUST be number, not string
          console.log(`🔌 Step 1: Connecting to printer ${host}:${port}...`);
          console.log(`🔌 Host type: ${typeof host}, Port type: ${typeof port}`);
          
          // Connect with port as number (not string)
          await NetPrinter.connectPrinter(host, port);
          console.log(`✅ Connected to printer ${host}:${port}`);
          
          try {
            // Step 2: Print ESC/POS commands
            // For raw ESC/POS commands, use printText directly with the ESC/POS string
            // This is similar to backend which uses socket.write(data) directly
            console.log(`📤 Step 2: Sending ${printData.length} bytes to printer...`);
            console.log(`📤 Print data preview (first 100 chars):`, printData.substring(0, 100));
            
            // Use printText for raw ESC/POS commands (most compatible)
            if (NetPrinter.printText && typeof NetPrinter.printText === 'function') {
              console.log(`📤 Using printText with ESC/POS string (${printData.length} bytes)`);
              await NetPrinter.printText(printData);
              console.log(`✅ printText completed`);
            } else if (NetPrinter.printBill && typeof NetPrinter.printBill === 'function') {
              // Fallback: Try printBill with base64 (less reliable for raw ESC/POS)
              console.log(`⚠️ printText not available, trying printBill with base64...`);
              const encoder = new TextEncoder();
              const dataBytes = encoder.encode(printData);
              const binaryString = Array.from(dataBytes, byte => String.fromCharCode(byte)).join('');
              
              let base64Data;
              try {
                if (typeof btoa !== 'undefined') {
                  base64Data = btoa(binaryString);
                } else {
                  base64Data = require('base-64').encode(binaryString);
                }
              } catch (e) {
                // Manual base64 encoding
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
              
              console.log(`📤 Using printBill with base64 data (${base64Data.length} chars)`);
              await NetPrinter.printBill(base64Data);
              console.log(`✅ printBill completed`);
            } else {
              throw new Error('Neither printText nor printBill is available');
            }
            
            console.log(`✅ Successfully sent data to printer ${host}:${port}`);
            
          } finally {
            // Step 3: Close connection
            console.log(`🔌 Step 3: Closing connection...`);
            if (NetPrinter.closeConn && typeof NetPrinter.closeConn === 'function') {
              await NetPrinter.closeConn();
              console.log(`✅ Connection closed`);
            }
          }
          
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
  console.log(`🔌 NetPrinter type: ${typeof NetPrinter}`);
  console.log(`🔌 NetPrinter available: ${!!NetPrinter}`);
  if (NetPrinter) {
    console.log(`🔌 NetPrinter methods:`, Object.keys(NetPrinter));
  }
  console.log('🖨️ ====================================');
  
  if (!isThermalPrinterAvailable || !NetPrinter) {
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
