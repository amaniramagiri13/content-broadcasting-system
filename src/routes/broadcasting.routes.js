const express = require('express');
const router = express.Router();
const broadcastingController = require('../controllers/broadcasting.controller');
const rateLimit = require('express-rate-limit');

const broadcastLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests. Please slow down.',
  },
});

router.get('/live/:teacherId', broadcastLimiter, broadcastingController.getLiveContent);

module.exports = router;
