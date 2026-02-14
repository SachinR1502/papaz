const Supplier = require('../models/Supplier');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { createNotification } = require('../utils/notificationService');
const { emitOrderUpdate } = require('../utils/socketHelper');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get Notifications
// @route   GET /api/supplier/notifications
const getNotifications = asyncHandler(async (req, res) => {
    const notifications = await Notification.find({ recipient: req.user._id })
        .sort({ createdAt: -1 })
        .limit(50);
    return ApiResponse.success(res, notifications, 'Notifications fetched successfully');
});

// @desc    Mark Notification as Read
// @route   PUT /api/supplier/notifications/:id/read
const markNotificationRead = asyncHandler(async (req, res) => {
    const notification = await Notification.findOne({ _id: req.params.id, recipient: req.user._id });
    if (notification) {
        notification.read = true;
        await notification.save();
    }
    return ApiResponse.success(res, null, 'Notification marked as read');
});

// @desc    Clear All Notifications
// @route   DELETE /api/supplier/notifications
const clearAllNotifications = asyncHandler(async (req, res) => {
    await Notification.deleteMany({ recipient: req.user._id });
    return ApiResponse.success(res, null, 'All notifications cleared');
});

// @desc    Get Supplier Profile & Dashboard Data
// @route   GET /api/supplier/dashboard
const getDashboard = asyncHandler(async (req, res) => {
    const supplier = await Supplier.findOne({ user: req.user._id }).populate('products');
    if (!supplier) {
        return ApiResponse.error(res, 'Supplier profile not found', 404);
    }

    const stats = {
        totalProducts: await Product.countDocuments({ supplier: supplier._id }),
        totalOrders: await Order.countDocuments({
            $or: [
                { supplier: supplier._id },
                { 'items.product': { $in: supplier.products } }
            ]
        }),
        revenue: supplier.revenue || 0,
        walletBalance: supplier.walletBalance || 0,
        rating: supplier.rating || 4.5
    };

    const orders = await Order.find({
        $or: [
            { supplier: supplier._id },
            { 'items.product': { $in: supplier.products } }
        ]
    }).limit(10).sort({ createdAt: -1 });

    return ApiResponse.success(res, {
        profile: supplier,
        stats,
        recentOrders: orders
    }, 'Dashboard data fetched');
});

// @desc    Update Supplier Profile
// @route   PUT /api/supplier/profile
const updateProfile = asyncHandler(async (req, res) => {
    const supplier = await Supplier.findOne({ user: req.user._id });
    if (!supplier) return ApiResponse.error(res, 'Supplier profile not found', 404);

    const { fullName, storeName, address, city, email, phoneNumber, notificationSettings, lat, lng, location, locationName } = req.body;

    supplier.fullName = fullName || supplier.fullName;
    supplier.storeName = storeName || supplier.storeName;
    supplier.address = address || supplier.address;
    supplier.city = city || supplier.city;
    supplier.email = email || supplier.email;
    supplier.phoneNumber = phoneNumber || supplier.phoneNumber;
    supplier.notificationSettings = notificationSettings || supplier.notificationSettings;
    if (locationName) supplier.locationName = locationName;

    if (location && location.coordinates) {
        supplier.location = location;
    } else if (lng !== undefined && lat !== undefined) {
        supplier.location = {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
        };
    }

    await supplier.save();
    return ApiResponse.success(res, supplier, 'Profile updated successfully');
});

// @desc    Get Supplier Inventory
// @route   GET /api/supplier/inventory
const getInventory = asyncHandler(async (req, res) => {
    const supplier = await Supplier.findOne({ user: req.user._id });
    if (!supplier) return ApiResponse.error(res, 'Supplier profile not found', 404);

    const products = await Product.find({ supplier: supplier._id });
    return ApiResponse.success(res, products, 'Inventory fetched successfully');
});

