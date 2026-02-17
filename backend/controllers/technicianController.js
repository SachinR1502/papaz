const Technician = require('../models/Technician');
const Notification = require('../models/Notification');
const ServiceRequest = require('../models/ServiceRequest');
const Vehicle = require('../models/Vehicle');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Transaction = require('../models/Transaction');
const Supplier = require('../models/Supplier');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { createNotification } = require('../utils/notificationService');
const { emitJobUpdate, emitOrderUpdate } = require('../utils/socketHelper');

// @desc    Get Notifications
// @route   GET /api/technician/notifications
const getNotifications = asyncHandler(async (req, res) => {
    const notifications = await Notification.find({ recipient: req.user._id })
        .sort({ createdAt: -1 })
        .limit(50);
    return ApiResponse.success(res, notifications, 'Notifications fetched successfully');
});

// @desc    Mark Notification as Read
// @route   PUT /api/technician/notifications/:id/read
const markNotificationRead = asyncHandler(async (req, res) => {
    const notification = await Notification.findOne({ _id: req.params.id, recipient: req.user._id });
    if (notification) {
        notification.read = true;
        await notification.save();
    }
    return ApiResponse.success(res, null, 'Notification marked as read');
});

// @desc    Clear All Notifications
// @route   DELETE /api/technician/notifications
const clearAllNotifications = asyncHandler(async (req, res) => {
    await Notification.deleteMany({ recipient: req.user._id });
    return ApiResponse.success(res, null, 'All notifications cleared');
});

// @desc    Get Profile
// @route   GET /api/technician/profile
const getProfile = asyncHandler(async (req, res) => {
    const technician = await Technician.findOne({ user: req.user._id }).populate('user', 'name phoneNumber email');
    if (!technician) return ApiResponse.error(res, 'Technician profile not found', 404);

    // Optimization: Don't load activeJobs here, they are loaded in getJobs
    // Aggregate Stats
    const stats = await ServiceRequest.aggregate([
        { $match: { technician: technician._id } },
        {
            $group: {
                _id: null,
                totalJobs: { $sum: 1 },
                completedJobs: {
                    $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] }
                },
                totalRating: { $sum: "$rating" },
                ratingCount: {
                    $sum: { $cond: [{ $ifNull: ["$rating", false] }, 1, 0] }
                },
                // Calculate response time for accepted/completed jobs
                totalResponseTime: {
                    $sum: {
                        $cond: [
                            { $and: [{ $ne: ["$status", "pending"] }, { $ne: ["$status", "cancelled"] }] }, // If accepted
                            { $subtract: [{ $toDate: "$updatedAt" }, { $toDate: "$createdAt" }] }, // Simplification: using updatedAt as proxy for acceptance if steps not reliable, ideally use step query but aggregate is complex. 
                            // Better approach: We'll calculate response time separately or use a simpler metric for now.
                            0
                        ]
                    }
                }
            }
        }
    ]);

    // Refined Response Time Calculation (more accurate than aggregate potentially)
    // Fetch last 20 accepted jobs to calculate average response
    const recentJobs = await ServiceRequest.find({
        technician: technician._id,
        status: { $ne: 'pending' },
        'steps.title': 'Technician Assigned'
    }).select('createdAt steps').limit(20);

    let totalResponseMs = 0;
    let responseCount = 0;

    recentJobs.forEach(job => {
        const assignedStep = job.steps.find(s => s.title === 'Technician Assigned' && s.status === 'completed');
        if (assignedStep && assignedStep.time) {
            const diff = new Date(assignedStep.time) - new Date(job.createdAt);
            if (diff > 0) {
                totalResponseMs += diff;
                responseCount++;
            }
        }
    });

    const avgResponseMs = responseCount > 0 ? totalResponseMs / responseCount : 0;
    const avgResponseMinutes = Math.round(avgResponseMs / (1000 * 60));
    const avgResponseFormatted = avgResponseMinutes < 60
        ? `${avgResponseMinutes}m`
        : `${Math.round(avgResponseMinutes / 60)}h`;

    const jobStats = stats[0] || { totalJobs: 0, completedJobs: 0, totalRating: 0, ratingCount: 0 };

    // Calculate CSR Score (Based on rating 5 stars = 100%)
    const avgRating = jobStats.ratingCount > 0 ? (jobStats.totalRating / jobStats.ratingCount) : 5;
    const csrScore = Math.min(100, Math.round((avgRating / 5) * 100));

    const enhancedProfile = {
        ...technician.toObject(),
        stats: {
            csrScore: `${csrScore}%`,
            avgResponseTime: avgResponseFormatted || 'N/A',
            tasksDone: jobStats.completedJobs,
            tasksDone: jobStats.completedJobs,
            activeJobs: 0 // activeJobs not loaded here
        }
    };

    return ApiResponse.success(res, { profile: enhancedProfile, activeJobs: [] }, 'Profile fetched successfully');
});

