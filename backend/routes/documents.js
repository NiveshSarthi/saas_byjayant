const express = require('express');
const documentController = require('../controllers/documentController');
const { authenticate } = require('../middlewares/auth');
const { authorize } = require('../middlewares/rbac');
const multer = require('multer');

// Reuse upload from server.js, but since it's local, define again or import
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});
const upload = multer({ storage });

const router = express.Router();

// All routes protected
router.use(authenticate);
router.use(authorize(['HR Manager', 'Admin']));

router.post('/upload', upload.single('file'), documentController.uploadDocument);
router.get('/', documentController.getDocuments);

module.exports = router;




