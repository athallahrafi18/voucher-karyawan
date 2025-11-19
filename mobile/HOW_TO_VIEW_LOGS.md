# Cara Melihat Console Log - Voucher Karyawan Rakan Kuphi

## 📱 Untuk APK yang Sudah Di-Install (Production Build)

### Metode 1: Menggunakan ADB Logcat (Paling Mudah)

#### Step 1: Install ADB (Android Debug Bridge)

**Windows:**
1. Download Android Platform Tools: https://developer.android.com/studio/releases/platform-tools
2. Extract ke folder (contoh: `C:\platform-tools`)
3. Tambahkan ke PATH environment variable

**Atau install via Chocolatey:**
```powershell
choco install adb
```

#### Step 2: Enable USB Debugging di Tablet/HP

1. Buka **Settings** → **About Phone**
2. Tap **Build Number** 7 kali (untuk enable Developer Options)
3. Kembali ke **Settings** → **Developer Options**
4. Enable **USB Debugging**
5. Connect tablet/HP ke komputer via USB

#### Step 3: Cek Device Terhubung

```bash
adb devices
```

Harus muncul device Anda, contoh:
```
List of devices attached
ABC123XYZ    device
```

#### Step 4: Lihat Log Aplikasi

**Filter log hanya untuk aplikasi Anda:**
```bash
adb logcat | grep "ReactNativeJS"
```

**Atau filter dengan package name:**
```bash
adb logcat | grep "com.rakan.kuphi.voucher"
```

**Lihat semua log (termasuk native):**
```bash
adb logcat
```

**Clear log dan lihat fresh:**
```bash
adb logcat -c
adb logcat | grep "ReactNativeJS"
```

**Simpan log ke file:**
```bash
adb logcat > app_logs.txt
```

---

### Metode 2: Menggunakan React Native Debugger

#### Step 1: Install React Native Debugger

```bash
npm install -g react-native-debugger
```

Atau download: https://github.com/jhen0409/react-native-debugger/releases

#### Step 2: Enable Remote Debugging

1. Buka aplikasi di tablet/HP
2. Shake device (atau tekan `Ctrl+M` di emulator)
3. Pilih **"Debug"** atau **"Open Developer Menu"**
4. Pilih **"Debug with Chrome"** atau **"Debug with React Native Debugger"**

#### Step 3: Buka React Native Debugger

Aplikasi React Native Debugger akan terbuka, dan Anda bisa lihat console log di sana.

---

### Metode 3: Menggunakan Chrome DevTools

#### Step 1: Enable Remote Debugging

1. Buka aplikasi di tablet/HP
2. Shake device (atau tekan `Ctrl+M` di emulator)
3. Pilih **"Debug"**
4. Pilih **"Debug with Chrome"**

#### Step 2: Buka Chrome

1. Buka Chrome browser
2. Buka: `chrome://inspect`
3. Klik **"inspect"** di bawah device Anda
4. Buka tab **"Console"** untuk melihat log

---

### Metode 4: Menggunakan Flipper (Advanced)

Flipper adalah tool debugging yang lebih advanced:
- Download: https://fbflipper.com/
- Install dan connect device
- Lihat log di Flipper

---

## 🔍 Filter Log untuk Print Debugging

Saat debugging print, cari log berikut:

### Log yang Menunjukkan TCP Socket Tersedia:
```
✅ TCP Socket library available
✅ Found Socket at TcpSocketModule.Socket
```

### Log yang Menunjukkan Print Process:
```
🖨️ Attempting to connect to printer 192.168.110.10:9100
📦 Data size: XXX bytes
✅ Connected to printer 192.168.110.10:9100
📤 Sent XXX bytes to printer
```

### Log Error:
```
❌ Printer error: ...
❌ Error code: ...
⏱️ Printer connection timeout
```

### Log Warning (TCP Socket Tidak Tersedia):
```
⚠️ TCP Socket library not available
⚠️ TCP Socket not found in module
```

---

## 📝 Contoh Command Lengkap

### Windows PowerShell:

```powershell
# 1. Cek device terhubung
adb devices

# 2. Clear log
adb logcat -c

# 3. Filter log untuk aplikasi (real-time)
adb logcat | Select-String "ReactNativeJS"

# 4. Simpan log ke file
adb logcat > D:\logs\app_logs.txt
```

### Windows CMD:

```cmd
# 1. Cek device terhubung
adb devices

# 2. Clear log
adb logcat -c

# 3. Filter log untuk aplikasi (real-time)
adb logcat | findstr "ReactNativeJS"

# 4. Simpan log ke file
adb logcat > D:\logs\app_logs.txt
```

---

## 🚀 Quick Start (Paling Mudah)

### Untuk Windows:

1. **Install ADB** (jika belum):
   - Download: https://developer.android.com/studio/releases/platform-tools
   - Extract ke `C:\platform-tools`
   - Tambahkan `C:\platform-tools` ke PATH

2. **Enable USB Debugging** di tablet/HP:
   - Settings → About Phone → Tap Build Number 7x
   - Settings → Developer Options → Enable USB Debugging

3. **Connect device** ke komputer via USB

4. **Jalankan command:**
   ```bash
   adb logcat | findstr "ReactNativeJS"
   ```

5. **Buka aplikasi** dan coba print

6. **Lihat log** di terminal - semua console.log akan muncul di sini

---

## 📱 Tanpa USB (Wireless Debugging)

Jika tidak bisa connect via USB:

### Step 1: Enable Wireless Debugging

1. Connect device dan komputer ke WiFi yang sama
2. Enable **Wireless Debugging** di Developer Options
3. Note IP address dan port (contoh: `192.168.1.100:5555`)

### Step 2: Connect via Network

```bash
adb connect 192.168.1.100:5555
```

### Step 3: Lihat Log

```bash
adb logcat | findstr "ReactNativeJS"
```

---

## 🎯 Tips

1. **Clear log sebelum test**: `adb logcat -c`
2. **Filter dengan package name**: Lebih spesifik
3. **Simpan ke file**: Untuk analisis nanti
4. **Gunakan grep/findstr**: Untuk filter log tertentu

---

## 🔧 Troubleshooting ADB

### Device tidak terdeteksi:
```bash
# Restart ADB server
adb kill-server
adb start-server
adb devices
```

### Permission denied:
- Pastikan USB Debugging sudah enable
- Accept prompt di device saat connect
- Coba unplug dan plug kembali

---

## 📚 Referensi

- ADB Documentation: https://developer.android.com/studio/command-line/adb
- React Native Debugging: https://reactnative.dev/docs/debugging
- Logcat Documentation: https://developer.android.com/studio/command-line/logcat

