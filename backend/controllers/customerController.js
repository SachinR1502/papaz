const Customer = require('../models/Customer');
const Notification = require('../models/Notification');
const Vehicle = require('../models/Vehicle');
const ServiceRequest = require('../models/ServiceRequest');
const User = require('../models/User');
const Technician = require('../models/Technician');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Transaction = require('../models/Transaction');
const Supplier = require('../models/Supplier');
const Counter = require('../models/Counter');
const { createOrder, verifyPaymentSignature, fetchPayment } = require('../utils/razorpayService');
const { calculateDistance } = require('../utils/distance');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { createNotification } = require('../utils/notificationService');
const { emitJobUpdate, emitOrderUpdate } = require('../utils/socketHelper');

// @desc    Get Notifications
// @route   GET /api/customer/notifications
const getNotifications = asyncHandler(async (req, res) => {
    const notifications = await Notification.find({ recipient: req.user._id })
        .sort({ createdAt: -1 })
        .limit(50);
    return ApiResponse.success(res, notifications, 'Notifications fetched successfully');
});

// @desc    Mark Notification as Read
// @route   PUT /api/customer/notifications/:id/read
const markNotificationRead = asyncHandler(async (req, res) => {
    const notification = await Notification.findOne({ _id: req.params.id, recipient: req.user._id });
    if (notification) {
        notification.read = true;
        await notification.save();
    }
    return ApiResponse.success(res, null, 'Notification marked as read');
});

// @desc    Clear All Notifications
// @route   DELETE /api/customer/notifications
const clearAllNotifications = asyncHandler(async (req, res) => {
    await Notification.deleteMany({ recipient: req.user._id });
    return ApiResponse.success(res, null, 'All notifications cleared');
});

// @desc    Get Customer Profile & Dashboard Data
// @route   GET /api/customer/dashboard
const getDashboard = asyncHandler(async (req, res) => {
    const customer = await Customer.findOne({ user: req.user._id }).populate('wishlist');
    if (!customer) {
        return ApiResponse.error(res, 'Customer profile not found', 404);
    }

    const [vehicles, activeJobs] = await Promise.all([
        Vehicle.find({ customer: customer._id }),
        ServiceRequest.find({
            customer: customer._id,
            status: { $ne: 'completed' }
        })
            .populate({
                path: 'technician',
                select: 'user fullName phoneNumber',
                populate: { path: 'user', select: '_id name email' }
            })
            .sort({ createdAt: -1 })
    ]);

    return ApiResponse.success(res, {
        profile: customer,
        vehicles,
        activeJobs
    }, 'Dashboard data fetched');
});

// @desc    Add New Vehicle
// @route   POST /api/customer/vehicles
const addVehicle = asyncHandler(async (req, res) => {
    const customer = await Customer.findOne({ user: req.user._id });
    if (!customer) return ApiResponse.error(res, 'Customer not found', 404);

    const { make, model, registrationNumber, year, chassisNumber, engineNumber, fuelType, bsNorm, images, vehicleType, color, mileage } = req.body;

    // Validate required fields
    if (!make || !model || !registrationNumber) {
        return ApiResponse.error(res, 'Missing required fields (make, model, registrationNumber)', 400);
    }

    // Generate sequential VN number (6 digits, starting from 000001)
    const vnSequence = await Counter.getNextSequence('vehicle_vn');
    const vnNumber = String(vnSequence).padStart(6, '0');
    const qrCode = `VN-${vnNumber}`;

    const vehicle = await Vehicle.create({
        customer: customer._id,
        make,
        model,
        vehicleType: vehicleType || 'Car',
        registrationNumber,
        year,
        chassisNumber,
        engineNumber,
        fuelType,
        bsNorm,
        color,
        mileage,
        images: images || [],
        qrCode: qrCode
    });

    return ApiResponse.success(res, vehicle, 'Vehicle registered successfully', 201);
});

// @desc    Get All Vehicles
// @route   GET /api/customer/vehicles
const getVehicles = asyncHandler(async (req, res) => {
    const customer = await Customer.findOne({ user: req.user._id });
    if (!customer) return ApiResponse.error(res, 'Customer not found', 404);
    const vehicles = await Vehicle.find({ customer: customer._id });
    return ApiResponse.success(res, vehicles, 'Vehicles fetched successfully');
});

