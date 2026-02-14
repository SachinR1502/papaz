// Health Routes
const express = require('express');
const router = express.Router();
const healthController = require('../controllers/helthController');

router.get('/health', healthController);

module.exports = router;
