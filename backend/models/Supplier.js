const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    fullName: { type: String, required: true },
    storeName: { type: String, required: true },
    address: { type: String, required: true },
    addressLine1: { type: String },
    addressLine2: { type: String },
    city: { type: String, required: true },
    state: { type: String },
    zipCode: { type: String },
    email: { type: String },
    phoneNumber: { type: String },
    isApproved: { type: Boolean, default: false },
    rating: { type: Number, default: 0.0 },
    revenue: { type: Number, default: 0.0 },
    products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    walletBalance: { type: Number, default: 0.0 },
    notificationSettings: {
        push: { type: Boolean, default: true },
        email: { type: Boolean, default: true }
    },
    bankAccounts: [{
        accountHolderName: String,
        accountNumber: String,
        accountNumberFull: String,
        ifscCode: String,
        bankName: String,
        isDefault: { type: Boolean, default: false },
        addedAt: { type: Date, default: Date.now }
    }],
    locationName: { type: String },
    location: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], default: [0, 0] } // [lng, lat]
    }
}, { timestamps: true });

supplierSchema.index({ "location": "2dsphere" });

module.exports = mongoose.model('Supplier', supplierSchema);
