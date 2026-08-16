const express = require('express');
const router = express.Router();
const {
  submitReview,
  getPublicApprovedReviews,
  getPublicStats,
  getAdminReviews,
  getAdminStats,
  updateStatus,
  toggleFeatured,
  deleteReview,
  adminLogin,
} = require('../controllers/reviewController');
const adminAuth = require('../middleware/auth');
const { reviewSubmitLimiter } = require('../middleware/rateLimiter');

// --- Public Endpoints ---
router.post('/reviews', reviewSubmitLimiter, submitReview);
router.get('/reviews/public', getPublicApprovedReviews);
router.get('/reviews/stats', getPublicStats);
router.post('/reviews/admin/login', adminLogin);

// --- Admin Private Endpoints ---
router.get('/reviews/admin', adminAuth, getAdminReviews);
router.get('/reviews/admin/stats', adminAuth, getAdminStats);
router.patch('/reviews/:id/status', adminAuth, updateStatus);
router.patch('/reviews/:id/feature', adminAuth, toggleFeatured);
router.delete('/reviews/:id', adminAuth, deleteReview);

module.exports = router;