// @desc    Add Product to Inventory
// @route   POST /api/supplier/inventory
const addProduct = asyncHandler(async (req, res) => {
    const supplier = await Supplier.findOne({ user: req.user._id });
    if (!supplier) return ApiResponse.error(res, 'Supplier profile not found', 404);

    const { name, category, price, image, description, stock, compatibleModels } = req.body;

    const product = await Product.create({
        name,
        category,
        price,
        image,
        description,
        stock,
        compatibleModels,
        supplier: supplier._id
    });

    supplier.products.push(product._id);
    await supplier.save();

    return ApiResponse.success(res, product, 'Product added successfully', 201);
});

// @desc    Update Product
// @route   PUT /api/supplier/inventory/:id
const updateProduct = asyncHandler(async (req, res) => {
    const supplier = await Supplier.findOne({ user: req.user._id });
    const product = await Product.findOne({ _id: req.params.id, supplier: supplier._id });

    if (!product) return ApiResponse.error(res, 'Product not found', 404);

    const { name, category, price, image, description, stock, compatibleModels } = req.body;

    product.name = name || product.name;
    product.category = category || product.category;
    product.price = price || product.price;
    product.image = image || product.image;
    product.description = description || product.description;
    product.stock = stock !== undefined ? stock : product.stock;
    product.compatibleModels = compatibleModels || product.compatibleModels;

    await product.save();
    return ApiResponse.success(res, product, 'Product updated successfully');
});

// @desc    Delete Product
// @route   DELETE /api/supplier/inventory/:id
const deleteProduct = asyncHandler(async (req, res) => {
    const supplier = await Supplier.findOne({ user: req.user._id });
    const product = await Product.findOneAndDelete({ _id: req.params.id, supplier: supplier._id });

    if (!product) return ApiResponse.error(res, 'Product not found', 404);

    supplier.products = supplier.products.filter(id => id.toString() !== req.params.id);
    await supplier.save();

    return ApiResponse.success(res, null, 'Product removed successfully');
});

const getOrders = asyncHandler(async (req, res) => {
    const supplier = await Supplier.findOne({ user: req.user._id });
    if (!supplier) return ApiResponse.error(res, 'Supplier profile not found', 404);

    const orders = await Order.find({
        $or: [
            { supplier: supplier._id },
            { 'items.product': { $in: supplier.products } },
            { supplier: null, status: 'inquiry' }
        ]
    })
        .populate('customer', 'fullName phoneNumber city')
        .populate('technician', 'fullName garageName phoneNumber city')
        .sort({ createdAt: -1 });

    return ApiResponse.success(res, orders, 'Orders fetched successfully');
});

// @desc    Get Wholesale Orders
// @route   GET /api/supplier/wholesale/orders
const getWholesaleOrders = asyncHandler(async (req, res) => {
    const supplier = await Supplier.findOne({ user: req.user._id });
    if (!supplier) return ApiResponse.error(res, 'Supplier profile not found', 404);

    const orders = await Order.find({
        supplier: supplier._id,
        technician: { $exists: true }
    })
        .populate('technician', 'fullName garageName phoneNumber city')
        .sort({ createdAt: -1 });

    return ApiResponse.success(res, orders, 'Wholesale orders fetched successfully');
});