const updateProfile = asyncHandler(async (req, res) => {
    const technician = await Technician.findOne({ user: req.user._id });
    if (!technician) return ApiResponse.error(res, 'Technician profile not found', 404);

    const {
        fullName,
        registrationType,
        garageName,
        address,
        addressLine1,
        addressLine2,
        city,
        state,
        zipCode,
        dob,
        aadharNo,
        panNo,
        udyamNo,
        profession,
        workType,
        serviceRadius,
        vehicleTypes,
        technicalSkills,
        softSkills,
        avatar,
        isOnline,
        location,
        locationName
    } = req.body;

    if (fullName !== undefined) technician.fullName = fullName;
    if (registrationType !== undefined) technician.registrationType = registrationType;
    if (garageName !== undefined) technician.garageName = garageName;
    if (address !== undefined) technician.address = address;
    if (addressLine1 !== undefined) technician.addressLine1 = addressLine1;
    if (addressLine2 !== undefined) technician.addressLine2 = addressLine2;
    if (city !== undefined) technician.city = city;
    if (state !== undefined) technician.state = state;
    if (zipCode !== undefined) technician.zipCode = zipCode;
    if (dob !== undefined) technician.dob = dob;
    if (aadharNo !== undefined) technician.aadharNo = aadharNo;
    if (panNo !== undefined) technician.panNo = panNo;
    if (udyamNo !== undefined) technician.udyamNo = udyamNo;
    if (profession !== undefined) technician.profession = profession;
    if (workType !== undefined) technician.workType = workType;
    if (serviceRadius !== undefined) technician.serviceRadius = serviceRadius;
    if (vehicleTypes !== undefined) technician.vehicleTypes = vehicleTypes;
    if (technicalSkills !== undefined) technician.technicalSkills = technicalSkills;
    if (softSkills !== undefined) technician.softSkills = softSkills;
    if (avatar !== undefined) technician.avatar = avatar;
    if (isOnline !== undefined) technician.isOnline = isOnline;
    if (locationName !== undefined) technician.locationName = locationName;

    if (location) {
        if (location.coordinates) {
            technician.location = location;
        } else if (location.longitude && location.latitude) {
            technician.location = {
                type: 'Point',
                coordinates: [parseFloat(location.longitude), parseFloat(location.latitude)]
            };
        }
    }

    await technician.save();
    return ApiResponse.success(res, technician, 'Profile updated successfully');
});

// @desc    Get Jobs (Available and My Jobs)
// @route   GET /api/technician/jobs
const getJobs = asyncHandler(async (req, res) => {
    const technician = await Technician.findOne({ user: req.user._id });
    if (!technician) return ApiResponse.error(res, 'Technician profile not found', 404);

    console.log(`[GET_JOBS] Technician: ${technician.fullName} (${technician._id})`);

    // 1. My Jobs (Direct Requests + Active + History)
    const hasValidLocation = technician.location?.coordinates?.length === 2 &&
        (technician.location.coordinates[0] !== 0 || technician.location.coordinates[1] !== 0);

    console.log(`[GET_JOBS] Has Valid Location: ${hasValidLocation} ${JSON.stringify(technician.location?.coordinates)}`);

    let broadcastQuery = {
        status: 'pending',
        technician: null
    };

    // Geo-spatial query for nearby jobs
    if (hasValidLocation) {
        broadcastQuery['location.coordinates'] = {
            $near: {
                $geometry: technician.location,
                $maxDistance: (technician.serviceRadius || 50) * 1000 // Default 50km
            }
        };
    }

    // Execute queries in parallel for performance
    const myJobsPromise = ServiceRequest.find({ technician: technician._id })
        .populate({
            path: 'vehicle',
            select: 'make model registrationNumber year vehicleType images chassisNumber engineNumber fuelType bsNorm manufacturersYear licensePlate'
        })
        .populate('customer', 'fullName phoneNumber email address')
        .sort({ createdAt: -1 });

    let availableInitialPromise;
    if (hasValidLocation) {
        // When using $near, do NOT use .sort() as it conflicts and MongoDB sorts by distance automatically
        availableInitialPromise = ServiceRequest.find(broadcastQuery)
            .populate({
                path: 'vehicle',
                select: 'make model registrationNumber year vehicleType images chassisNumber engineNumber fuelType bsNorm manufacturersYear licensePlate'
            })
            .populate('customer', 'fullName phoneNumber email address')
            .limit(50);
    } else {
        availableInitialPromise = ServiceRequest.find(broadcastQuery)
            .populate({
                path: 'vehicle',
                select: 'make model registrationNumber year vehicleType images chassisNumber engineNumber fuelType bsNorm manufacturersYear licensePlate'
            })
            .populate('customer', 'fullName phoneNumber email address')
            .limit(50)
            .sort({ createdAt: -1 });
    }

    const [myJobs, availableInitial] = await Promise.all([
        myJobsPromise,
        availableInitialPromise
    ]);

    console.log(`[GET_JOBS] MyJobs count: ${myJobs.length}, Initial Available count: ${availableInitial.length}`);

    // Always fetch recent global broadcasts to ensure we don't miss anything due to distance limits
    // This acts as a safety list to show *something* even if the geo-query is too strict
    const globalBroadcasts = await ServiceRequest.find({
        status: 'pending',
        technician: null,
        isBroadcast: true
    })
        .populate({
            path: 'vehicle',
            select: 'make model registrationNumber year vehicleType images chassisNumber engineNumber fuelType bsNorm manufacturersYear licensePlate'
        })
        .populate('customer', 'fullName phoneNumber email address')
        .sort({ createdAt: -1 })
        .limit(20);

    // Merge availableInitial (Geo-targeted) with globalBroadcasts (Recent)
    // Use a Map to deduplicate by Job ID
    const allAvailableJobsMap = new Map();

    availableInitial.forEach(job => allAvailableJobsMap.set(job._id.toString(), job));
    globalBroadcasts.forEach(job => allAvailableJobsMap.set(job._id.toString(), job));

    const available = Array.from(allAvailableJobsMap.values());
    console.log(`[GET_JOBS] Final Merged Available count: ${available.length}`);

    return ApiResponse.success(res, {
        available,
        myJobs
    }, 'Jobs fetched successfully');
});

