const express = require('express');
const administrationController = require('../controllers/administrationController');
const { authenticate } = require('../middlewares/auth');
const { authorize } = require('../middlewares/rbac');

const router = express.Router();

// All routes protected for Administration and HR roles
router.use(authenticate, authorize(['Operations', 'Admin', 'HR Manager', 'HR']));

// Checklist routes
router.post('/checklists', administrationController.createChecklist);
router.get('/checklists', administrationController.getChecklists);
router.put('/checklists/:id', administrationController.updateChecklist);
router.delete('/checklists/:id', administrationController.deleteChecklist);

// Task routes
router.post('/tasks', administrationController.createTask);
router.get('/tasks', administrationController.getTasks);
router.put('/tasks/:id', administrationController.updateTask);
router.delete('/tasks/:id', administrationController.deleteTask);

// Inventory routes
router.post('/inventory', administrationController.createInventory);
router.get('/inventory', administrationController.getInventory);
router.put('/inventory/:id', administrationController.updateInventory);
router.delete('/inventory/:id', administrationController.deleteInventory);

// Expense routes
router.post('/expenses', administrationController.createExpense);
router.get('/expenses', administrationController.getExpenses);
router.put('/expenses/:id', administrationController.updateExpense);
router.delete('/expenses/:id', administrationController.deleteExpense);

// Export routes
router.get('/export/pdf', administrationController.exportTasksPdf);
router.get('/export/csv', administrationController.exportTasksCsv);
router.get('/inventory/export', administrationController.exportInventoryPdf);

module.exports = router;




