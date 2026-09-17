const express = require('express');
const router = express.Router();
const {
  getExams,
  getExamById,
  createExam,
  updateExam,
  deleteExam,
} = require('../controllers/examController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.use(protect);

router
  .route('/')
  .get(getExams)
  .post(authorize('admin'), createExam);

router
  .route('/:id')
  .get(getExamById)
  .put(authorize('admin'), updateExam)
  .delete(authorize('admin'), deleteExam);

module.exports = router;
