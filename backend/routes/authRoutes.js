const express = require('express');
const router = express.Router();
const { sendOtp, verifyOtp, updateProfile, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const { registerDevice } = require('../controllers/deviceController');

router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
router.post('/profile', protect, updateProfile);
router.post('/device', protect, registerDevice); // Register Device Info
router.get('/me', protect, getMe);

module.exports = router;
