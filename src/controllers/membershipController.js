const Membership = require('../models/Membership');
const path = require('path');

// Generate / Register Membership Card in Database
exports.generateCard = async (req, res) => {
    try {
        const { customerName, customerEmail } = req.body;
        
        if (!customerName || !customerEmail) {
            return res.status(400).json({ success: false, message: 'Name and email are required.' });
        }

        // Check if user already has a card
        let membership = await Membership.findOne({ customerEmail });
        
        if (!membership) {
            // Generate a unique 8-digit Card ID and 16-digit Card Number
            const random8Digits = Math.floor(10000000 + Math.random() * 90000000).toString();
            const cardId = 'CHJ-' + random8Digits;
            const cardNumber = `4455 ${random8Digits.substring(0, 4)} ${random8Digits.substring(4, 8)} ${Math.floor(1000 + Math.random() * 9000)}`;

            membership = await Membership.create({
                customerName,
                customerEmail,
                cardId,
                cardNumber
            });
        }

        res.status(200).json({
            success: true,
            data: membership
        });

    } catch (error) {
        console.error("Card generation error:", error);
        res.status(500).json({ success: false, message: 'Failed to generate card.' });
    }
};

// Get Single Membership Details by Card ID (for QR Code Scanner)
exports.getMembershipByCardId = async (req, res) => {
    try {
        const { cardId } = req.params;
        const membership = await Membership.findOne({ cardId });

        if (!membership) {
            return res.status(404).json({ success: false, message: 'Membership card not found or invalid.' });
        }

        res.status(200).json({
            success: true,
            data: membership
        });
    } catch (error) {
        console.error("Fetch card error:", error);
        res.status(500).json({ success: false, message: 'Server Error fetching membership.' });
    }
};
