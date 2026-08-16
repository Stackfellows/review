const rateLimit = require('express-rate-limit');

// Rate limiter for public review submission endpoint (e.g., max 5 submissions per 15 mins per IP)
const reviewSubmitLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many review submissions from this IP address. Please try again after 15 minutes.',
  },
});

// General rate limiter for API endpoints
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests. Please slow down.',
  },
});

module.exports = {
  reviewSubmitLimiter,
  apiLimiter,
};
