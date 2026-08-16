const errorHandler = (err, req, res, next) => {
  console.error('[API Error]:', err);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({
      success: false,
      message: errors.join(', ') || 'Validation error.',
    });
  }

  // Mongoose CastError (e.g. invalid ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'Invalid resource ID format.',
    });
  }

  // Generic internal server error response
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Something went wrong on the server. Please try again.',
  });
};

module.exports = errorHandler;
