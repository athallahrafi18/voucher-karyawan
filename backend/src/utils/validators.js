/**
 * Input validation and sanitization utilities for production
 */

class Validators {
  // Validate date format YYYY-MM-DD
  static validateDate(dateString) {
    if (!dateString || typeof dateString !== 'string') {
      return { valid: false, error: 'Tanggal harus diisi' };
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(dateString)) {
      return { valid: false, error: 'Format tanggal harus YYYY-MM-DD' };
    }

    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return { valid: false, error: 'Tanggal tidak valid' };
    }

    return { valid: true, date };
  }

  // Validate IP address
  static validateIP(ip) {
    if (!ip || typeof ip !== 'string') {
      return { valid: false, error: 'IP address harus diisi' };
    }

    const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    if (!ipRegex.test(ip)) {
      return { valid: false, error: 'Format IP address tidak valid' };
    }

    return { valid: true, ip: ip.trim() };
  }

  // Validate port number
  static validatePort(port) {
    if (!port) {
      return { valid: false, error: 'Port harus diisi' };
    }

    const portNum = parseInt(port, 10);
    if (isNaN(portNum) || portNum < 1 || portNum > 65535) {
      return { valid: false, error: 'Port harus antara 1-65535' };
    }

    return { valid: true, port: portNum };
  }

  // Validate employee ID array
  static validateEmployeeIds(employeeIds) {
    if (!employeeIds || !Array.isArray(employeeIds)) {
      return { valid: false, error: 'employee_ids harus berupa array' };
    }

    if (employeeIds.length === 0) {
      return { valid: false, error: 'employee_ids tidak boleh kosong' };
    }

    if (employeeIds.length > 100) {
      return { valid: false, error: 'Maksimal 100 karyawan per batch' };
    }

    const validIds = employeeIds
      .map(id => {
        const numId = parseInt(id, 10);
        return !isNaN(numId) && numId > 0 ? numId : null;
      })
      .filter(id => id !== null);

    if (validIds.length === 0) {
      return { valid: false, error: 'Minimal 1 employee_id yang valid harus diisi' };
    }

    return { valid: true, ids: validIds };
  }

  // Validate barcode (alphanumeric, max 50 chars)
  static validateBarcode(barcode) {
    if (!barcode || typeof barcode !== 'string') {
      return { valid: false, error: 'Barcode harus diisi' };
    }

    const trimmed = barcode.trim();
    if (trimmed.length === 0) {
      return { valid: false, error: 'Barcode tidak boleh kosong' };
    }

    if (trimmed.length > 50) {
      return { valid: false, error: 'Barcode maksimal 50 karakter' };
    }

    // Allow alphanumeric and common barcode characters
    const barcodeRegex = /^[A-Za-z0-9\-_]+$/;
    if (!barcodeRegex.test(trimmed)) {
      return { valid: false, error: 'Barcode hanya boleh mengandung huruf, angka, dan karakter -_' };
    }

    return { valid: true, barcode: trimmed };
  }

  // Validate string input (for names, etc.)
  static validateString(value, fieldName, options = {}) {
    const { minLength = 1, maxLength = 255, required = true } = options;

    if (required && (!value || typeof value !== 'string')) {
      return { valid: false, error: `${fieldName} harus diisi` };
    }

    if (!required && !value) {
      return { valid: true, value: '' };
    }

    const trimmed = value.trim();
    if (trimmed.length < minLength) {
      return { valid: false, error: `${fieldName} minimal ${minLength} karakter` };
    }

    if (trimmed.length > maxLength) {
      return { valid: false, error: `${fieldName} maksimal ${maxLength} karakter` };
    }

    return { valid: true, value: trimmed };
  }

  // Validate integer ID
  static validateId(id, fieldName = 'ID') {
    if (!id) {
      return { valid: false, error: `${fieldName} harus diisi` };
    }

    const numId = parseInt(id, 10);
    if (isNaN(numId) || numId <= 0) {
      return { valid: false, error: `${fieldName} harus berupa angka positif` };
    }

    return { valid: true, id: numId };
  }

  // Sanitize string (remove dangerous characters)
  static sanitizeString(str) {
    if (typeof str !== 'string') return '';
    return str.trim().replace(/[<>]/g, '');
  }
}

module.exports = Validators;

