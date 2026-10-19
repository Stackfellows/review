const mongoose = require('mongoose');

const homeSectionSchema = new mongoose.Schema({
    sectionKey: { 
        type: String, 
        required: true, 
        unique: true, 
        enum: ['shop_by_category', 'shop_by_age', 'the_experience'] 
    },
    title: { type: String, default: '' },
    subtitle: { type: String, default: '' },
    description: { type: String, default: '' },
    cards: [
        {
            title: { type: String, default: '' },
            subtitle: { type: String, default: '' },
            description: { type: String, default: '' },
            imageUrl: { type: String, default: '' },
            link: { type: String, default: '' }
        }
    ]
}, { timestamps: true });

module.exports = mongoose.model('HomeSection', homeSectionSchema);
