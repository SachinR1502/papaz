const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    fullName: { type: String, required: true },
    address: { type: String, required: true },
    addressLine1: { type: String },
    addressLine2: { type: String },
    city: { type: String, required: true },
    state: { type: String },
    zipCode: { type: String },
    email: { type: String },
    phoneNumber: { type: String },
    avatar: { type: String },
    savedAddresses: [{
        label: { type: String },
        address: { type: String }, // General address string
        addressLine1: { type: String },
        addressLine2: { type: String },
        city: { type: String },
        state: { type: String },
        country: { type: String },
        district: { type: String },
        taluka: { type: String },
        division: { type: String },
        region: { type: String },
        zipCode: { type: String },
        phone: { type: String },
        icon: { type: String, default: 'location' },
        location: {
            type: { type: String, enum: ['Point'], default: 'Point' },
            coordinates: { type: [Number], default: [0, 0] } // [lng, lat]
        },
        isDefault: { type: Boolean, default: false }
    }],
    locationName: { type: String },
    location: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], default: [0, 0] } // [lng, lat]
    },
    walletBalance: { type: Number, default: 0.00 },
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    savedCards: [{
        type: { type: String }, // 'visa', 'mastercard', etc.
        last4: { type: String },
        expiry: { type: String },
        brand: { type: String }
    }],
    notificationSettings: {
        push: { type: Boolean, default: true },
        email: { type: Boolean, default: true },
        sms: { type: Boolean, default: false },
        offers: { type: Boolean, default: true },
        updates: { type: Boolean, default: true }
    }
}, { timestamps: true });

customerSchema.index({ "location": "2dsphere" });
customerSchema.index({ "savedAddresses.location": "2dsphere" });

module.exports = mongoose.model('Customer', customerSchema);
