const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const connectDB = require('./config/db');
const { requestLogger } = require('./utils/logger');
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const membershipRoutes = require('./routes/membershipRoutes');
const chatRoutes = require('./routes/chatRoutes');
const reviewRoutes = require('./routes/reviewRoutes');

const errorHandler = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimiter');

const app = express();

// Security Headers
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: false,
}));

// Cross-Origin Resource Sharing
app.use(
  cors({
    origin: true, // Allow all requesting origins
    credentials: true,
  })
);

// Body Parsing, Request Logger & Rate Limiting
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(requestLogger);
app.use('/api', apiLimiter);

// Connect to MongoDB Database
connectDB();

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/membership', membershipRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api', reviewRoutes);

// Health Check Route
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    service: 'Cliffhanger The Jeans - Unified Backend API',
    port: process.env.PORT || 3400,
    timestamp: new Date().toISOString(),
  });
});

// Root Route
app.get('/', (req, res) => {
  res.send('Cliffhanger The Jeans - Unified API is running.');
});

// Centralized Error Handling Middleware
app.use(errorHandler);

// Server Listener
const PORT = process.env.PORT || 3400;
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`=================================`);
  console.log(`Cliffhanger Unified API Running`);
  console.log(`Port: ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`=================================`);
});

// Graceful Shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down server gracefully...');
  server.close(() => {
    console.log('Server process terminated.');
  });
});

module.exports = app;
