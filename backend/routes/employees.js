const express = require('express');
const employeeController = require('../controllers/employeeController');
const Employee = require('../models/Employee');
const { authenticate } = require('../middlewares/auth');
const { authorize } = require('../middlewares/rbac');

const router = express.Router();

// All routes protected with authenticate
router.use(authenticate);

// But allow employees to view own profile
router.get('/my-profile', async (req, res) => {
  try {
    const employee = await Employee.findOne({ user: req.user.id }).populate('user').populate('documents').populate('assets');
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    res.json(employee);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// HR only for management
router.use(authorize(['HR Manager', 'Admin']));

router.get('/', employeeController.getAllEmployees);
router.get('/:id', employeeController.getEmployeeById);
router.post('/', employeeController.createEmployee);
router.put('/:id', employeeController.updateEmployee);
router.put('/:id/status', employeeController.updateEmployeeStatus);
router.delete('/:id', employeeController.deleteEmployee);
router.put('/:id/onboarding', employeeController.updateOnboarding);
router.put('/:id/complete-onboarding', employeeController.completeOnboarding);

// Additional routes
router.post('/add-document', employeeController.addDocument);
router.post('/add-asset', employeeController.addAsset);

// Export routes
router.get('/export/pdf', employeeController.exportEmployeesPdf);
router.get('/export/csv', employeeController.exportEmployeesCsv);

module.exports = router;




