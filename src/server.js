const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const connectDB = require('./config/db');
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
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:3400',
  'https://cliffhangerthejeans.com',
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
        callback(null, true);
      } else {
        callback(null, true); // Allow for mobile browser QR scans
      }
    },
    credentials: true,
  })
);

// Body Parsing & General Rate Limiting
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use('/api', apiLimiter);

// Connect to MongoDB Database
connectDB();

// API Routes
app.use('/api', reviewRoutes);

// Health Check Route
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    service: 'Cliffhanger The Jeans - Review API',
    port: process.env.PORT || 3400,
    timestamp: new Date().toISOString(),
  });
});

// Root Route
app.get('/', (req, res) => {
  res.send('Cliffhanger The Jeans - Review API is running.');
});

// Centralized Error Handling Middleware
app.use(errorHandler);

// Server Listener
const PORT = process.env.PORT || 3400;
const server = app.listen(PORT, () => {
  console.log(`=================================`);
  console.log(`Cliffhanger Review API Running`);
  console.log(`Port: ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`=================================`);
});

// Graceful Shutdown for Hostinger Passenger
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down server gracefully...');
  server.close(() => {
    console.log('Server process terminated.');
  });
});

module.exports = app;
