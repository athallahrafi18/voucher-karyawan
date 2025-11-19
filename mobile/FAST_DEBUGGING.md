# ⚡ Fast Debugging - Tanpa Rebuild APK

## 🎯 Opsi 1: Test dengan APK yang Sudah Ada + ADB Log (PALING CEPAT)

**Tidak perlu rebuild!** Perubahan error handling yang sudah dibuat akan memberikan error detail di log, jadi kita bisa langsung tahu masalahnya.

### Langkah-langkah:

1. **Install APK yang sudah ada** (jika belum)
2. **Connect tablet ke komputer** via USB
3. **Enable USB Debugging** di tablet
4. **Buka ADB logcat:**
   ```powershell
   cd C:\platform-tools
   adb logcat -c
   adb logcat | findstr "ReactNativeJS"
   ```
5. **Test print** di aplikasi
6. **Lihat log** - error detail akan muncul di terminal

### Log yang Perlu Dicari:

```
❌ Printer error: ...
❌ Error code: ECONNREFUSED
❌ Error message: Connection refused - Printer tidak merespons atau port salah
📊 Print summary: 0/1 successful, 1 failed
```

Dari log ini, kita bisa langsung tahu masalahnya tanpa perlu rebuild!

---

## 🎯 Opsi 2: Build Lokal (Lebih Cepat dari EAS Cloud)

Build lokal lebih cepat karena:
- Tidak perlu upload ke cloud
- Build langsung di komputer Anda
- Bisa menggunakan cache

### Prerequisites:

1. **Install Android Studio**
   - Download: https://developer.android.com/studio
   - Install Android SDK
   - Set environment variables:
     ```powershell
     # Set ANDROID_HOME
     $env:ANDROID_HOME = "C:\Users\YourName\AppData\Local\Android\Sdk"
     
     # Add to PATH
     $env:PATH += ";$env:ANDROID_HOME\platform-tools;$env:ANDROID_HOME\tools"
     ```

2. **Install Java JDK 17**
   - Download: https://adoptium.net/
   - Set JAVA_HOME:
     ```powershell
     $env:JAVA_HOME = "C:\Program Files\Java\jdk-17"
     ```

### Build Lokal:

```bash
cd mobile
eas build --platform android --profile preview --local
```

**Keuntungan:**
- ✅ Lebih cepat (5-15 menit vs 20-40 menit)
- ✅ Tidak perlu upload ke cloud
- ✅ Bisa menggunakan cache lokal

**Kekurangan:**
- ❌ Perlu setup Android SDK (sekali saja)
- ❌ Perlu Java JDK
- ❌ Perlu space disk lebih besar

---

## 🎯 Opsi 3: Development Build (Untuk Development)

Development build lebih cepat karena:
- Tidak perlu sign APK
- Optimasi untuk development
- Hot reload support

### Setup Development Build:

1. **Build development client (sekali saja):**
   ```bash
   cd mobile
   eas build --platform android --profile development
   ```

2. **Install development client** ke tablet

3. **Start Metro bundler:**
   ```bash
   npm start
   ```

4. **Load app** di development client (scan QR code)

**Keuntungan:**
- ✅ Hot reload (perubahan langsung terlihat)
- ✅ Tidak perlu rebuild untuk perubahan JavaScript
- ✅ Lebih cepat untuk development

**Kekurangan:**
- ❌ Perlu build development client dulu (sekali)
- ❌ Tidak untuk production

---

## 🎯 Opsi 4: Optimasi Build EAS (Cloud Build)

Jika tetap ingin build di cloud, optimasi berikut bisa mempercepat:

### 1. Gunakan Cache

```bash
# Jangan gunakan --clear-cache kecuali perlu
eas build --platform android --profile preview
```

### 2. Build Incremental

Hanya build jika ada perubahan native code. Untuk perubahan JavaScript saja, tidak perlu rebuild.

### 3. Build di Waktu yang Tepat

- Build di pagi hari (server kurang sibuk)
- Hindari build di jam sibuk (siang/malam)

---

## 💡 Rekomendasi

**Untuk debugging print issue sekarang:**

1. ✅ **Gunakan Opsi 1** (Test dengan APK yang sudah ada + ADB log)
   - Tidak perlu rebuild
   - Error detail sudah ada di log
   - Langsung tahu masalahnya

2. Jika perlu rebuild (setelah fix):
   - Gunakan **Opsi 2** (Build lokal) jika sudah setup Android SDK
   - Atau gunakan **Opsi 3** (Development build) untuk development

---

## 🔍 Cara Cek Error Tanpa Rebuild

### Step 1: Connect Device

```powershell
cd C:\platform-tools
adb devices
```

### Step 2: Clear dan Lihat Log

```powershell
adb logcat -c
adb logcat | findstr "ReactNativeJS"
```

### Step 3: Test Print di Aplikasi

Buka aplikasi → Generate voucher → Print

### Step 4: Lihat Error Detail di Log

Cari log berikut:
- `❌ Printer error:` - Error object
- `❌ Error code:` - Error code (ECONNREFUSED, ETIMEDOUT, dll)
- `❌ Error message:` - Error message detail
- `📊 Print summary:` - Summary hasil print

Dari error code dan message, kita bisa langsung tahu:
- **ECONNREFUSED** → IP/port salah atau printer tidak ON
- **ETIMEDOUT** → Printer tidak merespons atau network lambat
- **ENETUNREACH** → Network tidak bisa dijangkau

---

## 📝 Contoh Log yang Akan Muncul

### Jika TCP Socket Tidak Tersedia:
```
⚠️ TCP Socket library not available
❌ TCP Socket library tidak tersedia. Pastikan menggunakan APK build (bukan Expo Go).
```

### Jika Koneksi Gagal:
```
🖨️ Attempting to connect to printer 192.168.110.10:9100
❌ Printer error: [Error object]
❌ Error code: ECONNREFUSED
❌ Error message: Connection refused - Printer tidak merespons atau port salah
📊 Print summary: 0/1 successful, 1 failed
```

### Jika Berhasil:
```
🖨️ Attempting to connect to printer 192.168.110.10:9100
✅ Connected to printer 192.168.110.10:9100
📤 Sent 1234 bytes to printer
✅ Voucher 1 printed successfully
📊 Print summary: 1/1 successful, 0 failed
```

---

**Coba Opsi 1 dulu - tidak perlu rebuild, langsung tahu masalahnya dari log!** 🚀

