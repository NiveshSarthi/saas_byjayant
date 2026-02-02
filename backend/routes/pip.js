const express = require('express');
const pipController = require('../controllers/pipController');
const { authenticate } = require('../middlewares/auth');
const { authorize } = require('../middlewares/rbac');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get all PIPs (HR only)
router.get('/', authorize(['HR Manager', 'Admin']), pipController.getPIPs);

// Get specific PIP
router.get('/:id', authorize(['HR Manager', 'Admin']), pipController.getPIPById);

// Create new PIP
router.post('/', authorize(['HR Manager', 'Admin']), pipController.createPIP);

// Update PIP
router.put('/:id', authorize(['HR Manager', 'Admin']), pipController.updatePIP);

// Delete PIP
router.delete('/:id', authorize(['HR Manager', 'Admin']), pipController.deletePIP);

// Add review to PIP
router.post('/:id/reviews', authorize(['HR Manager', 'Admin']), pipController.addReview);

// Update objective progress
router.put('/:id/objectives', authorize(['HR Manager', 'Admin']), pipController.updateObjective);

// Complete PIP
router.post('/:id/complete', authorize(['HR Manager', 'Admin']), pipController.completePIP);

module.exports = router;