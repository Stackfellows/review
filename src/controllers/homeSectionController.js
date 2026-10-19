const HomeSection = require('../models/HomeSection');

// Initial default data if none exists in database
const defaultSections = {
    shop_by_category: {
        sectionKey: 'shop_by_category',
        title: 'Shop By Category',
        subtitle: 'Curated Styles',
        description: 'Explore our latest collections built for adventure.',
        cards: [
            {
                title: "Boys Collection",
                subtitle: "RUGGED & ADVENTURE READY",
                imageUrl: "/prodact1.png",
                link: "/boys"
            },
            {
                title: "Girls Collection",
                subtitle: "CHIC & ACTIVE FREEDOM",
                imageUrl: "/prodact3.png",
                link: "/girls"
            },
            {
                title: "Baby Essentials",
                subtitle: "ULTRA SOFT & SAFE",
                imageUrl: "/prodact5.png",
                link: "/collection"
            },
            {
                title: "Denim & Accessories",
                subtitle: "COMPLETE THE LOOK",
                imageUrl: "/prodact4.png",
                link: "/collection"
            }
        ]
    },
    shop_by_age: {
        sectionKey: 'shop_by_age',
        title: 'Shop By Age',
        subtitle: 'Categories',
        description: 'Gear tailored by age group from toddlers to teenagers.',
        cards: [
            {
                title: "2-4 Years",
                subtitle: "Toddler Adventures",
                imageUrl: "/prodactbyage/pic 10.png",
                link: "/collection?age=2-4"
            },
            {
                title: "5-7 Years",
                subtitle: "Little Explorers",
                imageUrl: "/prodactbyage/pic 11.png",
                link: "/collection?age=5-7"
            },
            {
                title: "8-10 Years",
                subtitle: "Active Juniors",
                imageUrl: "/prodactbyage/pic 12.png",
                link: "/collection?age=8-10"
            },
            {
                title: "11-14 Years",
                subtitle: "Teen Trends",
                imageUrl: "/prodactbyage/pic 13.png",
                link: "/collection?age=11-14"
            }
        ]
    },
    the_experience: {
        sectionKey: 'the_experience',
        title: 'ENGINEERED FOR ELITE EXPLORERS',
        subtitle: 'The Experience',
        description: "We don't just make clothes; we build gear. High-class denim crafted for the world's youngest mountain climbers.",
        cards: [
            {
                title: "Tough Souls",
                subtitle: "BOYS ADVENTURE",
                imageUrl: "/prodact1.png",
                link: "/boys"
            },
            {
                title: "Wild Hearts",
                subtitle: "GIRLS EXPLORER",
                imageUrl: "/prodact3.png",
                link: "/girls"
            },
            {
                title: "Tiny Pioneers",
                subtitle: "BABY DENIM",
                imageUrl: "/prodact5.png",
                link: "/babies"
            }
        ]
    }
};

// Seed if missing
const ensureDefaults = async () => {
    for (const key of Object.keys(defaultSections)) {
        const exists = await HomeSection.findOne({ sectionKey: key });
        if (!exists) {
            await HomeSection.create(defaultSections[key]);
        }
    }
};

// Get all home sections (Public)
exports.getAllSections = async (req, res) => {
    try {
        await ensureDefaults();
        const sections = await HomeSection.find();
        const formatted = {};
        sections.forEach(s => {
            formatted[s.sectionKey] = s;
        });
        res.status(200).json({ success: true, data: formatted });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// Get single section by key
exports.getSectionByKey = async (req, res) => {
    try {
        await ensureDefaults();
        const section = await HomeSection.findOne({ sectionKey: req.params.sectionKey });
        if (!section) {
            return res.status(404).json({ success: false, error: 'Section not found' });
        }
        res.status(200).json({ success: true, data: section });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// Update section content (Admin only)
exports.updateSection = async (req, res) => {
    try {
        const { sectionKey } = req.params;
        const { title, subtitle, description, cards } = req.body;

        let parsedCards = cards;
        if (typeof cards === 'string') {
            try {
                parsedCards = JSON.parse(cards);
            } catch (e) {
                parsedCards = [];
            }
        }

        const updated = await HomeSection.findOneAndUpdate(
            { sectionKey },
            { 
                $set: { 
                    title, 
                    subtitle, 
                    description, 
                    ...(parsedCards ? { cards: parsedCards } : {})
                } 
            },
            { new: true, upsert: true }
        );

        res.status(200).json({ success: true, data: updated, message: 'Section updated successfully' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// Upload image helper for admin card image upload
exports.uploadSectionImage = async (req, res) => {
    try {
        if (!req.file || !req.file.path) {
            return res.status(400).json({ success: false, error: 'No image uploaded' });
        }
        res.status(200).json({ success: true, imageUrl: req.file.path });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};
