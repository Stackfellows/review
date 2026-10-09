const express = require('express');
const router = express.Router();
const userAuthController = require('../controllers/userAuthController');
const userAuthMiddleware = require('../middleware/userAuthMiddleware');

router.post('/register', userAuthController.registerUser);
router.post('/login', userAuthController.loginUser);
router.get('/profile', userAuthMiddleware, userAuthController.getUserProfile);

module.exports = router;
