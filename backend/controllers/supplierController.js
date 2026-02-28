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
const Counter = require('../models/Counter');

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

// Helper to calculate KYC Percentage
const calculateKyc = (supplier) => {
    const fields = [
        'fullName', 'storeName', 'address', 'city', 'email', 'phoneNumber',
        'gstin', 'panNumber', 'aadharNumber'
    ];
    const docFields = ['gstCertificate', 'aadharCard', 'panCard', 'electricityBill'];

    let completed = 0;
    fields.forEach(f => { if (supplier[f]) completed++; });
    docFields.forEach(f => { if (supplier.documents?.[f]) completed++; });

    // Bank check
    if (supplier.bankAccounts && supplier.bankAccounts.length > 0) completed++;
    if (supplier.documents?.cancelledCheque) completed++;

    return Math.round((completed / (fields.length + docFields.length + 2)) * 100);
};

// @desc    Update Supplier Profile
// @route   PUT /api/supplier/profile
const updateProfile = asyncHandler(async (req, res) => {
    const {
        fullName, storeName, address, addressLine1, addressLine2, city, state, zipCode,
        email, phoneNumber, alternatePhoneNumber, businessCategories, otherCategory,
        gstin, udyamNumber, panNumber, aadharNumber, documents,
        notificationSettings, lat, lng, location, locationName,
        bankDetails
    } = req.body;

    const updateData = {
        fullName,
        storeName,
        address,
        addressLine1,
        addressLine2,
        city,
        state,
        zipCode,
        email,
        phoneNumber,
        alternatePhoneNumber,
        businessCategories,
        otherCategory,
        gstin,
        udyamNumber,
        panNumber,
        aadharNumber,
        documents,
        notificationSettings
    };

    if (locationName) updateData.locationName = locationName;

    if (location && location.coordinates) {
        updateData.location = location;
    } else if (lng !== undefined && lat !== undefined) {
        updateData.location = {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
        };
    }

    // Handle Bank Details mapping if present
    if (bankDetails) {
        updateData.bankAccounts = [{
            accountHolderName: bankDetails.accountHolderName,
            accountNumber: bankDetails.accountNumber,
            accountNumberFull: bankDetails.accountNumber,
            ifscCode: bankDetails.ifscCode,
            bankName: bankDetails.bankName,
            isDefault: true
        }];
    }

    // Check if supplier exists to decide on ID generation
    let supplier = await Supplier.findOne({ user: req.user._id });

    if (!supplier) {
        // Generate Supplier ID: SUP0001
        const sequence = await Counter.getNextSequence('supplier_id');
        updateData.supplierId = `SUP${String(sequence).padStart(4, '0')}`;
    }

    // Use findOneAndUpdate with upsert
    supplier = await Supplier.findOneAndUpdate(
        { user: req.user._id },
        { $set: updateData },
        { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    // Update KYC Percentage
    supplier.kycPercentage = calculateKyc(supplier);
    await supplier.save();

    // Update the User record to reflect profile completion
    if (req.user && !req.user.profileCompleted) {
        const User = require('../models/User');
        await User.findByIdAndUpdate(req.user._id, {
            profileCompleted: true,
            isRegistered: true
        });
    }

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

    const {
        name, category, price, image, images, stock,
        brand, sku, modelNumber, gtinHsn,
        mfgDate, fuelType, vehicleType, compatibility, warranty, guarantee,
        costPrice, mrp, gst, minStockLevel,
        shortDescription, specifications, installationInstructions,
        metaTitle, metaDescription, tags
    } = req.body;

    // Auto-generate Product ID & SKU
    const nextSeq = await Counter.getNextSequence('product_id');
    const productId = `PROD${String(nextSeq).padStart(4, '0')}`;
    const generatedSku = sku || `SKU-${String(nextSeq).padStart(6, '0')}`;

    // Clean numeric values for safe DB insertion
    const cleanNum = (val) => {
        const n = parseFloat(val);
        return isNaN(n) ? 0 : n;
    };

    const costPriceVal = costPrice ? cleanNum(costPrice) : undefined;
    const priceVal = cleanNum(price);
    const mrpVal = cleanNum(mrp);
    const stockVal = Math.max(0, parseInt(stock) || 0);
    const minStockVal = Math.max(0, parseInt(minStockLevel) || 5);
    const gstVal = parseInt(gst) || 18;

    // Auto-generate Slug
    const slug = name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '') + '-' + productId.toLowerCase();

    // Transform compatibility for schema mapping
    const formattedCompatibility = (compatibility || []).map(c => ({
        model: c.model,
        yearRange: { from: c.fromYear || '', to: c.toYear || '' },
        engineType: c.engineType
    }));

    // Handle optional date field
    const mfgDateValue = mfgDate && mfgDate !== '' ? new Date(mfgDate) : undefined;

    const productData = {
        name,
        productId,
        supplier: supplier._id,
        sku: generatedSku,
        brand: brand || 'Generic',
        category,
        modelNumber,
        gtinHsn,
        mfgDate: mfgDateValue,
        fuelType,
        vehicleType,
        compatibility: formattedCompatibility,
        warranty,
        guarantee,
        costPrice: costPriceVal,
        price: priceVal, // Selling Price
        mrp: mrpVal,
        gst: gstVal,
        stock: stockVal,
        minStockLevel: minStockVal,
        image,
        images: images || [],
        shortDescription,
        specifications,
        installationInstructions,
        metaTitle,
        metaDescription,
        tags,
        slug,
        approvalStatus: 'pending'
    };

    console.log('[DEBUG] Creating product with data:', JSON.stringify(productData, null, 2));

    const product = await Product.create(productData);

    await Supplier.updateOne(
        { _id: supplier._id },
        { $push: { products: product._id } }
    );

    return ApiResponse.success(res, product, 'Product added and queued for approval', 201);
});

// @desc    Update Product
// @route   PUT /api/supplier/inventory/:id
const updateProduct = asyncHandler(async (req, res) => {
    const supplier = await Supplier.findOne({ user: req.user._id });
    const product = await Product.findOne({ _id: req.params.id, supplier: supplier._id });

    if (!product) return ApiResponse.error(res, 'Product not found', 404);

    const updateFields = req.body;

    // If name is updated, update slug as well
    if (updateFields.name && updateFields.name !== product.name) {
        updateFields.slug = updateFields.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '') + '-' + product.productId.toLowerCase();
    }

    // Protection for certain fields
    delete updateFields.productId;
    delete updateFields.supplier;
    delete updateFields.approvalStatus; // Supplier cannot approve their own product

    Object.assign(product, updateFields);
    await product.save();

    return ApiResponse.success(res, product, 'Product updated successfully');
});

