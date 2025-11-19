/**
 * Print directly to thermal printer via TCP socket
 * Similar to LUNA POS - print from mobile app directly
 * 
 * Note: For Expo Go, TCP socket requires development build
 * For production, use EAS Build with react-native-tcp-socket
 */

import EscPosGenerator from './escPosGenerator';

// Import TCP socket library (requires development build, not Expo Go)
let TcpSocket = null;
let isTcpSocketAvailable = false;

try {
  // react-native-tcp-socket requires native module
  // This will work in development build or production build (EAS Build)
  // Will NOT work in Expo Go
  const TcpSocketModule = require('react-native-tcp-socket');
  
  console.log('📦 TcpSocketModule:', TcpSocketModule);
  
  // Try different ways to get Socket class
  if (TcpSocketModule && TcpSocketModule.Socket) {
    TcpSocket = TcpSocketModule.Socket;
    isTcpSocketAvailable = true;
    console.log('✅ Found Socket at TcpSocketModule.Socket');
  } else if (TcpSocketModule && TcpSocketModule.default) {
    if (TcpSocketModule.default.Socket) {
      TcpSocket = TcpSocketModule.default.Socket;
      isTcpSocketAvailable = true;
      console.log('✅ Found Socket at TcpSocketModule.default.Socket');
    } else if (typeof TcpSocketModule.default === 'function') {
      TcpSocket = TcpSocketModule.default;
      isTcpSocketAvailable = true;
      console.log('✅ Found Socket at TcpSocketModule.default (function)');
    }
  } else if (TcpSocketModule && typeof TcpSocketModule === 'function') {
    TcpSocket = TcpSocketModule;
    isTcpSocketAvailable = true;
    console.log('✅ Found Socket as function');
  }
  
  // Test if Socket is actually a constructor
  if (TcpSocket && typeof TcpSocket !== 'function') {
    console.warn('⚠️ TcpSocket is not a function:', typeof TcpSocket);
    TcpSocket = null;
    isTcpSocketAvailable = false;
  }
  
  if (isTcpSocketAvailable) {
    console.log('✅ TCP Socket library available and ready to use');
  } else {
    console.warn('⚠️ TCP Socket not found in module');
  }
} catch (e) {
  console.warn('⚠️ TCP Socket library not available:', e.message);
  console.warn('⚠️ Error details:', e);
  console.warn('⚠️ For direct TCP printing, build with EAS Build (not Expo Go).');
  TcpSocket = null;
  isTcpSocketAvailable = false;
}

/**
 * Print voucher directly to printer via TCP socket
 * @param {Object} voucher - Voucher data
 * @param {string} printerIp - Printer IP address
 * @param {number} printerPort - Printer port (default: 9100)
 * @returns {Promise<void>}
 */
export const printVoucher = async (voucher, printerIp, printerPort = 9100) => {
  return new Promise((resolve, reject) => {
    // Generate ESC/POS commands
    const printData = EscPosGenerator.generateVoucherReceipt(voucher);
    
    // Convert string to buffer/bytes
    const encoder = new TextEncoder();
    const dataBytes = encoder.encode(printData);

    // Use TCP socket if available (development build)
    if (isTcpSocketAvailable && TcpSocket && typeof TcpSocket === 'function') {
      try {
        console.log(`🖨️ Attempting to connect to printer ${printerIp}:${printerPort}`);
        console.log(`📦 Data size: ${dataBytes.length} bytes`);
        
        const socket = new TcpSocket();
        let isResolved = false;

        socket.setTimeout(10000); // 10 seconds timeout

        socket.connect(printerPort, printerIp, () => {
          console.log(`✅ Connected to printer ${printerIp}:${printerPort}`);
          try {
            socket.write(dataBytes);
            console.log(`📤 Sent ${dataBytes.length} bytes to printer`);
          } catch (writeError) {
            console.error('❌ Error writing to socket:', writeError);
            if (!isResolved) {
              isResolved = true;
              socket.destroy();
              reject(new Error(`Failed to write to printer: ${writeError.message}`));
            }
          }
        });

        socket.on('data', (data) => {
          console.log('📄 Printer response:', data);
          if (!isResolved) {
            isResolved = true;
            socket.destroy();
            resolve();
          }
        });

        socket.on('close', () => {
          console.log('🔌 Printer connection closed');
          if (!isResolved) {
            isResolved = true;
            resolve();
          }
        });

        socket.on('error', (error) => {
          console.error('❌ Printer error:', error);
          console.error('❌ Error code:', error.code);
          console.error('❌ Error message:', error.message);
          if (!isResolved) {
            isResolved = true;
            socket.destroy();
            reject(new Error(`Failed to connect to printer: ${error.message || error.code || 'Unknown error'}`));
          }
        });

        socket.on('timeout', () => {
          console.error('⏱️ Printer connection timeout');
          socket.destroy();
          if (!isResolved) {
            isResolved = true;
            reject(new Error('Printer connection timeout. Check IP and network connection.'));
          }
        });
        
        // Return early - don't fall through to error message
        return;
      } catch (socketError) {
        console.error('❌ Error creating TCP socket:', socketError);
        console.error('❌ Socket error details:', socketError.stack);
        // Fall through to error message
        isTcpSocketAvailable = false;
      }
    }
    
    // Fallback: Show error message if TCP socket not available
    if (!isTcpSocketAvailable || !TcpSocket) {
      // Fallback: Show informative error message
      // HTTP printing usually doesn't work for ESC/POS printers
      console.warn('⚠️ TCP Socket not available. Cannot print directly.');
      reject(new Error(
        `Printing tidak tersedia di Expo Go.\n\n` +
        `Untuk print langsung ke printer, Anda perlu:\n` +
        `1. Build aplikasi dengan EAS Build (development build)\n` +
        `2. Install APK yang sudah di-build\n\n` +
        `Voucher sudah berhasil dibuat di database, ` +
        `tapi tidak bisa di-print saat ini.\n\n` +
        `IP Printer: ${printerIp}:${printerPort}`
      ));
    }
  });
};

/**
 * Print multiple vouchers one by one
 * @param {Array} vouchers - Array of voucher data
 * @param {string} printerIp - Printer IP address
 * @param {number} printerPort - Printer port
 * @returns {Promise<number>} Number of vouchers printed
 */
export const printVouchers = async (vouchers, printerIp, printerPort = 9100) => {
  let printedCount = 0;
  
  for (let i = 0; i < vouchers.length; i++) {
    const voucher = vouchers[i];
    
    try {
      await printVoucher(voucher, printerIp, printerPort);
      printedCount++;
      
      // Small delay between prints
      if (i < vouchers.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    } catch (error) {
      console.error(`Error printing voucher ${i + 1}:`, error);
      // Continue with next voucher even if one fails
    }
  }
  
  return printedCount;
};