// @desc    Accept Job
// @route   POST /api/technician/jobs/:id/accept
const acceptJob = asyncHandler(async (req, res) => {
    const technician = await Technician.findOne({ user: req.user._id });
    if (!technician) return ApiResponse.error(res, 'Technician profile not found', 404);

    const job = await ServiceRequest.findById(req.params.id);
    if (!job) return ApiResponse.error(res, 'Job not found', 404);
    if (job.status !== 'pending') return ApiResponse.error(res, 'Job is no longer available', 400);

    // Security Check: If job is already assigned to a specific technician (Direct Request), only THAT technician can accept it.
    if (job.technician && job.technician.toString() !== technician._id.toString()) {
        return ApiResponse.error(res, 'This job is reserved for another technician', 403);
    }

    job.technician = technician._id;
    job.status = 'accepted';

    if (job.steps) {
        const step = job.steps.find(s => s.title === 'Technician Assigned');
        if (step) { step.status = 'completed'; step.time = new Date(); }
    }

    await job.save();

    // Notify Customer
    const populatedJob = await ServiceRequest.findById(job._id).populate('customer');
    if (populatedJob.customer && populatedJob.customer.user) {
        createNotification(req, {
            recipient: populatedJob.customer.user,
            title: 'Technician Assigned',
            body: `${technician.fullName} has accepted your service request.`,
            type: 'service',
            relatedId: job._id
        }).catch(e => console.error('Notification Error:', e));

        emitJobUpdate(req, populatedJob.customer.user, {
            jobId: job._id,
            status: job.status,
            message: 'Technician assigned to your job'
        });
    }

    return ApiResponse.success(res, job, 'Job accepted successfully');
});

// @desc    Update Job Status
// @route   PUT /api/technician/jobs/:id/status
const updateJobStatus = asyncHandler(async (req, res) => {
    const { status, note, requirements } = req.body;
    const job = await ServiceRequest.findById(req.params.id);

    if (!job) return ApiResponse.error(res, 'Job not found', 404);

    // 1. Authorization Check: Ensure this technician is assigned to the job
    const technician = await Technician.findOne({ user: req.user._id });
    if (!technician || job.technician.toString() !== technician._id.toString()) {
        return ApiResponse.error(res, 'Not authorized to update this job', 403);
    }

    // 2. Status Transition Checks
    if (status) {
        // If technician is trying to mark as completed
        if (status === 'completed') {
            // Check if bill exists
            if (!job.bill) {
                return ApiResponse.error(res, 'Cannot complete job without a generated bill', 400);
            }

            // Security: Only allow manual completion for CASH payments
            // Online/Wallet payments must be handled by their respective verification controllers
            const paymentMethod = job.bill.paymentMethod || 'cash'; // Fallback to cash if not set
            if (paymentMethod !== 'cash') {
                return ApiResponse.error(res, `Cannot manually complete job with ${paymentMethod.toUpperCase()} payment. Payment must be verified by the system.`, 400);
            }

            // For Cash payments, mark as paid and create audit transaction
            job.bill.status = 'paid';
            job.bill.paymentMethod = 'cash';
            job.billTotal = job.bill.totalAmount;

            // Create Transaction record for Cash (Audit Trail)
            await Transaction.create({
                customer: job.customer,
                technician: technician._id,
                type: 'payment',
                amount: job.bill.totalAmount,
                description: `Cash Payment for Job #${job._id.toString().slice(-6).toUpperCase()}`,
                status: 'completed',
                paymentMethod: 'cash'
            });

            // Update Technician Stats/Earnings (even though cash isn't in digital wallet)
            technician.totalEarnings = (technician.totalEarnings || 0) + job.bill.totalAmount;
            await technician.save();

            await Transaction.create({
                technician: technician._id,
                type: 'earnings',
                amount: job.bill.totalAmount,
                description: `Cash Earnings for Job #${job._id.toString().slice(-6).toUpperCase()}`,
                status: 'completed',
                paymentMethod: 'cash'
            });
        }

        job.status = status;
    }

    if (note) job.repairDetails = { ...job.repairDetails, notes: note };
    if (requirements) job.requirements = requirements;

    // Logic to update steps based on status
    if (status === 'in_progress' && job.steps) {
        const step = job.steps.find(s => s.title === 'Inspection Started' || s.title === 'Inspection');
        if (step) { step.status = 'completed'; step.time = new Date(); }
    }

    await job.save();

    // Notify Customer
    const populatedJob = await ServiceRequest.findById(job._id).populate('customer');
    if (populatedJob.customer && populatedJob.customer.user) {
        createNotification(req, {
            recipient: populatedJob.customer.user,
            title: 'Job Update',
            body: `Your job status has been updated to ${status.replace(/_/g, ' ')}.`,
            type: 'service',
            relatedId: job._id
        }).catch(e => console.error('Notification Error:', e));

        emitJobUpdate(req, populatedJob.customer.user, {
            jobId: job._id,
            status: job.status,
            message: `Job status updated to ${status}`
        });
    }

    return ApiResponse.success(res, job, 'Job status updated successfully');
});

const cancelJob = asyncHandler(async (req, res) => {
    const { reason } = req.body;
    const job = await ServiceRequest.findById(req.params.id);

    if (!job) return ApiResponse.error(res, 'Job not found', 404);

    const technician = await Technician.findOne({ user: req.user._id });
    if (!technician || job.technician.toString() !== technician._id.toString()) {
        return ApiResponse.error(res, 'Not authorized', 403);
    }

    if (job.status === 'completed' || job.status === 'vehicle_delivered') {
        return ApiResponse.error(res, 'Cannot cancel completed job', 400);
    }

    job.status = 'cancelled';
    job.cancellationReason = reason;
    job.cancelledBy = 'technician';
    await job.save();

    return ApiResponse.success(res, job, 'Job cancelled successfully');
});

const getJob = asyncHandler(async (req, res) => {
    const job = await ServiceRequest.findById(req.params.id)
        .populate('vehicle')
        .populate({
            path: 'customer',
            select: 'fullName phoneNumber address user',
            populate: { path: 'user', select: '_id name email' }
        });

    if (!job) return ApiResponse.error(res, 'Job not found', 404);

    const technician = await Technician.findOne({ user: req.user._id });
    if (!technician) return ApiResponse.error(res, 'Technician profile not found', 404);

    if (job.technician && job.technician.toString() !== technician._id.toString()) {
        return ApiResponse.error(res, 'Not authorized to view this job details', 403);
    }

    // Fetch associated part requests (Orders)
    const partRequests = await Order.find({ serviceRequest: job._id })
        .populate('supplier', 'storeName fullName')
        .sort({ createdAt: -1 });

    const jobObj = job.toObject();
    jobObj.partRequests = partRequests;

    return ApiResponse.success(res, jobObj, 'Job details fetched successfully');
});

