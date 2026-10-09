const Product = require('../models/Product');
const Subscriber = require('../models/Subscriber');
const Review = require('../models/Review');
const { sendNewProductEmail } = require('../utils/mailer');

// Get all products
exports.getProducts = async (req, res) => {
    try {
        const { category, isNewArrival, limit } = req.query;
        let query = {};
        
        if (category) query.category = category;
        if (isNewArrival) query.isNewArrival = true;

        let productsQuery = Product.find(query).sort({ createdAt: -1 });
        if (limit) {
            productsQuery = productsQuery.limit(parseInt(limit));
        }
        
        const products = await productsQuery;
        res.status(200).json({ success: true, count: products.length, data: products });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// Get single product
exports.getProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ success: false, error: 'Product not found' });
        }
        res.status(200).json({ success: true, data: product });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// Create product (Admin only)
exports.createProduct = async (req, res) => {
    try {
        const product = await Product.create(req.body);
        
        // Asynchronously send new product email to subscribers and reviewers
        setImmediate(async () => {
            try {
                // Get all active subscribers
                const subscribers = await Subscriber.find({ isSubscribed: true }).select('email');
                // Get all distinct reviewers emails
                const reviewers = await Review.find({ email: { $exists: true, $ne: null } }).distinct('email');
                
                // Combine and deduplicate
                const allEmails = [...new Set([
                    ...subscribers.map(s => s.email),
                    ...reviewers
                ])];

                if (allEmails.length > 0) {
                    await sendNewProductEmail(allEmails, product);
                }
            } catch (err) {
                console.error("Error broadcasting new product email:", err);
            }
        });

        res.status(201).json({ success: true, data: product });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

// Update product (Admin only)
exports.updateProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!product) {
            return res.status(404).json({ success: false, error: 'Product not found' });
        }
        res.status(200).json({ success: true, data: product });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

// Delete product (Admin only)
exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) {
            return res.status(404).json({ success: false, error: 'Product not found' });
        }
        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};
