const express = require('express');
const fieldConfigController = require('../controllers/fieldConfigController');
const { authenticate } = require('../middlewares/auth');
const { authorize } = require('../middlewares/rbac');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get all field configurations
router.get('/', authorize(['HR Manager', 'Admin', 'Operations', 'Administration']), fieldConfigController.getFieldConfigs);

// Get field config by type
router.get('/:type', authorize(['HR Manager', 'Admin', 'Operations', 'Administration']), fieldConfigController.getFieldConfigByType);

// Update field config
router.put('/:type', authorize(['HR Manager', 'Admin', 'Operations', 'Administration']), fieldConfigController.updateFieldConfig);

// Add value to field config
router.post('/:type/values', authorize(['HR Manager', 'Admin', 'Operations', 'Administration']), fieldConfigController.addFieldValue);

// Remove value from field config
router.delete('/:type/values', authorize(['HR Manager', 'Admin', 'Operations', 'Administration']), fieldConfigController.removeFieldValue);

// Add position
router.post('/positions', authorize(['HR Manager', 'Admin', 'Operations', 'Administration']), fieldConfigController.addPosition);

// Remove position
router.delete('/positions/:positionId', authorize(['HR Manager', 'Admin', 'Operations', 'Administration']), fieldConfigController.removePosition);

module.exports = router;