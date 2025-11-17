import axios from 'axios';
import { buildUrl } from '../config/api';

// Create axios instance
const api = axios.create({
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log('API Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Voucher API
export const voucherAPI = {
  // Generate vouchers
  generate: async (quantity, issueDate) => {
    const response = await api.post(buildUrl('/vouchers/generate'), {
      quantity,
      issue_date: issueDate,
    });
    return response.data;
  },

  // Check voucher
  check: async (barcode) => {
    const response = await api.get(buildUrl(`/vouchers/check/${barcode}`));
    return response.data;
  },

  // Redeem voucher
  redeem: async (barcode, redeemedBy, tenantUsed) => {
    const response = await api.put(buildUrl(`/vouchers/redeem/${barcode}`), {
      redeemed_by: redeemedBy,
      tenant_used: tenantUsed,
    });
    return response.data;
  },

  // Get daily report
  getDailyReport: async (date) => {
    const response = await api.get(buildUrl('/vouchers/report/daily'), {
      params: { date },
    });
    return response.data;
  },

  // Get vouchers for print
  getVouchersForPrint: async (date) => {
    const response = await api.get(buildUrl('/vouchers/print'), {
      params: { date },
    });
    return response.data;
  },

  // Get voucher details
  getVoucherDetails: async (date) => {
    const response = await api.get(buildUrl('/vouchers/details'), {
      params: { date },
    });
    return response.data;
  },
};

// Print API
export const printAPI = {
  // Print thermal
  thermal: async (vouchers, printerIp, printerPort) => {
    const response = await api.post(buildUrl('/print/thermal'), {
      vouchers,
      printer_ip: printerIp,
      printer_port: printerPort,
    });
    return response.data;
  },
};

export default api;

