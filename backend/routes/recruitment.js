const express = require('express');
const recruitmentController = require('../controllers/recruitmentController');
const { authenticate } = require('../middlewares/auth');
const { authorize } = require('../middlewares/rbac');

const router = express.Router();

// All routes protected with authenticate and HR role
router.use(authenticate);
router.use(authorize(['HR Manager', 'Admin']));

router.get('/', recruitmentController.getAllRecruitments);
router.get('/stats', recruitmentController.getRecruitmentStats);
router.get('/:id', recruitmentController.getRecruitmentById);
router.post('/', recruitmentController.createRecruitment);
router.put('/:id', recruitmentController.updateRecruitment);
router.post('/:id/close', recruitmentController.closeRecruitment);
router.delete('/:id', recruitmentController.deleteRecruitment);

// Candidate routes
router.post('/add-candidate', recruitmentController.addCandidate);
router.put('/update-candidate-stage', recruitmentController.updateCandidateStage);

// Offer
router.post('/generate-offer', recruitmentController.generateOffer);

// Export routes
router.get('/export/pdf', recruitmentController.exportRecruitmentsPdf);
router.get('/export/csv', recruitmentController.exportRecruitmentsCsv);

module.exports = router;




