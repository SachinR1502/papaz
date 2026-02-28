const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        minlength: 3
    },
    productId: {
        type: String, // Format: PROD0001
        unique: true
    },
    supplier: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Supplier',
        required: true
    },
    sku: {
        type: String,
        required: true,
        trim: true
    },
    brand: {
        type: String,
        required: true,
        default: 'Generic'
    },
    category: {
        type: String,
        required: true,
        enum: ['Batteries', 'Tires', 'Engine Oil', 'Brakes', 'Lights', 'Filters', 'Accessories', 'Spare Parts', 'Lubricants', 'Suspension', 'Electrical']
    },
    modelNumber: {
        type: String
    },
    gtinHsn: {
        type: String
    },
    mfgDate: {
        type: Date
    },
    fuelType: [{
        type: String,
        enum: ['Petrol', 'Diesel', 'Electric', 'Hybrid']
    }],
    vehicleType: [{
        type: String,
        enum: ['2W', '3W', '4W', 'Commercial']
    }],
    compatibility: [{
        model: String,
        yearRange: {
            from: String,
            to: String
        },
        engineType: String
    }],
    warranty: {
        available: { type: Boolean, default: false },
        period: Number,
        unit: { type: String, enum: ['Months', 'Years'] }
    },
    guarantee: {
        available: { type: Boolean, default: false },
        period: Number,
        unit: { type: String, enum: ['Months', 'Years'] }
    },
    costPrice: {
        type: Number
    },
    price: { // This is the Selling Price
        type: Number,
        required: true
    },
    mrp: {
        type: Number,
        required: true
    },
    gst: {
        type: Number,
        enum: [0, 5, 12, 18, 28],
        default: 18
    },
    stock: {
        type: Number,
        default: 0
    },
    minStockLevel: {
        type: Number,
        default: 5
    },
    image: { // Primary Image
        type: String,
        required: true
    },
    images: [{ // Additional Images
        type: String
    }],
    shortDescription: {
        type: String,
        maxlength: 150
    },
    specifications: {
        type: mongoose.Schema.Types.Mixed // Rich JSON or String
    },
    installationInstructions: {
        type: String
    },
    metaTitle: String,
    metaDescription: String,
    tags: [String],
    slug: {
        type: String,
        unique: true
    },
    approvalStatus: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    isFeatured: {
        type: Boolean,
        default: false
    },
    commissionPercent: {
        type: Number,
        default: 10
    },
    platformMargin: {
        type: Number,
        default: 0
    },
    rating: {
        type: Number,
        default: 4.0
    }
}, {
    timestamps: true
});

// Compound index for SKU uniqueness per supplier
ProductSchema.index({ supplier: 1, sku: 1 }, { unique: true });

module.exports = mongoose.model('Product', ProductSchema);
