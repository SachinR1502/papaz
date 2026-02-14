const mongoose = require('mongoose');

const deviceSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    type: {
        type: String,
        default: 'Unknown'
    },
    deviceId: {
        type: String,
        required: true
    },
    ip: {
        type: String
    },
    location: {
        type: String
    },
    lastActive: {
        type: Date,
        default: Date.now
    },
    isCurrent: {
        type: Boolean,
        default: false
    },
    fcmToken: {
        type: String
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Device', deviceSchema);
