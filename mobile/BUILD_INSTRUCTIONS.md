# Instruksi Build APK - Voucher Karyawan Rakan Kuphi

## 📋 Checklist Sebelum Build

### ✅ 1. Siapkan Logo/Icon

Anda perlu menyiapkan file berikut di folder `mobile/assets/`:

#### a. Icon (icon.png)
- **Ukuran**: 1024x1024 pixels
- **Format**: PNG dengan background transparan
- **Nama file**: `icon.png`
- **Lokasi**: `mobile/assets/icon.png`

#### b. Adaptive Icon (adaptive-icon.png) - Android
- **Ukuran**: 1024x1024 pixels
- **Format**: PNG dengan background transparan
- **Nama file**: `adaptive-icon.png`
- **Lokasi**: `mobile/assets/adaptive-icon.png`
- **Catatan**: Logo harus berada di tengah, sisakan padding 20% dari setiap sisi (area aman untuk Android)

#### c. Splash Screen (splash.png)
- **Ukuran**: 1242x2436 pixels (atau ratio 3:4)
- **Format**: PNG
- **Nama file**: `splash.png`
- **Lokasi**: `mobile/assets/splash.png`
- **Background**: Warna #D4A574 (golden brown) - sudah di-set di app.json

#### d. Favicon (favicon.png) - Opsional
- **Ukuran**: 48x48 pixels
- **Format**: PNG
- **Nama file**: `favicon.png`
- **Lokasi**: `mobile/assets/favicon.png`

### ✅ 2. Cara Menambahkan Logo

1. **Siapkan logo Anda** dengan ukuran yang sesuai (lihat di atas)
2. **Rename file** sesuai nama yang diperlukan
3. **Copy file** ke folder `mobile/assets/`
4. **Pastikan file sudah ada** sebelum build

### ✅ 3. Tools untuk Generate Icon

Jika Anda punya logo dalam format lain, gunakan tools online:
- **App Icon Generator**: https://www.appicon.co/
- **Icon Kitchen**: https://icon.kitchen/
- **Favicon Generator**: https://www.favicon-generator.org/

Atau gunakan tool Expo:
```bash
cd mobile
npx expo install @expo/image-utils
```

---

## 🚀 Langkah Build APK

### Step 1: Install EAS CLI

```bash
npm install -g eas-cli
```

### Step 2: Login ke Expo

```bash
eas login
```

Jika belum punya akun Expo, buat di: https://expo.dev/signup

### Step 3: Configure Project

```bash
cd mobile
eas build:configure
```

Ini akan:
- Menambahkan project ID ke `app.json` (mengganti `your-project-id-here`)
- Membuat file `eas.json` (sudah dibuat, akan di-update jika perlu)

### Step 4: Pastikan Logo Sudah Ada

Cek apakah file berikut ada:
```bash
# Windows PowerShell
dir mobile\assets\*.png

# Atau cek manual di folder mobile/assets/
```

File yang harus ada:
- ✅ `icon.png`
- ✅ `adaptive-icon.png`
- ✅ `splash.png`
- ✅ `favicon.png` (opsional)

### Step 5: Build APK

#### Option A: Build Preview (untuk testing)
```bash
cd mobile
eas build --platform android --profile preview
```

#### Option B: Build Production
```bash
cd mobile
eas build --platform android --profile production
```

### Step 6: Download APK

Setelah build selesai:
1. **Link download** akan muncul di terminal
2. Atau buka **EAS Dashboard**: https://expo.dev/accounts/[your-account]/projects/voucher-karyawan-rakan-kuphi/builds
3. **Download APK** dan install di tablet/HP

---

## ⚠️ Troubleshooting

### Error: Missing Icon
**Solusi**: Pastikan file `icon.png` dan `adaptive-icon.png` ada di `mobile/assets/`

### Error: Project ID not found
**Solusi**: Jalankan `eas build:configure` untuk generate project ID

### Error: Build timeout
**Solusi**: Build pertama kali mungkin lama (10-20 menit), tunggu sampai selesai

### Error: Network error
**Solusi**: Pastikan koneksi internet stabil, build dilakukan di cloud

---

## 📝 Informasi Aplikasi

- **Nama**: Voucher Karyawan Rakan Kuphi
- **Package**: com.rakan.kuphi.voucher
- **Version**: 1.0.0
- **Description**: Aplikasi manajemen voucher makan karyawan untuk Rakan Kuphi. Fitur generate voucher, scan barcode, dan print langsung ke printer thermal.

---

## 🎨 Warna Aplikasi

- **Primary Color**: #2563EB (Blue)
- **Splash Background**: #D4A574 (Golden Brown)
- **Icon Background**: #D4A574 (Golden Brown)

---

## 📞 Support

Jika ada masalah:
1. Cek dokumentasi EAS: https://docs.expo.dev/build/introduction/
2. Cek Expo Documentation: https://docs.expo.dev/
3. Cek file `APP_SETUP.md` untuk informasi lebih detail

---

## ✅ Checklist Final

Sebelum build, pastikan:
- [ ] Logo sudah di-upload ke `mobile/assets/`
- [ ] File `icon.png` (1024x1024) ada
- [ ] File `adaptive-icon.png` (1024x1024) ada
- [ ] File `splash.png` (1242x2436) ada
- [ ] Sudah login ke Expo (`eas login`)
- [ ] Sudah configure project (`eas build:configure`)
- [ ] Koneksi internet stabil

Setelah semua checklist selesai, jalankan build!

