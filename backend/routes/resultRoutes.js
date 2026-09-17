const express = require('express');
const router = express.Router();
const {
  getResults,
  createResult,
  bulkUploadResults,
  updateResult,
  deleteResult,
  getMyResults,
} = require('../controllers/resultController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.use(protect);

router.get('/my-results', authorize('student'), getMyResults);
router.post('/bulk', authorize('admin', 'teacher'), bulkUploadResults);

router
  .route('/')
  .get(authorize('admin', 'teacher'), getResults)
  .post(authorize('admin', 'teacher'), createResult);

router
  .route('/:id')
  .put(authorize('admin', 'teacher'), updateResult)
  .delete(authorize('admin', 'teacher'), deleteResult);

module.exports = router;
