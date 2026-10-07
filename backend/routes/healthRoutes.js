const express = require('express');
const router = express.Router();
const { getDBStatus } = require('../config/db');

/**
 * @route   GET /api/health
 * @desc    API Health Check & Database Connection Status
 * @access  Public
 */
router.get('/', (req, res) => {
  const dbStatus = getDBStatus();

  res.status(200).json({
    success: true,
    message: 'CareerPilot API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
    database: {
      status: dbStatus.status,
      connected: dbStatus.isConnected,
      host: dbStatus.host
    }
  });
});

module.exports = router;
