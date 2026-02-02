const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/auth');
const { authorize } = require('../middlewares/rbac');
const { getPayrolls, getPayrollById, createPayroll, updatePayroll, deletePayroll, calculateAndGetPayroll, exportPayrollsPdf, exportPayrollsCsv, exportPayrollsExcel, exportSinglePayrollPdf, exportSinglePayrollExcel } = require('../controllers/payrollController');

router.use(authenticate);
router.use(authorize(['HR Manager', 'Accounts', 'Admin']));

router.get('/', getPayrolls);
router.get('/:id', getPayrollById);
router.post('/', createPayroll);
router.put('/:id', updatePayroll);
router.delete('/:id', deletePayroll);
router.post('/calculate', calculateAndGetPayroll);
router.get('/:id/export', exportSinglePayrollPdf);
router.get('/:id/excel', exportSinglePayrollExcel);
router.get('/export/pdf', exportPayrollsPdf);
router.get('/export/csv', exportPayrollsCsv);
router.get('/export/excel', exportPayrollsExcel);

module.exports = router;




