// API Configuration
// Update API_BASE_URL dengan backend URL Anda (Railway, localhost, dll)

// Production URL - Railway
const PRODUCTION_URL = 'https://voucher-karyawan-production.up.railway.app/api';

// Development URL - untuk test di emulator/simulator (localhost)
// Untuk test di device real, ganti dengan IP komputer Anda (contoh: http://192.168.1.100:3000/api)
const DEVELOPMENT_URL = 'http://localhost:3000/api';

// Gunakan production URL untuk device real
// Untuk development di emulator, bisa ganti dengan DEVELOPMENT_URL
export const API_BASE_URL = PRODUCTION_URL;

export const PRINTER_IP = '192.168.110.10';
export const PRINTER_PORT = 9100;

// Helper untuk build full URL
export const buildUrl = (endpoint) => {
  return `${API_BASE_URL}${endpoint}`;
};

