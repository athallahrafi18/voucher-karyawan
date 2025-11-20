# ⚠️ Library Tidak Terdeteksi - Troubleshooting

## Masalah

Dari log:
```
📡 Thermal Printer available: false
🔌 NetPrinter available: false
```

Library `@haroldtran/react-native-thermal-printer` tidak terdeteksi.

## Kemungkinan Penyebab

### 1. Library Belum Ter-link di Native (PALING MUNGKIN)
- Library ini adalah **native module**
- Setelah `npm install`, library perlu di-link ke native code
- **Perlu rebuild aplikasi** setelah install library baru

### 2. Struktur Module Berbeda
- Import statement mungkin salah
- Struktur export library mungkin berbeda dari yang diharapkan

### 3. Library Tidak Kompatibel dengan Expo SDK 54
- Library mungkin memerlukan konfigurasi khusus untuk Expo
- Mungkin perlu plugin atau config tambahan

## Solusi

### Step 1: Pastikan Library Terinstall
```bash
cd mobile
npm list @haroldtran/react-native-thermal-printer
```

### Step 2: Rebuild Aplikasi (WAJIB)
Library native module **HARUS** di-rebuild setelah install:

```bash
cd mobile
eas build --platform android --profile preview
```

**PENTING:** Library native module tidak akan bekerja tanpa rebuild!

### Step 3: Cek Log Setelah Rebuild
Setelah rebuild, cek log untuk melihat:
- Apakah library terdeteksi
- Struktur module yang sebenarnya
- Methods yang tersedia

### Step 4: Jika Masih Tidak Terdeteksi
Cek apakah library support Expo:
- Beberapa library tidak support Expo
- Mungkin perlu eject dari Expo atau menggunakan development build

## Catatan Penting

**Library native module TIDAK akan bekerja di:**
- ❌ Expo Go
- ❌ Tanpa rebuild setelah install

**Library native module AKAN bekerja di:**
- ✅ Development build (EAS Build)
- ✅ Production build (EAS Build)
- ✅ Setelah rebuild dengan native module ter-link

## Langkah Selanjutnya

1. **Rebuild aplikasi** dengan EAS Build
2. **Test lagi** dan cek log untuk melihat apakah library terdeteksi
3. Jika masih tidak terdeteksi, cek struktur module dari log yang lebih detail

