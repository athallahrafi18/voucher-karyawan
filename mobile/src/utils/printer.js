/**
 * Print directly to thermal printer via TCP/LAN connection
 * Using react-native-thermal-receipt-printer (compatible with Expo SDK 54)
 * 
 * Note: Requires development build or production build (EAS Build)
 * Will NOT work in Expo Go
 */

import EscPosGenerator from './escPosGenerator';
import logger from './logger';

// Import thermal printer library
let NetPrinter = null;
let isThermalPrinterAvailable = false;

try {
  // react-native-thermal-receipt-printer requires native module
  // This will work in development build or production build (EAS Build)
  // Will NOT work in Expo Go
  logger.debug('Attempting to load react-native-thermal-receipt-printer...');
  
  let ThermalPrinterModule;
  try {
    ThermalPrinterModule = require('react-native-thermal-receipt-printer');
    logger.debug('Module loaded:', !!ThermalPrinterModule);
  } catch (requireError) {
    logger.error('Failed to require module:', requireError);
    throw requireError;
  }
  
  if (!ThermalPrinterModule) {
    throw new Error('ThermalPrinterModule is null or undefined');
  }
  
  // react-native-thermal-receipt-printer exports NetPrinter for TCP/LAN connection
  // Structure: { NetPrinter: { init, getDeviceList, connectPrinter, closeConn, printText, printBill }, ... }
  if (ThermalPrinterModule && ThermalPrinterModule.NetPrinter) {
    NetPrinter = ThermalPrinterModule.NetPrinter;
    isThermalPrinterAvailable = true;
    logger.debug('Found NetPrinter at ThermalPrinterModule.NetPrinter');
  } else if (ThermalPrinterModule && ThermalPrinterModule.default) {
    if (ThermalPrinterModule.default.NetPrinter) {
      NetPrinter = ThermalPrinterModule.default.NetPrinter;
      isThermalPrinterAvailable = true;
      logger.debug('Found NetPrinter at ThermalPrinterModule.default.NetPrinter');
    } else if (ThermalPrinterModule.default && typeof ThermalPrinterModule.default === 'object') {
      NetPrinter = ThermalPrinterModule.default;
      isThermalPrinterAvailable = true;
      logger.debug('Using ThermalPrinterModule.default as NetPrinter');
    }
  } else if (ThermalPrinterModule && typeof ThermalPrinterModule === 'object') {
    if (ThermalPrinterModule.NetPrinter) {
      NetPrinter = ThermalPrinterModule.NetPrinter;
      isThermalPrinterAvailable = true;
      logger.debug('Found NetPrinter in module object');
    } else {
      NetPrinter = ThermalPrinterModule;
      isThermalPrinterAvailable = true;
      logger.debug('Using module as NetPrinter');
    }
  }
  
  if (isThermalPrinterAvailable && NetPrinter) {
    logger.debug('Thermal Printer library available and ready to use');
  } else {
    logger.warn('Thermal Printer not found in module');
  }
} catch (e) {
  logger.error('Thermal Printer library not available:', e.message);
  logger.error('Error details:', e);
  logger.warn('For direct TCP printing, build with EAS Build (not Expo Go).');
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
    logger.debug('Printer already initialized');
    return;
  }
  
  // If init is in progress, wait for it
  if (initPromise) {
    logger.debug('Printer initialization in progress, waiting...');
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
      logger.debug('Initializing printer library...');
      
      // Call init() - this is CRITICAL to avoid NullPointerException
      await NetPrinter.init();
      
      // Delay to ensure adapter is ready (critical for native module)
      await new Promise(resolve => setTimeout(resolve, 300));
      
      isPrinterInitialized = true;
      logger.debug('Printer library initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize printer library:', error);
      logger.error('Error message:', error.message);
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
      
      logger.debug(`Attempting to connect to printer ${host}:${port}`);
      logger.debug(`Data size: ${printData.length} bytes`);
      
      // Double check NetPrinter is still available
      if (!NetPrinter || typeof NetPrinter !== 'object') {
        throw new Error('NetPrinter is not available or invalid');
      }
      
      // Use thermal printer library if available
      if (isThermalPrinterAvailable && NetPrinter) {
        try {
          // react-native-thermal-receipt-printer NetPrinter API:
          // Methods available: init, getDeviceList, connectPrinter, closeConn, printText, printBill
          // Flow: init() -> connectPrinter(host: string, port: number) -> printText(text) -> closeConn()
          
          console.log(`🔧 Connection config:`, JSON.stringify({ host, port }));
          
          // Step 0: Initialize printer library (CRITICAL - must be done before connectPrinter)
          // This prevents NullPointerException: PrinterAdapter.selectDevice() on null object
          if (!isPrinterInitialized) {
            logger.debug('Step 0: Initializing printer library (required before connect)...');
            await initPrinter();
            logger.debug('Printer library ready for connection');
          }
          
          // Step 1: Connect to printer
          // connectPrinter expects (host: string, port: number) as separate parameters
          // Port MUST be number, not string
          logger.debug(`Step 1: Connecting to printer ${host}:${port}...`);
          
          // Connect with port as number (not string)
          await NetPrinter.connectPrinter(host, port);
          logger.debug(`Connected to printer ${host}:${port}`);
          
          try {
            // Step 2: Print ESC/POS commands
            // For raw ESC/POS commands, use printText directly with the ESC/POS string
            // This is similar to backend which uses socket.write(data) directly
            logger.debug(`Step 2: Sending ${printData.length} bytes to printer...`);
            
            // Use printText for raw ESC/POS commands
            // This library may have issues with raw binary ESC/POS, but it's the best we can do
            if (NetPrinter.printText && typeof NetPrinter.printText === 'function') {
              logger.debug(`Using printText with ESC/POS string (${printData.length} bytes)`);
              
              try {
                // Send data to printer
                await NetPrinter.printText(printData);
                
                // Add delay to ensure printer processes the data
                // Some printers need time to process ESC/POS commands
                await new Promise(resolve => setTimeout(resolve, 500));
                
                logger.debug('printText completed successfully');
              } catch (printTextError) {
                logger.error('printText failed:', printTextError);
                throw printTextError;
              }
            } else {
              throw new Error('NetPrinter.printText() is not available');
            }
            
            logger.debug(`Successfully sent data to printer ${host}:${port}`);
            
          } finally {
            // Step 3: Close connection
            logger.debug('Step 3: Closing connection...');
            if (NetPrinter.closeConn && typeof NetPrinter.closeConn === 'function') {
              await NetPrinter.closeConn();
              logger.debug('Connection closed');
            }
          }
          
        } catch (printError) {
          logger.error('PRINTER ERROR:', printError);
          logger.error('Error message:', printError.message);
          logger.debug('Connection params:', { host, port });
          
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
        logger.warn('Thermal Printer library not available. Cannot print directly.');
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
      logger.error('Unexpected error in printVoucher:', error);
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
  
  logger.debug(`Starting to print ${vouchers.length} voucher(s) to ${printerIp}:${printerPort}`);
  
  if (!isThermalPrinterAvailable || !NetPrinter) {
    const errorMsg = 'Thermal Printer library tidak tersedia. Pastikan menggunakan APK build (bukan Expo Go).';
    logger.error(errorMsg);
    throw new Error(errorMsg);
  }
  
  for (let i = 0; i < vouchers.length; i++) {
    const voucher = vouchers[i];
    
    try {
      logger.debug(`Printing voucher ${i + 1}/${vouchers.length} - ${voucher.voucher_code || voucher.barcode}`);
      await printVoucher(voucher, printerIp, printerPort);
      printedCount++;
      logger.debug(`Voucher ${i + 1} printed successfully`);
      
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
      logger.error(`Error printing voucher ${i + 1} (${voucher.voucher_code || voucher.barcode}):`, error);
      // Continue with next voucher even if one fails
    }
  }
  
  logger.debug(`Print summary: ${printedCount}/${vouchers.length} successful, ${errors.length} failed`);
  
  if (errors.length > 0) {
    logger.error('Print errors:', errors);
  }
  
  return { printedCount, errors };
};
