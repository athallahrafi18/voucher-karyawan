// API Configuration
// Update API_BASE_URL dengan backend URL Anda (Railway, localhost, dll)

export const API_BASE_URL = __DEV__ 
  ? 'http://localhost:3000/api'  // Development - ganti dengan IP komputer Anda jika test di device
  : 'https://your-backend.railway.app/api';  // Production - ganti dengan Railway URL

export const PRINTER_IP = '192.168.110.10';
export const PRINTER_PORT = 9100;

// Helper untuk build full URL
export const buildUrl = (endpoint) => {
  return `${API_BASE_URL}${endpoint}`;
};