// @desc    Update Order Status
// @route   PUT /api/supplier/orders/:id/status
const updateOrderStatus = asyncHandler(async (req, res) => {
    const { status, totalAmount, deliveryDetails, paymentStatus } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) return ApiResponse.error(res, 'Order not found', 404);

    const supplier = await Supplier.findOne({ user: req.user._id });

    const isDirectSupplier = order.supplier && order.supplier.toString() === supplier._id.toString();
    const hasItem = order.items.some(item => supplier.products.includes(item.product));

    if (!isDirectSupplier && !hasItem) {
        return ApiResponse.error(res, 'Not authorized for this order', 403);
    }

    if (status) {
        order.status = status;
        if (status === 'delivered' && order.paymentMethod === 'cash') {
            order.paymentStatus = 'paid';
        }
    }

    if (totalAmount) {
        order.totalAmount = totalAmount;
        if (order.items.length === 1) {
            order.items[0].price = totalAmount / (order.items[0].quantity || 1);
        }
    }

    if (paymentStatus) {
        order.paymentStatus = paymentStatus;
    }

    if (deliveryDetails) {
        order.deliveryDetails = {
            ...order.deliveryDetails,
            ...deliveryDetails
        };
    }

    await order.save();

    // Notify Recipient
    const populatedOrder = await Order.findById(order._id)
        .populate({ path: 'customer', populate: { path: 'user' } })
        .populate({ path: 'technician', populate: { path: 'user' } });

    if (populatedOrder.customer && populatedOrder.customer.user) {
        createNotification(req, {
            recipient: populatedOrder.customer.user._id,
            title: 'Order Status Update',
            body: `Your order #${order.orderId} status has been updated to: ${status}.`,
            type: 'order',
            relatedId: order._id
        }).catch(e => console.error('Notification Error:', e));

        emitOrderUpdate(req, populatedOrder.customer.user._id, {
            orderId: order._id,
            status: order.status,
            message: `Order status updated to ${status}`
        });
    } else if (populatedOrder.technician && populatedOrder.technician.user) {
        createNotification(req, {
            recipient: populatedOrder.technician.user._id,
            title: 'Wholesale Order Update',
            body: `Your wholesale order #${order.orderId} status is now: ${status || order.status}`,
            type: 'order',
            relatedId: order._id
        }).catch(e => console.error('Notification Error:', e));

        emitOrderUpdate(req, populatedOrder.technician.user._id, {
            orderId: order._id,
            status: order.status,
            message: `Order status updated to ${status}`
        });
    }

    return ApiResponse.success(res, order, 'Order updated successfully');
});

// @desc    Send Quotation for Order Inquiry
// @route   POST /api/supplier/orders/:id/quotation
const sendQuotation = asyncHandler(async (req, res) => {
    const { items, totalAmount } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) return ApiResponse.error(res, 'Order not found', 404);

    const supplier = await Supplier.findOne({ user: req.user._id });
    if (!supplier) return ApiResponse.error(res, 'Supplier profile not found', 404);

    // If it's a public inquiry and no one has claimed it, the first to send a quote claims it
    if (!['inquiry', 'pending'].includes(order.status)) {
        return ApiResponse.error(res, 'Order is not in a quotable state', 400);
    }

    if (order.status === 'inquiry' && !order.supplier) {
        order.supplier = supplier._id;
    } else if (order.supplier && order.supplier.toString() === supplier._id.toString()) {
        // Authorized: Direct request to this supplier
    } else {
        return ApiResponse.error(res, 'Not authorized for this order inquiry', 403);
    }

    // Update items with prices
    if (items && Array.isArray(items)) {
        items.forEach(updatedItem => {
            const item = order.items.id(updatedItem._id || updatedItem.id);
            if (item) {
                item.price = updatedItem.price;
            }
        });
    }

    order.totalAmount = totalAmount || order.items.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 1)), 0);
    order.status = 'quoted';
    await order.save();

    // Notify Customer
    const populatedOrder = await Order.findById(order._id).populate({ path: 'customer', populate: { path: 'user' } });
    if (populatedOrder.customer && populatedOrder.customer.user) {
        createNotification(req, {
            recipient: populatedOrder.customer.user._id,
            title: 'New Quotation Received',
            body: `Supplier ${supplier.storeName} has sent a quotation for your inquiry #${order.orderId}.`,
            type: 'order',
            relatedId: order._id
        }).catch(e => console.error('Notification Error:', e));

        emitOrderUpdate(req, populatedOrder.customer.user._id, {
            orderId: order._id,
            status: 'quoted',
            message: 'You have received a new quotation'
        });
    }

    return ApiResponse.success(res, order, 'Quotation sent successfully');
});

module.exports = {
    getDashboard,
    getNotifications,
    markNotificationRead,
    clearAllNotifications,
    updateProfile,
    getInventory,
    addProduct,
    updateProduct,
    deleteProduct,
    getOrders,
    updateOrderStatus,
    getWholesaleOrders,
    sendQuotation
};

