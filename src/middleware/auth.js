const jwt = require('jsonwebtoken');

const adminAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    // Check if token exists in Authorization header
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const decoded = jwt.verify(
          token,
          process.env.JWT_SECRET || 'cliffhanger_review_secret_key_2026_super_secure'
        );
        req.admin = decoded;
        return next();
      } catch (err) {
        // Token invalid, attempt fallback check below
      }
    }

    // Direct Admin Secret Passkey or Admin Token header check
    const adminPasskey = req.headers['x-admin-key'] || req.headers['x-admin-token'];
    const expectedPasskey = process.env.ADMIN_PASSWORD || 'admin00@00';

    if (adminPasskey && adminPasskey.trim() === expectedPasskey.trim()) {
      req.admin = { role: 'admin' };
      return next();
    }

    return res.status(401).json({
      success: false,
      message: 'Unauthorized access. Admin authentication required.',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Authentication error.',
    });
  }
};

module.exports = adminAuth;
