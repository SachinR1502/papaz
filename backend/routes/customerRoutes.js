const express = require('express');
const router = express.Router();
const {
    getDashboard,
    addVehicle,
    getVehicles,
    updateProfile,
    getVehicleHistory,
    createJob,
    getJobHistory,
    getJob,
    respondToQuote,
    respondToBill,
    requestPart,
    getGarages,
    getSuppliers,
    getAddresses,
    addAddress,
    updateAddress,
    removeAddress,
    getProducts,
    createOrder,
    getOrders,
    getOrder,
    getWishlist,
    addToWishlist,
    removeFromWishlist,
    getWalletHistory,
    topupWallet,
    addCard,
    removeCard,
    rateJob,
    cancelJob,
    createOrderPayment,
    verifyOrderPayment,
    payStoreOrderWithWallet,
    respondToOrderQuotation
} = require('../controllers/customerController');
const { protect } = require('../middleware/authMiddleware');
const {
    createWalletTopupOrder,
    verifyWalletTopup,
    createBillPaymentOrder,
    verifyBillPayment
} = require('../controllers/razorpayController');
const { getNotifications, markNotificationRead, clearAllNotifications } = require('../controllers/customerController');
const { getMyDevices, removeDevice } = require('../controllers/deviceController');

router.get('/notifications', protect, getNotifications);
router.put('/notifications/:id/read', protect, markNotificationRead);
router.delete('/notifications', protect, clearAllNotifications);

router.get('/devices', protect, getMyDevices);
router.delete('/devices/:id', protect, removeDevice);
router.get('/dashboard', protect, getDashboard);
router.put('/profile', protect, updateProfile);
router.post('/vehicles', protect, addVehicle);
router.get('/vehicles', protect, getVehicles);
router.get('/vehicles/:id/history', protect, getVehicleHistory);
router.get('/garages', protect, getGarages);
router.get('/suppliers', protect, getSuppliers);
router.get('/products', getProducts);
router.post('/orders', protect, createOrder);
router.get('/orders', protect, getOrders);
router.get('/orders/:id', protect, getOrder);
router.post('/orders/:id/quotation/respond', protect, respondToOrderQuotation);
router.get('/wishlist', protect, getWishlist);
router.post('/wishlist/:id', protect, addToWishlist);
router.delete('/wishlist/:id', protect, removeFromWishlist);
router.post('/jobs', protect, createJob);
router.get('/jobs/history', protect, getJobHistory);
router.get('/jobs/:id', protect, getJob);
router.post('/jobs/:id/quote/respond', protect, respondToQuote);
router.post('/jobs/:id/bill/respond', protect, respondToBill);
router.post('/parts/request', protect, requestPart);
router.get('/addresses', protect, getAddresses);
router.post('/addresses', protect, addAddress);
router.put('/addresses/:id', protect, updateAddress);
router.delete('/addresses/:id', protect, removeAddress);

// Job Actions
router.post('/jobs/:id/rate', protect, rateJob);
router.post('/jobs/:id/cancel', protect, cancelJob);

// Wallet & Payments
router.get('/wallet/history', protect, getWalletHistory);
router.post('/wallet/topup', protect, topupWallet);
router.post('/payments/cards', protect, addCard);
router.delete('/payments/cards/:id', protect, removeCard);

// Razorpay Payment Routes
router.post('/wallet/create-order', protect, createWalletTopupOrder);
router.post('/wallet/verify-payment', protect, verifyWalletTopup);
router.post('/jobs/:id/bill/create-order', protect, createBillPaymentOrder);
router.post('/jobs/:id/bill/verify-payment', protect, verifyBillPayment);
router.post('/orders/:id/pay', protect, createOrderPayment);
router.post('/orders/:id/verify', protect, verifyOrderPayment);
router.post('/orders/:id/wallet-pay', protect, payStoreOrderWithWallet);

module.exports = router;
