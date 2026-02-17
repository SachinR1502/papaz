const express = require('express');
const router = express.Router();
const {
    getProfile,
    updateProfile,
    getJobs,
    acceptJob,
    updateJobStatus,
    getInventory,
    getJob,
    sendQuote,
    sendBill,
    requestParts,
    addRepairDetails,
    getProducts,
    requestProduct,
    addPart,
    requestCustomOrder,
    getVehicleHistory,
    placeWholesaleOrder,
    getWholesaleOrders,
    payWholesaleOrderWithWallet,
    payWholesaleOrderWithCash,
    cancelJob,
    updateRequirementStatus,
    respondToPartRequest
} = require('../controllers/technicianController');
const { protect } = require('../middleware/authMiddleware');
const {
    getTechnicianWallet,
    requestWithdrawal,
    getWithdrawalHistory,
    getEarningsSummary,
    addBankAccount,
    getBankAccounts
} = require('../controllers/technicianWalletController');
const { getNotifications, markNotificationRead, clearAllNotifications } = require('../controllers/technicianController');
const { getMyDevices, removeDevice } = require('../controllers/deviceController');

router.get('/notifications', protect, getNotifications);
router.put('/notifications/:id/read', protect, markNotificationRead);
router.delete('/notifications', protect, clearAllNotifications);

router.get('/devices', protect, getMyDevices);
router.delete('/devices/:id', protect, removeDevice);

router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.get('/jobs', protect, getJobs);
router.get('/jobs/:id', protect, getJob);
router.post('/jobs/:id/accept', protect, acceptJob);
router.post('/jobs/:id/cancel', protect, cancelJob);
router.put('/jobs/:id/status', protect, updateJobStatus);
router.post('/jobs/:id/quote', protect, sendQuote);
router.post('/jobs/:id/bill', protect, sendBill);
router.post('/jobs/:id/parts-request', protect, requestParts);
router.put('/jobs/:id/details', protect, addRepairDetails);
router.get('/inventory', protect, getInventory);
router.post('/inventory', protect, addPart);
router.get('/products', protect, getProducts);
router.post('/store/request', protect, requestProduct);
router.post('/store/order', protect, placeWholesaleOrder);
router.post('/store/custom-order', protect, requestCustomOrder);
router.get('/vehicle-history/:vehicleId', protect, getVehicleHistory);
router.get('/store/orders', protect, getWholesaleOrders);
router.post('/store/orders/:id/wallet-pay', protect, payWholesaleOrderWithWallet);
router.post('/store/orders/:id/cash-pay', protect, payWholesaleOrderWithCash);
router.put('/jobs/:id/requirements/:reqId', protect, updateRequirementStatus);
router.post('/store/request/:id/respond', protect, respondToPartRequest);

// Wallet & Withdrawal Routes
router.get('/wallet', protect, getTechnicianWallet);
router.get('/wallet/earnings', protect, getEarningsSummary);
router.post('/wallet/withdraw', protect, requestWithdrawal);
router.get('/wallet/withdrawals', protect, getWithdrawalHistory);
router.post('/wallet/bank-account', protect, addBankAccount);
router.get('/wallet/bank-accounts', protect, getBankAccounts);

// Wholesale Order Payment Routes
const {
    createWholesaleOrderPayment,
    verifyWholesaleOrderPayment
} = require('../controllers/razorpayController');

router.post('/store/orders/:id/pay', protect, createWholesaleOrderPayment);
router.post('/store/orders/:id/verify', protect, verifyWholesaleOrderPayment);

module.exports = router;
