const express = require('express');
const router = express.Router();
const membershipController = require('../controllers/membershipController');

router.post('/generate', membershipController.generateCard);
router.get('/:cardId', membershipController.getMembershipByCardId);

module.exports = router;
