const nodemailer = require('nodemailer');
require('dotenv').config();

async function testEmail() {
    try {
        let transporter = nodemailer.createTransport({
            service: 'gmail', // Use gmail as service
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        let info = await transporter.sendMail({
            from: `"Cliffhanger Jeans Test" <${process.env.EMAIL_USER}>`,
            to: process.env.EMAIL_USER, // Send to self for testing
            subject: "Test Email from Backend",
            text: "Hello, this is a test email to verify credentials.",
            html: "<b>Hello, this is a test email to verify credentials.</b>",
        });

        console.log("Message sent: %s", info.messageId);
        console.log("Email test successful!");
    } catch (error) {
        console.error("Error sending email:", error);
    }
}

testEmail();