// @desc    Create Service Request
// @route   POST /api/customer/jobs
const createJob = asyncHandler(async (req, res) => {
    const customer = await Customer.findOne({ user: req.user._id });
    if (!customer) return ApiResponse.error(res, 'Customer profile not found', 404);

    const {
        vehicleId,
        description,
        serviceType,
        serviceMethod,
        isBroadcast,
        location,
        voiceNote,
        photos,
        technicianId,
        requirements,
        serviceCharge
    } = req.body;

    console.log(`[CREATE_JOB] Customer: ${customer.fullName}, isBroadcast: ${isBroadcast}, technicianId: ${technicianId}`);

    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) return ApiResponse.error(res, 'Vehicle not found', 404);

    // Determine if this is a broadcast or a direct booking
    // UI logic: If Auto Broadcast is selected, isBroadcast = true. If Direct Booking, isBroadcast = false.
    // Ensure directTechnicianId is ONLY set if it is NOT a broadcast and a tech ID is provided.
    // For broadcast jobs, technician field MUST be null/undefined to show up for everyone.
    const jobIsBroadcast = isBroadcast !== undefined ? String(isBroadcast) === 'true' : (!technicianId);
    const directTechnicianId = (!jobIsBroadcast && technicianId) ? technicianId : null;

    const job = await ServiceRequest.create({
        customer: customer._id,
        technician: directTechnicianId, // This must be null for broadcast jobs
        vehicle: vehicleId,
        vehicleModel: `${vehicle.make} ${vehicle.model}`,
        vehicleNumber: vehicle.registrationNumber,
        description,
        serviceType: serviceType || 'other',
        serviceMethod: serviceMethod || 'on_spot',
        serviceCharge: serviceCharge || 0,
        isBroadcast: jobIsBroadcast,
        location: {
            latitude: parseFloat(location?.latitude || 0),
            longitude: parseFloat(location?.longitude || 0),
            address: location?.address || customer.address,
            type: 'Point',
            coordinates: [parseFloat(location?.longitude || 0), parseFloat(location?.latitude || 0)]
        },
        status: 'pending',
        photos: photos || [],
        voiceNote,
        requirements: requirements || [],
        steps: [
            { title: 'Booking Confirmed', status: 'completed', time: new Date() },
            { title: 'Technician Assigned', status: jobIsBroadcast ? 'pending' : 'completed', time: !jobIsBroadcast ? new Date() : null },
            { title: 'Inspection Started', status: 'pending' },
            { title: 'Quote Shared', status: 'pending' },
            { title: 'Repair in Progress', status: 'pending' },
            { title: 'Quality Check', status: 'pending' },
            { title: 'Ready for Delivery', status: 'pending' }
        ]
    });

    if (directTechnicianId) {
        // Direct Booking: Notify the specific technician
        const tech = await Technician.findById(directTechnicianId).populate('user');
        if (tech && tech.user) {
            console.log(`[CREATE_JOB] Sending direct request to tech: ${tech.fullName}`);
            createNotification(req, {
                recipient: tech.user._id || tech.user,
                title: 'New Job Request',
                body: `New direct booking from ${customer.fullName} for ${vehicle.make} ${vehicle.model}`,
                type: 'service',
                relatedId: job._id
            }).catch(e => console.error('Notification Error:', e));

            emitJobUpdate(req, tech.user._id || tech.user, {
                type: 'new_request',
                jobId: job._id,
                job: job, // Pass full job object for context
                status: 'new_request',
                message: 'You have a new private job request'
            });
        }
    } else if (jobIsBroadcast) {
        // Auto Broadcast: Alert nearby technicians
        console.log(`[CREATE_JOB] Broadcasting job to all technicians`);
        const io = req.app.get('io');
        if (io) {
            io.emit('job_update', {
                type: 'new_broadcast',
                jobId: job._id,
                job: job, // Include job (with location) for client-side filtering
                status: 'pending',
                broadcast: true
            });
        }
    }

    return ApiResponse.success(res, job, 'Service request created successfully', 201);
});

// @desc    Get Job History
// @route   GET /api/customer/jobs/history
const getJobHistory = asyncHandler(async (req, res) => {
    const customer = await Customer.findOne({ user: req.user._id });
    if (!customer) return ApiResponse.error(res, 'Customer not found', 404);

    const jobs = await ServiceRequest.find({ customer: customer._id })
        .populate('vehicle')
        .populate({
            path: 'technician',
            select: 'user fullName phoneNumber garageName',
            populate: { path: 'user', select: '_id name email' }
        })
        .sort({ createdAt: -1 });

    return ApiResponse.success(res, jobs, 'Job history fetched');
});

// @desc    Get Single Job Details
// @route   GET /api/customer/jobs/:id
const getJob = asyncHandler(async (req, res) => {
    const job = await ServiceRequest.findById(req.params.id)
        .populate('vehicle')
        .populate({
            path: 'customer',
            select: 'fullName phoneNumber address user'
        })
        .populate({
            path: 'technician',
            select: 'fullName phoneNumber garageName address user profileImage'
        });

    if (!job) {
        return ApiResponse.error(res, 'Job not found', 404);
    }

    return ApiResponse.success(res, job, 'Job details fetched successfully');
});

// @desc    Rate and Review Job
// @route   POST /api/customer/jobs/:id/rate
const rateJob = asyncHandler(async (req, res) => {
    const { rating, review } = req.body;
    const job = await ServiceRequest.findById(req.params.id);

    if (!job) return ApiResponse.error(res, 'Job not found', 404);
    if (job.status !== 'completed' && job.status !== 'vehicle_delivered') {
        return ApiResponse.error(res, 'Job must be completed to rate', 400);
    }

    job.rating = rating;
    job.review = review;
    await job.save();

    // Update Technician Average Rating
    if (job.technician) {
        const technician = await Technician.findById(job.technician);
        if (technician) {
            const ratings = await ServiceRequest.find({
                technician: technician._id,
                rating: { $exists: true }
            });

            const total = ratings.reduce((sum, r) => sum + r.rating, 0);
            technician.rating = (total / (ratings.length || 1)).toFixed(1);
            await technician.save();
        }
    }

    return ApiResponse.success(res, job, 'Job rated successfully');
});

// @desc    Cancel Job
// @route   POST /api/customer/jobs/:id/cancel
const cancelJob = asyncHandler(async (req, res) => {
    const { reason } = req.body;
    const job = await ServiceRequest.findById(req.params.id);

    if (!job) return ApiResponse.error(res, 'Job not found', 404);

    if (job.status !== 'pending' && job.status !== 'accepted') {
        return ApiResponse.error(res, 'Cannot cancel job in its current state', 400);
    }

    job.status = 'cancelled';
    job.cancellationReason = reason;
    job.cancelledBy = 'customer';
    await job.save();

    // Notify Technician if assigned
    if (job.technician) {
        const tech = await Technician.findById(job.technician).populate('user');
        if (tech && tech.user) {
            createNotification(req, {
                recipient: tech.user,
                title: 'Job Cancelled',
                body: `Job #${job._id.toString().slice(-6).toUpperCase()} has been cancelled by the customer.`,
                type: 'service',
                relatedId: job._id
            }).catch(e => console.error('Notification Error:', e));

            emitJobUpdate(req, tech.user, {
                jobId: job._id,
                status: 'cancelled',
                message: 'Job cancelled by customer'
            });
        }
    }

    return ApiResponse.success(res, job, 'Job cancelled successfully');
});

