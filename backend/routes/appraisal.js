const express = require('express');
const appraisalController = require('../controllers/appraisalController');
const { authenticate } = require('../middlewares/auth');
const { authorize } = require('../middlewares/rbac');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get all appraisals (HR only)
router.get('/', authorize(['HR Manager', 'Admin']), appraisalController.getAppraisals);

// Get specific appraisal
router.get('/:id', authorize(['HR Manager', 'Admin']), appraisalController.getAppraisalById);

// Create new appraisal
router.post('/', authorize(['HR Manager', 'Admin']), appraisalController.createAppraisal);

// Update appraisal
router.put('/:id', authorize(['HR Manager', 'Admin']), appraisalController.updateAppraisal);

// Delete appraisal
router.delete('/:id', authorize(['HR Manager', 'Admin']), appraisalController.deleteAppraisal);

// Generate appraisal letter PDF
router.get('/:id/generate-letter', authorize(['HR Manager', 'Admin']), appraisalController.generateAppraisalLetter);

module.exports = router;