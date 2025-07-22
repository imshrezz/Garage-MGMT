const express = require("express");
const router = express.Router();
const { authenticate } = require('../middleware/authMiddleware');
const {
  sendEmail,
  sendOffer,
  sendServiceReminder,
  getServiceHistory,
  sendBulkOffer,
  testAutomaticServiceReminder,
} = require("../controllers/mailController");

// Send regular email
router.post("/send", authenticate, sendEmail);

// Send special offer
router.post("/send-offer", authenticate, sendOffer);

// Send service reminder
router.post("/send-reminder", authenticate, sendServiceReminder);

// Send bulk offer
router.post("/send-bulk-offer", authenticate, sendBulkOffer);

// Get customer service history
router.get("/service-history", authenticate, getServiceHistory);

// Test automatic service reminder
router.post("/test-automatic-reminder", testAutomaticServiceReminder);

module.exports = router; 