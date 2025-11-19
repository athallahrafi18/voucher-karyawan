# Setup Aplikasi Voucher Karyawan Rakan Kuphi

## Informasi Aplikasi

- **Nama**: Voucher Karyawan Rakan Kuphi
- **Package Name**: com.rakan.kuphi.voucher
- **Version**: 1.0.0
- **Description**: Aplikasi manajemen voucher makan karyawan untuk Rakan Kuphi. Fitur generate voucher, scan barcode, dan print langsung ke printer thermal.

## Deskripsi Aplikasi

Aplikasi Voucher Karyawan Rakan Kuphi adalah sistem manajemen voucher makan harian untuk karyawan. Aplikasi ini memiliki dua role utama:

### Role Admin:
- Generate voucher harian untuk karyawan
- Master data karyawan
- Laporan harian voucher
- Setting printer thermal

### Role Kitchen:
- Scan barcode voucher
- Validasi dan redeem voucher
- Riwayat scan harian

## Fitur Utama:

1. **Generate Voucher**: Admin dapat membuat voucher untuk karyawan yang hadir
2. **Print Langsung**: Print voucher langsung ke printer thermal via LAN (seperti LUNA POS)
3. **Scan Barcode**: Kitchen dapat scan barcode untuk validasi voucher
4. **Master Data**: Kelola data karyawan dengan mudah
5. **Laporan**: Lihat laporan harian voucher yang sudah digunakan

## Setup untuk Build APK

### 1. Install EAS CLI

```bash
npm install -g eas-cli
```

### 2. Login ke Expo

```bash
eas login
```

### 3. Configure Project

```bash
cd mobile
eas build:configure
```

Ini akan membuat file `eas.json` (sudah dibuat) dan menambahkan project ID ke `app.json`.

### 4. Siapkan Logo/Icon

Pastikan file berikut ada di folder `mobile/assets/`:
- `icon.png` (1024x1024)
- `adaptive-icon.png` (1024x1024)
- `splash.png` (1242x2436)
- `favicon.png` (48x48) - opsional

### 5. Build APK

#### Build Preview (untuk testing):
```bash
eas build --platform android --profile preview
```

#### Build Production:
```bash
eas build --platform android --profile production
```

### 6. Download APK

Setelah build selesai, download APK dari:
- EAS Dashboard: https://expo.dev/accounts/[your-account]/projects/voucher-karyawan-rakan-kuphi/builds
- Atau dari link yang diberikan di terminal

## Catatan Penting:

1. **Logo**: Pastikan logo sudah di-upload ke folder `assets/` sebelum build
2. **Project ID**: Setelah `eas build:configure`, project ID akan otomatis ditambahkan ke `app.json`
3. **Network**: Pastikan aplikasi memiliki permission INTERNET dan ACCESS_NETWORK_STATE
4. **Printer**: Untuk print langsung, aplikasi memerlukan native module (sudah include react-native-tcp-socket)

## Environment Variables

Tidak ada environment variables yang diperlukan untuk build. API URL sudah di-set di `src/config/api.js`.

## Troubleshooting

### Build Error: Missing Icon
- Pastikan file `icon.png` dan `adaptive-icon.png` ada di folder `assets/`

### Build Error: Project ID
- Jalankan `eas build:configure` untuk generate project ID

### Build Error: Network Permission
- Permission sudah di-set di `app.json`, tidak perlu tambahan

## Support

Untuk masalah build atau setup, cek:
- EAS Build Documentation: https://docs.expo.dev/build/introduction/
- Expo Documentation: https://docs.expo.dev/

