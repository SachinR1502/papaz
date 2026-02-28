const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    phoneNumber: { type: String, required: true, unique: true },
    password: { type: String, select: false },
    role: { type: String, enum: ['customer', 'technician', 'supplier', 'admin'], default: 'customer' },
    otp: String,
    otpExpires: Date,
    profileCompleted: { type: Boolean, default: false },
    isRegistered: { type: Boolean, default: false },
    status: { type: String, enum: ['active', 'suspended', 'pending'], default: 'active' }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