// @desc    Respond to Quote (Approve/Reject)
// @route   POST /api/customer/jobs/:id/quote/respond
const respondToQuote = asyncHandler(async (req, res) => {
    const { response, action } = req.body;
    const finalAction = response || action;

    console.log(`[RESPOND_QUOTE] JobId: ${req.params.id}, Action: ${finalAction}`);

    if (!finalAction) {
        console.warn(`[RESPOND_QUOTE] Missing action in request body:`, req.body);
        return ApiResponse.error(res, 'Action is required', 400);
    }

    const job = await ServiceRequest.findById(req.params.id);

    if (!job) {
        console.warn(`[RESPOND_QUOTE] Job not found: ${req.params.id}`);
        return ApiResponse.error(res, 'Job not found', 404);
    }

    console.log(`[RESPOND_QUOTE] Found Job: ${job._id}, Current Status: ${job.status}`);

    if (job.status !== 'quote_pending') {
        console.warn(`[RESPOND_QUOTE] Invalid status for response: ${job.status}`);
        return ApiResponse.error(res, `No pending quote for this job (Current status: ${job.status})`, 400);
    }

    if (finalAction === 'approve' || finalAction === 'approved' || finalAction === 'accept_with_parts' || finalAction === 'accept_own_parts') {
        job.status = 'in_progress';

        // Handle parts source preference
        if (finalAction === 'accept_own_parts') {
            job.partsSource = 'customer';
        } else {
            job.partsSource = 'technician';
        }

        if (job.steps) {
            const step = job.steps.find(s => s.title === 'Repair in Progress' || s.title === 'Work in Progress');
            if (step) { step.status = 'pending'; }
        }
    } else {
        job.status = 'quote_rejected';
    }

    await job.save();

    // Notify Technician
    if (job.technician) {
        const tech = await Technician.findById(job.technician).populate('user');
        if (tech && tech.user) {
            const statusLabel = finalAction.includes('reject') ? 'rejected' : 'approved';
            createNotification(req, {
                recipient: tech.user,
                title: `Quote ${statusLabel.toUpperCase()}`,
                body: `Customer has ${statusLabel} the quote for job #${job._id.toString().slice(-6).toUpperCase()}${job.partsSource === 'customer' ? ' with their own parts' : ''}.`,
                type: 'service',
                relatedId: job._id
            }).catch(e => console.error('Notification Error:', e));

            emitJobUpdate(req, tech.user, {
                jobId: job._id,
                status: job.status,
                message: `Quote ${statusLabel} by customer`
            });
        }
    }

    return ApiResponse.success(res, job, `Quote ${finalAction} successfully`);
});

// @desc    Respond to Bill (Approve/Reject)
// @route   POST /api/customer/jobs/:id/bill/respond
const respondToBill = asyncHandler(async (req, res) => {
    const { action, paymentMethod } = req.body;

    console.log(`[RESPOND_BILL] JobId: ${req.params.id}, Action: ${action}, Method: ${paymentMethod}`);

    const job = await ServiceRequest.findById(req.params.id);

    if (!job) {
        console.warn(`[RESPOND_BILL] Job not found: ${req.params.id}`);
        return ApiResponse.error(res, 'Job not found', 404);
    }

    console.log(`[RESPOND_BILL] Job Status: ${job.status}`);

    if (action === 'approve') {
        const billAmount = job.bill?.totalAmount || 0;
        const jobShortId = job._id.toString().slice(-6).toUpperCase();

        if (paymentMethod === 'wallet') {
            const customer = await Customer.findOne({ user: req.user._id });
            if (!customer) return ApiResponse.error(res, 'Customer not found', 404);

            // Atomic update to prevent race conditions
            const updatedCustomer = await Customer.findOneAndUpdate(
                { _id: customer._id, walletBalance: { $gte: billAmount } },
                { $inc: { walletBalance: -billAmount } },
                { new: true }
            );

            if (!updatedCustomer) {
                return ApiResponse.error(res, 'Insufficient wallet balance', 400);
            }

            // Update local instance for subsequent operations if needed
            customer.walletBalance = updatedCustomer.walletBalance;

            await Transaction.create({
                customer: customer._id,
                type: 'payment',
                amount: billAmount,
                description: `Payment for Job #${jobShortId}`,
                referenceId: job._id,
                paymentMethod: 'wallet',
                status: 'completed'
            });

            // Credit Technician
            if (job.technician) {
                const technician = await Technician.findByIdAndUpdate(
                    job.technician,
                    { $inc: { walletBalance: billAmount, totalEarnings: billAmount } },
                    { new: true }
                );

                if (technician) {
                    await Transaction.create({
                        technician: technician._id,
                        type: 'earnings',
                        amount: billAmount,
                        description: `Earnings for Job #${jobShortId}`,
                        referenceId: job._id,
                        paymentMethod: 'wallet',
                        status: 'completed'
                    });
                }
            }
            job.status = 'completed';
        } else if (paymentMethod === 'razorpay' || paymentMethod === 'online') {
            // Online payments must be verified via the specific verification endpoint in razorpayController
            return ApiResponse.error(res, 'Online payments must be verified via the verification endpoint', 400);
        } else if (paymentMethod === 'cash') {
            job.status = 'payment_pending_cash';
        } else {
            job.status = 'completed';
        }

        if (job.bill) {
            job.bill.status = (paymentMethod === 'cash') ? 'pending' : 'paid';
            job.bill.paymentMethod = paymentMethod;
            job.billTotal = job.bill.totalAmount;
        }

        if (job.status === 'completed' && job.steps) {
            const step = job.steps.find(s => s.title === 'Ready for Delivery');
            if (step) { step.status = 'completed'; step.time = new Date(); }
        }
    } else {
        job.status = 'bill_rejected';
        if (job.bill) job.bill.status = 'rejected';
    }

    await job.save();

    // Notify Technician
    if (job.technician) {
        const tech = await Technician.findById(job.technician).populate('user');
        if (tech && tech.user) {
            const jobShortId = job._id.toString().slice(-6).toUpperCase();
            createNotification(req, {
                recipient: tech.user,
                title: `Bill ${action === 'approve' ? 'Paid' : 'Rejected'}`,
                body: `Customer has ${action === 'approve' ? 'paid' : 'rejected'} the bill for job #${jobShortId}.`,
                type: 'service',
                relatedId: job._id
            }).catch(e => console.error('Notification Error:', e));

            emitJobUpdate(req, tech.user, {
                jobId: job._id,
                status: job.status,
                message: `Bill ${action} by customer`
            });
        }
    }

    return ApiResponse.success(res, job, `Bill ${action === 'approve' ? 'paid' : 'rejected'} successfully`);
});

