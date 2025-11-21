const EmployeeModel = require('../models/employeeModel');
const Validators = require('../utils/validators');

class EmployeeController {
  // GET /api/employees
  static async getAll(req, res, next) {
    try {
      const { date } = req.query; // Optional: get employees with voucher status for a date
      
      if (date) {
        // Validate date if provided
        const dateValidation = Validators.validateDate(date);
        if (!dateValidation.valid) {
          return res.status(400).json({
            success: false,
            message: dateValidation.error
          });
        }
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

      // Validate ID
      const idValidation = Validators.validateId(id, 'ID');
      if (!idValidation.valid) {
        return res.status(400).json({
          success: false,
          message: idValidation.error
        });
      }

      const employee = await EmployeeModel.findById(idValidation.id);
      
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

      // Validate name
      const nameValidation = Validators.validateString(name, 'Nama', { minLength: 1, maxLength: 100 });
      if (!nameValidation.valid) {
        return res.status(400).json({
          success: false,
          message: nameValidation.error
        });
      }

      // Validate employee_code if provided
      if (employee_code) {
        const codeValidation = Validators.validateString(employee_code, 'Employee Code', { minLength: 1, maxLength: 20, required: false });
        if (!codeValidation.valid) {
          return res.status(400).json({
            success: false,
            message: codeValidation.error
          });
        }
      }

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
      // Database errors will be handled by error middleware
      next(error);
    }
  }

  // PUT /api/employees/:id
  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const { name, employee_code, is_active } = req.body;

      // Validate ID
      const idValidation = Validators.validateId(id, 'ID');
      if (!idValidation.valid) {
        return res.status(400).json({
          success: false,
          message: idValidation.error
        });
      }

      const employee = await EmployeeModel.findById(idValidation.id);
      if (!employee) {
        return res.status(404).json({
          success: false,
          message: 'Employee tidak ditemukan'
        });
      }

      // Validate name
      const nameValidation = Validators.validateString(name, 'Nama', { minLength: 1, maxLength: 100 });
      if (!nameValidation.valid) {
        return res.status(400).json({
          success: false,
          message: nameValidation.error
        });
      }

      // Validate employee_code if provided
      let employeeCodeValidated = null;
      if (employee_code) {
        const codeValidation = Validators.validateString(employee_code, 'Employee Code', { minLength: 1, maxLength: 20, required: false });
        if (!codeValidation.valid) {
          return res.status(400).json({
            success: false,
            message: codeValidation.error
          });
        }
        employeeCodeValidated = codeValidation.value;
      }

      const updated = await EmployeeModel.update(
        idValidation.id,
        nameValidation.value,
        employeeCodeValidated,
        is_active !== undefined ? is_active : employee.is_active
      );

      res.json({
        success: true,
        message: 'Karyawan berhasil diupdate',
        data: updated
      });
    } catch (error) {
      // Database errors will be handled by error middleware
      next(error);
    }
  }

  // DELETE /api/employees/:id
  static async delete(req, res, next) {
    try {
      const { id } = req.params;

      // Validate ID
      const idValidation = Validators.validateId(id, 'ID');
      if (!idValidation.valid) {
        return res.status(400).json({
          success: false,
          message: idValidation.error
        });
      }

      const employee = await EmployeeModel.findById(idValidation.id);
      
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

