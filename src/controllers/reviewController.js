const Review = require('../models/Review');
const jwt = require('jsonwebtoken');

// Helper to sanitize HTML tags from strings
const sanitizeString = (str) => {
  if (typeof str !== 'string') return '';
  return str.replace(/<[^>]*>?/gm, '').trim();
};

/**
 * @desc    Submit a new customer review (Public)
 * @route   POST /api/reviews
 * @access  Public
 */
const submitReview = async (req, res, next) => {
  try {
    const { name, email, rating, review, source, hp_field } = req.body;

    // Honeypot anti-spam check
    if (hp_field) {
      return res.status(400).json({
        success: false,
        message: 'Invalid submission detected.',
      });
    }

    // Input Sanitization & Validation
    const cleanName = sanitizeString(name);
    const cleanEmail = sanitizeString(email).toLowerCase();
    const cleanReview = sanitizeString(review);
    const parsedRating = parseInt(rating, 10);
    const validSource = source === 'website' ? 'website' : 'qr';

    if (!cleanName || cleanName.length < 2 || cleanName.length > 100) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid name (2 to 100 characters).',
      });
    }

    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.',
      });
    }

    if (isNaN(parsedRating) || parsedRating < 1 || parsedRating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Star rating must be an integer between 1 and 5.',
      });
    }

    if (!cleanReview || cleanReview.length < 5 || cleanReview.length > 1000) {
      return res.status(400).json({
        success: false,
        message: 'Please write a review between 5 and 1000 characters.',
      });
    }

    // Capture requester metadata
    const ipHash = req.ip || req.headers['x-forwarded-for'] || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';

    const newReview = await Review.create({
      name: cleanName,
      email: cleanEmail,
      rating: parsedRating,
      review: cleanReview,
      source: validSource,
      status: 'pending',
      metadata: {
        ipHash,
        userAgent,
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Thank you for sharing your experience with Cliffhanger The Jeans. Your review has been received successfully and will be published upon approval.',
      data: {
        id: newReview._id,
        status: newReview.status,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get public approved reviews
 * @route   GET /api/reviews/public
 * @access  Public
 */
const getPublicApprovedReviews = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = Math.min(parseInt(req.query.limit, 10) || 10, 50);
    const skip = (page - 1) * limit;
    const ratingFilter = parseInt(req.query.rating, 10);
    const featuredOnly = req.query.featured === 'true';

    const query = { status: 'approved' };
    if (ratingFilter >= 1 && ratingFilter <= 5) {
      query.rating = ratingFilter;
    }
    if (featuredOnly) {
      query.isFeatured = true;
    }

    const total = await Review.countDocuments(query);
    const reviews = await Review.find(query)
      .select('name rating review isFeatured source createdAt')
      .sort({ isFeatured: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return res.status(200).json({
      success: true,
      data: reviews,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get public approved rating summary statistics
 * @route   GET /api/reviews/stats
 * @access  Public
 */
const getPublicStats = async (req, res, next) => {
  try {
    const stats = await Review.aggregate([
      { $match: { status: 'approved' } },
      {
        $group: {
          _id: null,
          totalReviews: { $sum: 1 },
          avgRating: { $avg: '$rating' },
          fiveStar: { $sum: { $cond: [{ $eq: ['$rating', 5] }, 1, 0] } },
          fourStar: { $sum: { $cond: [{ $eq: ['$rating', 4] }, 1, 0] } },
          threeStar: { $sum: { $cond: [{ $eq: ['$rating', 3] }, 1, 0] } },
          twoStar: { $sum: { $cond: [{ $eq: ['$rating', 2] }, 1, 0] } },
          oneStar: { $sum: { $cond: [{ $eq: ['$rating', 1] }, 1, 0] } },
        },
      },
    ]);

    const result = stats[0] || {
      totalReviews: 0,
      avgRating: 0,
      fiveStar: 0,
      fourStar: 0,
      threeStar: 0,
      twoStar: 0,
      oneStar: 0,
    };

    return res.status(200).json({
      success: true,
      data: {
        totalReviews: result.totalReviews,
        averageRating: parseFloat((result.avgRating || 0).toFixed(1)),
        distribution: {
          5: result.fiveStar,
          4: result.fourStar,
          3: result.threeStar,
          2: result.twoStar,
          1: result.oneStar,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all reviews for Admin Dashboard
 * @route   GET /api/reviews/admin
 * @access  Private (Admin)
 */
const getAdminReviews = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);
    const skip = (page - 1) * limit;

    const { status, rating, source, search, sort, featured } = req.query;

    const query = {};

    if (status && ['pending', 'approved', 'rejected'].includes(status)) {
      query.status = status;
    }

    if (rating && parseInt(rating, 10) >= 1 && parseInt(rating, 10) <= 5) {
      query.rating = parseInt(rating, 10);
    }

    if (source && ['qr', 'website'].includes(source)) {
      query.source = source;
    }

    if (featured === 'true') {
      query.isFeatured = true;
    }

    if (search) {
      const searchRegex = new RegExp(sanitizeString(search), 'i');
      query.$or = [{ name: searchRegex }, { review: searchRegex }];
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'oldest') sortOption = { createdAt: 1 };
    if (sort === 'rating_high') sortOption = { rating: -1, createdAt: -1 };
    if (sort === 'rating_low') sortOption = { rating: 1, createdAt: -1 };

    const total = await Review.countDocuments(query);
    const reviews = await Review.find(query)
      .select('+email')
      .sort(sortOption)
      .skip(skip)
      .limit(limit);

    return res.status(200).json({
      success: true,
      data: reviews,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get full dashboard statistics for Admin
 * @route   GET /api/reviews/admin/stats
 * @access  Private (Admin)
 */
const getAdminStats = async (req, res, next) => {
  try {
    const stats = await Review.aggregate([
      {
        $group: {
          _id: null,
          totalReviews: { $sum: 1 },
          avgRating: { $avg: '$rating' },
          pendingReviews: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
          approvedReviews: { $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] } },
          rejectedReviews: { $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] } },
          fiveStar: { $sum: { $cond: [{ $eq: ['$rating', 5] }, 1, 0] } },
          fourStar: { $sum: { $cond: [{ $eq: ['$rating', 4] }, 1, 0] } },
          threeStar: { $sum: { $cond: [{ $eq: ['$rating', 3] }, 1, 0] } },
          twoStar: { $sum: { $cond: [{ $eq: ['$rating', 2] }, 1, 0] } },
          oneStar: { $sum: { $cond: [{ $eq: ['$rating', 1] }, 1, 0] } },
          qrCount: { $sum: { $cond: [{ $eq: ['$source', 'qr'] }, 1, 0] } },
          websiteCount: { $sum: { $cond: [{ $eq: ['$source', 'website'] }, 1, 0] } },
        },
      },
    ]);

    const result = stats[0] || {
      totalReviews: 0,
      avgRating: 0,
      pendingReviews: 0,
      approvedReviews: 0,
      rejectedReviews: 0,
      fiveStar: 0,
      fourStar: 0,
      threeStar: 0,
      twoStar: 0,
      oneStar: 0,
      qrCount: 0,
      websiteCount: 0,
    };

    return res.status(200).json({
      success: true,
      data: {
        totalReviews: result.totalReviews,
        averageRating: parseFloat((result.avgRating || 0).toFixed(1)),
        pendingReviews: result.pendingReviews,
        approvedReviews: result.approvedReviews,
        rejectedReviews: result.rejectedReviews,
        fiveStar: result.fiveStar,
        fourStar: result.fourStar,
        threeStar: result.threeStar,
        twoStar: result.twoStar,
        oneStar: result.oneStar,
        qrCount: result.qrCount,
        websiteCount: result.websiteCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update review moderation status
 * @route   PATCH /api/reviews/:id/status
 * @access  Private (Admin)
 */
const updateStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be pending, approved, or rejected.',
      });
    }

    const review = await Review.findByIdAndUpdate(id, { status }, { new: true });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found.',
      });
    }

    return res.status(200).json({
      success: true,
      message: `Review status updated to ${status}.`,
      data: review,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Toggle review featured state
 * @route   PATCH /api/reviews/:id/feature
 * @access  Private (Admin)
 */
const toggleFeatured = async (req, res, next) => {
  try {
    const { id } = req.params;
    const review = await Review.findById(id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found.',
      });
    }

    review.isFeatured = !review.isFeatured;
    await review.save();

    return res.status(200).json({
      success: true,
      message: `Review is now ${review.isFeatured ? 'featured' : 'unfeatured'}.`,
      data: review,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete review
 * @route   DELETE /api/reviews/:id
 * @access  Private (Admin)
 */
const deleteReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const review = await Review.findByIdAndDelete(id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Review permanently deleted.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Admin Login Endpoint
 * @route   POST /api/reviews/admin/login
 * @access  Public
 */
const adminLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPassword = (password || '').trim();

    const adminEmail = (process.env.ADMIN_EMAIL || 'cliffhangerthejeans@gmail.com').toLowerCase().trim();
    const adminPass = (process.env.ADMIN_PASSWORD || 'admin00@00').trim();

    if (cleanEmail === adminEmail && cleanPassword === adminPass) {
      const token = jwt.sign(
        { email: cleanEmail, role: 'admin' },
        process.env.JWT_SECRET || 'cliffhanger_review_secret_key_2026_super_secure',
        { expiresIn: '7d' }
      );
      return res.status(200).json({
        success: true,
        message: 'Admin login successful.',
        token,
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Invalid admin credentials. Correct email: cliffhangerthejeans@gmail.com, password: admin00@00',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  submitReview,
  getPublicApprovedReviews,
  getPublicStats,
  getAdminReviews,
  getAdminStats,
  updateStatus,
  toggleFeatured,
  deleteReview,
  adminLogin,
};