const sendQuote = asyncHandler(async (req, res) => {
    const { items, laborAmount, note, photos, voiceNote } = req.body;
    const job = await ServiceRequest.findById(req.params.id);

    if (!job) return ApiResponse.error(res, 'Job not found', 404);

    // Authorization: Ensure this technician is assigned to the job
    const technician = await Technician.findOne({ user: req.user._id });
    if (!technician || job.technician.toString() !== technician._id.toString()) {
        return ApiResponse.error(res, 'Not authorized to send quote for this job', 403);
    }

    const processedItems = items.map(item => {
        // If it's a note, set total to 0 regardless of price/quantity
        const isNote = item.isNote || false;
        const quantity = item.quantity || 1;
        const unitPrice = isNote ? 0 : (item.unitPrice || item.price || 0);
        const total = isNote ? 0 : (unitPrice * quantity);

        return {
            product: item.product || null,
            description: item.description,
            quantity,
            unitPrice,
            total,
            brand: item.brand || '',
            partNumber: item.partNumber || '',
            isCustom: !!item.isCustom,
            isNote: isNote,
            images: item.images || [],
            voiceNote: item.voiceNote || null
        };
    });

    // Add service charge to items for visibility if not already present
    if (job.serviceCharge > 0 && !(processedItems || []).some(i => (i.description || "").toLowerCase().includes("service fee") || (i.description || "").toLowerCase().includes("pickup fee"))) {
        processedItems.push({
            description: `Service Fee (${(job.serviceMethod || 'on_spot').replace('_', ' ').toUpperCase()})`,
            quantity: 1,
            unitPrice: job.serviceCharge,
            total: job.serviceCharge,
            isNote: false
        });
    }

    // Only sum items that are NOT notes
    const totalItems = processedItems.reduce((sum, item) => sum + (item.isNote ? 0 : item.total), 0);
    const total = totalItems + parseFloat(laborAmount || 0);

    job.quote = {
        items: processedItems,
        laborAmount: parseFloat(laborAmount || 0),
        totalAmount: total,
        note: note,
        photos: photos,
        voiceNote: voiceNote,
        createdAt: new Date()
    };

    // Also update general repair details for visibility
    if (note || (photos && photos.length > 0)) {
        job.repairDetails = {
            ...job.repairDetails,
            notes: note || job.repairDetails?.notes,
            photos: photos && photos.length > 0 ? photos : job.repairDetails?.photos
        };
    }
    job.status = 'quote_pending';

    if (job.steps) {
        const inspStep = job.steps.find(s => s.title === 'Inspection' || s.title === 'Inspection Started');
        if (inspStep) { inspStep.status = 'completed'; inspStep.time = new Date(); }

        const quoteStep = job.steps.find(s => s.title === 'Quote Shared');
        if (quoteStep) { quoteStep.status = 'completed'; quoteStep.time = new Date(); }
    }

    await job.save();

    const populatedJob = await ServiceRequest.findById(job._id).populate('customer');
    if (populatedJob.customer && populatedJob.customer.user) {
        createNotification(req, {
            recipient: populatedJob.customer.user,
            title: 'New Quote',
            body: `Technician has shared a quote for your service #${job._id.toString().slice(-6).toUpperCase()}.`,
            type: 'service',
            relatedId: job._id
        }).catch(e => console.error('Notification Error:', e));

        emitJobUpdate(req, populatedJob.customer.user, {
            jobId: job._id,
            status: job.status,
            message: 'New quote shared'
        });
    }

    return ApiResponse.success(res, job, 'Quote shared successfully');
});

const sendBill = asyncHandler(async (req, res) => {
    const { items, laborAmount, note, photos, voiceNote } = req.body;
    const job = await ServiceRequest.findById(req.params.id);

    if (!job) return ApiResponse.error(res, 'Job not found', 404);

    // Authorization: Ensure this technician is assigned to the job
    const technician = await Technician.findOne({ user: req.user._id });
    if (!technician || job.technician.toString() !== technician._id.toString()) {
        return ApiResponse.error(res, 'Not authorized to send bill for this job', 403);
    }

    const processedItems = items.map(item => {
        // If it's a note, set total to 0 regardless of price/quantity
        const isNote = item.isNote || false;
        const quantity = item.quantity || 1;
        const unitPrice = isNote ? 0 : (item.unitPrice || item.price || 0);
        const total = isNote ? 0 : (unitPrice * quantity);

        return {
            product: item.product || null,
            description: item.description,
            quantity,
            unitPrice,
            total,
            brand: item.brand || '',
            partNumber: item.partNumber || '',
            isCustom: !!item.isCustom,
            isNote: isNote,
            images: item.images || [],
            voiceNote: item.voiceNote || null
        };
    });

    // Add service charge to items for visibility if not already present
    if (job.serviceCharge > 0 && !(processedItems || []).some(i => (i.description || "").toLowerCase().includes("service fee") || (i.description || "").toLowerCase().includes("pickup fee"))) {
        processedItems.push({
            description: `Service Fee (${(job.serviceMethod || 'on_spot').replace('_', ' ').toUpperCase()})`,
            quantity: 1,
            unitPrice: job.serviceCharge,
            total: job.serviceCharge,
            isNote: false
        });
    }

    // Only sum items that are NOT notes
    const totalItems = processedItems.reduce((sum, item) => sum + (item.isNote ? 0 : item.total), 0);
    const total = totalItems + parseFloat(laborAmount || 0);

    job.bill = {
        items: processedItems,
        laborAmount: parseFloat(laborAmount || 0),
        totalAmount: total,
        note: note,
        photos: photos,
        voiceNote: voiceNote,
        createdAt: new Date(),
        status: 'pending'
    };

    // Update repair details for bill specifically
    if (note || (photos && photos.length > 0)) {
        job.repairDetails = {
            ...job.repairDetails,
            notes: note || job.repairDetails?.notes,
            photos: photos && photos.length > 0 ? photos : job.repairDetails?.photos
        };
    }
    job.status = 'billing_pending';

    if (job.steps) {
        const step = job.steps.find(s => s.title === 'Ready for Delivery');
        if (step) { step.status = 'completed'; step.time = new Date(); }
    }

    await job.save();

    const populatedJob = await ServiceRequest.findById(job._id).populate('customer');
    if (populatedJob.customer && populatedJob.customer.user) {
        createNotification(req, {
            recipient: populatedJob.customer.user,
            title: 'Bill Shared',
            body: `Final bill for your service request #${job._id.toString().slice(-6).toUpperCase()} is ready for payment.`,
            type: 'payment',
            relatedId: job._id
        }).catch(e => console.error('Notification Error:', e));

        emitJobUpdate(req, populatedJob.customer.user, {
            jobId: job._id,
            status: job.status,
            message: 'Final bill shared'
        });
    }

    return ApiResponse.success(res, job, 'Bill shared successfully');
});

