const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '.env') });

const { connectDB } = require('./config/db');
const apiRoutes = require('./routes');
const { notFound } = require('./middleware/notFoundMiddleware');
const { errorHandler } = require('./middleware/errorMiddleware');
const { initReminderScheduler } = require('./services/reminderService');

// Initialize Express App
const app = express();

// Enable proxy trust for reverse proxies (Render, Vercel, Heroku, Cloudflare)
app.set('trust proxy', 1);

// Connect to MongoDB
connectDB();

// Security HTTP headers
app.use(helmet());

// CORS Configuration - dynamically parse allowed origins
const configuredOrigins = (process.env.CLIENT_URL || '')
  .split(',')
  .map((url) => url.trim().replace(/\/$/, ''))
  .filter(Boolean);

const defaultDevOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:5174',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174'
];

const allowedOrigins = Array.from(new Set([...configuredOrigins, ...defaultDevOrigins]));

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, server-to-server, Postman)
      if (!origin) return callback(null, true);
      const cleanOrigin = origin.replace(/\/$/, '');
      if (allowedOrigins.includes(cleanOrigin) || process.env.NODE_ENV !== 'production') {
        return callback(null, true);
      }
      return callback(new Error(`Blocked by CORS policy: Origin ${origin} not permitted`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

// Body Parsing Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// HTTP Request Logger
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// API Routes Namespace
app.use('/api', apiRoutes);

// Root Index Route
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'CareerPilot AI Backend Server is running.',
    healthCheck: '/api/health'
  });
});

// 404 Catch-all Handler
app.use(notFound);

// Centralized Error Handling Middleware
app.use(errorHandler);

// Server Listening Configuration (bind to 0.0.0.0 for cloud hosting containers)
const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0';

const server = app.listen(PORT, HOST, () => {
  console.log(`🚀 CareerPilot Backend running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  console.log(`🔗 Health Check URL: http://localhost:${PORT}/api/health`);
  
  // Initialize Background Reminders Scheduler (Module 14)
  initReminderScheduler(60);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`❌ Unhandled Rejection: ${err.message}`);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error(`❌ Uncaught Exception: ${err.message}`);
});

module.exports = { app, server };
