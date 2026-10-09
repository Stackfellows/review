const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/', productController.getProducts);
router.get('/:id', productController.getProduct);

// Admin routes with image upload
router.post('/', authMiddleware, upload.array('images', 5), async (req, res, next) => {
    try {
        if (req.files && req.files.length > 0) {
            req.body.images = req.files.map(file => file.path);
        }
        next();
    } catch (err) {
        next(err);
    }
}, productController.createProduct);

router.put('/:id', authMiddleware, upload.array('images', 5), async (req, res, next) => {
    try {
        if (req.files && req.files.length > 0) {
            req.body.images = req.files.map(file => file.path);
        }
        next();
    } catch (err) {
        next(err);
    }
}, productController.updateProduct);

router.delete('/:id', authMiddleware, productController.deleteProduct);

module.exports = router;
