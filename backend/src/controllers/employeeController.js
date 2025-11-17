const EmployeeModel = require('../models/employeeModel');

class EmployeeController {
  // GET /api/employees
  static async getAll(req, res, next) {
    try {
      const { date } = req.query; // Optional: get employees with voucher status for a date
      
      if (date) {
        const employees = await EmployeeModel.getEmployeesWithVoucherStatus(date);
        res.json({
          success: true,
          data: employees
        });
      } else {
        const employees = await EmployeeModel.getAllActive();
        res.json({
          success: true,
          data: employees
        });
      }
    } catch (error) {
      next(error);
    }
  }

  // GET /api/employees/:id
  static async getById(req, res, next) {
    try {
      const { id } = req.params;
      const employee = await EmployeeModel.findById(id);
      
      if (!employee) {
        return res.status(404).json({
          success: false,
          message: 'Employee tidak ditemukan'
        });
      }

      res.json({
        success: true,
        data: employee
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/employees
  static async create(req, res, next) {
    try {
      const { name, employee_code } = req.body;

      if (!name || !name.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Nama karyawan harus diisi'
        });
      }

      // Check if name already exists
      const existing = await EmployeeModel.findByName(name);
      if (existing) {
        return res.status(400).json({
          success: false,
          message: 'Nama karyawan sudah ada'
        });
      }

      const employee = await EmployeeModel.create(name.trim(), employee_code || null);

      res.json({
        success: true,
        message: 'Karyawan berhasil ditambahkan',
        data: employee
      });
    } catch (error) {
      if (error.code === '23505') { // Unique violation
        return res.status(400).json({
          success: false,
          message: 'Employee code sudah digunakan'
        });
      }
      next(error);
    }
  }

  // PUT /api/employees/:id
  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const { name, employee_code, is_active } = req.body;

      const employee = await EmployeeModel.findById(id);
      if (!employee) {
        return res.status(404).json({
          success: false,
          message: 'Employee tidak ditemukan'
        });
      }

      if (!name || !name.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Nama karyawan harus diisi'
        });
      }

      const updated = await EmployeeModel.update(
        id,
        name.trim(),
        employee_code || null,
        is_active !== undefined ? is_active : employee.is_active
      );

      res.json({
        success: true,
        message: 'Karyawan berhasil diupdate',
        data: updated
      });
    } catch (error) {
      if (error.code === '23505') { // Unique violation
        return res.status(400).json({
          success: false,
          message: 'Employee code sudah digunakan'
        });
      }
      next(error);
    }
  }

  // DELETE /api/employees/:id
  static async delete(req, res, next) {
    try {
      const { id } = req.params;
      const employee = await EmployeeModel.findById(id);
      
      if (!employee) {
        return res.status(404).json({
          success: false,
          message: 'Employee tidak ditemukan'
        });
      }

      await EmployeeModel.delete(id);

      res.json({
        success: true,
        message: 'Karyawan berhasil dihapus'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = EmployeeController;