// @desc    Delete Product
// @route   DELETE /api/supplier/inventory/:id
const deleteProduct = asyncHandler(async (req, res) => {
    const supplier = await Supplier.findOne({ user: req.user._id });
    const product = await Product.findOneAndDelete({ _id: req.params.id, supplier: supplier._id });

    if (!product) return ApiResponse.error(res, 'Product not found', 404);

    await Supplier.updateOne(
        { _id: supplier._id },
        { $pull: { products: req.params.id } }
    );

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
            ...(order.deliveryDetails || {}),
            ...deliveryDetails
        };
        order.markModified('deliveryDetails');
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

    // If it's a public inquiry or pending order and no one has claimed it, the first to send a quote claims it
    const isClaimable = ['inquiry', 'pending'].includes(order.status) && !order.supplier;

    if (isClaimable) {
        order.supplier = supplier._id;
    } else if (order.supplier && order.supplier.toString() === supplier._id.toString()) {
        // Authorized: Direct request to this supplier
    } else {
        return ApiResponse.error(res, 'Not authorized for this order inquiry', 403);
    }

    // Update items with prices
    if (items && Array.isArray(items)) {
        items.forEach(quotationItem => {
            // Try to match by ID
            const existingItem = order.items.id(quotationItem._id || quotationItem.id);

            if (existingItem) {
                existingItem.price = quotationItem.price;
                existingItem.quantity = quotationItem.quantity;
                existingItem.name = quotationItem.name; // Allow name correction
                if (quotationItem.description) existingItem.description = quotationItem.description;
            } else {
                // Determine if it's a new item (no ID match)
                // Note: quotationItem.id might be a client-side random string, so we ignore it if it's not a valid ObjectId
                order.items.push({
                    name: quotationItem.name || 'Quoted Item',
                    quantity: quotationItem.quantity || 1,
                    price: quotationItem.price || 0,
                    product: quotationItem.product || null,
                    description: quotationItem.description || '',
                    total: (quotationItem.price || 0) * (quotationItem.quantity || 1)
                });
            }
        });
    }

    order.totalAmount = totalAmount || order.items.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 1)), 0);
    order.status = 'quoted';
    await order.save();

    // Notify Customer OR Technician
    const populatedOrder = await Order.findById(order._id)
        .populate({ path: 'customer', populate: { path: 'user' } })
        .populate({ path: 'technician', populate: { path: 'user' } });

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
    } else if (populatedOrder.technician && populatedOrder.technician.user) {
        // Technically acts as the customer in this B2B transaction
        createNotification(req, {
            recipient: populatedOrder.technician.user._id,
            title: 'New Quotation Received',
            body: `Supplier ${supplier.storeName} has sent a quotation for your request #${order.orderId}.`,
            type: 'order',
            relatedId: order._id
        }).catch(e => console.error('Notification Error:', e));

        emitOrderUpdate(req, populatedOrder.technician.user._id, {
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

