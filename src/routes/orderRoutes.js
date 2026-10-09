const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const authMiddleware = require('../middleware/authMiddleware');

// Public routes
router.post('/', orderController.createOrder);
router.get('/track/:trackingId', orderController.trackOrder);

// Admin routes
router.get('/', authMiddleware, orderController.getOrders);
router.put('/:id/status', authMiddleware, orderController.updateOrderStatus);
router.delete('/:id', authMiddleware, orderController.deleteOrder);

module.exports = router;
