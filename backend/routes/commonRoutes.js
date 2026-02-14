const express = require('express');
const router = express.Router();
const { getPublicSettings } = require('../controllers/commonController');
const { protect } = require('../middleware/authMiddleware');

// Allow authenticated users to fetch settings
// We use 'protect' to ensure only logged-in users access this, 
// ensuring platform data isn't completely public to visitors.
router.get('/settings', protect, getPublicSettings);

module.exports = router;
