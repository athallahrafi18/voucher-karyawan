const express = require('express');
const router = express.Router();
const EmployeeController = require('../controllers/employeeController');

// GET /api/employees - Get all employees
router.get('/', EmployeeController.getAll);

// GET /api/employees/:id - Get employee by ID
router.get('/:id', EmployeeController.getById);

// POST /api/employees - Create new employee
router.post('/', EmployeeController.create);

// PUT /api/employees/:id - Update employee
router.put('/:id', EmployeeController.update);

// DELETE /api/employees/:id - Delete employee (soft delete)
router.delete('/:id', EmployeeController.delete);

module.exports = router;

