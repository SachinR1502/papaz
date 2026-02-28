const express = require('express');
const router = express.Router();
const { sendOtp, verifyOtp, loginWithPassword, changePassword, checkOtp, resetPassword, updateProfile, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const { registerDevice } = require('../controllers/deviceController');

router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
router.post('/login-password', loginWithPassword);
router.post('/change-password', protect, changePassword);
router.post('/check-otp', checkOtp);
router.post('/reset-password', resetPassword);
router.post('/profile', protect, updateProfile);
router.post('/device', protect, registerDevice); // Register Device Info
router.get('/me', protect, getMe);

module.exports = router;
