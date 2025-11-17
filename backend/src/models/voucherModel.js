const pool = require('../config/database');

class VoucherModel {
  // Generate barcode: RK + YYYYMMDD + nomor urut 3 digit
  static generateBarcode(issueDate, sequence) {
    const dateStr = issueDate.replace(/-/g, '');
    const seqStr = String(sequence).padStart(3, '0');
    return `RK${dateStr}${seqStr}`;
  }

  // Generate multiple vouchers
  static async generateVouchers(quantity, issueDate) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      const vouchers = [];
      const validUntil = issueDate; // Voucher hanya berlaku 1 hari
      
      for (let i = 1; i <= quantity; i++) {
        const voucherNumber = String(i).padStart(3, '0');
        const barcode = this.generateBarcode(issueDate, i);
        
        const result = await client.query(
          `INSERT INTO vouchers 
           (barcode, voucher_number, nominal, company_name, issue_date, valid_until, status)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           RETURNING *`,
          [barcode, voucherNumber, 10000, 'Rakan Kuphi', issueDate, validUntil, 'active']
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

  // Check voucher by barcode
  static async findByBarcode(barcode) {
    const result = await pool.query(
      'SELECT * FROM vouchers WHERE barcode = $1',
      [barcode]
    );
    
    if (result.rows.length === 0) {
      return null;
    }
    
    const voucher = result.rows[0];
    
    // Auto-expire voucher yang lewat tanggal
    if (voucher.status === 'active' && new Date(voucher.valid_until) < new Date()) {
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
      
      // Check if expired
      if (new Date(voucher.valid_until) < new Date()) {
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

  // Get daily report
  static async getDailyReport(date) {
    const result = await pool.query(
      `SELECT 
        COUNT(*) FILTER (WHERE status = 'active') as total_unused,
        COUNT(*) FILTER (WHERE status = 'redeemed') as total_redeemed,
        COUNT(*) FILTER (WHERE status = 'expired') as total_expired,
        COUNT(*) as total_generated,
        COUNT(*) FILTER (WHERE tenant_used = 'Martabak Rakan') as martabak_count,
        COUNT(*) FILTER (WHERE tenant_used = 'Mie Aceh Rakan') as mie_aceh_count
       FROM vouchers 
       WHERE issue_date = $1`,
      [date]
    );
    
    const stats = result.rows[0];
    const totalGenerated = parseInt(stats.total_generated) || 0;
    const totalRedeemed = parseInt(stats.total_redeemed) || 0;
    const redemptionRate = totalGenerated > 0 
      ? ((totalRedeemed / totalGenerated) * 100).toFixed(1) 
      : '0.0';
    
    return {
      date,
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

  // Get voucher details for report
  static async getVoucherDetails(date) {
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
       WHERE issue_date = $1
       ORDER BY voucher_number ASC`,
      [date]
    );
    
    return result.rows;
  }
}

module.exports = VoucherModel;

