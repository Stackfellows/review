const express = require('express');
const router = express.Router();
const { chat, recommend, sizeRecommendation } = require('../controllers/chatController');

router.post('/', chat);
router.post('/recommend', recommend);
router.post('/size', sizeRecommendation);

module.exports = router;
