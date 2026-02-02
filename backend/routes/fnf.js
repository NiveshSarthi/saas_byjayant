const express = require('express');
const fnfController = require('../controllers/fnfController');
const { authenticate } = require('../middlewares/auth');
const { authorize } = require('../middlewares/rbac');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get all FNFs (HR and Accounts)
router.get('/', authorize(['HR Manager', 'Accounts', 'Admin']), fnfController.getFNFs);

// Get specific FNF
router.get('/:id', authorize(['HR Manager', 'Accounts', 'Admin']), fnfController.getFNFById);

// Create new FNF
router.post('/', authorize(['HR Manager', 'Admin']), fnfController.createFNF);

// Update FNF
router.put('/:id', authorize(['HR Manager', 'Accounts', 'Admin']), fnfController.updateFNF);

// Update FNF status
router.put('/:id/status', authorize(['HR Manager', 'Admin']), fnfController.updateFNFStatus);

// Delete FNF
router.delete('/:id', authorize(['HR Manager', 'Admin']), fnfController.deleteFNF);

// Calculate FNF amounts
router.post('/calculate', authorize(['HR Manager', 'Admin']), fnfController.calculateFNF);

// Generate FNF letter PDF
router.get('/:id/generate-letter', authorize(['HR Manager', 'Accounts', 'Admin']), fnfController.generateFNFLetter);

// Process payment
router.post('/:id/process-payment', authorize(['Accounts']), fnfController.processPayment);

// Stop FNF
router.put('/:id/stop', authorize(['HR Manager', 'Admin']), fnfController.stopFNF);

// Revert FNF
router.delete('/:id/revert', authorize(['HR Manager', 'Admin']), fnfController.revertFNF);

module.exports = router;