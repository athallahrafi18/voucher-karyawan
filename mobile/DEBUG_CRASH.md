# 🔍 Debug Force Close / Crash

## Cara Melihat Log Crash

### 1. Menggunakan ADB Logcat (Recommended)

```bash
# Clear logcat dulu
adb logcat -c

# Filter untuk melihat semua error dan crash
adb logcat *:E AndroidRuntime:E ReactNativeJS:V ReactNative:V

# Atau lihat semua log (verbose)
adb logcat

# Filter khusus untuk aplikasi Anda
adb logcat | grep -i "voucher\|reactnative\|crash\|fatal"
```

### 2. Menggunakan Android Studio Logcat

1. Buka Android Studio
2. Connect device via USB
3. Buka tab "Logcat"
4. Filter: `package:com.yourpackage` atau `tag:ReactNativeJS`

### 3. Cek Log File di Device

```bash
# Cek logcat file
adb logcat -d > crash_log.txt

# Cek anr (Application Not Responding)
adb shell ls /data/anr/

# Cek tombstone (native crash)
adb shell ls /data/tombstones/
```

## Kemungkinan Penyebab Crash

### 1. Native Module Tidak Terinstall
- Library `react-native-thermal-receipt-printer` mungkin tidak ter-link dengan benar
- Perlu rebuild setelah install library

### 2. Library Tidak Kompatibel
- Expo SDK 54 mungkin tidak kompatibel dengan library ini
- Cek versi library dan Expo SDK compatibility

### 3. Missing Permissions
- Library mungkin memerlukan permission yang belum di-declare
- Cek `app.json` untuk permissions

### 4. Native Method Call Error
- Format parameter salah
- Method tidak tersedia
- Native crash sebelum JavaScript error

## Troubleshooting Steps

### Step 1: Cek Log dengan ADB

```bash
# Clear dan monitor log
adb logcat -c
adb logcat | grep -i "error\|crash\|fatal\|exception"
```

### Step 2: Cek Apakah Library Terinstall

```bash
# Cek node_modules
cd mobile
ls node_modules/react-native-thermal-receipt-printer

# Cek apakah ada di package.json
cat package.json | grep thermal
```

### Step 3: Rebuild dengan Clean

```bash
cd mobile

# Clean
rm -rf node_modules
rm -rf .expo
npm install

# Rebuild
eas build --platform android --profile preview --clear-cache
```

### Step 4: Test dengan Minimal Code

Coba test library dengan code minimal:

```javascript
// Test minimal
import { NetPrinter } from 'react-native-thermal-receipt-printer';

try {
  console.log('Testing NetPrinter...');
  console.log('NetPrinter:', NetPrinter);
  console.log('Methods:', Object.keys(NetPrinter || {}));
} catch (e) {
  console.error('Error:', e);
}
```

## Alternative: Gunakan Backend Print

Jika library terus crash, gunakan backend print API:

```javascript
// Di GenerateVoucherScreen.js
import { printAPI } from '../../services/api';

// Ganti printVouchers dengan:
const result = await printAPI.thermal(vouchers, printerIp, printerPort);
```

Ini akan print via backend (Node.js TCP socket) yang lebih stabil.

