const VoucherModel = require('../models/voucherModel');
const Validators = require('../utils/validators');

class VoucherController {
  // POST /api/vouchers/generate
  static async generate(req, res, next) {
    try {
      const { employee_ids, issue_date } = req.body;
      const EmployeeModel = require('../models/employeeModel');

      // Validate employee IDs
      const employeeIdsValidation = Validators.validateEmployeeIds(employee_ids);
      if (!employeeIdsValidation.valid) {
        return res.status(400).json({
          success: false,
          message: employeeIdsValidation.error
        });
      }

      // Validate date
      const dateValidation = Validators.validateDate(issue_date);
      if (!dateValidation.valid) {
        return res.status(400).json({
          success: false,
          message: dateValidation.error
        });
      }

      // Check which employees already have voucher today
      const employeesWithVoucher = [];
      const employeesWithoutVoucher = [];
      
      for (const employeeId of employeeIdsValidation.ids) {
        const hasVoucher = await EmployeeModel.hasVoucherToday(employeeId, issue_date);
        if (hasVoucher) {
          const employee = await EmployeeModel.findById(employeeId);
          employeesWithVoucher.push(employee?.name || `ID: ${employeeId}`);
        } else {
          employeesWithoutVoucher.push(employeeId);
        }
      }

      // Generate vouchers only for employees without voucher today
      const vouchers = await VoucherModel.generateVouchers(employeesWithoutVoucher, dateValidation.date.toISOString().split('T')[0]);

      const message = vouchers.length > 0 
        ? `${vouchers.length} voucher berhasil dibuat`
        : 'Tidak ada voucher yang dibuat';
      
      const warning = employeesWithVoucher.length > 0
        ? ` (${employeesWithVoucher.length} karyawan sudah memiliki voucher hari ini: ${employeesWithVoucher.join(', ')})`
        : '';

      res.json({
        success: true,
        message: message + warning,
        data: {
          vouchers,
          total: vouchers.length,
          skipped: employeesWithVoucher.length,
          skipped_employees: employeesWithVoucher
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/vouchers/check/:barcode
  static async check(req, res, next) {
    try {
      const { barcode } = req.params;

      // Validate barcode
      const barcodeValidation = Validators.validateBarcode(barcode);
      if (!barcodeValidation.valid) {
        return res.status(400).json({
          success: false,
          message: barcodeValidation.error
        });
      }

      // Step 1: Cek apakah voucher ada di database (by barcode or voucher_code)
      const voucher = await VoucherModel.findByBarcode(barcodeValidation.barcode);

      // Step 2: Validasi - Voucher harus ada di database
      if (!voucher) {
        return res.status(404).json({
          success: false,
          message: 'Voucher tidak ditemukan atau tidak valid',
          data: {
            can_redeem: false,
            reason: 'Voucher tidak terdaftar di database'
          }
        });
      }

      // Step 3: Validasi - Voucher tidak boleh sudah di-redeemed
      if (voucher.status === 'redeemed') {
        return res.json({
          success: false,
          message: 'Voucher sudah digunakan',
          data: {
            barcode: voucher.barcode,
            voucher_code: voucher.voucher_code,
            voucher_number: voucher.voucher_number,
            status: voucher.status,
            redeemed_at: voucher.redeemed_at,
            redeemed_by: voucher.redeemed_by,
            tenant_used: voucher.tenant_used,
            can_redeem: false,
            reason: 'Voucher sudah di-redeem sebelumnya'
          }
        });
      }

      // Step 4: Validasi - Voucher tidak boleh expired
      if (voucher.status === 'expired') {
        return res.json({
          success: false,
          message: 'Voucher sudah kadaluarsa',
          data: {
            barcode: voucher.barcode,
            voucher_code: voucher.voucher_code,
            voucher_number: voucher.voucher_number,
            status: voucher.status,
            issue_date: voucher.issue_date,
            valid_until: voucher.valid_until,
            can_redeem: false,
            reason: 'Voucher sudah melewati tanggal berlaku'
          }
        });
      }

      // Step 5: Validasi - Voucher harus berstatus 'active'
      if (voucher.status !== 'active') {
        return res.json({
          success: false,
          message: 'Voucher tidak valid',
          data: {
            barcode: voucher.barcode,
            voucher_code: voucher.voucher_code,
            status: voucher.status,
            can_redeem: false,
            reason: `Status voucher: ${voucher.status}`
          }
        });
      }

      // Voucher is valid - semua validasi passed
      res.json({
        success: true,
        data: {
          barcode: voucher.barcode,
          voucher_code: voucher.voucher_code,
          voucher_number: voucher.voucher_number,
          nominal: voucher.nominal,
          company_name: voucher.company_name,
          status: voucher.status,
          issue_date: voucher.issue_date,
          valid_until: voucher.valid_until,
          employee_name: voucher.employee_name || voucher.employee_name_full,
          employee_id: voucher.employee_id,
          can_redeem: true
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // PUT /api/vouchers/redeem/:barcode
  static async redeem(req, res, next) {
    try {
      const { barcode } = req.params;
      const { redeemed_by, tenant_used } = req.body;

      // Validate barcode
      const barcodeValidation = Validators.validateBarcode(barcode);
      if (!barcodeValidation.valid) {
        return res.status(400).json({
          success: false,
          message: barcodeValidation.error
        });
      }

      // Validate redeemed_by
      const redeemedByValidation = Validators.validateString(redeemed_by, 'redeemed_by', { maxLength: 100 });
      if (!redeemedByValidation.valid) {
        return res.status(400).json({
          success: false,
          message: redeemedByValidation.error
        });
      }

      // Validate tenant_used
      const tenantValidation = Validators.validateString(tenant_used, 'tenant_used', { maxLength: 100 });
      if (!tenantValidation.valid) {
        return res.status(400).json({
          success: false,
          message: tenantValidation.error
        });
      }

      if (!['Martabak Rakan', 'Mie Aceh Rakan'].includes(tenantValidation.value)) {
        return res.status(400).json({
          success: false,
          message: 'tenant_used harus "Martabak Rakan" atau "Mie Aceh Rakan"'
        });
      }

      // Redeem voucher
      const voucher = await VoucherModel.redeem(barcodeValidation.barcode, redeemedByValidation.value, tenantValidation.value);

      res.json({
        success: true,
        message: 'Voucher berhasil digunakan',
        data: {
          barcode: voucher.barcode,
          voucher_number: voucher.voucher_number,
          status: voucher.status,
          redeemed_at: voucher.redeemed_at,
          redeemed_by: voucher.redeemed_by,
          tenant_used: voucher.tenant_used
        }
      });
    } catch (error) {
      if (error.message.includes('tidak ditemukan') || 
          error.message.includes('sudah') ||
          error.message.includes('kadaluarsa')) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }
      next(error);
    }
  }

  // GET /api/vouchers/report/daily?date=YYYY-MM-DD&end_date=YYYY-MM-DD&status=all|active|redeemed|expired
  static async getDailyReport(req, res, next) {
    try {
      const { date, end_date, status } = req.query;

      // Validate date
      const dateValidation = Validators.validateDate(date);
      if (!dateValidation.valid) {
        return res.status(400).json({
          success: false,
          message: dateValidation.error
        });
      }

      // Validate end_date if provided
      let endDateValidated = null;
      if (end_date) {
        const endDateValidation = Validators.validateDate(end_date);
        if (!endDateValidation.valid) {
          return res.status(400).json({
            success: false,
            message: `end_date: ${endDateValidation.error}`
          });
        }
        endDateValidated = end_date;
      }

      // Validate status if provided
      const validStatuses = ['all', 'active', 'redeemed', 'expired'];
      if (status && !validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: `status harus salah satu dari: ${validStatuses.join(', ')}`
        });
      }

      // If end_date is provided, use range. Otherwise, use single date
      const report = await VoucherModel.getDailyReport(date, endDateValidated, status || null);

      res.json({
        success: true,
        data: report
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/vouchers/print?date=YYYY-MM-DD
  static async getVouchersForPrint(req, res, next) {
    try {
      const { date } = req.query;

      // Validate date
      const dateValidation = Validators.validateDate(date);
      if (!dateValidation.valid) {
        return res.status(400).json({
          success: false,
          message: dateValidation.error
        });
      }

      const vouchers = await VoucherModel.getVouchersForPrint(date);

      res.json({
        success: true,
        data: vouchers
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/vouchers/details?date=YYYY-MM-DD&end_date=YYYY-MM-DD&status=all|active|redeemed|expired (for report screen)
  static async getVoucherDetails(req, res, next) {
    try {
      const { date, end_date, status } = req.query;

      // Validate date
      const dateValidation = Validators.validateDate(date);
      if (!dateValidation.valid) {
        return res.status(400).json({
          success: false,
          message: dateValidation.error
        });
      }

      // Validate end_date if provided
      let endDateValidated = null;
      if (end_date) {
        const endDateValidation = Validators.validateDate(end_date);
        if (!endDateValidation.valid) {
          return res.status(400).json({
            success: false,
            message: `end_date: ${endDateValidation.error}`
          });
        }
        endDateValidated = end_date;
      }

      // Validate status if provided
      const validStatuses = ['all', 'active', 'redeemed', 'expired'];
      if (status && !validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: `status harus salah satu dari: ${validStatuses.join(', ')}`
        });
      }

      // If end_date is provided, use range. Otherwise, use single date
      const vouchers = await VoucherModel.getVoucherDetails(date, endDateValidated, status || null);

      res.json({
        success: true,
        data: vouchers
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/vouchers/scan-history?date=YYYY-MM-DD&status=all|valid|invalid (for kitchen scan history)
  static async getScanHistory(req, res, next) {
    try {
      const { date, status } = req.query;

      // Validate date
      const dateValidation = Validators.validateDate(date);
      if (!dateValidation.valid) {
        return res.status(400).json({
          success: false,
          message: dateValidation.error
        });
      }

      // Validate status if provided
      const validStatuses = ['all', 'valid', 'invalid'];
      if (status && !validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: `status harus salah satu dari: ${validStatuses.join(', ')}`
        });
      }

      const history = await VoucherModel.getScanHistory(date, status || 'all');

      res.json({
        success: true,
        data: history
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = VoucherController;

