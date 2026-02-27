const mongoose = require('mongoose');

const technicianSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    registrationType: { type: String, enum: ['individual', 'garage'], default: 'individual' },
    fullName: { type: String, required: true },
    garageName: { type: String },
    avatar: { type: String },
    address: { type: String, required: true },
    addressLine1: { type: String },
    addressLine2: { type: String },
    city: { type: String },
    state: { type: String },
    zipCode: { type: String },
    dob: { type: String },
    aadharNo: { type: String },
    panNo: { type: String },
    udyamNo: { type: String },
    profession: { type: String },
    workType: { type: String },
    serviceRadius: { type: String, default: '10' },
    vehicleTypes: [{
        type: String,
        enum: ['Car', 'Bike', 'Scooter', 'Truck', 'Bus', 'Tractor', 'Van', 'Rickshaw', 'Earthmover', 'EV Vehicle', 'Other']
    }],
    technicalSkills: [String],
    softSkills: [String],
    isApproved: { type: Boolean, default: false },
    isOnline: { type: Boolean, default: true },
    walletBalance: { type: Number, default: 0 },
    totalEarnings: { type: Number, default: 0 },
    rating: { type: Number, default: 5.0 },
    bankAccounts: [{
        accountHolderName: String,
        accountNumber: String,
        ifscCode: String,
        bankName: String,
        isVerified: { type: Boolean, default: false },
        isDefault: { type: Boolean, default: false },
        addedAt: { type: Date, default: Date.now }
    }],
    documents: {
        idProof: { type: String },
        garagePhoto: { type: String },
        license: { type: String }
    },
    locationName: { type: String },
    location: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], default: [0, 0] } // [lng, lat]
    },
    notificationSettings: {
        push: { type: Boolean, default: true },
        email: { type: Boolean, default: true },
        sms: { type: Boolean, default: false },
        newJobs: { type: Boolean, default: true },
        serviceUpdates: { type: Boolean, default: true }
    },
    inventory: [{
        name: { type: String, required: true },
        sku: { type: String },
        category: { type: String },
        quantity: { type: Number, default: 0 },
        price: { type: Number, default: 0 },
        description: { type: String },
        images: [{ type: String }],
        status: { type: String, enum: ['active', 'inactive'], default: 'active' },
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now }
    }]
}, { timestamps: true });

technicianSchema.index({ "location": "2dsphere" });
technicianSchema.index({ isApproved: 1 });

module.exports = mongoose.model('Technician', technicianSchema);
