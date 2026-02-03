const express = require('express');
const gatepassController = require('../controllers/gatepassController');
const { authenticate } = require('../middlewares/auth');
const { authorize } = require('../middlewares/rbac');

const router = express.Router();

// All routes protected with authenticate
router.use(authenticate);

// Employee routes
router.post('/request', authorize(['Employee']), gatepassController.requestGatepass);
router.get('/my', authorize(['Employee']), gatepassController.getMyGatepasses);

// HR/Admin routes
router.get('/pending', authorize(['HR Manager', 'Admin']), gatepassController.getPendingGatepasses);
router.get('/hr', authorize(['HR Manager', 'Admin']), gatepassController.getGatepassesByStatus);
router.get('/stats', authorize(['HR Manager', 'Admin']), gatepassController.getGatepassStats);
router.put('/:id/approve', authorize(['HR Manager', 'Admin']), gatepassController.approveGatepass);
router.put('/:id/reject', authorize(['HR Manager', 'Admin']), gatepassController.rejectGatepass);

module.exports = router;