const getProducts = asyncHandler(async (req, res) => {
    const { category, search } = req.query;
    let query = {};
    if (category && category !== 'All') query.category = category;
    if (search) query.name = { $regex: search, $options: 'i' };

    const products = await Product.find(query).populate('supplier', 'storeName fullName city rating');
    return ApiResponse.success(res, products, 'Products fetched successfully');
});

const requestProduct = asyncHandler(async (req, res) => {
    const { productId, quantity, shopId, jobId, customName, customDescription, image, voiceUri } = req.body;
    const techUser = req.user;
    const technician = await Technician.findOne({ user: techUser._id });

    if (!technician) return ApiResponse.error(res, 'Technician profile not found', 404);

    let product = null;
    if (productId && !productId.startsWith('custom-')) {
        try {
            product = await Product.findById(productId);
        } catch (e) {
            // Ignore invalid ID format if we have customName
        }
    }

    if (!product && !customName) {
        return ApiResponse.error(res, 'Product not found and no custom name provided', 404);
    }

    let vehicleDetails = null;
    if (jobId) {
        const job = await ServiceRequest.findById(jobId).populate('vehicle');
        if (!job) return ApiResponse.error(res, 'Linked job not found', 404);

        // Authorization: Ensure this technician is assigned to the job
        if (job.technician && job.technician.toString() !== technician._id.toString()) {
            return ApiResponse.error(res, 'Not authorized to request parts for this job', 403);
        }

        if (job.vehicle) {
            vehicleDetails = {
                make: job.vehicle.make,
                model: job.vehicle.model,
                year: job.vehicle.year,
                vin: job.vehicle.vin || job.vehicle.chassisNumber,
                registrationNumber: job.vehicle.registrationNumber,
                fuelType: job.vehicle.fuelType
            };
        }
    }

    const qty = parseInt(quantity) || 1;
    const totalAmount = product ? ((product.price || 0) * qty) : 0; // Custom orders might have 0 price initially
    const orderId = 'ORD-' + Date.now() + '-' + Math.floor(Math.random() * 1000);

    let parsedImage = null;
    let parsedVoice = null;
    let finalDescription = customDescription;

    if (customDescription) {
        const photoMatch = customDescription.match(/\[PhotoURI:(.*?)\]/);
        if (photoMatch) {
            parsedImage = photoMatch[1];
        }
        const voiceMatch = customDescription.match(/\[VoiceURI:(.*?)\]/);
        if (voiceMatch) {
            parsedVoice = voiceMatch[1];
        }
    }

    // Use direct fields if provided, otherwise use parsed ones
    const finalImage = image || parsedImage;
    const finalVoice = voiceUri || parsedVoice;

    const orderItem = product ? {
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: quantity || 1,
        image: product.image,
        voiceUri: product.voiceUri,
        description: product.description
    } : {
        name: customName,
        description: finalDescription,
        quantity: quantity || 1,
        price: 0,
        image: finalImage,
        voiceUri: finalVoice
    };

    const targetSupplier = shopId || (product ? product.supplier : null);
    // If no specific supplier and it's a custom request, it's an inquiry
    const initialStatus = !targetSupplier ? 'inquiry' : 'pending';

    const order = new Order({
        orderId,
        technician: technician._id,
        serviceRequest: jobId || null,
        supplier: targetSupplier,
        items: [orderItem],
        totalAmount,
        status: initialStatus,
        paymentStatus: 'pending',
        location: {
            lat: technician.location?.coordinates?.[1] || 0,
            lng: technician.location?.coordinates?.[0] || 0
        },
        deliveryType: 'garage',
        deliveryAddress: {
            address: technician.address,
            name: technician.garageName || technician.fullName,
            phone: req.user.phoneNumber
        },
        vehicleDetails: vehicleDetails
    });

    await order.save();

    const supplier = await Supplier.findById(order.supplier).populate('user');
    if (supplier && supplier.user) {
        createNotification(req, {
            recipient: supplier.user._id || supplier.user,
            title: 'New Order Received',
            body: `New order for ${quantity}x ${product ? product.name : (customName || 'Custom Item')} from ${technician.garageName}`,
            type: 'order',
            relatedId: order._id
        }).catch(e => console.error('Notification Error:', e));

        if (emitOrderUpdate) {
            emitOrderUpdate(req, supplier.user._id || supplier.user, {
                orderId: order._id,
                status: initialStatus,
                message: 'You have a new order'
            });
        }
    }

    return ApiResponse.success(res, order, 'Product ordered successfully');
});

