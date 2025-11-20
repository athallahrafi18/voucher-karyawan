# 🔄 Migrasi ke @haroldtran/react-native-thermal-printer

## Alasan Migrasi

1. **Library saat ini** (`react-native-thermal-receipt-printer`) mungkin tidak kompatibel dengan printer iware ULT-80AT III
2. **Error native** menunjukkan library tidak bisa memproses raw ESC/POS dengan baik
3. **@haroldtran/react-native-thermal-printer** lebih populer dan aktif dikembangkan

## Langkah Migrasi

### 1. Uninstall Library Lama

```bash
cd mobile
npm uninstall react-native-thermal-receipt-printer base-64
```

### 2. Install Library Baru

```bash
npm install @haroldtran/react-native-thermal-printer
```

### 3. Update Code

Library baru memiliki API yang sedikit berbeda:

**Old API (react-native-thermal-receipt-printer):**
```javascript
await NetPrinter.init();
await NetPrinter.connectPrinter(host, port);
await NetPrinter.printText(data);
await NetPrinter.closeConn();
```

**New API (@haroldtran/react-native-thermal-printer):**
```javascript
import { NetPrinter } from '@haroldtran/react-native-thermal-printer';

await NetPrinter.init();
await NetPrinter.connectPrinter(host, port, timeout);
await NetPrinter.printText(data);
await NetPrinter.cutPaper(); // Optional
await NetPrinter.closeConn();
```

### 4. Perubahan di printer.js

Perlu update:
- Import statement
- API calls (sedikit berbeda)
- Error handling

## Keuntungan Library Baru

1. ✅ Lebih aktif dikembangkan
2. ✅ Dokumentasi lebih lengkap
3. ✅ Kompatibel dengan lebih banyak printer ESC/POS
4. ✅ API lebih sederhana
5. ✅ Support untuk cut paper, image printing, dll

## Catatan

- Library baru juga memerlukan EAS Build (tidak bisa di Expo Go)
- Perlu rebuild aplikasi setelah install library baru
- Test dengan printer iware setelah migrasi

