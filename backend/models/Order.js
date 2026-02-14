const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer'
    },
    technician: { // Requester if it's a technician ordering parts
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Technician'
    },
    garage: { // Fulfillment partner (Wait, this might overlap with technician or supplier)
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Technician', // Using Technician/Garage model for shops
    },
    supplier: { // If ordered from a specific supplier
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Supplier'
    },
    serviceRequest: { // Link to the service job this order is for
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ServiceRequest'
    },
    items: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product'
        },
        name: String, // Snapshot
        price: Number,
        quantity: Number,
        image: String,
        voiceUri: String,
        partNumber: String,
        brand: String,
        description: String
    }],
    totalAmount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'accepted', 'rejected', 'packed', 'out_for_delivery', 'shipped', 'delivered', 'cancelled', 'inquiry', 'quoted'],
        default: 'pending'
    },
    orderId: {
        type: String,
        unique: true
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed', 'refunded', 'unpaid'],
        default: 'pending'
    },
    paymentMethod: {
        type: String,
        enum: ['razorpay', 'wallet', 'cash', 'card']
    },
    deliveryType: {
        type: String,
        enum: ['garage', 'address'],
        default: 'garage'
    },
    deliveryAddress: {
        type: mongoose.Schema.Types.Mixed // Stores the snapshot of the address
    },
    vehicleDetails: {
        make: String,
        model: String,
        year: String,
        vin: String,
        registrationNumber: String,
        fuelType: String
    },
    deliveryFee: {
        type: Number,
        default: 0
    },
    razorpayOrderId: String,
    razorpayPaymentId: String,
    razorpaySignature: String,
    location: {
        lat: { type: Number },
        lng: { type: Number }
    },
    deliveryDetails: {
        vehicleNumber: String,
        driverName: String,
        driverPhone: String,
        estimatedDelivery: Date
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Order', OrderSchema);