// @desc    Respond to Order Quotation (from Supplier)
// @route   POST /api/technician/store/request/:id/respond
const respondToPartRequest = asyncHandler(async (req, res) => {
    const { action } = req.body; // 'approve' or 'reject' / 'accept'
    const order = await Order.findById(req.params.id);

    if (!order) return ApiResponse.error(res, 'Order not found', 404);

    const technician = await Technician.findOne({ user: req.user._id });
    if (!technician || (order.technician && order.technician.toString() !== technician._id.toString())) {
        return ApiResponse.error(res, 'Not authorized to respond to this quotation', 403);
    }

    if (order.status !== 'quoted' && order.status !== 'inquiry') {
        return ApiResponse.error(res, 'Order is not in a respondable state (quoted/inquiry)', 400);
    }

    if (action === 'approve' || action === 'accept') {
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
                title: `Quotation ${action === 'approve' || action === 'accept' ? 'Accepted' : 'Rejected'}`,
                body: `Technician has ${action === 'approve' || action === 'accept' ? 'accepted' : 'rejected'} your quotation for order #${order.orderId}.`,
                type: 'order',
                relatedId: order._id
            }).catch(e => console.error('Notification Error:', e));

            if (emitOrderUpdate) {
                emitOrderUpdate(req, supplier.user._id, {
                    orderId: order._id,
                    status: order.status,
                    message: `Quotation ${action} by technician`
                });
            }
        }
    }

    return ApiResponse.success(res, order, `Quotation ${action} successfully responded`);
});

const addPart = asyncHandler(async (req, res) => {
    const part = req.body;
    const technician = await Technician.findOne({ user: req.user._id });
    // Simulate inventory update logic
    return ApiResponse.success(res, part, 'Part added to inventory');
});

const requestCustomOrder = asyncHandler(async (req, res) => {
    const { supplierName, items } = req.body;
    const technician = await Technician.findOne({ user: req.user._id });

    if (!technician) return ApiResponse.error(res, 'Technician profile not found', 404);

    // Try to find supplier by name if possible, or just create an inquiry
    let targetSupplier = null;
    if (supplierName) {
        targetSupplier = await Supplier.findOne({
            $or: [
                { storeName: { $regex: supplierName, $options: 'i' } },
                { fullName: { $regex: supplierName, $options: 'i' } }
            ]
        });
    }

    const orderId = 'ORD-C-' + Date.now() + '-' + Math.floor(Math.random() * 1000);

    const processedItems = (items || []).map(item => ({
        name: item.name,
        brand: item.company || item.brand,
        partNumber: item.partNumber,
        description: item.description,
        quantity: parseInt(item.qty || item.quantity || 1),
        price: 0, // Custom request
        image: item.photos?.[0] || item.image, // Order model expects single string for image
        voiceUri: item.voiceNote || item.voiceUri
    }));

    const order = new Order({
        orderId,
        technician: technician._id,
        supplier: targetSupplier?._id || null,
        items: processedItems,
        totalAmount: 0,
        status: targetSupplier ? 'pending' : 'inquiry',
        paymentStatus: 'pending',
        location: {
            lat: technician.location?.coordinates?.[1] || 0,
            lng: technician.location?.coordinates?.[0] || 0
        },
        deliveryType: 'garage',
        deliveryAddress: {
            address: technician.address,
            name: technician.garageName || technician.fullName,
            phone: req.user.phoneNumber
        }
    });

    await order.save();

    // Notify supplier if found
    if (targetSupplier && targetSupplier.user) {
        createNotification(req, {
            recipient: targetSupplier.user,
            title: 'New Custom Order Inquiry',
            body: `New custom order request for ${processedItems.length} items from ${technician.garageName}`,
            type: 'order',
            relatedId: order._id
        }).catch(e => console.error('Notification Error:', e));
    }

    return ApiResponse.success(res, order, 'Custom order dispatched successfully');
});

