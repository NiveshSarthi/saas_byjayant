const express = require('express');
const accountsController = require('../controllers/accountsController');
const { authenticate } = require('../middlewares/auth');
const { authorize } = require('../middlewares/rbac');

const router = express.Router();

// All routes protected for Accounts role
router.use(authenticate, authorize(['Accounts', 'Admin']));

// Deal routes
router.get('/deals', accountsController.getDeals);
router.post('/deals', accountsController.createDeal);
router.put('/deals/:id', accountsController.updateDeal);
router.post('/deals/incentive', accountsController.createDealIncentive);

// Incentive routes
router.get('/incentives', accountsController.getIncentives);
router.put('/incentives/:id/approve', accountsController.approveIncentiveRelease);
router.put('/incentives/:id/release', accountsController.releaseIncentive);

// Petty cash routes
router.get('/petty-cash', accountsController.getPettyCashLedger);
router.post('/petty-cash', accountsController.addPettyCashEntry);

// Expense approval routes
router.get('/approvals/pending', accountsController.getPendingExpenses);
router.put('/approvals/:id/approve', accountsController.approveExpenseRequest);
router.put('/approvals/:id/reject', accountsController.rejectExpenseRequest);

// Export routes
router.get('/export/pdf', accountsController.exportDealsPdf);
router.get('/export/csv', accountsController.exportDealsCsv);

module.exports = router;




