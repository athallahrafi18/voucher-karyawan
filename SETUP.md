# 🚀 Setup Guide - Sistem Voucher Rakan Kuphi

Panduan lengkap untuk setup dan menjalankan aplikasi.

## 📋 Prerequisites

- Node.js 16+ dan npm
- PostgreSQL 12+
- Expo CLI (untuk mobile)
- Git

## 🔧 Backend Setup

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Setup Database

**Option A: Local PostgreSQL**
```bash
# Install PostgreSQL
# Windows: Download dari postgresql.org
# Mac: brew install postgresql
# Linux: sudo apt-get install postgresql

# Create database
createdb voucher_db

# Atau via psql:
psql -U postgres
CREATE DATABASE voucher_db;
```

**Option B: Cloud Database (Railway/Supabase)**
- Buat database di Railway atau Supabase
- Copy connection string

### 3. Configure Environment

```bash
cd backend
cp env.example .env
```

Edit `.env`:
```env
DATABASE_URL=postgresql://username:password@localhost:5432/voucher_db
PORT=3000
NODE_ENV=development
```

**Untuk Railway/Supabase:**
```env
DATABASE_URL=postgresql://user:pass@host:5432/dbname
PORT=3000
NODE_ENV=production
```

### 4. Run Migration

```bash
npm run migrate
```

Ini akan membuat tabel `vouchers` dan indexes.

### 5. Start Server

```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

Server akan berjalan di `http://localhost:3000`

### 6. Test Backend

```bash
# Health check
curl http://localhost:3000/health

# Generate test vouchers
curl -X POST http://localhost:3000/api/vouchers/generate \
  -H "Content-Type: application/json" \
  -d '{"quantity": 5, "issue_date": "2025-11-17"}'
```

## 📱 Mobile App Setup

### 1. Install Dependencies

```bash
cd mobile
npm install
```

### 2. Install Expo CLI (if not installed)

```bash
npm install -g expo-cli
```

### 3. Configure API URL

Edit `mobile/src/config/api.js`:

**Untuk Development (localhost):**
```javascript
export const API_BASE_URL = 'http://localhost:3000/api';
```

**⚠️ Important untuk Android:**
Jika test di Android device/emulator, gunakan IP komputer Anda:
```javascript
// Cari IP komputer Anda:
// Windows: ipconfig
// Mac/Linux: ifconfig

export const API_BASE_URL = 'http://192.168.1.100:3000/api';  // Ganti dengan IP Anda
```

**Untuk Production:**
```javascript
export const API_BASE_URL = 'https://your-backend.railway.app/api';
```

### 4. Configure Printer (Optional)

Edit `mobile/src/config/api.js`:
```javascript
export const PRINTER_IP = '192.168.110.10';  // Ganti dengan IP printer Anda
export const PRINTER_PORT = 9100;
```

### 5. Start Expo

```bash
cd mobile
npm start
```

Ini akan:
- Start Metro bundler
- Show QR code untuk Expo Go
- Open Expo DevTools

### 6. Run on Device

**Option A: Expo Go (Recommended untuk testing)**
1. Install Expo Go app di HP/Tablet
2. Scan QR code dari terminal
3. App akan load di device

**Option B: Android Emulator**
```bash
npm run android
```

**Option C: iOS Simulator (Mac only)**
```bash
npm run ios
```

## 🧪 Testing

### Test Backend API

1. **Generate Vouchers:**
```bash
curl -X POST http://localhost:3000/api/vouchers/generate \
  -H "Content-Type: application/json" \
  -d '{"quantity": 10, "issue_date": "2025-11-17"}'
```

2. **Check Voucher:**
```bash
curl http://localhost:3000/api/vouchers/check/RK20251117001
```

3. **Redeem Voucher:**
```bash
curl -X PUT http://localhost:3000/api/vouchers/redeem/RK20251117001 \
  -H "Content-Type: application/json" \
  -d '{"redeemed_by": "Test Staff", "tenant_used": "Martabak Rakan"}'
```

4. **Get Daily Report:**
```bash
curl "http://localhost:3000/api/vouchers/report/daily?date=2025-11-17"
```

### Test Mobile App

1. **Login Screen:**
   - Pilih role: Admin atau Kitchen
   - App akan navigate ke screen sesuai role

2. **Admin Flow:**
   - Home → Generate Voucher → Print
   - Home → Report → Lihat laporan

3. **Kitchen Flow:**
   - Scanner → Scan barcode → Validation → Redeem
   - History → Lihat riwayat scan

## 🐛 Troubleshooting

### Backend Issues

**Database connection error:**
- Check PostgreSQL sudah running
- Check `DATABASE_URL` di `.env` benar
- Test connection: `psql $DATABASE_URL`

**Port already in use:**
- Change `PORT` di `.env`
- Atau kill process: `lsof -ti:3000 | xargs kill`

**Migration error:**
- Pastikan database sudah dibuat
- Check user punya permission CREATE TABLE

### Mobile Issues

**Cannot connect to API:**
- Check `API_BASE_URL` di `src/config/api.js`
- Untuk Android, gunakan IP komputer (bukan localhost)
- Check backend sudah running
- Check firewall tidak block port 3000

**Camera permission denied:**
- Enable camera permission di device settings
- Atau reinstall app

**Expo Go connection error:**
- Pastikan HP dan komputer di network yang sama
- Check firewall settings
- Try restart Expo: `npm start -c`

**Build error:**
- Clear cache: `expo start -c`
- Delete `node_modules` dan reinstall: `rm -rf node_modules && npm install`

## 🚢 Deployment

### Backend ke Railway

1. Push code ke GitHub
2. Login ke Railway.app
3. New Project → Deploy from GitHub
4. Select repository
5. Add PostgreSQL database
6. Set environment variables:
   - `DATABASE_URL` (auto dari Railway)
   - `PORT=3000`
   - `NODE_ENV=production`
7. Deploy!

### Mobile ke EAS Build

```bash
# Install EAS CLI
npm install -g eas-cli

# Login
eas login

# Configure
eas build:configure

# Build APK
eas build --platform android --profile preview
```

Download APK dari EAS dashboard.

## 📝 Next Steps

1. ✅ Setup backend dan database
2. ✅ Test API dengan Postman/curl
3. ✅ Setup mobile app
4. ✅ Test di device
5. ✅ Deploy backend ke Railway
6. ✅ Update API URL di mobile
7. ✅ Build APK dan install di tablet

## 💡 Tips

- Gunakan real device untuk testing (bukan emulator)
- Test barcode scanning dengan voucher yang sudah di-print
- Backup database sebelum production
- Monitor logs di Railway dashboard
- Test offline mode di mobile app

---

**Happy Coding! 🎉**

