const express = require('express');
const router = express.Router();
const {
    getDashboard,
    getAllUsers,
    getPendingUsers,
    approveUser,
    rejectUser,
    getAllJobs,
    getJobDetails,
    cancelJob,
    getAllTransactions,
    getSettings,
    updateSettings,
    getReports,
    updateUser,
    suspendUser,
    getUserActivity,
    verifyDocument,
    getServiceZones,
    updateServiceZones
} = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// All admin routes require authentication and admin role
router.use(protect);
router.use(adminOnly);

// Dashboard & Stats
const { getMyDevices, removeDevice } = require('../controllers/deviceController');
router.get('/devices', getMyDevices);
router.delete('/devices/:id', removeDevice);
router.get('/dashboard', getDashboard);
router.get('/reports', getReports);

// User Management
const { getUserDevices } = require('../controllers/deviceController');
router.get('/users/:id/devices', getUserDevices);
router.get('/users', getAllUsers);
router.get('/users/pending', getPendingUsers);
router.post('/users/:id/approve', approveUser);
router.post('/users/:id/reject', rejectUser);
router.put('/users/:id', updateUser);
router.post('/users/:id/suspend', suspendUser);
router.get('/users/:id/activity', getUserActivity);
router.post('/users/:id/verify-doc', verifyDocument);

// Jobs Management
router.get('/jobs', getAllJobs);
router.get('/jobs/:id', getJobDetails);
router.post('/jobs/:id/cancel', cancelJob);

// Transactions
router.get('/transactions', getAllTransactions);

// Settings
router.get('/settings', getSettings);
router.put('/settings', updateSettings);
router.get('/service-zones', getServiceZones);
router.post('/service-zones', updateServiceZones);

module.exports = router;
