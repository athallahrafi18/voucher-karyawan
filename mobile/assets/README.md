# Assets Folder

Folder ini berisi asset-asset untuk aplikasi Voucher Karyawan Rakan Kuphi.

## File yang diperlukan:

### 1. Icon (icon.png)
- **Ukuran**: 1024x1024 pixels
- **Format**: PNG dengan transparansi
- **Gunakan**: Logo aplikasi utama
- **Lokasi**: `./assets/icon.png`

### 2. Adaptive Icon (adaptive-icon.png) - Android
- **Ukuran**: 1024x1024 pixels
- **Format**: PNG dengan transparansi
- **Gunakan**: Icon untuk Android (adaptive icon)
- **Lokasi**: `./assets/adaptive-icon.png`
- **Catatan**: Logo harus berada di tengah, dengan padding 20% dari setiap sisi (area aman)

### 3. Splash Screen (splash.png)
- **Ukuran**: 1242x2436 pixels (atau 3:4 ratio)
- **Format**: PNG
- **Gunakan**: Layar splash saat aplikasi dibuka
- **Lokasi**: `./assets/splash.png`
- **Background**: Warna #D4A574 (golden brown)

### 4. Favicon (favicon.png) - Web (opsional)
- **Ukuran**: 48x48 pixels
- **Format**: PNG
- **Gunakan**: Icon untuk web version
- **Lokasi**: `./assets/favicon.png`

## Cara Menambahkan Logo:

1. Siapkan logo dengan ukuran yang sesuai (lihat di atas)
2. Simpan file dengan nama yang sesuai di folder `assets/`
3. Pastikan file sudah ada sebelum build APK

## Tools untuk Generate Icon:

Anda bisa menggunakan tools online seperti:
- https://www.appicon.co/
- https://icon.kitchen/
- https://www.favicon-generator.org/

Atau gunakan tool Expo:
```bash
npx expo install @expo/image-utils
```

## Catatan:

- Semua icon harus dalam format PNG
- Pastikan logo memiliki kontras yang baik
- Untuk adaptive icon Android, pastikan logo berada di area aman (tidak terlalu dekat ke edge)
