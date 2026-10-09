const Subscriber = require('../models/Subscriber');
const { sendWelcomeDiscountEmail } = require('../utils/mailer');

exports.subscribe = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ success: false, error: 'Email is required' });
        }

        let subscriber = await Subscriber.findOne({ email });
        
        if (subscriber) {
            if (!subscriber.isSubscribed) {
                subscriber.isSubscribed = true;
                await subscriber.save();
                // Send email again if re-subscribing
                await sendWelcomeDiscountEmail(email);
                return res.json({ success: true, message: 'Re-subscribed successfully!' });
            }
            return res.status(400).json({ success: false, error: 'Email already subscribed' });
        }

        subscriber = await Subscriber.create({ email });
        
        // Send the 10% off welcome email
        await sendWelcomeDiscountEmail(email);

        res.status(201).json({ success: true, message: 'Subscribed successfully!' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
