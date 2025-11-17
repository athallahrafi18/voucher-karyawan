const VoucherModel = require('../models/voucherModel');

class VoucherController {
  // POST /api/vouchers/generate
  static async generate(req, res, next) {
    try {
      const { quantity, issue_date } = req.body;

      // Validation
      if (!quantity || !issue_date) {
        return res.status(400).json({
          success: false,
          message: 'quantity dan issue_date harus diisi'
        });
      }

      if (quantity < 1 || quantity > 100) {
        return res.status(400).json({
          success: false,
          message: 'quantity harus antara 1-100'
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

      // Generate vouchers
      const vouchers = await VoucherModel.generateVouchers(quantity, issue_date);

      res.json({
        success: true,
        message: `${quantity} vouchers generated successfully`,
        data: {
          vouchers,
          total: vouchers.length
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

  // GET /api/vouchers/report/daily?date=YYYY-MM-DD
  static async getDailyReport(req, res, next) {
    try {
      const { date } = req.query;

      if (!date) {
        return res.status(400).json({
          success: false,
          message: 'Parameter date harus diisi (format: YYYY-MM-DD)'
        });
      }

      const report = await VoucherModel.getDailyReport(date);

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

  // GET /api/vouchers/details?date=YYYY-MM-DD (for report screen)
  static async getVoucherDetails(req, res, next) {
    try {
      const { date } = req.query;

      if (!date) {
        return res.status(400).json({
          success: false,
          message: 'Parameter date harus diisi (format: YYYY-MM-DD)'
        });
      }

      const vouchers = await VoucherModel.getVoucherDetails(date);

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

