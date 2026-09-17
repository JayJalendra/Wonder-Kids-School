const express = require('express');
const router = express.Router();
const {
  getAttendance,
  getClassAttendanceByDate,
  bulkMarkAttendance,
  getMyAttendance,
  deleteAttendance,
} = require('../controllers/attendanceController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.use(protect);

router.get('/my-attendance', authorize('student'), getMyAttendance);
router.get('/class/:classId', authorize('admin', 'teacher'), getClassAttendanceByDate);
router.post('/bulk', authorize('admin', 'teacher'), bulkMarkAttendance);

router
  .route('/')
  .get(authorize('admin', 'teacher'), getAttendance);

router
  .route('/:id')
  .delete(authorize('admin'), deleteAttendance);

module.exports = router;