const getVehicleHistory = asyncHandler(async (req, res) => {
    const { vehicleId } = req.params;
    const technician = await Technician.findOne({ user: req.user._id });
    if (!technician) return ApiResponse.error(res, 'Technician profile not found', 404);

    let vehicle = null;

    // First try valid ObjectId
    if (vehicleId.match(/^[0-9a-fA-F]{24}$/)) {
        vehicle = await Vehicle.findById(vehicleId);
    }

    // If not found by ID or not a valid ID format, try registration number
    if (!vehicle) {
        vehicle = await Vehicle.findOne({ registrationNumber: vehicleId });
    }

    // Authorization: Check if technician has a job for this vehicle (assigned or broadcast)
    const query = {
        $or: [
            { vehicle: vehicle?._id },
            { vehicleNumber: vehicleId }
        ],
        $or: [
            { technician: technician._id },
            { isBroadcast: true, status: 'pending' }
        ]
    };

    const hasAccess = await ServiceRequest.findOne(query);

    if (!hasAccess) {
        return ApiResponse.error(res, 'Not authorized to view this vehicle history', 403);
    }

    // Only allow seeing customer contact details if explicitly assigned
    const isAssigned = hasAccess.technician && hasAccess.technician.toString() === technician._id.toString();
    if (vehicle && isAssigned) {
        await vehicle.populate('customer', 'fullName phoneNumber email');
    }

    const history = await ServiceRequest.find({
        $or: [
            { 'vehicle': vehicle?._id },
            { 'vehicleNumber': vehicleId }
        ],
        status: { $in: ['completed', 'vehicle_delivered'] }
    }).sort({ createdAt: -1 });

    const mappedHistory = history.map(job => ({
        id: job._id,
        date: new Date(job.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
        service: job.steps?.find(s => s.status === 'completed')?.title || job.description || 'General Service',
        technician: 'Technician',
        cost: job.bill?.totalAmount || 0,
        notes: job.repairDetails?.notes || job.description || 'No notes'
    }));

    return ApiResponse.success(res, { vehicle, history: mappedHistory }, 'Vehicle history fetched');
});

const placeWholesaleOrder = asyncHandler(async (req, res) => {
    const { items, supplierId, totalAmount, jobId } = req.body;
    const technician = await Technician.findOne({ user: req.user._id });
    if (!technician) return ApiResponse.error(res, 'Technician profile not found', 404);

    let vehicleDetails = null;
    if (jobId) {
        const job = await ServiceRequest.findById(jobId).populate('vehicle');
        if (!job) return ApiResponse.error(res, 'Linked job not found', 404);

        // Authorization: Ensure this technician is assigned to the job
        if (job.technician && job.technician.toString() !== technician._id.toString()) {
            return ApiResponse.error(res, 'Not authorized to place wholesale orders for this job', 403);
        }

        if (job.vehicle) {
            vehicleDetails = {
                make: job.vehicle.make,
                model: job.vehicle.model,
                year: job.vehicle.year,
                vin: job.vehicle.vin || job.vehicle.chassisNumber,
                registrationNumber: job.vehicle.registrationNumber,
                fuelType: job.vehicle.fuelType
            };
        }
    }

    const orderId = `W-ORD-${Date.now().toString().slice(-6)}`;

    const order = await Order.create({
        technician: technician._id,
        supplier: supplierId || null,
        serviceRequest: jobId || null,
        items: items.map(item => ({
            product: item.productId || item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image: item.image,
            brand: item.brand || '',
            partNumber: item.partNumber || '',
            description: item.description || ''
        })),
        totalAmount: totalAmount || items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        orderId,
        status: 'pending',
        location: {
            lat: technician.location?.coordinates?.[1] || 0,
            lng: technician.location?.coordinates?.[0] || 0
        },
        deliveryType: 'garage',
        deliveryAddress: {
            address: technician.address,
            name: technician.garageName || technician.fullName,
            phone: req.user.phoneNumber
        },
        vehicleDetails: vehicleDetails
    });

    if (supplierId) {
        const supplier = await Supplier.findById(supplierId).populate('user');
        if (supplier && supplier.user) {
            createNotification(req, {
                recipient: supplier.user,
                title: 'New Wholesale Order',
                body: `New wholesale order #${orderId} received from ${technician.fullName}.`,
                type: 'order',
                relatedId: order._id
            }).catch(e => console.error('Notification Error:', e));

            emitOrderUpdate(req, supplier.user, {
                orderId: order._id,
                status: order.status,
                message: 'New wholesale order received'
            });
        }
    }

    return ApiResponse.success(res, order, 'Wholesale order placed successfully', 201);
});

const getWholesaleOrders = asyncHandler(async (req, res) => {
    const technician = await Technician.findOne({ user: req.user._id });
    if (!technician) return ApiResponse.error(res, 'Technician profile not found', 404);

    const orders = await Order.find({ technician: technician._id })
        .populate('supplier', 'storeName fullName city')
        .sort({ createdAt: -1 });

    return ApiResponse.success(res, orders, 'Wholesale orders fetched successfully');
});

const payWholesaleOrderWithWallet = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);
    if (!order) return ApiResponse.error(res, 'Order not found', 404);

    const technician = await Technician.findOne({ user: req.user._id });
    if (!technician) return ApiResponse.error(res, 'Technician profile not found', 404);

    if (order.technician.toString() !== technician._id.toString()) {
        return ApiResponse.error(res, 'Unauthorized', 403);
    }

    if (order.paymentStatus === 'paid') {
        return ApiResponse.error(res, 'Order is already paid', 400);
    }

    const amount = order.totalAmount;
    // Atomic update for Technician wallet deduction
    const updatedTechnician = await Technician.findOneAndUpdate(
        { _id: technician._id, walletBalance: { $gte: amount } },
        { $inc: { walletBalance: -amount } },
        { new: true }
    );

    if (!updatedTechnician) {
        return ApiResponse.error(res, 'Insufficient wallet balance', 400);
    }

    // Update local local instance
    technician.walletBalance = updatedTechnician.walletBalance;

    order.paymentStatus = 'paid';
    order.paymentMethod = 'wallet';
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
        description: `Wallet Payment for Wholesale Order #${order.orderId}`,
        paymentMethod: 'wallet',
        status: 'completed'
    });

    // Atomic update for Supplier credit
    if (order.supplier) {
        const supplier = await Supplier.findByIdAndUpdate(
            order.supplier,
            { $inc: { walletBalance: amount, revenue: amount } },
            { new: true }
        ).populate('user');

        if (supplier) {
            await Transaction.create({
                supplier: supplier._id,
                type: 'earnings',
                amount: amount,
                description: `Received Wallet Payment for Wholesale Order #${order.orderId}`,
                paymentMethod: 'wallet',
                status: 'completed'
            });

            if (supplier.user) {
                createNotification(req, {
                    recipient: supplier.user,
                    title: 'Wholesale Order Paid',
                    body: `Wholesale order #${order.orderId} has been paid via wallet.`,
                    type: 'order',
                    relatedId: order._id
                }).catch(e => console.error('Notification Error:', e));

                emitOrderUpdate(req, supplier.user, {
                    orderId: order._id,
                    status: order.status,
                    paymentStatus: 'paid',
                    message: 'Order paid successfully'
                });
            }
        }
    }

    return ApiResponse.success(res, { order, newBalance: technician.walletBalance }, 'Order paid successfully');
});

const payWholesaleOrderWithCash = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);
    if (!order) return ApiResponse.error(res, 'Order not found', 404);

    const technician = await Technician.findOne({ user: req.user._id });
    if (!technician || order.technician.toString() !== technician._id.toString()) {
        return ApiResponse.error(res, 'Unauthorized', 403);
    }

    if (order.paymentStatus === 'paid') {
        return ApiResponse.error(res, 'Order is already paid', 400);
    }

    order.paymentMethod = 'cash';
    order.paymentStatus = 'pending';
    order.status = 'confirmed';
    await order.save();

    // Notify Supplier
    if (order.supplier) {
        const supplier = await Supplier.findById(order.supplier).populate('user');
        if (supplier && supplier.user) {
            createNotification(req, {
                recipient: supplier.user._id,
                title: 'Wholesale Order - Cash Payment',
                body: `Technician ${technician.fullName} has chosen cash payment for order #${order.orderId}. Please collect cash on delivery.`,
                type: 'order',
                relatedId: order._id
            }).catch(e => console.error('Notification Error:', e));

            emitOrderUpdate(req, supplier.user._id, {
                orderId: order._id,
                status: order.status,
                paymentStatus: 'pending',
                message: 'Order confirmed with cash payment'
            });
        }
    }

    return ApiResponse.success(res, order, 'Cash payment method selected and order confirmed');
});

