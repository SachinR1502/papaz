const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
    maintenanceMode: { type: Boolean, default: false },
    allowRegistrations: { type: Boolean, default: true },
    commissionRate: { type: Number, default: 10 },
    payoutSchedule: { type: String, default: 'Weekly' },
    currency: { type: String, default: 'INR' },
    minWithdrawal: { type: Number, default: 100 },
    maxWithdrawal: { type: Number, default: 50000 },
    serviceZones: [{
        name: String,
        active: { type: Boolean, default: true }
    }]
}, { timestamps: true });

module.exports = mongoose.model('Settings', settingsSchema);
