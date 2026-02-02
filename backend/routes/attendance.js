const express = require('express');
const attendanceController = require('../controllers/attendanceController');
const { authenticate } = require('../middlewares/auth');
const { authorize } = require('../middlewares/rbac');

const router = express.Router();

// All routes protected with authenticate
router.use(authenticate);

// Employee routes
router.post('/check-in', authorize(['Employee']), attendanceController.checkIn);
router.post('/check-out', authorize(['Employee']), attendanceController.checkOut);
router.get('/history', authorize(['Employee']), attendanceController.getAttendanceHistory);

// HR/Admin routes
router.get('/', authorize(['HR Manager', 'Admin']), attendanceController.getAllAttendances);
router.get('/export/pdf', authorize(['HR Manager', 'Admin']), attendanceController.exportAttendancesPdf);
router.get('/export/csv', authorize(['HR Manager', 'Admin']), attendanceController.exportAttendancesCsv);

module.exports = router;




