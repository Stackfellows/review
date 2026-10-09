const nodemailer = require('nodemailer');

const createTransporter = () => {
    return nodemailer.createTransport({
        service: 'gmail', // You can change this to 'smtp.hostinger.com' or whatever service you use
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
};

exports.sendWelcomeDiscountEmail = async (email) => {
    try {
        const transporter = createTransporter();
        const mailOptions = {
            from: `"Cliffhanger Jeans" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Welcome to the Family! Here is your 10% OFF',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
                    <h2 style="color: #047857; text-align: center; text-transform: uppercase; letter-spacing: 2px;">Welcome to Cliffhanger Jeans!</h2>
                    <p style="color: #334155; font-size: 16px;">Thank you for joining our exclusive family. As promised, here is your 10% discount code for your first adventure order:</p>
                    <div style="background-color: #0f172a; color: #10b981; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 4px; margin: 20px 0; border-radius: 8px;">
                        WELCOME10
                    </div>
                    <p style="color: #334155; font-size: 14px;">Use this code at checkout to claim your discount. Get ready to discover premium rugged denim designed for the next generation of explorers.</p>
                    <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 30px 0;" />
                    <p style="color: #94a3b8; font-size: 12px; text-align: center;">You are receiving this because you subscribed to our newsletter.</p>
                </div>
            `
        };
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error("Error sending welcome email:", error);
    }
};

exports.sendNewProductEmail = async (emails, product) => {
    try {
        if (!emails || emails.length === 0) return;
        const transporter = createTransporter();
        const mailOptions = {
            from: `"Cliffhanger Jeans" <${process.env.EMAIL_USER}>`,
            to: process.env.EMAIL_USER, // Send to self
            bcc: emails, // Send to all users hidden
            subject: `New Arrival! Discover the ${product.name}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
                    <h2 style="color: #047857; text-align: center; text-transform: uppercase; letter-spacing: 2px;">Fresh Drop!</h2>
                    <img src="${product.images && product.images.length > 0 ? product.images[0] : ''}" alt="${product.name}" style="width: 100%; border-radius: 8px; margin-bottom: 20px;" />
                    <h3 style="color: #0f172a; font-size: 20px; text-transform: uppercase;">${product.name}</h3>
                    <p style="color: #334155; font-size: 16px;">${product.description}</p>
                    <p style="color: #0f172a; font-size: 18px; font-weight: bold;">Only Rs. ${product.price}</p>
                    <a href="https://cliffhangerthejeans.com/product/${product._id}" style="display: block; width: 200px; margin: 20px auto; background-color: #047857; color: white; text-align: center; padding: 12px; text-decoration: none; border-radius: 6px; font-weight: bold; text-transform: uppercase;">Shop Now</a>
                </div>
            `
        };
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error("Error sending new product email:", error);
    }
};
