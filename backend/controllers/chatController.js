const Message = require('../models/Message');
const mongoose = require('mongoose');

// @desc    Get messages for a conversation
// @route   GET /api/chat/:conversationId
const getMessages = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const messages = await Message.find({ conversationId })
            .sort({ createdAt: 1 }) // Oldest first for chat history
            .populate('sender', 'name profileImage'); // Optional: populate sender info

        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Send a message
// @route   POST /api/chat
const sendMessage = async (req, res) => {
    try {
        console.log("ChatController: sendMessage request body:", req.body);
        const { conversationId, content, messageType, targetId, senderRole } = req.body;

        const messageData = {
            conversationId,
            sender: req.user._id,
            senderRole: senderRole || req.user.role,
            content,
            messageType: messageType || 'text',
        };

        if (targetId && mongoose.Types.ObjectId.isValid(targetId)) {
            messageData.targetId = targetId;
        }

        const newMessage = new Message(messageData);

        const savedMessage = await newMessage.save();
        await savedMessage.populate('sender', 'name profileImage');

        res.status(201).json(savedMessage);
    } catch (error) {
        console.error("SendMessage Error:", error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const markAsRead = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const userId = req.user._id;

        await Message.updateMany(
            {
                conversationId,
                sender: { $ne: userId },
                status: { $ne: 'read' }
            },
            {
                status: 'read',
                readAt: new Date()
            }
        );

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getMessages,
    sendMessage,
    markAsRead
};
