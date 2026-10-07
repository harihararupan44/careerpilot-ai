const express = require('express');
const router = express.Router();
const {
  getGuidancePeople,
  getGuidanceProfile,
  sendGuidanceRequest,
  getSentGuidanceRequests,
  getReceivedGuidanceRequests,
  getGuidanceRequestById,
  acceptGuidanceRequest,
  rejectGuidanceRequest,
  cancelGuidanceRequest,
  completeGuidanceRequest
} = require('../controllers/guidanceController');
const { protect } = require('../middleware/authMiddleware');

// People discovery & profile
router.get('/people', protect, getGuidancePeople);
router.get('/people/:id', protect, getGuidanceProfile);

// Send guidance request
router.post('/requests', protect, sendGuidanceRequest);

// Specific request listing routes (Must be registered BEFORE /requests/:id)
router.get('/requests/sent', protect, getSentGuidanceRequests);
router.get('/requests/received', protect, getReceivedGuidanceRequests);
router.get('/requests/:id', protect, getGuidanceRequestById);

// Request status transitions
router.patch('/requests/:id/accept', protect, acceptGuidanceRequest);
router.patch('/requests/:id/reject', protect, rejectGuidanceRequest);
router.delete('/requests/:id/cancel', protect, cancelGuidanceRequest);
router.patch('/requests/:id/complete', protect, completeGuidanceRequest);

module.exports = router;
