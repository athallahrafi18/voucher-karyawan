const pool = require('../config/database');

class EmployeeModel {
  // Get all active employees
  static async getAllActive() {
    const result = await pool.query(
      'SELECT * FROM employees WHERE is_active = true ORDER BY name ASC'
    );
    return result.rows;
  }

  // Get employee by ID
  static async findById(id) {
    const result = await pool.query(
      'SELECT * FROM employees WHERE id = $1',
      [id]
    );
    return result.rows[0];
  }

  // Get employee by name
  static async findByName(name) {
    const result = await pool.query(
      'SELECT * FROM employees WHERE LOWER(name) = LOWER($1) AND is_active = true',
      [name]
    );
    return result.rows[0];
  }

  // Create employee
  static async create(name, employeeCode = null) {
    const result = await pool.query(
      `INSERT INTO employees (name, employee_code)
       VALUES ($1, $2)
       RETURNING *`,
      [name, employeeCode]
    );
    return result.rows[0];
  }

  // Update employee
  static async update(id, name, employeeCode, isActive) {
    const result = await pool.query(
      `UPDATE employees 
       SET name = $1, employee_code = $2, is_active = $3, updated_at = NOW()
       WHERE id = $4
       RETURNING *`,
      [name, employeeCode, isActive, id]
    );
    return result.rows[0];
  }

  // Delete employee (soft delete)
  static async delete(id) {
    const result = await pool.query(
      `UPDATE employees 
       SET is_active = false, updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [id]
    );
    return result.rows[0];
  }

  // Check if employee already has voucher for today
  static async hasVoucherToday(employeeId, date) {
    const result = await pool.query(
      `SELECT COUNT(*) as count 
       FROM vouchers 
       WHERE employee_id = $1 AND issue_date = $2`,
      [employeeId, date]
    );
    return parseInt(result.rows[0].count) > 0;
  }

  // Get employees with voucher status for a date
  static async getEmployeesWithVoucherStatus(date) {
    const result = await pool.query(
      `SELECT 
        e.id,
        e.name,
        e.employee_code,
        e.is_active,
        CASE WHEN v.id IS NOT NULL THEN true ELSE false END as has_voucher_today,
        v.voucher_code,
        v.status as voucher_status
       FROM employees e
       LEFT JOIN vouchers v ON v.employee_id = e.id AND v.issue_date = $1
       WHERE e.is_active = true
       ORDER BY e.name ASC`,
      [date]
    );
    return result.rows;
  }
}

module.exports = EmployeeModel;

