# 🔄 Migrasi Library Printer

## Perubahan Library

**Dari:** `react-native-tcp-socket` v6.3.0  
**Ke:** `react-native-thermal-receipt-printer` v2.1.0

## Alasan Migrasi

1. ✅ **Kompatibilitas lebih baik** dengan Expo SDK 54
2. ✅ **Khusus untuk printer thermal** - lebih sesuai kebutuhan
3. ✅ **Support TCP/LAN** via NetPrinter
4. ✅ **Aktif maintenance** dan komunitas yang lebih besar
5. ✅ **Lebih mudah digunakan** - API lebih sederhana

## Langkah Instalasi

1. **Install library baru:**
   ```bash
   cd mobile
   npm install react-native-thermal-receipt-printer
   ```

2. **Rebuild aplikasi:**
   ```bash
   eas build --platform android --profile preview
   ```

   ⚠️ **PENTING:** Library ini memerlukan native module, jadi harus rebuild APK.

## Perubahan Kode

### Sebelum (react-native-tcp-socket):
```javascript
const socket = new TcpSocket();
socket.connect(port, host, callback);
socket.write(dataBytes);
```

### Sesudah (react-native-thermal-receipt-printer):
```javascript
const NetPrinter = require('react-native-thermal-receipt-printer').NetPrinter;
await NetPrinter.printRaw({
  host: '192.168.110.10',
  port: 9100,
  data: base64Data
});
```

## Fitur Library Baru

- ✅ **NetPrinter** - TCP/LAN connection (yang kita butuhkan)
- ✅ **BluetoothPrinter** - Support Bluetooth (opsional)
- ✅ **USBPrinter** - Support USB (Android only, opsional)
- ✅ **printRaw** - Untuk ESC/POS raw commands
- ✅ **printText** - Untuk text printing dengan formatting

## Testing

Setelah rebuild, test dengan:
1. Pastikan printer dan device di WiFi yang sama
2. Cek IP printer benar (192.168.110.10:9100)
3. Coba print voucher
4. Cek log untuk error jika ada

## Troubleshooting

### Error: "Thermal Printer library not available"
- Pastikan menggunakan APK build (bukan Expo Go)
- Pastikan library terinstall: `npm install react-native-thermal-receipt-printer`
- Rebuild APK setelah install

### Error: "Connection failed"
- Cek IP printer benar
- Cek printer dan device di network yang sama
- Cek port benar (default: 9100)
- Cek printer ON dan siap

### Error: "printRaw is not a function"
- Pastikan menggunakan versi library yang benar
- Cek import: `const { NetPrinter } = require('react-native-thermal-receipt-printer')`

## Dokumentasi

- GitHub: https://github.com/HeligPfleigh/react-native-thermal-receipt-printer
- NPM: https://www.npmjs.com/package/react-native-thermal-receipt-printer

