const express = require('express');
const employeeController = require('../controllers/employeeController');
const { authenticate } = require('../middlewares/auth');
const { authorize } = require('../middlewares/rbac');

const router = express.Router();

// All routes protected with authenticate
router.use(authenticate);

// HR/Admin routes for assets
router.use(authorize(['HR Manager', 'Admin']));

router.get('/', employeeController.getAllAssets);
router.get('/stats', employeeController.getAssetStats);

module.exports = router;