const mongoose = require('mongoose');

const membershipSchema = new mongoose.Schema({
    customerName: { type: String, required: true },
    customerEmail: { type: String, required: true },
    cardId: { type: String, required: true, unique: true },
    cardNumber: { type: String, required: true },
    issuedAt: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('Membership', membershipSchema);
