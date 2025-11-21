const VoucherModel = require('../models/voucherModel');

class VoucherController {
  // POST /api/vouchers/generate
  static async generate(req, res, next) {
    try {
      const { employee_ids, issue_date } = req.body;
      const EmployeeModel = require('../models/employeeModel');

      // Validation
      if (!employee_ids || !Array.isArray(employee_ids) || employee_ids.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'employee_ids harus berupa array dan tidak boleh kosong'
        });
      }

      if (employee_ids.length > 100) {
        return res.status(400).json({
          success: false,
          message: 'Maksimal 100 karyawan per batch'
        });
      }

      // Filter out invalid IDs
      const validIds = employee_ids.filter(id => id && Number.isInteger(Number(id)));
      
      if (validIds.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Minimal 1 employee_id harus diisi'
        });
      }

      if (!issue_date) {
        return res.status(400).json({
          success: false,
          message: 'issue_date harus diisi'
        });
      }

      // Validate date format
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(issue_date)) {
        return res.status(400).json({
          success: false,
          message: 'Format tanggal harus YYYY-MM-DD'
        });
      }

      // Check which employees already have voucher today
      const employeesWithVoucher = [];
      const employeesWithoutVoucher = [];
      
      for (const employeeId of validIds) {
        const hasVoucher = await EmployeeModel.hasVoucherToday(employeeId, issue_date);
        if (hasVoucher) {
          const employee = await EmployeeModel.findById(employeeId);
          employeesWithVoucher.push(employee?.name || `ID: ${employeeId}`);
        } else {
          employeesWithoutVoucher.push(employeeId);
        }
      }

      // Generate vouchers only for employees without voucher today
      const vouchers = await VoucherModel.generateVouchers(employeesWithoutVoucher, issue_date);

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

      if (!barcode) {
        return res.status(400).json({
          success: false,
          message: 'Barcode harus diisi'
        });
      }

      const voucher = await VoucherModel.findByBarcode(barcode);

      if (!voucher) {
        return res.status(404).json({
          success: false,
          message: 'Voucher tidak ditemukan',
          data: {
            can_redeem: false
          }
        });
      }

      // Check status
      if (voucher.status === 'redeemed') {
        return res.json({
          success: false,
          message: 'Voucher sudah digunakan',
          data: {
            barcode: voucher.barcode,
            voucher_number: voucher.voucher_number,
            status: voucher.status,
            redeemed_at: voucher.redeemed_at,
            redeemed_by: voucher.redeemed_by,
            tenant_used: voucher.tenant_used,
            can_redeem: false
          }
        });
      }

      if (voucher.status === 'expired') {
        return res.json({
          success: false,
          message: 'Voucher sudah kadaluarsa',
          data: {
            barcode: voucher.barcode,
            voucher_number: voucher.voucher_number,
            status: voucher.status,
            can_redeem: false
          }
        });
      }

      // Voucher is valid
      res.json({
        success: true,
        data: {
          barcode: voucher.barcode,
          voucher_number: voucher.voucher_number,
          nominal: voucher.nominal,
          company_name: voucher.company_name,
          status: voucher.status,
          issue_date: voucher.issue_date,
          valid_until: voucher.valid_until,
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

      // Validation
      if (!barcode) {
        return res.status(400).json({
          success: false,
          message: 'Barcode harus diisi'
        });
      }

      if (!redeemed_by || !tenant_used) {
        return res.status(400).json({
          success: false,
          message: 'redeemed_by dan tenant_used harus diisi'
        });
      }

      if (!['Martabak Rakan', 'Mie Aceh Rakan'].includes(tenant_used)) {
        return res.status(400).json({
          success: false,
          message: 'tenant_used harus "Martabak Rakan" atau "Mie Aceh Rakan"'
        });
      }

      // Redeem voucher
      const voucher = await VoucherModel.redeem(barcode, redeemed_by, tenant_used);

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

      if (!date) {
        return res.status(400).json({
          success: false,
          message: 'Parameter date harus diisi (format: YYYY-MM-DD)'
        });
      }

      // If end_date is provided, use range. Otherwise, use single date
      const report = await VoucherModel.getDailyReport(date, end_date || null, status || null);

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

      if (!date) {
        return res.status(400).json({
          success: false,
          message: 'Parameter date harus diisi (format: YYYY-MM-DD)'
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

      if (!date) {
        return res.status(400).json({
          success: false,
          message: 'Parameter date harus diisi (format: YYYY-MM-DD)'
        });
      }

      // If end_date is provided, use range. Otherwise, use single date
      const vouchers = await VoucherModel.getVoucherDetails(date, end_date || null, status || null);

      res.json({
        success: true,
        data: vouchers
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = VoucherController;

