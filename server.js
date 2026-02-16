// ============================================
// BACKEND SERVER - server.js
// ============================================
// Install required packages:
// npm install express cors nodemailer dotenv body-parser

const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// In-memory storage (replace with database in production)
const bookings = [];

// Configure email transporter
const transporter = nodemailer.createTransport({
    service: 'gmail', // You can use 'gmail', 'outlook', 'yahoo', etc.
    auth: {
        user: process.env.EMAIL_USER, // Your email
        pass: process.env.EMAIL_PASSWORD // Your email password or app password
    }
});

// Alternative configuration for custom SMTP
/*
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});
*/

// Email templates
const getCustomerEmailTemplate = (bookingData) => {
    const packageNames = {
        'starter': 'Starter Plan - $99/month',
        'growth': 'Growth Plan - $199/month',
        'premium': 'Premium Plan - $299/month'
    };

    return `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #8DA399; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background-color: #F9F7F2; padding: 30px; border-radius: 0 0 10px 10px; }
        .booking-details { background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .detail-row { padding: 10px 0; border-bottom: 1px solid #e0e0e0; }
        .detail-label { font-weight: bold; color: #8DA399; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        .button { display: inline-block; background-color: #8DA399; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🌿 Booking Confirmation</h1>
            <p>Thank you for choosing NutriLife!</p>
        </div>
        <div class="content">
            <h2>Hello ${bookingData.name}!</h2>
            <p>We're excited to start your wellness journey with you. Your consultation has been successfully booked.</p>
            
            <div class="booking-details">
                <h3 style="color: #8DA399; margin-top: 0;">Your Booking Details:</h3>
                <div class="detail-row">
                    <span class="detail-label">Booking ID:</span> ${bookingData.bookingId}
                </div>
                <div class="detail-row">
                    <span class="detail-label">Name:</span> ${bookingData.name}
                </div>
                <div class="detail-row">
                    <span class="detail-label">Email:</span> ${bookingData.email}
                </div>
                <div class="detail-row">
                    <span class="detail-label">Phone:</span> ${bookingData.phone}
                </div>
                <div class="detail-row">
                    <span class="detail-label">Preferred Date:</span> ${new Date(bookingData.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
                <div class="detail-row">
                    <span class="detail-label">Selected Package:</span> ${packageNames[bookingData.package]}
                </div>
                ${bookingData.message ? `<div class="detail-row"><span class="detail-label">Your Message:</span> ${bookingData.message}</div>` : ''}
            </div>

            <h3 style="color: #8DA399;">What's Next?</h3>
            <ul>
                <li>We'll contact you within 24 hours to confirm your appointment time</li>
                <li>Please prepare any health records or dietary logs you'd like to discuss</li>
                <li>Feel free to write down any questions you have for your consultation</li>
            </ul>

            <p style="text-align: center;">
                <a href="mailto:info@nutrilife.com" class="button">Reply to this Email</a>
            </p>

            <p>If you need to reschedule or have any questions, please don't hesitate to contact us at <strong>info@nutrilife.com</strong> or call us at <strong>+1 (555) 123-4567</strong>.</p>
            
            <p>Looking forward to working with you!</p>
            <p><strong>The NutriLife Team</strong></p>
        </div>
        <div class="footer">
            <p>© 2026 NutriLife. All rights reserved.</p>
            <p>123 Wellness St, Health City | info@nutrilife.com | +1 (555) 123-4567</p>
        </div>
    </div>
</body>
</html>
    `;
};

const getAdminEmailTemplate = (bookingData) => {
    const packageNames = {
        'starter': 'Starter Plan - $99/month',
        'growth': 'Growth Plan - $199/month',
        'premium': 'Premium Plan - $299/month'
    };

    return `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f4; }
        .header { background-color: #333333; color: white; padding: 20px; text-align: center; }
        .content { background-color: white; padding: 30px; }
        .booking-details { background-color: #F9F7F2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #8DA399; }
        .detail-row { padding: 8px 0; }
        .detail-label { font-weight: bold; color: #8DA399; display: inline-block; width: 150px; }
        .priority { background-color: #8DA399; color: white; padding: 5px 15px; border-radius: 20px; font-size: 12px; display: inline-block; margin: 10px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>🔔 New Booking Received</h2>
        </div>
        <div class="content">
            <span class="priority">ACTION REQUIRED</span>
            <p>A new consultation booking has been received and requires your attention.</p>
            
            <div class="booking-details">
                <h3 style="color: #8DA399; margin-top: 0;">Booking Information:</h3>
                <div class="detail-row">
                    <span class="detail-label">Booking ID:</span> ${bookingData.bookingId}
                </div>
                <div class="detail-row">
                    <span class="detail-label">Timestamp:</span> ${new Date(bookingData.timestamp).toLocaleString()}
                </div>
                <div class="detail-row">
                    <span class="detail-label">Client Name:</span> ${bookingData.name}
                </div>
                <div class="detail-row">
                    <span class="detail-label">Email:</span> <a href="mailto:${bookingData.email}">${bookingData.email}</a>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Phone:</span> <a href="tel:${bookingData.phone}">${bookingData.phone}</a>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Preferred Date:</span> ${new Date(bookingData.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
                <div class="detail-row">
                    <span class="detail-label">Package:</span> ${packageNames[bookingData.package]}
                </div>
                ${bookingData.message ? `<div class="detail-row"><span class="detail-label">Message:</span><br/><div style="margin-top: 10px; padding: 15px; background-color: white; border-radius: 5px;">${bookingData.message}</div></div>` : ''}
            </div>

            <h4 style="color: #333;">Next Steps:</h4>
            <ol>
                <li>Review the booking details</li>
                <li>Contact the client within 24 hours to confirm the appointment time</li>
                <li>Add the appointment to your calendar</li>
                <li>Prepare client intake forms if needed</li>
            </ol>

            <p style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #8DA399;">
                <strong>Quick Actions:</strong><br/>
                Email: <a href="mailto:${bookingData.email}">${bookingData.email}</a><br/>
                Call: <a href="tel:${bookingData.phone}">${bookingData.phone}</a>
            </p>
        </div>
    </div>
</body>
</html>
    `;
};

