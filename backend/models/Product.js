const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    supplier: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Supplier',
        required: true
    },
    category: {
        type: String,
        required: true,
        enum: ['Batteries', 'Tires', 'Engine Oil', 'Brakes', 'Lights', 'Filters', 'Accessories', 'Spare Parts', 'Lubricants', 'Suspension', 'Electrical']
    },
    price: {
        type: Number,
        required: true
    },
    image: {
        type: String, // URL
        required: true
    },
    rating: {
        type: Number,
        default: 4.0
    },
    compatibleModels: [{
        type: String
    }],
    description: {
        type: String
    },
    stock: {
        type: Number,
        default: 10
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Product', ProductSchema);
