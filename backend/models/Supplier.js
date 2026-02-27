const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    supplierId: { type: String, unique: true }, // SUP0001 format
    fullName: { type: String, required: true },
    storeName: { type: String, required: true },
    address: { type: String, required: true },
    addressLine1: { type: String },
    addressLine2: { type: String },
    city: { type: String, required: true },
    state: { type: String },
    zipCode: { type: String },
    email: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    alternatePhoneNumber: { type: String },
    businessCategories: [{ type: String }], // Two Wheeler, Three Wheeler, etc.
    otherCategory: { type: String },
    gstin: { type: String, required: true },
    udyamNumber: { type: String },
    panNumber: { type: String, required: true },
    aadharNumber: { type: String, required: true },

    documents: {
        gstCertificate: { type: String },
        udyamCertificate: { type: String },
        aadharCard: { type: String },
        panCard: { type: String },
        electricityBill: { type: String },
        cancelledCheque: { type: String }
    },

    verificationStatus: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    status: {
        type: String,
        enum: ['active', 'suspended', 'blocked'],
        default: 'active'
    },
    kycPercentage: { type: Number, default: 0 },

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
