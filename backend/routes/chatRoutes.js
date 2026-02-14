const express = require('express');
const router = express.Router();
const { getMessages, sendMessage, markAsRead } = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');

router.get('/:conversationId', protect, getMessages);
router.post('/', protect, sendMessage);
router.put('/:conversationId/read', protect, markAsRead);

module.exports = router;
