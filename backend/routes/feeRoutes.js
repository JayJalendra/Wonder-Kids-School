const express = require('express');
const router = express.Router();
const {
  getFees,
  getFeeStats,
  createFee,
  updateFee,
  deleteFee,
  getMyFees,
} = require('../controllers/feeController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.use(protect);

router.get('/my-fees', authorize('student'), getMyFees);
router.get('/stats', authorize('admin'), getFeeStats);

router
  .route('/')
  .get(authorize('admin'), getFees)
  .post(authorize('admin'), createFee);

router
  .route('/:id')
  .put(authorize('admin'), updateFee)
  .delete(authorize('admin'), deleteFee);

module.exports = router;
