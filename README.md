# Sistem Voucher Karyawan Rakan Kuphi

Sistem lengkap untuk manage voucher makan karyawan dengan backend API dan mobile app.

## 📁 Struktur Project

```
voucher-karyawan/
├── backend/          # Node.js + Express + PostgreSQL API
└── mobile/           # React Native mobile app (Admin & Kitchen)
```

## 🚀 Quick Start

### Backend Setup

1. Install dependencies:
```bash
cd backend
npm install
```

2. Setup database:
   - Install PostgreSQL
   - Buat database: `voucher_db`
   - Atau gunakan PostgreSQL dari Railway/Supabase

3. Setup environment:
```bash
cp env.example .env
```

Edit `.env`:
```
DATABASE_URL=postgresql://username:password@localhost:5432/voucher_db
PORT=3000
NODE_ENV=development
```

4. Run migration:
```bash
npm run migrate
```

5. Start server:
```bash
npm run dev
```

Backend akan berjalan di `http://localhost:3000`

### Mobile App Setup

1. Install dependencies:
```bash
cd mobile
npm install
```

2. Configure API URL:
Edit `src/config/api.js`:
```javascript
export const API_BASE_URL = 'http://localhost:3000/api';  // Development
// atau
export const API_BASE_URL = 'https://your-backend.railway.app/api';  // Production
```

3. Start Expo:
```bash
npm start
```

4. Scan QR code dengan Expo Go app atau run:
```bash
npm run android
npm run ios
```

## 📱 Features

### Admin Role
- Dashboard dengan statistik harian
- Generate voucher (1-100 voucher per hari)
- Print ke thermal printer (ESC/POS)
- Laporan penggunaan voucher

### Kitchen Role
- Scan barcode voucher
- Validasi voucher
- Redeem voucher dengan input staff & tenant
- Riwayat scan hari ini

## 🗄️ Database Schema

Tabel `vouchers`:
- id, barcode (unique), voucher_number
- nominal (default: 10000)
- issue_date, valid_until (sama dengan issue_date)
- status: 'active', 'redeemed', 'expired'
- redeemed_at, redeemed_by, tenant_used

## 🔌 API Endpoints

### Vouchers
- `POST /api/vouchers/generate` - Generate voucher
- `GET /api/vouchers/check/:barcode` - Check voucher status
- `PUT /api/vouchers/redeem/:barcode` - Redeem voucher
- `GET /api/vouchers/report/daily?date=YYYY-MM-DD` - Daily report
- `GET /api/vouchers/print?date=YYYY-MM-DD` - Get vouchers for print

### Print
- `POST /api/print/thermal` - Print to thermal printer

## 🖨️ Thermal Printer

Printer configuration:
- IP: `192.168.110.10` (default)
- Port: `9100` (default)
- Protocol: TCP Socket
- Format: ESC/POS commands

## 📦 Tech Stack

### Backend
- Node.js + Express
- PostgreSQL
- CORS enabled

### Mobile
- React Native (Expo)
- React Navigation
- React Native Paper
- Expo Barcode Scanner
- AsyncStorage

## 🚢 Deployment

### Backend (Railway.app)

1. Push code ke GitHub
2. Connect Railway ke GitHub repo
3. Add PostgreSQL database
4. Set environment variables:
   - `DATABASE_URL` (auto dari Railway)
   - `PORT=3000`
   - `NODE_ENV=production`
5. Deploy!

### Mobile (EAS Build)

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

## 📝 Environment Variables

### Backend (.env)
```
DATABASE_URL=postgresql://...
PORT=3000
NODE_ENV=development
```

### Mobile (src/config/api.js)
```javascript
export const API_BASE_URL = 'http://...';
export const PRINTER_IP = '192.168.110.10';
export const PRINTER_PORT = 9100;
```

## 🧪 Testing

1. **Backend**: Test dengan Postman atau curl
2. **Mobile**: Test di real device (tablet/HP)
3. **Integration**: Test generate → print → scan → redeem flow

## 📖 Documentation

- Backend: Lihat `backend/README.md`
- Mobile: Lihat `mobile/README.md`

## 🎯 Workflow

1. **Admin**: Generate voucher → Print ke thermal printer
2. **Kitchen**: Scan barcode → Validasi → Redeem dengan input staff & tenant
3. **Admin**: Lihat laporan penggunaan voucher

## ⚠️ Important Notes

- Voucher hanya berlaku 1 hari (valid_until = issue_date)
- Barcode format: `RK + YYYYMMDD + nomor urut 3 digit`
- Nominal: Rp 10.000 per voucher
- 2 tenant: Martabak Rakan & Mie Aceh Rakan
- Auto-expire voucher yang lewat tanggal

## 📞 Support

Untuk issues atau pertanyaan, silakan buat issue di repository.

---

**Made with ❤️ for Rakan Kuphi**

