const express = require('express');
const router = express.Router();
const {
    getDashboard,
    updateProfile,
    getInventory,
    addProduct,
    updateProduct,
    deleteProduct,
    getOrders,
    updateOrderStatus,
    getWholesaleOrders,
    sendQuotation
} = require('../controllers/supplierController');
const { protect } = require('../middleware/authMiddleware');
const { getNotifications, markNotificationRead, clearAllNotifications } = require('../controllers/supplierController');
const { getMyDevices, removeDevice } = require('../controllers/deviceController');

router.get('/notifications', protect, getNotifications);
router.put('/notifications/:id/read', protect, markNotificationRead);
router.delete('/notifications', protect, clearAllNotifications);

router.get('/devices', protect, getMyDevices);
router.delete('/devices/:id', protect, removeDevice);

router.get('/dashboard', protect, getDashboard);
router.put('/profile', protect, updateProfile);

router.get('/inventory', protect, getInventory);
router.post('/inventory', protect, addProduct);
router.put('/inventory/:id', protect, updateProduct);
router.delete('/inventory/:id', protect, deleteProduct);

router.get('/orders', protect, getOrders);
router.get('/wholesale/orders', protect, getWholesaleOrders);
router.put('/orders/:id/status', protect, updateOrderStatus);
router.post('/orders/:id/quotation', protect, sendQuotation);

// Wallet & Payments
const {
    getSupplierWallet,
    requestWithdrawal,
    getEarningsSummary,
    addBankAccount,
    getBankAccounts
} = require('../controllers/supplierWalletController');

router.get('/wallet', protect, getSupplierWallet);
router.get('/wallet/earnings', protect, getEarningsSummary);
router.post('/wallet/withdraw', protect, requestWithdrawal);
router.post('/wallet/bank-account', protect, addBankAccount);
router.get('/wallet/bank-accounts', protect, getBankAccounts);

module.exports = router;
