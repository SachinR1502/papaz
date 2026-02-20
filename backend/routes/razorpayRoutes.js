const express = require('express');
const router = express.Router();
const {
    createWalletTopupOrder,
    verifyWalletTopup,
    createBillPaymentOrder,
    verifyBillPayment,
    createWholesaleOrderPayment,
    verifyWholesaleOrderPayment,
    checkRazorpayOrderStatus
} = require('../controllers/razorpayController');
const { protect } = require('../middleware/authMiddleware');

// Customer & Wallet
router.post('/wallet/create-order', protect, createWalletTopupOrder);
router.post('/wallet/verify-payment', protect, verifyWalletTopup);

// Job Bill Payments (Customer -> Technician)
router.post('/jobs/:id/bill/create-order', protect, createBillPaymentOrder);
router.post('/jobs/:id/bill/verify-payment', protect, verifyBillPayment);

// Wholesale Order Payments (Technician -> Supplier)
router.post('/store/orders/:id/pay', protect, createWholesaleOrderPayment);
router.post('/store/orders/:id/verify', protect, verifyWholesaleOrderPayment);

// Helper / Support Routes
router.get('/order/:orderId/status', protect, checkRazorpayOrderStatus);

// Webhook (No protect - verified by signature)
router.post('/webhook', require('../controllers/razorpayController').handleRazorpayWebhook);

module.exports = router;

