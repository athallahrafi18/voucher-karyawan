const pool = require('../config/database');

class VoucherModel {
  // Generate random voucher code (like Grab: 8 characters alphanumeric)
  static generateVoucherCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Exclude confusing chars (0, O, I, 1)
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  // Generate barcode: RK + YYYYMMDD + nomor urut 3 digit (for backward compatibility)
  static generateBarcode(issueDate, sequence) {
    const dateStr = issueDate.replace(/-/g, '');
    const seqStr = String(sequence).padStart(3, '0');
    return `RK${dateStr}${seqStr}`;
  }

  // Ensure unique voucher code
  static async generateUniqueVoucherCode() {
    let code;
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 10;

    while (!isUnique && attempts < maxAttempts) {
      code = this.generateVoucherCode();
      const result = await pool.query(
        'SELECT COUNT(*) as count FROM vouchers WHERE voucher_code = $1',
        [code]
      );
      isUnique = parseInt(result.rows[0].count) === 0;
      attempts++;
    }

    if (!isUnique) {
      throw new Error('Gagal generate unique voucher code');
    }

    return code;
  }

  // Generate vouchers for list of employee IDs
  static async generateVouchers(employeeIds, issueDate) {
    const client = await pool.connect();
    const EmployeeModel = require('./employeeModel');
    
    try {
      await client.query('BEGIN');
      
      const vouchers = [];
      // Voucher berlaku sampai akhir hari yang sama (23:59:59)
      // Set valid_until ke issue_date (akan dibandingkan sebagai DATE, bukan DATETIME)
      // Di findByBarcode, kita akan membandingkan hanya tanggalnya saja
      const validUntil = issueDate; // Voucher hanya berlaku 1 hari (sampai akhir hari)
      
      // Get the next sequence number for this date
      const sequenceResult = await client.query(
        `SELECT COUNT(*) as count FROM vouchers WHERE issue_date = $1`,
        [issueDate]
      );
      const startSequence = parseInt(sequenceResult.rows[0].count) + 1;
      
      for (let i = 0; i < employeeIds.length; i++) {
        const employeeId = employeeIds[i];
        
        // Get employee data
        const employee = await EmployeeModel.findById(employeeId);
        if (!employee || !employee.is_active) {
          continue; // Skip invalid or inactive employees
        }

        // Check if employee already has voucher for today
        const hasVoucher = await EmployeeModel.hasVoucherToday(employeeId, issueDate);
        if (hasVoucher) {
          continue; // Skip if already has voucher today
        }
        
        // Generate unique voucher code
        const voucherCode = await this.generateUniqueVoucherCode();
        const sequence = startSequence + i;
        const voucherNumber = String(sequence).padStart(3, '0');
        const barcode = this.generateBarcode(issueDate, sequence);
        
        const result = await client.query(
          `INSERT INTO vouchers 
           (voucher_code, barcode, voucher_number, nominal, company_name, issue_date, valid_until, status, employee_id, employee_name)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
           RETURNING *`,
          [voucherCode, barcode, voucherNumber, 10000, 'Rakan Kuphi', issueDate, validUntil, 'active', employeeId, employee.name]
        );
        
        vouchers.push(result.rows[0]);
      }
      
      await client.query('COMMIT');
      return vouchers;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Check voucher by barcode or voucher_code
  static async findByBarcode(barcode) {
    const result = await pool.query(
      `SELECT v.*, e.name as employee_name_full, e.employee_code
       FROM vouchers v
       LEFT JOIN employees e ON v.employee_id = e.id
       WHERE v.barcode = $1 OR v.voucher_code = $1`,
      [barcode]
    );
    
    if (result.rows.length === 0) {
      return null;
    }
    
    const voucher = result.rows[0];
    
    // Auto-expire voucher yang lewat tanggal
    // Compare dates only (not time) - voucher valid until end of valid_until date
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to start of today
    
    const validUntilDate = new Date(voucher.valid_until);
    validUntilDate.setHours(0, 0, 0, 0); // Set to start of valid_until date
    
    // Voucher expires if today is AFTER valid_until date
    // If valid_until is 2025-01-17, voucher is valid on 2025-01-17 (all day)
    // Voucher expires on 2025-01-18 (next day)
    if (voucher.status === 'active' && today > validUntilDate) {
      await pool.query(
        'UPDATE vouchers SET status = $1, updated_at = NOW() WHERE id = $2',
        ['expired', voucher.id]
      );
      voucher.status = 'expired';
    }
    
    return voucher;
  }

  // Redeem voucher
  static async redeem(barcode, redeemedBy, tenantUsed) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Check voucher exists and is active
      const voucher = await this.findByBarcode(barcode);
      
      if (!voucher) {
        throw new Error('Voucher tidak ditemukan');
      }
      
      if (voucher.status !== 'active') {
        throw new Error(`Voucher sudah ${voucher.status === 'redeemed' ? 'digunakan' : 'kadaluarsa'}`);
      }
      
      // Check if expired - compare dates only (not time)
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Set to start of today
      
      const validUntilDate = new Date(voucher.valid_until);
      validUntilDate.setHours(0, 0, 0, 0); // Set to start of valid_until date
      
      // Voucher expires if today is AFTER valid_until date
      // If valid_until is 2025-01-17, voucher is valid on 2025-01-17 (all day)
      // Voucher expires on 2025-01-18 (next day)
      if (today > validUntilDate) {
        await client.query(
          'UPDATE vouchers SET status = $1, updated_at = NOW() WHERE id = $2',
          ['expired', voucher.id]
        );
        throw new Error('Voucher sudah kadaluarsa');
      }
      
      // Update voucher to redeemed
      const result = await client.query(
        `UPDATE vouchers 
         SET status = 'redeemed', 
             redeemed_at = NOW(), 
             redeemed_by = $1, 
             tenant_used = $2,
             updated_at = NOW()
         WHERE id = $3
         RETURNING *`,
        [redeemedBy, tenantUsed, voucher.id]
      );
      
      await client.query('COMMIT');
      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Get daily report (supports single date or date range, with optional status filter)
  static async getDailyReport(startDate, endDate = null, status = null) {
    // If endDate is not provided, use startDate (single date)
    const endDateToUse = endDate || startDate;
    
    // Build WHERE clause
    let whereClause = 'WHERE issue_date >= $1 AND issue_date <= $2';
    const params = [startDate, endDateToUse];
    
    // Add status filter if provided
    if (status && status !== 'all' && ['active', 'redeemed', 'expired'].includes(status)) {
      whereClause += ' AND status = $3';
      params.push(status);
    }
    
    const result = await pool.query(
      `SELECT 
        COUNT(*) FILTER (WHERE status = 'active') as total_unused,
        COUNT(*) FILTER (WHERE status = 'redeemed') as total_redeemed,
        COUNT(*) FILTER (WHERE status = 'expired') as total_expired,
        COUNT(*) as total_generated,
        COUNT(*) FILTER (WHERE tenant_used = 'Martabak Rakan') as martabak_count,
        COUNT(*) FILTER (WHERE tenant_used = 'Mie Aceh Rakan') as mie_aceh_count
       FROM vouchers 
       ${whereClause}`,
      params
    );
    
    const stats = result.rows[0];
    const totalGenerated = parseInt(stats.total_generated) || 0;
    const totalRedeemed = parseInt(stats.total_redeemed) || 0;
    const redemptionRate = totalGenerated > 0 
      ? ((totalRedeemed / totalGenerated) * 100).toFixed(1) 
      : '0.0';
    
    return {
      start_date: startDate,
      end_date: endDateToUse,
      total_generated: totalGenerated,
      total_redeemed: totalRedeemed,
      total_unused: parseInt(stats.total_unused) || 0,
      total_expired: parseInt(stats.total_expired) || 0,
      redemption_rate: `${redemptionRate}%`,
      by_tenant: {
        'Martabak Rakan': parseInt(stats.martabak_count) || 0,
        'Mie Aceh Rakan': parseInt(stats.mie_aceh_count) || 0
      }
    };
  }

  // Get vouchers for print
  static async getVouchersForPrint(date) {
    const result = await pool.query(
      `SELECT barcode, voucher_number, nominal, company_name, issue_date, valid_until
       FROM vouchers 
       WHERE issue_date = $1
       ORDER BY voucher_number ASC`,
      [date]
    );
    
    return result.rows;
  }

  // Get voucher details for report (supports single date or date range, with optional status filter)
  static async getVoucherDetails(startDate, endDate = null, status = null) {
    // If endDate is not provided, use startDate (single date)
    const endDateToUse = endDate || startDate;
    
    // Build WHERE clause
    let whereClause = 'WHERE issue_date >= $1 AND issue_date <= $2';
    const params = [startDate, endDateToUse];
    
    // Add status filter if provided
    if (status && status !== 'all' && ['active', 'redeemed', 'expired'].includes(status)) {
      whereClause += ' AND status = $3';
      params.push(status);
    }
    
    const result = await pool.query(
      `SELECT 
        barcode, 
        voucher_number, 
        status, 
        redeemed_at, 
        redeemed_by, 
        tenant_used,
        issue_date
       FROM vouchers 
       ${whereClause}
       ORDER BY issue_date ASC, voucher_number ASC`,
      params
    );
    
    return result.rows;
  }
}

module.exports = VoucherModel;