const updateRequirementStatus = asyncHandler(async (req, res) => {
    const { isCompleted } = req.body;
    const job = await ServiceRequest.findById(req.params.id);

    if (!job) return ApiResponse.error(res, 'Job not found', 404);

    const technician = await Technician.findOne({ user: req.user._id });
    if (!technician || job.technician.toString() !== technician._id.toString()) {
        return ApiResponse.error(res, 'Not authorized', 403);
    }

    const requirement = job.requirements.id(req.params.reqId);
    if (!requirement) return ApiResponse.error(res, 'Requirement not found', 404);

    requirement.isCompleted = isCompleted;
    await job.save();

    return ApiResponse.success(res, job, 'Requirement status updated');
});

const getInventory = asyncHandler(async (req, res) => {
    const technician = await Technician.findOne({ user: req.user._id });
    if (!technician) return ApiResponse.error(res, 'Technician profile not found', 404);
    return ApiResponse.success(res, technician.inventory || [], 'Inventory fetched');
});

const requestParts = asyncHandler(async (req, res) => {
    const { parts } = req.body;
    const job = await ServiceRequest.findById(req.params.id);
    if (!job) return ApiResponse.error(res, 'Job not found', 404);

    const technician = await Technician.findOne({ user: req.user._id });
    if (!technician || job.technician.toString() !== technician._id.toString()) {
        return ApiResponse.error(res, 'Not authorized', 403);
    }
    // Logic for requesting parts from local store/admin
    return ApiResponse.success(res, null, 'Parts requested successfully');
});

const addRepairDetails = asyncHandler(async (req, res) => {
    const { details } = req.body;
    const job = await ServiceRequest.findById(req.params.id);
    if (!job) return ApiResponse.error(res, 'Job not found', 404);

    const technician = await Technician.findOne({ user: req.user._id });
    if (!technician || job.technician.toString() !== technician._id.toString()) {
        return ApiResponse.error(res, 'Not authorized', 403);
    }
    job.repairDetails = details;
    await job.save();
    return ApiResponse.success(res, job, 'Repair details added');
});

// Wallet Controllers
const getTechnicianWallet = asyncHandler(async (req, res) => {
    const technician = await Technician.findOne({ user: req.user._id });
    if (!technician) return ApiResponse.error(res, 'Technician not found', 404);

    const transactions = await Transaction.find({ technician: technician._id })
        .sort({ createdAt: -1 })
        .limit(20);

    return ApiResponse.success(res, {
        balance: technician.walletBalance,
        transactions
    }, 'Wallet details fetched');
});

const getWithdrawalHistory = asyncHandler(async (req, res) => {
    const technician = await Technician.findOne({ user: req.user._id });
    if (!technician) return ApiResponse.error(res, 'Technician not found', 404);

    const withdrawals = await Transaction.find({
        technician: technician._id,
        type: 'settlement'
    }).sort({ createdAt: -1 });

    return ApiResponse.success(res, withdrawals, 'Withdrawal history fetched');
});

const requestWithdrawal = asyncHandler(async (req, res) => {
    const { amount } = req.body;
    const technician = await Technician.findOne({ user: req.user._id });

    if (!technician) return ApiResponse.error(res, 'Technician not found', 404);
    if (technician.walletBalance < amount) {
        return ApiResponse.error(res, 'Insufficient balance', 400);
    }

    technician.walletBalance -= amount;
    await technician.save();

    const transaction = await Transaction.create({
        technician: technician._id,
        type: 'settlement',
        amount: amount,
        description: 'Withdrawal Request',
        status: 'pending',
        paymentMethod: 'bank_transfer'
    });

    return ApiResponse.success(res, transaction, 'Withdrawal requested');
});

const getBankAccounts = asyncHandler(async (req, res) => {
    const technician = await Technician.findOne({ user: req.user._id });
    return ApiResponse.success(res, technician.bankAccounts || [], 'Bank accounts fetched');
});

const addBankAccount = asyncHandler(async (req, res) => {
    const technician = await Technician.findOne({ user: req.user._id });
    if (!technician) return ApiResponse.error(res, 'Technician not found', 404);

    // Simple stub for now, assuming bankAccounts field exists or created
    const account = req.body;
    if (!technician.bankAccounts) technician.bankAccounts = [];
    technician.bankAccounts.push(account);
    await technician.save();

    return ApiResponse.success(res, technician.bankAccounts, 'Bank account added');
});

const getEarningsSummary = asyncHandler(async (req, res) => {
    const technician = await Technician.findOne({ user: req.user._id });
    return ApiResponse.success(res, { total: technician.totalEarnings }, 'Earnings fetched');
});

module.exports = {
    getProfile,
    getNotifications,
    markNotificationRead,
    clearAllNotifications,
    updateProfile,
    getJobs,
    getJob,
    acceptJob,
    updateJobStatus,
    getInventory,
    sendQuote,
    sendBill,
    requestParts,
    addRepairDetails,
    getProducts,
    requestProduct,
    addPart,
    requestCustomOrder,
    getVehicleHistory,
    placeWholesaleOrder,
    getWholesaleOrders,
    payWholesaleOrderWithWallet,
    payWholesaleOrderWithCash,
    cancelJob,
    updateRequirementStatus,
    getTechnicianWallet,
    getWithdrawalHistory,
    requestWithdrawal,
    getBankAccounts,
    addBankAccount,
    getEarningsSummary,
    respondToPartRequest
};
