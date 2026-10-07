const express = require('express');
const router = express.Router();
const {
  getPeople,
  getPublicProfile,
  getConnectionStatus,
  sendConnectionRequest,
  acceptConnectionRequest,
  rejectConnectionRequest,
  cancelConnectionRequest,
  removeConnection,
  getConnections,
  getPendingRequests
} = require('../controllers/communityController');
const { protect } = require('../middleware/authMiddleware');

// All community & people routes require authentication
router.use(protect);

// Specific sub-resource routes registered first to prevent shadowing by /:id
router.get('/requests', getPendingRequests);
router.patch('/requests/:id/accept', acceptConnectionRequest);
router.patch('/requests/:id/reject', rejectConnectionRequest);
router.delete('/requests/:id/cancel', cancelConnectionRequest);

router.get('/connections', getConnections);
router.delete('/connections/:id', removeConnection);

// Explore people collection root
router.get('/', getPeople);

// Specific user actions & public profile by :id
router.get('/:id/connection-status', getConnectionStatus);
router.post('/:id/connect', sendConnectionRequest);
router.get('/:id', getPublicProfile);

module.exports = router;
