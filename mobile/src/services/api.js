import axios from 'axios';
import { buildUrl } from '../config/api';
import logger from '../utils/logger';

// Create axios instance
const api = axios.create({
  timeout: 30000, // Increased to 30 seconds for Railway
  headers: {
    'Content-Type': 'application/json',
  },
  // Additional config for Railway
  validateStatus: function (status) {
    return status >= 200 && status < 500; // Accept 4xx as valid responses
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    logger.debug('API Request:', config.method?.toUpperCase(), config.url);
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
    if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
      logger.error('API Error: Network Error - Check your internet connection and API URL');
      logger.debug('API URL:', error.config?.url);
      logger.debug('Error details:', {
        code: error.code,
        message: error.message,
        config: {
          method: error.config?.method,
          url: error.config?.url,
          timeout: error.config?.timeout,
        }
      });
    } else if (error.code === 'ECONNABORTED') {
      logger.error('API Error: Request timeout - Server took too long to respond');
      logger.debug('API URL:', error.config?.url);
    } else {
      logger.error('API Error:', error.response?.data || error.message);
      logger.debug('Status:', error.response?.status);
    }
    return Promise.reject(error);
  }
);

// Employee API
export const employeeAPI = {
  // Get all employees
  getAll: async (date = null) => {
    const params = date ? { date } : {};
    const response = await api.get(buildUrl('/employees'), { params });
    return response.data;
  },

  // Get employee by ID
  getById: async (id) => {
    const response = await api.get(buildUrl(`/employees/${id}`));
    return response.data;
  },

  // Create employee
  create: async (name, employeeCode = null) => {
    const response = await api.post(buildUrl('/employees'), {
      name,
      employee_code: employeeCode,
    });
    return response.data;
  },

  // Update employee
  update: async (id, name, employeeCode = null, isActive = true) => {
    const response = await api.put(buildUrl(`/employees/${id}`), {
      name,
      employee_code: employeeCode,
      is_active: isActive,
    });
    return response.data;
  },

  // Delete employee
  delete: async (id) => {
    const response = await api.delete(buildUrl(`/employees/${id}`));
    return response.data;
  },
};

// Voucher API
export const voucherAPI = {
  // Generate vouchers
  generate: async (employeeIds, issueDate) => {
    const response = await api.post(buildUrl('/vouchers/generate'), {
      employee_ids: employeeIds,
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

  // Get daily report (supports date range and status filter)
  getDailyReport: async (startDate, endDate = null, status = null) => {
    const params = { date: startDate };
    if (endDate) params.end_date = endDate;
    if (status && status !== 'all') params.status = status;
    
    const response = await api.get(buildUrl('/vouchers/report/daily'), { params });
    return response.data;
  },

  // Get vouchers for print
  getVouchersForPrint: async (date) => {
    const response = await api.get(buildUrl('/vouchers/print'), {
      params: { date },
    });
    return response.data;
  },

  // Get voucher details (supports date range and status filter)
  getVoucherDetails: async (startDate, endDate = null, status = null) => {
    const params = { date: startDate };
    if (endDate) params.end_date = endDate;
    if (status && status !== 'all') params.status = status;
    
    const response = await api.get(buildUrl('/vouchers/details'), { params });
    return response.data;
  },

  // Get scan history (for kitchen scan history screen)
  getScanHistory: async (date, status = 'all') => {
    const params = { date };
    if (status && status !== 'All') params.status = status.toLowerCase();
    
    const response = await api.get(buildUrl('/vouchers/scan-history'), { params });
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

