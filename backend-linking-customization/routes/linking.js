const express = require('express');
const linkingController = require('../controllers/linkingController');
const { authenticate } = require('../../backend/middlewares/auth');
const { authorize } = require('../../backend/middlewares/rbac');

const router = express.Router();

// ModuleLink routes
router.get('/module-links', authenticate, authorize(['Admin']), linkingController.getModuleLinks);
router.post('/module-links', authenticate, authorize(['Admin']), linkingController.createModuleLink);
router.put('/module-links/:id', authenticate, authorize(['Admin']), linkingController.updateModuleLink);
router.delete('/module-links/:id', authenticate, authorize(['Admin']), linkingController.deleteModuleLink);
router.get('/module-links/export/pdf', authenticate, authorize(['Admin']), linkingController.exportModuleLinksPdf);
router.get('/module-links/export/csv', authenticate, authorize(['Admin']), linkingController.exportModuleLinksCsv);

// ApprovalFlow routes
router.get('/approval-flows', authenticate, authorize(['Admin']), linkingController.getApprovalFlows);
router.post('/approval-flows', authenticate, authorize(['Admin']), linkingController.createApprovalFlow);
router.put('/approval-flows/:id', authenticate, authorize(['Admin']), linkingController.updateApprovalFlow);
router.delete('/approval-flows/:id', authenticate, authorize(['Admin']), linkingController.deleteApprovalFlow);

// IncentiveRelation routes
router.get('/incentive-relations', authenticate, authorize(['Admin']), linkingController.getIncentiveRelations);
router.post('/incentive-relations', authenticate, authorize(['Admin']), linkingController.createIncentiveRelation);
router.put('/incentive-relations/:id', authenticate, authorize(['Admin']), linkingController.updateIncentiveRelation);
router.delete('/incentive-relations/:id', authenticate, authorize(['Admin']), linkingController.deleteIncentiveRelation);

// ModuleConfig routes
router.get('/module-configs', authenticate, authorize(['Admin']), linkingController.getModuleConfigs);
router.post('/module-configs', authenticate, authorize(['Admin']), linkingController.createModuleConfig);
router.put('/module-configs/:id', authenticate, authorize(['Admin']), linkingController.updateModuleConfig);
router.delete('/module-configs/:id', authenticate, authorize(['Admin']), linkingController.deleteModuleConfig);

module.exports = router;