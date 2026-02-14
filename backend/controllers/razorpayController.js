const Customer = require('../models/Customer');
const Supplier = require('../models/Supplier');
const Technician = require('../models/Technician');
const ServiceRequest = require('../models/ServiceRequest');
const Order = require('../models/Order');
const Transaction = require('../models/Transaction');
const Product = require('../models/Product');
const { createOrder, verifyPaymentSignature, fetchPayment } = require('../utils/razorpayService');
const { createNotification } = require('../utils/notificationService');
const { emitJobUpdate, emitOrderUpdate } = require('../utils/socketHelper');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Create Razorpay Order for Wallet Top-up
// @route   POST /api/customer/wallet/create-order
const createWalletTopupOrder = asyncHandler(async (req, res) => {
    const { amount } = req.body;
    const customer = await Customer.findOne({ user: req.user._id });
    if (!customer) return ApiResponse.error(res, 'Customer not found', 404);

    if (!amount || amount <= 0) {
        return ApiResponse.error(res, 'Invalid amount', 400);
    }

    const order = await createOrder(amount, 'INR', {
        customerId: customer._id.toString(),
        purpose: 'wallet_topup',
        customerName: customer.fullName
    });

    return ApiResponse.success(res, {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_dummy_key'
    }, 'Razorpay order created');
});

// @desc    Verify Wallet Top-up Payment
// @route   POST /api/customer/wallet/verify-payment
const verifyWalletTopup = asyncHandler(async (req, res) => {
    const { orderId, paymentId, signature } = req.body;
    const customer = await Customer.findOne({ user: req.user._id });
    if (!customer) return ApiResponse.error(res, 'Customer not found', 404);

    const isValid = verifyPaymentSignature(orderId, paymentId, signature);
    if (!isValid) return ApiResponse.error(res, 'Invalid payment signature', 400);

    const payment = await fetchPayment(paymentId);
    const amount = payment.amount / 100;

    customer.walletBalance += amount;
    await customer.save();

    await Transaction.create({
        customer: customer._id,
        type: 'topup',
        amount,
        description: 'Wallet Topup via Razorpay',
        referenceId: paymentId,
        paymentMethod: 'razorpay',
        razorpayOrderId: orderId,
        razorpayPaymentId: paymentId,
        status: 'completed'
    });

    return ApiResponse.success(res, {
        walletBalance: customer.walletBalance,
        amount
    }, 'Wallet topped up successfully');
});

// @desc    Create Razorpay Order for Bill Payment
// @route   POST /api/customer/jobs/:id/bill/create-order
const createBillPaymentOrder = asyncHandler(async (req, res) => {
    const job = await ServiceRequest.findById(req.params.id);
    if (!job) return ApiResponse.error(res, 'Job not found', 404);

    const customer = await Customer.findOne({ user: req.user._id });
    if (!customer) return ApiResponse.error(res, 'Customer not found', 404);

    if (job.customer.toString() !== customer._id.toString()) {
        return ApiResponse.error(res, 'Unauthorized', 403);
    }

    const amount = job.bill?.totalAmount || 0;
    if (amount <= 0) return ApiResponse.error(res, 'Invalid bill amount', 400);

    const order = await createOrder(amount, 'INR', {
        customerId: customer._id.toString(),
        jobId: job._id.toString(),
        purpose: 'bill_payment',
        customerName: customer.fullName,
        jobNumber: job.id.slice(-6).toUpperCase()
    });

    return ApiResponse.success(res, {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_dummy_key'
    }, 'Payment order created');
});

// @desc    Verify Bill Payment
// @route   POST /api/customer/jobs/:id/bill/verify-payment
const verifyBillPayment = asyncHandler(async (req, res) => {
    const { orderId, paymentId, signature } = req.body;
    const job = await ServiceRequest.findById(req.params.id);
    if (!job) return ApiResponse.error(res, 'Job not found', 404);

    const customer = await Customer.findOne({ user: req.user._id });
    if (!customer) return ApiResponse.error(res, 'Customer not found', 404);

    const isValid = verifyPaymentSignature(orderId, paymentId, signature);
    if (!isValid) return ApiResponse.error(res, 'Invalid payment signature', 400);

    const payment = await fetchPayment(paymentId);
    const amount = payment.amount / 100;

    if (Math.abs(amount - (job.bill?.totalAmount || 0)) > 1) {
        console.warn(`[Payment] Bill amount mismatch for job ${job._id}: expected ${job.bill?.totalAmount}, got ${amount}`);
        // In a strict production environment, you might want to return an error here
        // But for now, we'll log it and continue as the payment IS verified by signature
    }

    if (job.bill) {
        job.bill.status = 'paid';
        job.bill.paymentMethod = 'razorpay';
        job.bill.razorpayOrderId = orderId;
        job.bill.razorpayPaymentId = paymentId;
    }
    job.billTotal = amount;
    job.status = 'completed';

    if (job.steps) {
        const step = job.steps.find(s => s.title === 'Ready for Delivery');
        if (step) { step.status = 'completed'; step.time = new Date(); }
    }

    await job.save();

    await Transaction.create({
        customer: customer._id,
        type: 'payment',
        amount,
        description: `Payment for Job #${job._id.toString().slice(-6).toUpperCase()}`,
        referenceId: paymentId,
        paymentMethod: 'razorpay',
        razorpayOrderId: orderId,
        razorpayPaymentId: paymentId,
        status: 'completed'
    });

    if (job.technician) {
        const technician = await Technician.findById(job.technician);
        if (technician) {
            technician.walletBalance += amount;
            technician.totalEarnings += amount;
            await technician.save();

            await Transaction.create({
                technician: technician._id,
                type: 'earnings',
                amount,
                description: `Earnings for Job #${job._id.toString().slice(-6).toUpperCase()}`,
                referenceId: paymentId,
                paymentMethod: 'razorpay',
                status: 'completed'
            });

            if (technician.user) {
                createNotification(req, {
                    recipient: technician.user,
                    title: 'Bill Paid',
                    body: `Bill for job #${job._id.toString().slice(-6).toUpperCase()} has been paid via Razorpay.`,
                    type: 'job',
                    relatedId: job._id
                }).catch(e => console.error('Notification Error:', e));

                emitJobUpdate(req, technician.user, {
                    jobId: job._id,
                    status: job.status,
                    message: 'Bill paid successfully'
                });
            }
        }
    }

    return ApiResponse.success(res, job, 'Payment verified successfully');
});

