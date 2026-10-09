const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    productCode: { type: String }, // e.g. CH-B001, CH-B002
    collectionName: { type: String }, // e.g. Explorer Collection, Blossom Collection
    description: { type: String, required: true },
    price: { type: Number, required: true },
    originalPrice: { type: Number },
    salePrice: { type: Number },
    category: { type: String, required: true }, // e.g. "Boys", "Girls"
    fit: { type: String }, // e.g. "Straight Fit", "Wide Leg"
    shade: { type: String }, // e.g. "Ice Vintage Blue", "Deep Indigo Wash"
    washType: { type: String }, // e.g. "Light Vintage Wash", "Dark Stone Wash"
    fabric: { type: String, default: "Premium Stretch Denim" },
    ageGroup: { type: String }, // e.g. "0-2Y", "3-5Y", "6-9Y", "10-14Y"
    images: [{ type: String }],
    sizes: [{ type: String }], // e.g. ["22", "24", "26", "28", "30", "32", "34"]
    colors: [{ type: String }],
    stock: { type: Number, default: 50 },
    inStock: { type: Boolean, default: true },
    isNewArrival: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
