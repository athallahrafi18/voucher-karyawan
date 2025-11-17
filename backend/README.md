# Voucher Backend API

Backend API untuk sistem voucher karyawan Rakan Kuphi.

## Tech Stack

- Node.js + Express
- PostgreSQL
- CORS enabled untuk React Native

## Setup

1. Install dependencies:
```bash
npm install
```

2. Setup database:
   - Install PostgreSQL
   - Buat database baru: `voucher_db`
   - Atau gunakan PostgreSQL dari Railway/Supabase

3. Setup environment variables:
```bash
cp .env.example .env
```

Edit `.env`:
```
DATABASE_URL=postgresql://username:password@localhost:5432/voucher_db
PORT=3000
NODE_ENV=development
```

4. Run database migration:
```bash
npm run migrate
```

5. Start server:
```bash
# Development (with nodemon)
npm run dev

# Production
npm start
```

Server akan berjalan di `http://localhost:3000`

## API Endpoints

### 1. POST /api/vouchers/generate
Generate voucher harian

Request:
```json
{
  "quantity": 45,
  "issue_date": "2025-11-17"
}
```

### 2. GET /api/vouchers/check/:barcode
Cek status voucher

### 3. PUT /api/vouchers/redeem/:barcode
Tandai voucher sebagai sudah digunakan

Request:
```json
{
  "redeemed_by": "Kitchen Staff A",
  "tenant_used": "Martabak Rakan"
}
```

### 4. GET /api/vouchers/report/daily?date=2025-11-17
Laporan penggunaan voucher harian

### 5. GET /api/vouchers/print?date=2025-11-17
Get data voucher untuk print

### 6. POST /api/print/thermal
Print ke thermal printer

Request:
```json
{
  "vouchers": [...array of vouchers],
  "printer_ip": "192.168.110.10",
  "printer_port": 9100
}
```

## Database Schema

Tabel `vouchers`:
- id (SERIAL PRIMARY KEY)
- barcode (VARCHAR 50, UNIQUE)
- voucher_number (VARCHAR 10)
- nominal (INTEGER, default 10000)
- company_name (VARCHAR 100, default 'Rakan Kuphi')
- issue_date (DATE)
- valid_until (DATE)
- status (VARCHAR 20): 'active', 'redeemed', 'expired'
- redeemed_at (TIMESTAMP)
- redeemed_by (VARCHAR 100)
- tenant_used (VARCHAR 100)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

## Deployment

### Railway.app (Recommended)

1. Push code ke GitHub
2. Connect Railway ke GitHub repo
3. Add PostgreSQL database (auto-provision)
4. Set environment variables:
   - DATABASE_URL (auto dari Railway)
   - PORT=3000
   - NODE_ENV=production
5. Deploy!

Railway akan auto-detect Node.js dan deploy.

## Testing

Test API dengan Postman atau curl:

```bash
# Health check
curl http://localhost:3000/health

# Generate vouchers
curl -X POST http://localhost:3000/api/vouchers/generate \
  -H "Content-Type: application/json" \
  -d '{"quantity": 5, "issue_date": "2025-11-17"}'
```