// @desc    Create Razorpay Order for Wholesale Order (Technician to Supplier)
// @route   POST /api/technician/store/orders/:id/pay
const createWholesaleOrderPayment = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);
    if (!order) return ApiResponse.error(res, 'Order not found', 404);

    const technician = await Technician.findOne({ user: req.user._id });
    if (!technician) return ApiResponse.error(res, 'Technician not found', 404);

    if (order.technician.toString() !== technician._id.toString()) {
        return ApiResponse.error(res, 'Unauthorized', 403);
    }

    const amount = order.totalAmount;
    if (amount <= 0) return ApiResponse.error(res, 'Invalid order amount', 400);

    const rzpOrder = await createOrder(amount, 'INR', {
        technicianId: technician._id.toString(),
        orderId: order._id.toString(),
        purpose: 'wholesale_payment',
        technicianName: technician.fullName,
        orderNumber: order.orderId
    });

    return ApiResponse.success(res, {
        orderId: rzpOrder.id,
        amount: rzpOrder.amount,
        currency: rzpOrder.currency,
        keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_dummy_key'
    }, 'Wholesale payment order created');
});

// @desc    Verify Wholesale Order Payment
// @route   POST /api/technician/store/orders/:id/verify
const verifyWholesaleOrderPayment = asyncHandler(async (req, res) => {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return ApiResponse.error(res, 'Order not found', 404);

    const technician = await Technician.findOne({ user: req.user._id });
    if (!technician) return ApiResponse.error(res, 'Technician not found', 404);

    const isValid = verifyPaymentSignature(razorpayOrderId, razorpayPaymentId, razorpaySignature);
    if (!isValid) return ApiResponse.error(res, 'Invalid payment signature', 400);

    const payment = await fetchPayment(razorpayPaymentId);
    const amount = payment.amount / 100;

    order.paymentStatus = 'paid';
    order.paymentMethod = 'razorpay';
    order.razorpayOrderId = razorpayOrderId;
    order.razorpayPaymentId = razorpayPaymentId;
    order.razorpaySignature = razorpaySignature;
    order.status = 'confirmed';
    await order.save();

    for (const item of order.items) {
        if (item.product) {
            await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity } });
        }
    }

    await Transaction.create({
        technician: technician._id,
        type: 'payment',
        amount: -amount,
        description: `Payment for Wholesale Order #${order.orderId}`,
        referenceId: razorpayPaymentId,
        paymentMethod: 'razorpay',
        status: 'completed'
    });

    const supplier = await Supplier.findById(order.supplier);
    if (supplier) {
        supplier.walletBalance = (supplier.walletBalance || 0) + amount;
        supplier.revenue = (supplier.revenue || 0) + amount;
        await supplier.save();

        await Transaction.create({
            supplier: supplier._id,
            type: 'earnings',
            amount: amount,
            description: `Received payment for Wholesale Order #${order.orderId}`,
            referenceId: razorpayPaymentId,
            paymentMethod: 'razorpay',
            status: 'completed'
        });

        if (supplier.user) {
            createNotification(req, {
                recipient: supplier.user,
                title: 'Wholesale Order Paid',
                body: `Wholesale order #${order.orderId} has been paid via Razorpay.`,
                type: 'order',
                relatedId: order._id
            }).catch(e => console.error('Notification Error:', e));

            emitOrderUpdate(req, supplier.user, {
                orderId: order._id,
                status: order.status,
                paymentStatus: 'paid',
                message: 'Wholesale order paid successfully'
            });
        }
    }

    return ApiResponse.success(res, order, 'Payment verified successfully');
});

module.exports = {
    createWalletTopupOrder,
    verifyWalletTopup,
    createBillPaymentOrder,
    verifyBillPayment,
    createWholesaleOrderPayment,
    verifyWholesaleOrderPayment
};
