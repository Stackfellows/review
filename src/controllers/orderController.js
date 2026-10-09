const Order = require('../models/Order');
const nodemailer = require('nodemailer');

const createTransporter = () => nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const generateEmailTemplate = (title, preheader, content, trackingNumber) => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
        <style>
            body { margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #F5F5F0; color: #000000; }
            .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1); border: 1px solid #e2e8f0; }
            .header { background-color: #1B3022; padding: 40px; text-align: center; }
            .header h1 { color: #ffffff; margin: 0; font-size: 32px; font-weight: 900; letter-spacing: 2px; text-transform: uppercase; }
            .header p { color: rgba(255, 255, 255, 0.7); margin: 8px 0 0 0; font-size: 14px; font-weight: bold; letter-spacing: 4px; text-transform: uppercase; }
            .content { padding: 48px 40px; }
            .footer { background-color: #1B3022; padding: 32px 40px; text-align: center; border-top: 4px solid #F5F5F0; }
            .footer p { color: rgba(255, 255, 255, 0.6); margin: 0; font-size: 12px; font-weight: 500; }
            .btn { display: inline-block; background-color: #000000; color: #ffffff; padding: 16px 32px; border-radius: 4px; text-decoration: none; font-weight: 900; margin-top: 32px; text-align: center; text-transform: uppercase; letter-spacing: 2px; font-size: 14px; }
            .tracking-box { background-color: #F5F5F0; border-left: 4px solid #1B3022; padding: 20px; margin: 32px 0; }
            .tracking-box p { margin: 0; color: #475569; font-size: 11px; text-transform: uppercase; font-weight: 900; letter-spacing: 2px; }
            .tracking-box h3 { margin: 8px 0 0 0; color: #1B3022; font-size: 24px; font-weight: 900; letter-spacing: 1px; }
            h2 { color: #1B3022; margin-top: 0; font-size: 24px; font-weight: 900; text-transform: uppercase; letter-spacing: -0.5px; }
            p { line-height: 1.8; margin-bottom: 16px; color: #475569; font-size: 15px; }
            strong { color: #000000; font-weight: 800; }
        </style>
    </head>
    <body>
        <div style="display: none; max-height: 0px; overflow: hidden;">
            ${preheader}
        </div>
        <div class="container">
            <div class="header">
                <h1>Cliffhanger</h1>
                <p>The Jeans</p>
            </div>
            <div class="content">
                ${content}
                
                ${trackingNumber ? `
                <div class="tracking-box">
                    <p>Your Tracking Number</p>
                    <h3>${trackingNumber}</h3>
                </div>
                <div style="text-align: center;">
                    <a href="http://localhost:5173/track" class="btn">Track Your Order</a>
                </div>
                ` : ''}
            </div>
            <div class="footer">
                <p>&copy; ${new Date().getFullYear()} Cliffhanger Jeans. All rights reserved.</p>
                <p style="margin-top: 8px;">If you have any questions, reply to this email.</p>
            </div>
        </div>
    </body>
    </html>
    `;
};

// Create new order (Public)
exports.createOrder = async (req, res) => {
    try {
        const transporter = createTransporter();
        const { customer, items, totalAmount, paymentMethod } = req.body;
        
        // Generate tracking number like cliffhangerthejeans01, 02...
        const orderCount = await Order.countDocuments();
        const trackingNumber = 'cliffhangerthejeans' + String(orderCount + 1).padStart(2, '0');
        
        // Estimated delivery in 5 days
        const estimatedDelivery = new Date();
        estimatedDelivery.setDate(estimatedDelivery.getDate() + 5);

        const order = await Order.create({
            customer,
            items,
            totalAmount,
            paymentMethod,
            trackingNumber,
            estimatedDelivery
        });

        // Send confirmation email to Customer
        try {
            const customerContent = `
                <h2>Order Confirmed!</h2>
                <p>Hi ${customer.firstName},</p>
                <p>Thank you for shopping with <strong>Cliffhanger Jeans</strong>. We've received your order and our team is already getting it ready for shipment.</p>
                <p><strong>Total Amount:</strong> Rs. ${totalAmount.toLocaleString()}</p>
                <p><strong>Payment Method:</strong> ${paymentMethod}</p>
            `;
            
            const customerText = `Hi ${customer.firstName},\n\nThank you for your order! Your tracking number is ${trackingNumber}. Total Amount: Rs. ${totalAmount.toLocaleString()}.\n\nBest regards,\nCliffhanger Jeans Team`;

            await transporter.sendMail({
                from: `"Cliffhanger Jeans" <${process.env.EMAIL_USER}>`,
                to: customer.email,
                subject: `Order Confirmation - ${trackingNumber}`,
                text: customerText,
                html: generateEmailTemplate('Order Confirmed', 'Your Cliffhanger Jeans order has been successfully placed.', customerContent, trackingNumber)
            });
            
            // Send notification email to Admin
            const adminContent = `
                <h2>New Order Received</h2>
                <p>A new order has been placed on the store.</p>
                <p><strong>Customer:</strong> ${customer.firstName} ${customer.lastName}</p>
                <p><strong>Email:</strong> ${customer.email}</p>
                <p><strong>Total Amount:</strong> Rs. ${totalAmount.toLocaleString()}</p>
            `;
            
            const adminText = `New Order: ${trackingNumber} by ${customer.firstName} ${customer.lastName}. Total: Rs. ${totalAmount.toLocaleString()}.`;

            await transporter.sendMail({
                from: `"Cliffhanger System" <${process.env.EMAIL_USER}>`,
                to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
                subject: `New Order Alert: ${trackingNumber}`,
                text: adminText,
                html: generateEmailTemplate('New Order', 'A new order has been placed.', adminContent, trackingNumber)
            });
        } catch (emailErr) {
            console.error("Email sending failed:", emailErr);
            require('fs').writeFileSync('email-error.log', emailErr.toString() + '\n' + emailErr.stack);
            // We still return success for the order creation
        }

        res.status(201).json({ success: true, data: order });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

// Track order (Public)
exports.trackOrder = async (req, res) => {
    try {
        const { trackingId } = req.params;
        const order = await Order.findOne({ 
            $or: [{ trackingNumber: trackingId }, { _id: trackingId.length === 24 ? trackingId : null }]
        });

        if (!order) {
            return res.status(404).json({ success: false, error: 'Order not found' });
        }

        res.status(200).json({ success: true, data: order });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// Get all orders (Admin only)
exports.getOrders = async (req, res) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: orders.length, data: orders });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// Update order status (Admin only)
exports.updateOrderStatus = async (req, res) => {
    try {
        const transporter = createTransporter();
        const { status } = req.body;
        const order = await Order.findByIdAndUpdate(
            req.params.id, 
            { status }, 
            { new: true, runValidators: true }
        );

        if (!order) {
            return res.status(404).json({ success: false, error: 'Order not found' });
        }

        // Send status update email to Customer
        try {
            const customerContent = `
                <h2>Order Update</h2>
                <p>Hi ${order.customer.firstName},</p>
                <p>We are writing to let you know that the status of your order has been updated.</p>
                <p>Current Status: <strong style="color: #1B3022; text-transform: uppercase;">${status}</strong></p>
                <p>We'll keep you posted on any further updates.</p>
            `;
            
            const customerText = `Hi ${order.customer.firstName},\n\nYour order status has been updated to: ${status}.\n\nTrack your order with: ${order.trackingNumber}.\n\nBest regards,\nCliffhanger Jeans Team`;

            await transporter.sendMail({
                from: `"Cliffhanger Jeans" <${process.env.EMAIL_USER}>`,
                to: order.customer.email,
                subject: `Order Status Update - ${order.trackingNumber}`,
                text: customerText,
                html: generateEmailTemplate('Order Update', `Your order status is now ${status}.`, customerContent, order.trackingNumber)
            });
        } catch (emailErr) {
            console.error("Email sending failed on status update:", emailErr);
        }

        res.status(200).json({ success: true, data: order });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

// Delete order (Admin only)
exports.deleteOrder = async (req, res) => {
    try {
        const order = await Order.findByIdAndDelete(req.params.id);
        if (!order) {
            return res.status(404).json({ success: false, error: 'Order not found' });
        }
        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};
