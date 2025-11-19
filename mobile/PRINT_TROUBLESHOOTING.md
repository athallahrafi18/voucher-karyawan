# Troubleshooting Print - Voucher Karyawan Rakan Kuphi

## Masalah: Tidak bisa print ke printer thermal

### 1. Pastikan Anda menggunakan APK yang sudah di-build (BUKAN Expo Go)

**Expo Go TIDAK SUPPORT native modules seperti `react-native-tcp-socket`**

✅ **Solusi**: Build APK dengan EAS Build dan install APK tersebut di tablet/HP

```bash
cd mobile
eas build --platform android --profile preview
```

Setelah build selesai, download dan install APK di device.

---

### 2. Cek Log Console

Buka console/log aplikasi dan cari pesan berikut:

#### Jika melihat:
```
⚠️ TCP Socket library not available
```
**Artinya**: Masih menggunakan Expo Go atau native module tidak ter-link

#### Jika melihat:
```
✅ TCP Socket library available and ready to use
🖨️ Attempting to connect to printer 192.168.110.10:9100
```
**Artinya**: TCP Socket tersedia, tapi ada masalah koneksi

---

### 3. Cek Koneksi Network

#### Pastikan:
- ✅ Tablet/HP dan printer terhubung ke **jaringan yang sama** (WiFi/LAN)
- ✅ IP printer benar: `192.168.110.10`
- ✅ Port printer benar: `9100`
- ✅ Printer dalam kondisi **ON** dan **ready**

#### Test koneksi:
1. Buka browser di tablet/HP
2. Coba akses: `http://192.168.110.10:9100` (jika printer support HTTP)
3. Atau ping dari terminal: `ping 192.168.110.10`

---

### 4. Cek Permission Android

Pastikan aplikasi memiliki permission:
- ✅ `INTERNET` - untuk koneksi network
- ✅ `ACCESS_NETWORK_STATE` - untuk cek status network

Permission sudah di-set di `app.json`, tapi pastikan di device:
- Settings → Apps → Voucher Karyawan Rakan Kuphi → Permissions
- Pastikan "Network" permission **ON**

---

### 5. Cek Error Message di Aplikasi

Saat mencoba print, perhatikan error message:

#### Error: "Printing tidak tersedia di Expo Go"
**Solusi**: Build APK dengan EAS Build

#### Error: "Printer connection timeout"
**Kemungkinan**:
- IP printer salah
- Printer tidak terhubung ke network
- Firewall memblokir koneksi

**Solusi**:
1. Cek IP printer di Settings → Setting Printer
2. Pastikan printer dan device di jaringan yang sama
3. Cek firewall/router settings

#### Error: "Failed to connect to printer: ECONNREFUSED"
**Artinya**: Printer menolak koneksi

**Solusi**:
1. Pastikan printer support TCP/IP printing
2. Cek apakah printer dalam mode "Network Ready"
3. Restart printer

---

### 6. Test dengan Tools Lain

Coba test koneksi printer dengan tools lain:

#### Windows:
```powershell
Test-NetConnection -ComputerName 192.168.110.10 -Port 9100
```

#### Android (Terminal):
```bash
nc -zv 192.168.110.10 9100
```

Jika tools lain juga tidak bisa connect, masalahnya di network/printer, bukan di aplikasi.

---

### 7. Cek Console Log Detail

Saat mencoba print, buka console/log dan cari:

```
📦 TcpSocketModule: [object]
✅ Found Socket at ...
✅ TCP Socket library available
🖨️ Attempting to connect to printer ...
📦 Data size: XXX bytes
✅ Connected to printer ...
📤 Sent XXX bytes to printer
```

Jika tidak melihat log ini, berarti TCP Socket tidak tersedia (masih Expo Go).

---

### 8. Rebuild APK

Jika sudah build APK tapi masih tidak bisa:

1. **Rebuild dengan clean**:
```bash
cd mobile
eas build --platform android --profile preview --clear-cache
```

2. **Uninstall APK lama** dari device

3. **Install APK baru**

---

### 9. Cek Printer Settings

Pastikan di aplikasi:
- Settings → Setting Printer
- IP Printer: `192.168.110.10`
- Port: `9100`
- Paper Size: `58mm` atau `80mm` (sesuai printer)

---

### 10. Test Print Manual

Coba test print dengan command langsung (jika printer support):

#### Windows PowerShell:
```powershell
$socket = New-Object System.Net.Sockets.TcpClient("192.168.110.10", 9100)
$stream = $socket.GetStream()
$data = [System.Text.Encoding]::UTF8.GetBytes("TEST PRINT`n")
$stream.Write($data, 0, $data.Length)
$socket.Close()
```

Jika ini berhasil, berarti printer OK, masalahnya di aplikasi.

---

## Checklist Troubleshooting

- [ ] Sudah build APK dengan EAS Build (bukan Expo Go)
- [ ] Sudah install APK di device
- [ ] Device dan printer di jaringan yang sama
- [ ] IP printer benar (192.168.110.10)
- [ ] Port printer benar (9100)
- [ ] Printer dalam kondisi ON dan ready
- [ ] Permission INTERNET sudah diberikan
- [ ] Cek console log untuk error detail
- [ ] Test koneksi dengan tools lain

---

## Jika Masih Tidak Bisa

1. **Cek console log** dan copy error message lengkap
2. **Test koneksi** dengan tools lain (ping, telnet, nc)
3. **Cek printer manual** - apakah printer bisa diakses dari device lain?
4. **Cek network** - apakah ada firewall/VPN yang memblokir?

---

## Support

Jika masih tidak bisa setelah semua langkah di atas:
1. Copy console log lengkap
2. Copy error message dari aplikasi
3. Cek apakah printer support TCP/IP printing
4. Hubungi support atau buat issue di repository

