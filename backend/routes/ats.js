const express = require('express');
const router = express.Router();
const { uploadATS, computeScores } = require('../controllers/atsController');
const { authenticate } = require('../middlewares/auth');
const { authorize } = require('../middlewares/rbac');
const multer = require('multer');

const upload = multer({ dest: 'uploads/' });

router.post('/upload', authenticate, authorize(['HR Manager', 'Admin']), upload.array('resumes'), uploadATS);
router.post('/score/:id', authenticate, authorize(['HR Manager', 'Admin']), computeScores);

module.exports = router;




