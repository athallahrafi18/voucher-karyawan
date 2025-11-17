# Voucher Rakan Kuphi - Mobile App

Aplikasi mobile React Native untuk sistem voucher karyawan Rakan Kuphi dengan 2 role: Admin dan Kitchen.

## Tech Stack

- React Native (Expo)
- React Navigation (Stack & Bottom Tabs)
- React Native Paper (UI Components)
- Axios (HTTP Client)
- Expo Barcode Scanner
- AsyncStorage (Local Storage)

## Features

### Admin Role
- **Home Screen**: Dashboard dengan statistik harian
- **Generate Voucher**: Generate dan print voucher ke thermal printer
- **Report Screen**: Laporan penggunaan voucher harian

### Kitchen Role
- **Scanner Screen**: Scan barcode voucher dengan kamera
- **Validation Screen**: Validasi dan redeem voucher
- **History Screen**: Riwayat scan hari ini

## Setup

1. Install dependencies:
```bash
cd mobile
npm install
```

2. Configure API URL:
Edit `src/config/api.js`:
```javascript
export const API_BASE_URL = 'http://YOUR_BACKEND_URL/api';
```

3. Start development server:
```bash
npm start
```

4. Run on device:
- Scan QR code dengan Expo Go app (Android/iOS)
- Atau run: `npm run android` / `npm run ios`

## Configuration

### API Configuration
Edit `src/config/api.js` untuk mengubah:
- `API_BASE_URL`: Backend API URL
- `PRINTER_IP`: IP address thermal printer
- `PRINTER_PORT`: Port thermal printer (default: 9100)

### Theme
Edit `src/config/theme.js` untuk custom theme colors.

## Build

### Development (Expo Go)
```bash
npm start
```

### Production Build (APK)
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

Download APK dari EAS dashboard dan install di tablet/HP.

## Project Structure

```
mobile/
├── src/
│   ├── screens/
│   │   ├── auth/
│   │   │   └── LoginScreen.js
│   │   ├── admin/
│   │   │   ├── HomeScreen.js
│   │   │   ├── GenerateVoucherScreen.js
│   │   │   └── ReportScreen.js
│   │   ├── kitchen/
│   │   │   ├── ScannerScreen.js
│   │   │   ├── ValidationScreen.js
│   │   │   └── HistoryScreen.js
│   │   └── shared/
│   │       └── SettingsScreen.js
│   ├── components/
│   │   ├── VoucherCard.js
│   │   ├── StatsCard.js
│   │   └── StatusBadge.js
│   ├── navigation/
│   │   ├── AppNavigator.js
│   │   ├── AuthNavigator.js
│   │   ├── AdminNavigator.js
│   │   └── KitchenNavigator.js
│   ├── contexts/
│   │   ├── AuthContext.js
│   │   └── VoucherContext.js
│   ├── services/
│   │   └── api.js
│   ├── config/
│   │   ├── api.js
│   │   ├── theme.js
│   │   └── roles.js
│   └── utils/
│       ├── device.js
│       ├── formatters.js
│       └── storage.js
├── App.js
└── package.json
```

## Responsive Design

Aplikasi otomatis detect device type (tablet/phone) dan adjust:
- Font sizes
- Button heights
- Spacing
- Touch targets

## Permissions

Aplikasi memerlukan permission:
- **Camera**: Untuk scan barcode (Kitchen role)

## Testing

1. Test di real device (bukan emulator)
2. Test barcode scanning dengan voucher yang sudah di-print
3. Test network errors (offline mode)
4. Test di tablet dan HP

## Troubleshooting

### Camera tidak bekerja
- Pastikan permission camera sudah diberikan
- Test di real device (emulator tidak support camera)

### API connection error
- Check `API_BASE_URL` di `src/config/api.js`
- Pastikan backend sudah running
- Check network connection

### Build error
- Pastikan semua dependencies terinstall: `npm install`
- Clear cache: `expo start -c`

## Support

Untuk issues atau pertanyaan, silakan buat issue di repository.

