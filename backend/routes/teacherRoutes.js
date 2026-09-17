const express = require('express');
const router = express.Router();
const {
  getTeachers,
  getTeacherById,
  getMyAssignedClasses,
  createTeacher,
  updateTeacher,
  deleteTeacher,
} = require('../controllers/teacherController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.use(protect);

router.get('/me/classes', authorize('teacher'), getMyAssignedClasses);

router
  .route('/')
  .get(authorize('admin', 'teacher'), getTeachers)
  .post(authorize('admin'), createTeacher);

router
  .route('/:id')
  .get(getTeacherById)
  .put(authorize('admin'), updateTeacher)
  .delete(authorize('admin'), deleteTeacher);

module.exports = router;