// @desc    Request Custom Part
// @route   POST /api/customer/parts/request
const requestPart = async (req, res) => {
    try {
        const { name, partNumber, brand, description, quantity, supplierId, items, jobId } = req.body;
        const customer = await Customer.findOne({ user: req.user._id });
        if (!customer) return res.status(404).json({ message: 'Customer not found' });

        const orderId = `REQ-${Date.now().toString().slice(-6)}`;

        let orderItems = [];
        if (items && items.length > 0) {
            orderItems = items.map(item => ({
                product: item.productId || item.product,
                name: item.name,
                price: item.price || 0,
                quantity: item.quantity || item.qty || 1,
                description: item.description,
                image: item.image,
                voiceUri: item.voiceUri || item.voice,
                partNumber: item.partNumber || item.partNo || '',
                brand: item.brand || ''
            }));
        } else {
            const { image, voiceUri, voice } = req.body;
            orderItems = [{
                name: name,
                price: 0,
                quantity: quantity || 1,
                description: description,
                image: image,
                voiceUri: voiceUri || voice,
                partNumber: partNumber || '',
                brand: brand || '',
            }];
        }

        const totalAmount = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        // If jobId is provided, find the technician associated with it
        let technicianId = null;
        if (jobId) {
            const job = await ServiceRequest.findById(jobId);
            if (job) {
                technicianId = job.technician;
            }
        }

        const order = await Order.create({
            customer: customer._id,
            technician: technicianId,
            serviceRequest: jobId || null,
            supplier: supplierId || null,
            items: orderItems,
            totalAmount: totalAmount,
            orderId,
            status: 'inquiry',
            location: {
                lat: customer.location?.coordinates?.[1] || 0,
                lng: customer.location?.coordinates?.[0] || 0
            },
            deliveryType: 'address',
            deliveryAddress: {
                address: customer.address,
                name: customer.fullName,
                phone: customer.phoneNumber || req.user.phoneNumber
            }
        });

        // Notify Supplier
        try {
            if (supplierId) {
                const supplier = await Supplier.findById(supplierId);
                if (supplier && supplier.user) {
                    await createNotification(req, {
                        recipient: supplier.user,
                        title: 'New Part Inquiry',
                        body: `You have received a new part inquiry #${orderId} from ${customer.fullName}.`,
                        type: 'order',
                        relatedId: order._id
                    });

                    // Emit Socket Update
                    emitOrderUpdate(req, supplier.user, {
                        orderId: order._id,
                        status: order.status,
                        message: 'New inquiry received'
                    });
                }
            }
        } catch (e) {
            console.error('Notification Error:', e);
        }

        return ApiResponse.success(res, order, 'Part request submitted', 201);
    } catch (error) {
        return ApiResponse.error(res, 'Server error', 500, error.message);
    }
};

// @desc    Get Products (Store)
// @route   GET /api/customer/products
const getProducts = async (req, res) => {
    try {
        const { category, search, lat, lng } = req.query;
        let query = {};

        if (category && category !== 'All') {
            query.category = category;
        }

        if (search) {
            query.name = { $regex: search, $options: 'i' };
        }

        const products = await Product.find(query).populate('supplier', 'storeName fullName city rating address location');

        // If location is provided, mock distance based on city match or random
        const formattedProducts = products.map(p => {
            const prod = p.toObject();
            prod.id = prod._id;

            if (prod.supplier) {
                // Return supplier coordinates if they exist
                // Return supplier coordinates if they exist
                prod.lat = prod.supplier.location?.coordinates?.[1] || null;
                prod.lng = prod.supplier.location?.coordinates?.[0] || null;
            }

            return prod;
        });

        return ApiResponse.success(res, formattedProducts, 'Products fetched successfully');
    } catch (error) {
        console.error('getProducts error:', error);
        return ApiResponse.error(res, 'Failed to fetch products', 500, error.message);
    }
};

// @desc    Get Saved Addresses
// @route   GET /api/customer/addresses
const getAddresses = async (req, res) => {
    try {
        const customer = await Customer.findOne({ user: req.user._id });
        if (!customer) return res.status(404).json({ message: 'Customer not found' });
        return ApiResponse.success(res, customer.savedAddresses || [], 'Addresses fetched successfully');
    } catch (error) {
        return ApiResponse.error(res, 'Failed to fetch addresses', 500, error.message);
    }
};

// @desc    Add Saved Address
// @route   POST /api/customer/addresses
const addAddress = async (req, res) => {
    try {
        const { label, address, addressLine1, addressLine2, city, state, country, district, taluka, zipCode, phone, icon, lat, lng } = req.body;
        const customer = await Customer.findOne({ user: req.user._id });
        if (!customer) return res.status(404).json({ message: 'Customer not found' });

        if (!customer.savedAddresses) {
            customer.savedAddresses = [];
        }

        let fullAddress = address;
        if (!fullAddress && (addressLine1 || city || zipCode)) {
            fullAddress = `${addressLine1 || ''}${addressLine2 ? ', ' + addressLine2 : ''}, ${city || ''}, ${taluka ? taluka + ', ' : ''}${district ? district + ', ' : ''}${state || ''}, ${country || ''} - ${zipCode || ''}`;
        }

        const newAddress = {
            label,
            address: fullAddress, // Use provided string or constructed one
            addressLine1,
            addressLine2,
            city,
            state,
            country,
            district,
            taluka,
            division: req.body.division,
            region: req.body.region,
            zipCode,
            phone,
            icon: icon || 'location',
            location: {
                type: 'Point',
                coordinates: [lng ? parseFloat(lng) : 0, lat ? parseFloat(lat) : 0]
            }
        };
        customer.savedAddresses.push(newAddress);
        await customer.save();

        return ApiResponse.success(res, customer.savedAddresses, 'Address added successfully', 201);
    } catch (error) {
        return ApiResponse.error(res, 'Failed to add address', 500, error.message);
    }
};

