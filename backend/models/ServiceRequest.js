const mongoose = require('mongoose');

const serviceRequestSchema = new mongoose.Schema({
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
        required: true
    },
    technician: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Technician',
        default: null
    },
    vehicle: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vehicle'
    },
    vehicleModel: {
        type: String,
        required: true
    },
    vehicleNumber: {
        type: String
    },
    description: {
        type: String,
        required: true
    },
    serviceType: {
        type: String,
        enum: ['car_wash', 'repairs', 'maintenance', 'towing', 'inspection', 'other'],
        default: 'other'
    },
    serviceMethod: {
        type: String,
        enum: ['home_pickup', 'on_spot', 'walk_in'],
        default: 'on_spot'
    },
    serviceCharge: {
        type: Number,
        default: 0
    },
    isBroadcast: {
        type: Boolean,
        default: true
    },
    requirements: [{
        title: String,
        isCompleted: { type: Boolean, default: false }
    }],
    location: {
        latitude: Number,
        longitude: Number,
        address: String,
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], default: [0, 0] } // [longitude, latitude]
    },
    status: {
        type: String,
        enum: ['pending', 'pending_pickup', 'accepted', 'arrived', 'diagnosing', 'quote_pending', 'parts_required', 'parts_ordered', 'in_progress', 'quality_check', 'ready_for_delivery', 'billing_pending', 'vehicle_delivered', 'payment_pending_cash', 'completed', 'cancelled', 'bill_rejected', 'quote_rejected'],
        default: 'pending'
    },
    billTotal: {
        type: Number,
        default: 0
    },
    quote: {
        items: [{
            product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
            description: String,
            quantity: Number,
            unitPrice: Number,
            total: Number,
            brand: String,
            partNumber: String,
            isCustom: { type: Boolean, default: false },
            isNote: { type: Boolean, default: false },
            images: [String],
            voiceNote: String
        }],
        laborAmount: Number,
        totalAmount: Number,
        note: String,
        photos: [String],
        voiceNote: String,
        createdAt: { type: Date, default: Date.now }
    },
    bill: {
        items: [{
            product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
            description: String,
            quantity: Number,
            unitPrice: Number,
            total: Number,
            brand: String,
            partNumber: String,
            isCustom: { type: Boolean, default: false },
            isNote: { type: Boolean, default: false },
            images: [String],
            voiceNote: String
        }],
        laborAmount: Number,
        totalAmount: Number,
        note: String,
        photos: [String],
        voiceNote: String,
        status: { type: String, enum: ['pending', 'paid', 'rejected'], default: 'pending' },
        paymentMethod: { type: String, enum: ['cash', 'online', 'wallet', 'razorpay'] },
        razorpayOrderId: { type: String },
        razorpayPaymentId: { type: String },
        createdAt: { type: Date, default: Date.now }
    },
    steps: [{
        title: { type: String },
        status: { type: String, enum: ['pending', 'completed'], default: 'pending' },
        time: { type: Date }
    }],
    repairDetails: {
        notes: String,
        photos: [String],
        videoUrl: String,
        updatedAt: { type: Date, default: Date.now }
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    photos: [{ type: String }],
    voiceNote: { type: String },
    rating: { type: Number, min: 1, max: 5 },
    review: { type: String },
    partsSource: {
        type: String,
        enum: ['technician', 'customer'],
        default: 'technician'
    },
    cancellationReason: { type: String },
    cancelledBy: { type: String, enum: ['customer', 'technician', 'admin'] }
}, {
    timestamps: true,
    toJSON: {
        virtuals: true,
        transform: function (doc, ret) {
            ret.id = ret._id;
            delete ret._id;
            delete ret.__v;
            if (ret.location && ret.location.address) {
                ret.address = ret.location.address;
            }
        }
    }
});
serviceRequestSchema.index({ "location.coordinates": "2dsphere" });

module.exports = mongoose.model('ServiceRequest', serviceRequestSchema);
