const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
    technician: { type: mongoose.Schema.Types.ObjectId, ref: 'Technician' },
    supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier' },
    type: { type: String, enum: ['topup', 'payment', 'refund', 'earnings', 'settlement'], required: true },
    amount: { type: Number, required: true },
    description: { type: String },
    status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'completed' },
    referenceId: { type: String }, // Razorpay payment ID or order ID
    paymentMethod: { type: String }, // 'online', 'wallet', 'cash', 'razorpay'
    razorpayOrderId: { type: String }, // Razorpay order ID
    razorpayPaymentId: { type: String }, // Razorpay payment ID
    razorpaySignature: { type: String } // Razorpay signature for verification
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);