const updateAddress = async (req, res) => {
    try {
        const { label, address, addressLine1, addressLine2, city, state, country, district, taluka, division, region, zipCode, phone, icon, lat, lng } = req.body;
        const customer = await Customer.findOne({ user: req.user._id });
        if (!customer) return res.status(404).json({ message: 'Customer not found' });

        const addr = customer.savedAddresses.id(req.params.id);
        if (!addr) return res.status(404).json({ message: 'Address not found' });

        addr.label = label || addr.label;

        let fullAddress = address;
        if (!fullAddress && (addressLine1 || city || zipCode)) {
            fullAddress = `${addressLine1 || ''}${addressLine2 ? ', ' + addressLine2 : ''}, ${city || ''}, ${taluka ? taluka + ', ' : ''}${district ? district + ', ' : ''}${state || ''}, ${country || ''} - ${zipCode || ''}`;
        }

        addr.address = fullAddress || addr.address;
        addr.addressLine1 = addressLine1 || addr.addressLine1;
        addr.addressLine2 = addressLine2 !== undefined ? addressLine2 : addr.addressLine2;
        addr.city = city || addr.city;
        addr.state = state || addr.state;
        addr.country = country || addr.country;
        addr.district = district || addr.district;
        addr.taluka = taluka || addr.taluka;
        addr.division = division || addr.division;
        addr.region = region || addr.region;
        addr.zipCode = zipCode || addr.zipCode;
        addr.phone = phone || addr.phone;
        addr.icon = icon || addr.icon;

        if (lng !== undefined && lat !== undefined) {
            addr.location = {
                type: 'Point',
                coordinates: [parseFloat(lng), parseFloat(lat)]
            };
        }

        await customer.save();
        res.json(customer.savedAddresses);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

const removeAddress = async (req, res) => {
    try {
        const customer = await Customer.findOne({ user: req.user._id });
        if (!customer) return res.status(404).json({ message: 'Customer not found' });

        customer.savedAddresses = customer.savedAddresses.filter(a => a._id.toString() !== req.params.id);
        await customer.save();

        res.json(customer.savedAddresses);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get Nearby Garages (Technicians)
// @route   GET /api/customer/garages
const getGarages = async (req, res) => {
    try {
        const { lat, lng, vehicleType } = req.query;
        let query = { isApproved: true };

        if (vehicleType) {
            query.vehicleTypes = vehicleType;
        }

        if (lat && lng) {
            const parsedLat = parseFloat(lat);
            const parsedLng = parseFloat(lng);

            if (!isNaN(parsedLat) && !isNaN(parsedLng)) {
                query.location = {
                    $near: {
                        $geometry: {
                            type: "Point",
                            coordinates: [parsedLng, parsedLat]
                        }
                    }
                };
            }
        }

        const technicians = await Technician.find(query)
            .select('fullName garageName address serviceRadius location vehicleTypes rating isOnline city profileImage')
            .lean();

        let garages = technicians.map(tech => {
            const tLat = tech.location?.coordinates?.[1] || 0;
            const tLng = tech.location?.coordinates?.[0] || 0;

            const dist = (lat && lng) ? calculateDistance(parseFloat(lat), parseFloat(lng), tLat, tLng) : null;

            return {
                id: tech._id,
                name: tech.garageName || tech.fullName,
                rating: tech.rating || 4.5,
                lat: tLat,
                lng: tLng,
                distance: dist,
                logo: tech.profileImage || 'warehouse',
                city: tech.city,
                address: tech.address
            };
        });

        res.json(garages);
    } catch (error) {
        console.error('getGarages error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Create Product Order
// @route   POST /api/customer/orders
const createProductOrder = async (req, res) => {
    try {
        console.log('[customerController] createProductOrder called');
        console.log('[customerController] Body:', JSON.stringify(req.body, null, 2));

        const { items, totalAmount, garageId, supplierId, paymentMethod, deliveryType, deliveryAddressId, deliveryFee } = req.body;
        const customer = await Customer.findOne({ user: req.user._id });
        if (!customer) return res.status(404).json({ message: 'Customer not found' });

        const orderId = `ORD-${Date.now().toString().slice(-6)}`;

        // Get delivery address if provided
        let deliveryAddress = null;
        if (deliveryType === 'address' && deliveryAddressId) {
            const rawAddr = customer.savedAddresses.id(deliveryAddressId);
            if (rawAddr) {
                // Create explicit snapshot to ensure data integrity
                deliveryAddress = {
                    label: rawAddr.label,
                    address: rawAddr.address, // formatted address
                    addressLine1: rawAddr.addressLine1,
                    addressLine2: rawAddr.addressLine2,
                    city: rawAddr.city,
                    state: rawAddr.state,
                    zipCode: rawAddr.zipCode,
                    country: rawAddr.country,
                    phone: rawAddr.phone,
                    location: rawAddr.location
                };
            }
        }

        if (paymentMethod === 'wallet') {
            const updatedCustomer = await Customer.findOneAndUpdate(
                { _id: customer._id, walletBalance: { $gte: totalAmount } },
                { $inc: { walletBalance: -totalAmount } },
                { new: true }
            );

            if (!updatedCustomer) {
                return res.status(400).json({ message: 'Insufficient wallet balance' });
            }

            // Update local instance
            customer.walletBalance = updatedCustomer.walletBalance;

            await Transaction.create({
                customer: customer._id,
                type: 'payment',
                amount: totalAmount,
                description: `Order Payment for ${orderId}`,
                referenceId: orderId,
                paymentMethod: 'wallet'
            });

            // Credit the Product Provider (Supplier)
            // Try to find supplierId from body or from first product
            const effectiveSupplierId = supplierId || (items.length > 0 ? (items[0].supplierId || items[0].supplier?.id) : null);

            if (effectiveSupplierId && effectiveSupplierId.length === 24) {
                const supplier = await Supplier.findByIdAndUpdate(
                    effectiveSupplierId,
                    { $inc: { walletBalance: totalAmount, revenue: totalAmount } },
                    { new: true }
                );

                if (supplier) {

                    await Transaction.create({
                        supplier: supplier._id,
                        type: 'earnings',
                        amount: totalAmount,
                        description: `Revenue from Order ${orderId}`,
                        referenceId: orderId,
                        paymentMethod: 'wallet'
                    });
                } else {
                    console.warn(`createProductOrder: Supplier with ID ${effectiveSupplierId} not found for crediting.`);
                }
            } else {
                console.warn(`createProductOrder: Invalid or missing effectiveSupplierId: ${effectiveSupplierId}`);
            }
        }

        const orderData = {
            customer: customer._id,
            garage: null,
            supplier: (supplierId && supplierId.length === 24) ? supplierId : null,
            items: items.map(item => ({
                product: (item.id && item.id.length === 24) ? item.id : null,
                name: item.name || 'Unknown Product',
                price: typeof item.price === 'string' ? parseFloat(item.price.replace(/[^\d.]/g, '')) : (parseFloat(item.price) || 0),
                quantity: item.quantity || 1,
                image: item.image || '',
                voiceUri: item.voiceUri || null,
                partNumber: item.partNumber || item.partNo || '',
                brand: item.brand || ''
            })),
            totalAmount: totalAmount || 0,
            orderId,
            status: paymentMethod === 'wallet' ? 'confirmed' : 'pending',
            paymentStatus: paymentMethod === 'wallet' ? 'paid' : (paymentMethod === 'cash' ? 'unpaid' : 'pending'),
            paymentMethod: paymentMethod,
            deliveryType: deliveryType || 'address',
            deliveryAddress: deliveryAddress,
            deliveryFee: deliveryFee || 0,
            location: (deliveryAddress && deliveryAddress.location && deliveryAddress.location.coordinates) ? {
                lat: deliveryAddress.location.coordinates[1],
                lng: deliveryAddress.location.coordinates[0]
            } : null
        };

        const order = await Order.create(orderData);

        // Notify Supplier
        try {
            const effectiveSupplierId = supplierId || (items.length > 0 ? (items[0].supplierId || items[0].supplier?.id) : null);
            if (effectiveSupplierId) {
                const supplier = await Supplier.findById(effectiveSupplierId);
                if (supplier && supplier.user) {
                    await createNotification(req, {
                        recipient: supplier.user,
                        title: 'New Store Order',
                        body: `New order #${orderId} received from ${customer.fullName}.`,
                        type: 'order',
                        relatedId: order._id
                    });

                    // Emit Socket Update
                    emitOrderUpdate(req, supplier.user, {
                        orderId: order._id,
                        status: order.status,
                        message: 'New order received'
                    });
                }
            }
        } catch (e) {
            console.error('Notification Error:', e);
        }

        // Reduce stock if paid via wallet
        if (paymentMethod === 'wallet') {
            for (const item of order.items) {
                if (item.product) {
                    await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity } });
                }
            }
        }

        res.status(201).json(order);
    } catch (error) {
        console.error('createProductOrder Error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Create Razorpay Order for Store Order
// @route   POST /api/customer/orders/:id/pay
const createOrderPayment = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: 'Order not found' });

        const customer = await Customer.findOne({ user: req.user._id });
        if (!customer) return res.status(404).json({ message: 'Customer not found' });

        const amount = order.totalAmount;
        const rzpOrder = await createOrder(amount, 'INR', {
            customerId: customer._id.toString(),
            orderId: order._id.toString(),
            purpose: 'store_payment',
            orderNumber: order.orderId
        });

        res.json({
            orderId: rzpOrder.id,
            amount: rzpOrder.amount,
            keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_dummy_key'
        });
    } catch (error) {
        res.status(500).json({ message: 'Failed to create payment' });
    }
};

// @desc    Verify Store Order Payment
// @route   POST /api/customer/orders/:id/verify
const verifyOrderPayment = async (req, res) => {
    try {
        const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: 'Order not found' });

        // Verify signature
        const isValid = verifyPaymentSignature(razorpayOrderId, razorpayPaymentId, razorpaySignature);
        if (!isValid) return res.status(400).json({ message: 'Invalid signature' });

        const payment = await fetchPayment(razorpayPaymentId);
        const paymentAmount = payment.amount / 100;

        if (Math.abs(paymentAmount - order.totalAmount) > 1) {
            console.warn(`[Payment] Amount mismatch for order ${order._id}: expected ${order.totalAmount}, got ${paymentAmount}`);
        }

        order.paymentStatus = 'paid';
        order.razorpayOrderId = razorpayOrderId;
        order.razorpayPaymentId = razorpayPaymentId;
        order.status = 'confirmed';
        await order.save();

        // Reduce stock
        for (const item of order.items) {
            if (item.product) {
                await Product.findByIdAndUpdate(item.product, {
                    $inc: { stock: -item.quantity }
                });
            }
        }

        const amount = order.totalAmount;

        // Credit fulfiller
        if (order.garage) {
            const technician = await Technician.findById(order.garage);
            if (technician) {
                technician.walletBalance += amount;
                technician.totalEarnings += amount;
                await technician.save();
                await Transaction.create({ technician: technician._id, type: 'earnings', amount, description: `Earning from Order ${order.orderId}`, referenceId: razorpayPaymentId });
            }
        } else if (order.supplier) {
            const supplier = await Supplier.findById(order.supplier);
            if (supplier) {
                supplier.walletBalance += amount;
                supplier.revenue += amount;
                await supplier.save();
                await Transaction.create({ supplier: supplier._id, type: 'earnings', amount, description: `Revenue from Order ${order.orderId}`, referenceId: razorpayPaymentId });

                // Notify Supplier
                try {
                    if (supplier.user) {
                        await createNotification(req, {
                            recipient: supplier.user,
                            title: 'Order Paid',
                            body: `Order #${order.orderId} has been paid via Razorpay.`,
                            type: 'order',
                            relatedId: order._id
                        });

                        // Emit Socket Update
                        emitOrderUpdate(req, supplier.user, {
                            orderId: order._id,
                            status: order.status,
                            paymentStatus: 'paid',
                            message: 'Order paid successfully via Razorpay'
                        });
                    }
                } catch (e) {
                    console.error('Notification Error:', e);
                }
            }
        }

        res.json({ success: true, order });
    } catch (error) {
        res.status(500).json({ message: 'Verification failed' });
    }
};

// @desc    Get Customer Orders
// @route   GET /api/customer/orders
const getOrders = async (req, res) => {
    try {
        const customer = await Customer.findOne({ user: req.user._id });
        const orders = await Order.find({ customer: customer._id }).sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

//@desc    Get Customer Order by ID
//@route   GET /api/customer/orders/:id
const getOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const query = id.match(/^[0-9a-fA-F]{24}$/) ? { _id: id } : { orderId: id };

        const order = await Order.findOne(query)
            .populate('supplier', 'storeName fullName phone address rating');

        if (!order) return res.status(404).json({ message: 'Order not found' });
        res.json(order);
    } catch (error) {
        console.error('getOrder Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};


// @desc    Get Wishlist
// @route   GET /api/customer/wishlist
const getWishlist = async (req, res) => {
    try {
        const customer = await Customer.findOne({ user: req.user._id }).populate('wishlist');
        if (!customer) return res.status(404).json({ message: 'Customer not found' });
        res.json(customer.wishlist || []);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Add to Wishlist
// @route   POST /api/customer/wishlist/:id
const addToWishlist = async (req, res) => {
    try {
        const customer = await Customer.findOne({ user: req.user._id });
        if (!customer) return res.status(404).json({ message: 'Customer not found' });

        const productId = req.params.id;
        if (!customer.wishlist.includes(productId)) {
            customer.wishlist.push(productId);
            await customer.save();
        }

        // Return full updated wishlist
        await customer.populate('wishlist');
        res.json(customer.wishlist);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Remove from Wishlist
// @route   DELETE /api/customer/wishlist/:id
const removeFromWishlist = async (req, res) => {
    try {
        const customer = await Customer.findOne({ user: req.user._id });
        if (!customer) return res.status(404).json({ message: 'Customer not found' });

        customer.wishlist = customer.wishlist.filter(id => id.toString() !== req.params.id);
        await customer.save();

        await customer.populate('wishlist');
        res.json(customer.wishlist);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};


const updateProfile = asyncHandler(async (req, res) => {
    const customer = await Customer.findOne({ user: req.user._id });
    if (!customer) return ApiResponse.error(res, 'Customer not found', 404);

    const { fullName, address, city, email, notificationSettings, lat, lng, location, locationName, avatar } = req.body;

    customer.notificationSettings = notificationSettings || customer.notificationSettings;
    customer.fullName = fullName || customer.fullName;
    customer.address = address || customer.address;
    customer.city = city || customer.city;
    customer.email = email || customer.email;
    if (avatar) customer.avatar = avatar;
    if (locationName) customer.locationName = locationName;

    if (location && location.coordinates) {
        customer.location = location;
    } else if (lng !== undefined && lat !== undefined) {
        customer.location = {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
        };
    }

    await customer.save();
    return ApiResponse.success(res, customer, 'Profile updated successfully');
});

const getVehicleHistory = asyncHandler(async (req, res) => {
    const jobs = await ServiceRequest.find({ vehicle: req.params.id })
        .populate({
            path: 'technician',
            select: 'user fullName phoneNumber garageName',
            populate: { path: 'user', select: 'name' }
        })
        .sort({ createdAt: -1 });

    return ApiResponse.success(res, jobs, 'Vehicle history fetched successfully');
});


const getWalletHistory = asyncHandler(async (req, res) => {
    const customer = await Customer.findOne({ user: req.user._id });
    if (!customer) return ApiResponse.error(res, 'Customer not found', 404);

    const transactions = await Transaction.find({ customer: customer._id }).sort({ createdAt: -1 });
    return ApiResponse.success(res, transactions, 'Wallet history fetched successfully');
});

const topupWallet = asyncHandler(async (req, res) => {
    const { amount, referenceId } = req.body;
    const customer = await Customer.findOne({ user: req.user._id });
    if (!customer) return ApiResponse.error(res, 'Customer not found', 404);

    customer.walletBalance += parseFloat(amount);
    await customer.save();

    await Transaction.create({
        customer: customer._id,
        type: 'topup',
        amount: parseFloat(amount),
        description: 'Wallet Topup',
        referenceId,
        paymentMethod: 'online' // or 'manual' if this is a manual topup
    });

    return ApiResponse.success(res, { walletBalance: customer.walletBalance }, 'Wallet topped up successfully');
});

const addCard = asyncHandler(async (req, res) => {
    const { type, last4, expiry, brand } = req.body;
    const customer = await Customer.findOne({ user: req.user._id });
    if (!customer) return ApiResponse.error(res, 'Customer not found', 404);

    customer.savedCards.push({ type, last4, expiry, brand });
    await customer.save();

    return ApiResponse.success(res, customer.savedCards, 'Card added successfully', 201);
});

const removeCard = asyncHandler(async (req, res) => {
    const customer = await Customer.findOne({ user: req.user._id });
    if (!customer) return ApiResponse.error(res, 'Customer not found', 404);

    customer.savedCards = customer.savedCards.filter(c => c._id.toString() !== req.params.id);
    await customer.save();

    return ApiResponse.success(res, customer.savedCards, 'Card removed successfully');
});
const getSuppliers = async (req, res) => {
    try {
        const { lat, lng } = req.query;
        const suppliers = await Supplier.find({ isApproved: true }).select('fullName storeName address city rating location');

        let formattedSuppliers = suppliers.map(s => {
            const sLat = s.location?.coordinates?.[1] || (12.9784 + (Math.random() - 0.5) * 0.1);
            const sLng = s.location?.coordinates?.[0] || (77.6408 + (Math.random() - 0.5) * 0.1);

            const parsedLat = parseFloat(lat);
            const parsedLng = parseFloat(lng);
            const dist = (!isNaN(parsedLat) && !isNaN(parsedLng)) ? calculateDistance(parsedLat, parsedLng, sLat, sLng) : null;

            return {
                id: s._id,
                fullName: s.fullName,
                storeName: s.storeName,
                address: s.address,
                city: s.city,
                rating: s.rating || 4.2,
                lat: sLat,
                lng: sLng,
                distance: dist
            };
        });

        if (lat && lng) {
            formattedSuppliers.sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity));
        }

        res.json(formattedSuppliers);
    } catch (error) {
        console.error('getSuppliers error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Pay Store Order with Wallet
// @route   POST /api/customer/orders/:id/wallet-pay
const payStoreOrderWithWallet = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return ApiResponse.error(res, 'Order not found', 404);

        const customer = await Customer.findOne({ user: req.user._id });
        if (!customer) return ApiResponse.error(res, 'Customer not found', 404);

        if (order.customer.toString() !== customer._id.toString()) {
            return ApiResponse.error(res, 'Unauthorized', 403);
        }

        const amount = order.totalAmount;
        if (order.totalAmount > customer.walletBalance) {
            return ApiResponse.error(res, 'Insufficient wallet balance', 400);
        }

        // Deduct from customer wallet
        customer.walletBalance -= amount;
        await customer.save();

        // Update order status
        order.paymentStatus = 'paid';
        order.paymentMethod = 'wallet';
        order.status = 'confirmed';
        await order.save();

        // Reduce stock
        for (const item of order.items) {
            if (item.product) {
                await Product.findByIdAndUpdate(item.product, {
                    $inc: { stock: -item.quantity }
                });
            }
        }

        // Create customer transaction (debit)
        await Transaction.create({
            customer: customer._id,
            type: 'payment',
            amount: -amount,
            description: `Payment for Order #${order.orderId}`,
            referenceId: 'wallet_' + Date.now(),
            paymentMethod: 'wallet',
            status: 'completed'
        });

        // Credit fulfiller (technician or supplier)
        if (order.garage) {
            const technician = await Technician.findById(order.garage);
            if (technician) {
                technician.walletBalance += amount;
                technician.totalEarnings += amount;
                await technician.save();
                await Transaction.create({
                    technician: technician._id,
                    type: 'earnings',
                    amount,
                    description: `Earning from Order #${order.orderId}`,
                    referenceId: 'wallet_' + Date.now(),
                    paymentMethod: 'wallet',
                    status: 'completed'
                });
            }
        } else if (order.supplier) {
            const supplier = await Supplier.findById(order.supplier);
            if (supplier) {
                supplier.walletBalance = (supplier.walletBalance || 0) + amount;
                supplier.revenue = (supplier.revenue || 0) + amount;
                await supplier.save();
                await Transaction.create({
                    supplier: supplier._id,
                    type: 'earnings',
                    amount,
                    description: `Revenue from Order #${order.orderId}`,
                    referenceId: 'wallet_' + Date.now(),
                    paymentMethod: 'wallet',
                    status: 'completed'
                });

                // Notify Supplier
                try {
                    if (supplier.user) {
                        await createNotification(req, {
                            recipient: supplier.user,
                            title: 'Order Paid',
                            body: `Order #${order.orderId} has been paid via wallet.`,
                            type: 'order',
                            relatedId: order._id
                        });

                        // Emit Socket Update
                        emitOrderUpdate(req, supplier.user, {
                            orderId: order._id,
                            status: order.status,
                            paymentStatus: 'paid',
                            message: 'Order paid successfully'
                        });
                    }
                } catch (e) {
                    console.error('Notification Error:', e);
                }
            }
        }

        res.json({ success: true, order, walletBalance: customer.walletBalance });
    } catch (error) {
        console.error('payStoreOrderWithWallet Error:', error);
        res.status(500).json({ message: 'Failed to process wallet payment', error: error.message });
    }
};

// @desc    Respond to Order Quotation (Approve/Reject)
// @route   POST /api/customer/orders/:id/quotation/respond
const respondToOrderQuotation = asyncHandler(async (req, res) => {
    const { action } = req.body; // 'approve' or 'reject'
    const order = await Order.findById(req.params.id);

    if (!order) return ApiResponse.error(res, 'Order not found', 404);

    if (order.status !== 'quoted') {
        return ApiResponse.error(res, 'Order is not in quoted status', 400);
    }

    if (action === 'approve') {
        order.status = 'confirmed';
    } else {
        order.status = 'rejected';
    }

    await order.save();

    // Notify Supplier
    if (order.supplier) {
        const supplier = await Supplier.findById(order.supplier).populate('user');
        if (supplier && supplier.user) {
            createNotification(req, {
                recipient: supplier.user._id,
                title: `Quotation ${action === 'approve' ? 'Accepted' : 'Rejected'}`,
                body: `Customer has ${action === 'approve' ? 'accepted' : 'rejected'} your quotation for order #${order.orderId}.`,
                type: 'order',
                relatedId: order._id
            }).catch(e => console.error('Notification Error:', e));

            emitOrderUpdate(req, supplier.user._id, {
                orderId: order._id,
                status: order.status,
                message: `Quotation ${action} by customer`
            });
        }
    }

    return ApiResponse.success(res, order, `Quotation ${action === 'approve' ? 'accepted' : 'rejected'} successfully`);
});

module.exports = {
    getDashboard,
    addVehicle,
    getVehicles,
    updateProfile,
    getVehicleHistory,
    createJob,
    getJobHistory,
    getJob,
    respondToQuote,
    respondToBill,
    requestPart,
    getGarages,
    getSuppliers,
    getAddresses,
    addAddress,
    updateAddress,
    removeAddress,
    getProducts,
    createOrder: createProductOrder,
    getOrders,
    getOrder,
    getWishlist,
    addToWishlist,
    removeFromWishlist,
    getWalletHistory,
    topupWallet,
    addCard,
    removeCard,
    rateJob,
    cancelJob,
    createOrderPayment,
    verifyOrderPayment,
    payStoreOrderWithWallet,
    getNotifications,
    markNotificationRead,
    clearAllNotifications,
    respondToOrderQuotation
};