// API Routes

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'Server is running', timestamp: new Date() });
});

// Create new booking
app.post('/api/bookings', async (req, res) => {
    try {
        const { name, email, phone, date, package, message } = req.body;

        // Validate required fields
        if (!name || !email || !phone || !date || !package) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields'
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid email format'
            });
        }

        // Generate unique booking ID
        const bookingId = 'BOOK' + Date.now() + Math.random().toString(36).substr(2, 5).toUpperCase();

        // Create booking object
        const booking = {
            bookingId,
            name,
            email,
            phone,
            date,
            package,
            message: message || '',
            timestamp: new Date(),
            status: 'pending'
        };

        // Save booking (in production, save to database)
        bookings.push(booking);

        // Send confirmation email to customer
        const customerMailOptions = {
            from: `"NutriLife" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: '✅ Booking Confirmation - NutriLife Consultation',
            html: getCustomerEmailTemplate(booking)
        };

        // Send notification email to admin
        const adminMailOptions = {
            from: `"NutriLife Bookings" <${process.env.EMAIL_USER}>`,
            to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
            subject: `🔔 New Booking: ${name} - ${bookingId}`,
            html: getAdminEmailTemplate(booking)
        };

        // Send both emails
        await Promise.all([
            transporter.sendMail(customerMailOptions),
            transporter.sendMail(adminMailOptions)
        ]);

        console.log(`✅ Booking created: ${bookingId}`);
        console.log(`📧 Confirmation email sent to: ${email}`);
        console.log(`📧 Admin notification sent`);

        res.status(201).json({
            success: true,
            message: 'Booking created successfully',
            bookingId: bookingId,
            data: booking
        });

    } catch (error) {
        console.error('Error creating booking:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create booking. Please try again.'
        });
    }
});

// Get all bookings (admin endpoint)
app.get('/api/bookings', (req, res) => {
    res.json({
        success: true,
        count: bookings.length,
        bookings: bookings
    });
});

// Get specific booking by ID
app.get('/api/bookings/:bookingId', (req, res) => {
    const booking = bookings.find(b => b.bookingId === req.params.bookingId);
    
    if (!booking) {
        return res.status(404).json({
            success: false,
            error: 'Booking not found'
        });
    }

    res.json({
        success: true,
        booking: booking
    });
});

// Update booking status
app.patch('/api/bookings/:bookingId', (req, res) => {
    const booking = bookings.find(b => b.bookingId === req.params.bookingId);
    
    if (!booking) {
        return res.status(404).json({
            success: false,
            error: 'Booking not found'
        });
    }

    const { status } = req.body;
    if (status) {
        booking.status = status;
    }

    res.json({
        success: true,
        message: 'Booking updated successfully',
        booking: booking
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`📧 Email service configured`);
    console.log(`🔗 API endpoint: http://localhost:${PORT}/api/bookings`);
    console.log('EMAIL_USER:', process.env.EMAIL_USER);
    console.log('EMAIL_PASSWORD set:', !!process.env.EMAIL_PASSWORD);
});

// ============================================
// CONFIGURATION FILE - .env
// ============================================
/*
Create a .env file in your project root with these variables:

PORT=3000
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
ADMIN_EMAIL=admin@nutrilife.com

# For Gmail:
# 1. Go to Google Account settings
# 2. Enable 2-Step Verification
# 3. Generate App Password
# 4. Use that password in EMAIL_PASSWORD

# For custom SMTP:
SMTP_HOST=smtp.yourprovider.com
SMTP_PORT=587
*/

// ============================================
// PACKAGE.JSON
// ============================================
/*
{
  "name": "nutrilife-backend",
  "version": "1.0.0",
  "description": "Backend API for NutriLife booking system",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "nodemailer": "^6.9.7",
    "dotenv": "^16.3.1",
    "body-parser": "^1.20.2"
  },
  "devDependencies": {
    "nodemon": "^3.0.2"
  }
}
*/

// ============================================
// DATABASE INTEGRATION (Optional - MongoDB Example)
// ============================================
/*
const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// Define Booking Schema
const bookingSchema = new mongoose.Schema({
    bookingId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    date: { type: Date, required: true },
    package: { type: String, required: true },
    message: { type: String },
    status: { type: String, default: 'pending' },
    timestamp: { type: Date, default: Date.now }
});

const Booking = mongoose.model('Booking', bookingSchema);

// Replace in-memory storage with database operations:
// const booking = new Booking({ ... });
// await booking.save();
*/