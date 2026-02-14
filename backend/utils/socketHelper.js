/**
 * Utility to send real-time notifications via Socket.io
 */
const sendSocketNotification = (req, recipientId, notification) => {
    const io = req.app.get('io');
    if (io && recipientId) {
        // Recipient joins a room named by their userId strictly in server.js
        io.to(recipientId.toString()).emit('new_notification', notification);
    }
};

const emitJobUpdate = (req, recipientId, jobData) => {
    const io = req.app.get('io');
    if (io && recipientId) {
        io.to(recipientId.toString()).emit('job_update', jobData);
    }
};

const emitOrderUpdate = (req, recipientId, orderData) => {
    const io = req.app.get('io');
    if (io && recipientId) {
        io.to(recipientId.toString()).emit('order_update', orderData);
    }
};

module.exports = { sendSocketNotification, emitJobUpdate, emitOrderUpdate };
