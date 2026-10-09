const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Product = require('../models/Product');

dotenv.config({ path: path.join(__dirname, '../../.env') });

mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB for Seeding...'))
    .catch(err => {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    });

const sampleProducts = [
    {
        productCode: "CH-B001",
        name: "Summit Rider",
        category: "Boys",
        collectionName: "Explorer Collection",
        fit: "Straight Fit",
        shade: "Ice Vintage Blue",
        washType: "Light Vintage Wash",
        fabric: "Premium Stretch Denim",
        price: 3850,
        originalPrice: 4500,
        sizes: ["22", "24", "26", "28", "30", "32", "34"],
        ageGroup: "6-9Y",
        description: "Summit Rider is designed for boys who never stop exploring. Crafted from premium stretch denim in a refreshing Ice Vintage Blue wash, it combines all-day comfort, durability, and timeless style.",
        images: ["/prodact1.png", "/prodact2.png"],
        isNewArrival: true
    },
    {
        productCode: "CH-B002",
        name: "Canyon Trek",
        category: "Boys",
        collectionName: "Explorer Collection",
        fit: "Straight Fit",
        shade: "Deep Indigo Wash",
        washType: "Dark Stone Wash",
        fabric: "Premium Stretch Denim",
        price: 4200,
        originalPrice: 4800,
        sizes: ["22", "24", "26", "28", "30", "32", "34"],
        ageGroup: "10-14Y",
        description: "Canyon Trek combines timeless style with everyday durability. Crafted from premium stretch denim in a rich Deep Indigo Wash, these boys' jeans offer lasting comfort.",
        images: ["/prodact2.png", "/prodact3.png"],
        isNewArrival: true
    },
    {
        productCode: "CH-B003",
        name: "Ridge Runner",
        category: "Boys",
        collectionName: "Explorer Collection",
        fit: "Straight Fit",
        shade: "Mountain Blue Wash",
        washType: "Medium Vintage Wash",
        fabric: "Premium Stretch Denim",
        price: 3950,
        originalPrice: 4600,
        sizes: ["22", "24", "26", "28", "30", "32", "34"],
        ageGroup: "3-5Y",
        description: "Ridge Runner is crafted for boys who embrace every adventure with confidence. Featuring a premium Mountain Blue Wash, contrast pocket detailing, and comfortable stretch denim.",
        images: ["/prodact4.png", "/prodact1.png"],
        isNewArrival: true
    },
    {
        productCode: "CH-G001",
        name: "Meadow Bloom",
        category: "Girls",
        collectionName: "Blossom Collection",
        fit: "Wide Leg",
        shade: "Light Vintage Blue Wash",
        washType: "Light Vintage Blue",
        fabric: "Premium Embroidered Stretch Denim",
        price: 4400,
        originalPrice: 5200,
        sizes: ["22", "24", "26", "28", "30", "32", "34"],
        ageGroup: "6-9Y",
        description: "A beautifully crafted wide-leg denim designed for girls who love comfort with effortless style. Featuring delicate floral embroidery on both front pockets.",
        images: ["/prodact3.png", "/prodact5.png"],
        isNewArrival: true
    },
    {
        productCode: "CH-G002",
        name: "Sky Haven",
        category: "Girls",
        collectionName: "Blossom Collection",
        fit: "Wide Leg",
        shade: "Light Sky Blue Wash",
        washType: "Light Sky Blue",
        fabric: "Soft-Touch Premium Denim",
        price: 4100,
        originalPrice: 4900,
        sizes: ["22", "24", "26", "28", "30", "32", "34"],
        ageGroup: "10-14Y",
        description: "A timeless pair of premium wide-leg jeans crafted for comfort and effortless everyday style. Featuring a soft sky blue wash, subtle distressed detailing near the front pocket.",
        images: ["/prodact5.png", "/prodact4.png"],
        isNewArrival: true
    }
];

const seedDB = async () => {
    try {
        await Product.deleteMany({});
        await Product.insertMany(sampleProducts);
        console.log('Database successfully seeded with Boys & Girls collections!');
        process.exit();
    } catch (err) {
        console.error('Seeding error:', err);
        process.exit(1);
    }
};

seedDB();
