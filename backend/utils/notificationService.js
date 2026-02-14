const Notification = require('../models/Notification');
const { sendSocketNotification } = require('./socketHelper');

/**
 * Creates a notification in DB and emits it via Socket
 */
const createNotification = async (req, data) => {
    try {
        const notification = await Notification.create(data);
        sendSocketNotification(req, data.recipient, notification);
        return notification;
    } catch (error) {
        console.error('Create Notification Error:', error);
        return null;
    }
};

module.exports = { createNotification };
