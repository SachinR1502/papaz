const Customer = require('../models/Customer');
const Technician = require('../models/Technician');
const Supplier = require('../models/Supplier');
const ServiceRequest = require('../models/ServiceRequest');
const Order = require('../models/Order');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const Settings = require('../models/Settings');
const { createNotification } = require('../utils/notificationService');

// @desc    Get Admin Dashboard Stats
// @route   GET /api/admin/dashboard
const getDashboard = async (req, res) => {
    try {
        // Get counts
        const totalCustomers = await Customer.countDocuments();
        const totalTechnicians = await Technician.countDocuments();
        const totalSuppliers = await Supplier.countDocuments();

        // Job stats
        const totalJobs = await ServiceRequest.countDocuments();
        const activeJobs = await ServiceRequest.countDocuments({
            status: { $nin: ['completed', 'cancelled'] }
        });
        const completedJobs = await ServiceRequest.countDocuments({ status: 'completed' });

        // Pending approvals
        const pendingTechnicians = await Technician.countDocuments({ isApproved: false });
        const pendingSuppliers = await Supplier.countDocuments({ isApproved: false });
        const pendingApprovals = pendingTechnicians + pendingSuppliers;

        // Revenue calculation
        const paidTransactions = await Transaction.find({
            type: { $in: ['payment', 'earnings'] },
            status: 'completed'
        });
        const totalRevenue = paidTransactions
            .filter(t => t.amount > 0)
            .reduce((sum, t) => sum + t.amount, 0);

        // Platform commission
        let commissionRate = 0.10;
        const currentSettings = await Settings.findOne();
        if (currentSettings) commissionRate = currentSettings.commissionRate / 100;

        const platformCommission = totalRevenue * commissionRate;

        // Revenue History
        const { period = '7' } = req.query; // Default to 7 days
        const days = parseInt(period);
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const revenueHistoryData = await Transaction.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate },
                    type: { $in: ['payment', 'earnings'] },
                    amount: { $gt: 0 }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    total: { $sum: '$amount' }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        const revenueHistory = revenueHistoryData.map(d => ({
            date: d._id,
            amount: d.total
        }));

        // Recent activity
        const recentJobs = await ServiceRequest.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('customer', 'fullName')
            .populate('technician', 'fullName');

        res.json({
            stats: {
                totalCustomers,
                totalTechnicians,
                totalSuppliers,
                totalJobs,
                activeJobs,
                completedJobs,
                pendingApprovals,
                totalRevenue,
                platformCommission,
                revenueHistory
            },
            recentJobs: recentJobs.map(job => ({
                id: job._id,
                status: job.status,
                customer: job.customer?.fullName || 'Unknown',
                technician: job.technician?.fullName || 'Unassigned',
                createdAt: job.createdAt,
                totalAmount: job.bill?.totalAmount || job.quote?.totalAmount || 0
            }))
        });
    } catch (error) {
        console.error('Admin getDashboard Error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get All Users (Customers, Technicians, Suppliers)
// @route   GET /api/admin/users
const getAllUsers = async (req, res) => {
    try {
        const { type, status, search, page = 1, limit = 20 } = req.query;
        const skip = (page - 1) * limit;

        let users = [];

        if (!type || type === 'customer') {
            const customers = await Customer.find()
                .populate('user', 'name email phoneNumber status')
                .skip(skip)
                .limit(parseInt(limit));
            users = users.concat(customers.map(c => ({
                id: c._id,
                userId: c.user?._id,
                name: c.fullName,
                email: c.email || 'Not specified',
                phone: c.phoneNumber || c.user?.phoneNumber,
                type: 'customer',
                status: c.user?.status || 'active',
                isApproved: true,
                businessName: 'Personal Account',
                location: c.address || c.city || 'Not specified',
                walletBalance: c.walletBalance,
                earning: 0,
                jobsCount: 0,
                createdAt: c.createdAt,
                profileCompleted: c.user?.profileCompleted || false
            })));
        }

        if (!type || type === 'technician') {
            let techQuery = {};
            if (status === 'pending') techQuery.isApproved = false;
            if (status === 'approved') techQuery.isApproved = true;

            const technicians = await Technician.find(techQuery)
                .populate('user', 'phoneNumber status profileCompleted')
                .skip(skip)
                .limit(parseInt(limit));
            users = users.concat(technicians.map(t => ({
                id: t._id,
                userId: t.user?._id,
                name: t.fullName,
                email: 'Not specified', // Technicians don't have email in model
                phone: t.user?.phoneNumber || 'Not specified',
                type: 'technician',
                status: t.user?.status || (t.isApproved ? 'approved' : 'pending'),
                isApproved: t.isApproved,
                businessName: t.garageName,
                location: t.address || 'Not specified',
                walletBalance: t.walletBalance,
                earning: t.totalEarnings,
                jobsCount: 0,
                rating: t.rating,
                createdAt: t.createdAt,
                profileCompleted: t.user?.profileCompleted || false
            })));
        }

        if (!type || type === 'supplier') {
            let supplierQuery = {};
            if (status === 'pending') supplierQuery.isApproved = false;
            if (status === 'approved') supplierQuery.isApproved = true;

            const suppliers = await Supplier.find(supplierQuery)
                .populate('user', 'phoneNumber status profileCompleted')
                .skip(skip)
                .limit(parseInt(limit));
            users = users.concat(suppliers.map(s => ({
                id: s._id,
                userId: s.user?._id,
                name: s.fullName,
                email: s.email || 'Not specified',
                phone: s.phoneNumber || s.user?.phoneNumber,
                type: 'supplier',
                status: s.user?.status || (s.isApproved ? 'approved' : 'pending'),
                isApproved: s.isApproved,
                businessName: s.storeName,
                location: s.address || s.city || 'Not specified',
                walletBalance: s.walletBalance,
                earning: s.revenue,
                jobsCount: 0,
                rating: s.rating,
                createdAt: s.createdAt,
                profileCompleted: s.user?.profileCompleted || false
            })));
        }

        res.json({
            users: users,
            total: users.length, // Simple count for now
        });
    } catch (error) {
        console.error('Admin getAllUsers Error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get Pending Approvals (Technicians & Suppliers)
// @route   GET /api/admin/users/pending
const getPendingUsers = async (req, res) => {
    try {
        const pendingTechnicians = await Technician.find({ isApproved: false })
            .populate('user', 'name email phoneNumber');
        const pendingSuppliers = await Supplier.find({ isApproved: false })
            .populate('user', 'name email phoneNumber');

        const pending = [
            ...pendingTechnicians.map(t => ({
                id: t._id,
                name: t.fullName || t.user?.name,
                type: 'technician',
                businessName: t.garageName,
                location: t.address || 'Not specified',
                appliedDate: t.createdAt,
                status: 'pending',
                phone: t.phoneNumber || t.user?.phoneNumber,
                registrationType: t.registrationType,
                udyamNo: t.udyamNo,
                serviceRadius: t.serviceRadius,
                dob: t.dob,
                aadharNo: t.aadharNo,
                panNo: t.panNo,
                profession: t.profession,
                workType: t.workType,
                vehicleTypes: t.vehicleTypes,
                technicalSkills: t.technicalSkills,
                softSkills: t.softSkills,
                locationName: t.locationName,
                gpsLocation: t.location,
                bankDetails: t.bankAccounts?.[0] ? {
                    holderName: t.bankAccounts[0].accountHolderName,
                    accountNo: t.bankAccounts[0].accountNumber,
                    ifsc: t.bankAccounts[0].ifscCode,
                    isVerified: t.bankAccounts[0].isVerified
                } : null,
                documents: t.documents ? [
                    { type: 'ID Proof', verified: t.documents.idProof },
                    { type: 'Garage Photo', verified: t.documents.garagePhoto },
                    { type: 'License', verified: t.documents.license }
                ] : []
            })),
            ...pendingSuppliers.map(s => ({
                id: s._id,
                supplierId: s.supplierId,
                name: s.fullName || s.user?.name,
                type: 'supplier',
                businessName: s.storeName,
                location: `${s.address}, ${s.city}`,
                appliedDate: s.createdAt,
                status: 'pending',
                phone: s.phoneNumber || s.user?.phoneNumber,
                alternatePhoneNumber: s.alternatePhoneNumber,
                email: s.email,
                gstin: s.gstin,
                panNumber: s.panNumber,
                aadharNumber: s.aadharNumber,
                udyamNumber: s.udyamNumber,
                businessCategories: s.businessCategories,
                otherCategory: s.otherCategory,
                kycPercentage: s.kycPercentage,
                bankDetails: s.bankDetails || (s.bankAccounts?.[0] ? {
                    holderName: s.bankAccounts[0].accountHolderName,
                    accountNo: s.bankAccounts[0].accountNumber,
                    ifsc: s.bankAccounts[0].ifscCode,
                    bankName: s.bankAccounts[0].bankName
                } : null),
                locationName: s.locationName,
                gpsLocation: s.location,
                documents: s.documents ? [
                    { type: 'GST Certificate', url: s.documents.gstCertificate },
                    { type: 'PAN Card', url: s.documents.panCard },
                    { type: 'Aadhaar Card', url: s.documents.aadharCard },
                    { type: 'Electricity Bill', url: s.documents.electricityBill },
                    { type: 'Udyam Certificate', url: s.documents.udyamCertificate },
                    { type: 'Cancelled Cheque', url: s.documents.cancelledCheque }
                ].filter(d => d.url) : []
            }))
        ];

        res.json(pending);
    } catch (error) {
        console.error('Admin getPendingUsers Error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Approve User (Technician or Supplier)
// @route   POST /api/admin/users/:id/approve
const approveUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { type } = req.body; // 'technician' or 'supplier'

        let profile;
        if (type === 'supplier') {
            profile = await Supplier.findByIdAndUpdate(id, { isApproved: true }, { new: true }).populate('user');
        } else {
            profile = await Technician.findByIdAndUpdate(id, { isApproved: true }, { new: true }).populate('user');
        }

        if (!profile) {
            return res.status(404).json({ message: 'User profile not found' });
        }

        // Also update the linked User's state
        if (profile.user) {
            await User.findByIdAndUpdate(profile.user._id, {
                profileCompleted: true,
                status: 'active'
            });

            // Notify the user
            createNotification(req, {
                recipient: profile.user._id,
                title: 'Account Approved!',
                body: `Congratulations! Your ${type} profile has been approved. You can now access your dashboard.`,
                type: 'system',
                relatedId: profile._id
            }).catch(e => console.error('Approval Notification Error:', e));
        }

        res.json({ success: true, message: `${type} approved successfully`, user: profile });
    } catch (error) {
        console.error('Admin approveUser Error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Reject User (Technician or Supplier)
// @route   POST /api/admin/users/:id/reject
const rejectUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { type, reason } = req.body;

        let user;
        if (type === 'supplier') {
            user = await Supplier.findByIdAndUpdate(id, {
                isApproved: false,
                rejectionReason: reason
            }, { new: true });
        } else {
            user = await Technician.findByIdAndUpdate(id, {
                isApproved: false,
                rejectionReason: reason
            }, { new: true });
        }

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Notify the user
        if (user.user) {
            createNotification(req, {
                recipient: user.user,
                title: 'Application Update',
                body: `Your application as a ${type} has been rejected. Reason: ${reason || 'Not specified'}. Please contact support or update your details.`,
                type: 'system',
                relatedId: user._id
            }).catch(e => console.error('Rejection Notification Error:', e));
        }

        res.json({ success: true, message: `${type} rejected`, user });
    } catch (error) {
        console.error('Admin rejectUser Error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get All Jobs (for Admin)
// @route   GET /api/admin/jobs
const getAllJobs = async (req, res) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;
        const skip = (page - 1) * limit;

        let query = {};
        if (status) query.status = status;

        const jobs = await ServiceRequest.find(query)
            .populate('customer', 'fullName')
            .populate('technician', 'fullName garageName')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await ServiceRequest.countDocuments(query);

        res.json({
            jobs: jobs.map(job => ({
                id: job._id,
                status: job.status,
                vehicleModel: job.vehicleModel,
                customer: job.customer?.fullName || 'Unknown',
                technician: job.technician?.fullName || 'Unassigned',
                garage: job.technician?.garageName,
                totalAmount: job.bill?.totalAmount || job.quote?.totalAmount || 0,
                paymentStatus: job.bill?.status || 'pending',
                createdAt: job.createdAt,
                completedAt: job.completedAt
            })),
            total,
            page: parseInt(page),
            pages: Math.ceil(total / limit)
        });
    } catch (error) {
        console.error('Admin getAllJobs Error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get Detailed Job Info
// @route   GET /api/admin/jobs/:id
const getJobDetails = async (req, res) => {
    try {
        const job = await ServiceRequest.findById(req.params.id)
            .populate('customer', 'fullName email phoneNumber')
            .populate('technician', 'fullName garageName phoneNumber rating');

        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        res.json(job);
    } catch (error) {
        console.error('Admin getJobDetails Error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Cancel Job by Admin
// @route   POST /api/admin/jobs/:id/cancel
const cancelJob = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;

        const job = await ServiceRequest.findByIdAndUpdate(id, {
            status: 'cancelled',
            cancellationReason: reason || 'Cancelled by Admin',
            cancelledBy: 'admin'
        }, { new: true });

        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        res.json({ success: true, message: 'Job cancelled by admin', job });
    } catch (error) {
        console.error('Admin cancelJob Error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get All Transactions
// @route   GET /api/admin/transactions
const getAllTransactions = async (req, res) => {
    try {
        const { type, page = 1, limit = 50, period } = req.query;
        const skip = (page - 1) * limit;

        let query = {};
        if (type) query.type = type;

        if (period) {
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - parseInt(period));
            query.createdAt = { $gte: startDate };
        }

        const transactions = await Transaction.find(query)
            .populate('customer', 'fullName')
            .populate('technician', 'fullName')
            .populate('supplier', 'fullName storeName')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Transaction.countDocuments(query);

        res.json({
            transactions,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / limit)
        });
    } catch (error) {
        console.error('Admin getAllTransactions Error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get Platform Settings
// @route   GET /api/admin/settings
const getSettings = async (req, res) => {
    try {
        let settings = await Settings.findOne();
        if (!settings) {
            settings = await Settings.create({
                maintenanceMode: false,
                allowRegistrations: true,
                commissionRate: 10,
                payoutSchedule: 'Weekly',
                currency: 'INR',
                minWithdrawal: 100,
                maxWithdrawal: 50000
            });
        }
        res.json(settings);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Update Platform Settings
// @route   PUT /api/admin/settings
const updateSettings = async (req, res) => {
    try {
        const updates = req.body;
        let settings = await Settings.findOneAndUpdate({}, updates, { new: true, upsert: true });
        res.json({ success: true, settings });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get Service Zones
// @route   GET /api/admin/service-zones
const getServiceZones = async (req, res) => {
    try {
        let settings = await Settings.findOne();
        if (!settings) {
            settings = await Settings.create({});
        }
        res.json(settings.serviceZones || []);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Update Service Zones
// @route   POST /api/admin/service-zones
const updateServiceZones = async (req, res) => {
    try {
        const { zones } = req.body;
        let settings = await Settings.findOneAndUpdate({}, { serviceZones: zones }, { new: true, upsert: true });
        res.json({ success: true, zones: settings.serviceZones });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get Reports/Analytics
// @route   GET /api/admin/reports
// @desc    Get Reports/Analytics
// @route   GET /api/admin/reports
// @desc    Get Reports/Analytics
// @route   GET /api/admin/reports
const getReports = async (req, res) => {
    try {
        const { period = 'week' } = req.query; // 'week', 'month', 'year'

        let startDate = new Date();
        let aggregationPipeline = [];
        let dateFormat = '';
        let fillLogic = null;

        if (period === 'month') {
            // Last 30 days grouped by week
            // Actually request says: 'current all week data' for the month
            // Let's do start of current month to now
            startDate = new Date();
            startDate.setDate(1); // 1st of current month
            startDate.setHours(0, 0, 0, 0);

            dateFormat = '%Y-%U'; // Year-Week

            aggregationPipeline = [
                {
                    $match: {
                        createdAt: { $gte: startDate },
                        type: { $in: ['payment', 'earnings'] },
                        amount: { $gt: 0 }
                    }
                },
                {
                    $group: {
                        _id: { $dateToString: { format: dateFormat, date: '$createdAt' } },
                        total: { $sum: '$amount' }
                    }
                },
                { $sort: { _id: 1 } }
            ];

            fillLogic = (data) => {
                const filled = [];
                // Find start and end week numbers
                const start = startDate;
                const end = new Date();

                // Helper to get week number
                const getWeek = (d) => {
                    const onejan = new Date(d.getFullYear(), 0, 1);
                    return Math.ceil((((d - onejan) / 86400000) + onejan.getDay() + 1) / 7);
                };

                const startWeek = getWeek(start);
                const endWeek = getWeek(end);

                for (let w = startWeek; w <= endWeek; w++) {
                    const id = `${start.getFullYear()}-${w.toString().padStart(2, '0')}`;
                    const found = data.find(d => d._id === id);
                    filled.push({
                        _id: `Week ${w}`,
                        total: found ? found.total : 0,
                        rawId: id
                    });
                }
                return filled;
            };

        } else if (period === 'year') {
            // Current year grouped by month
            startDate = new Date(new Date().getFullYear(), 0, 1); // Jan 1st of current year
            dateFormat = '%Y-%m';

            aggregationPipeline = [
                {
                    $match: {
                        createdAt: { $gte: startDate },
                        type: { $in: ['payment', 'earnings'] },
                        amount: { $gt: 0 }
                    }
                },
                {
                    $group: {
                        _id: { $dateToString: { format: dateFormat, date: '$createdAt' } },
                        total: { $sum: '$amount' }
                    }
                },
                { $sort: { _id: 1 } }
            ];

            fillLogic = (data) => {
                const filled = [];
                const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                for (let m = 0; m < 12; m++) {
                    const monthNum = (m + 1).toString().padStart(2, '0');
                    const id = `${startDate.getFullYear()}-${monthNum}`;
                    const found = data.find(d => d._id === id);

                    // Only push up to current month if we want to limit future chart space, 
                    // but usually charting libraries handle 12 months fine.
                    // Let's show all 12 so the year view is complete
                    filled.push({
                        _id: months[m],
                        total: found ? found.total : 0
                    });
                }
                return filled;
            };

        } else {
            // Default 'week' -> Last 7 days daily
            startDate = new Date();
            startDate.setDate(startDate.getDate() - 6); // Go back 6 days + today = 7 days
            startDate.setHours(0, 0, 0, 0);

            dateFormat = '%Y-%m-%d';

            aggregationPipeline = [
                {
                    $match: {
                        createdAt: { $gte: startDate },
                        type: { $in: ['payment', 'earnings'] },
                        amount: { $gt: 0 }
                    }
                },
                {
                    $group: {
                        _id: { $dateToString: { format: dateFormat, date: '$createdAt' } },
                        total: { $sum: '$amount' }
                    }
                },
                { $sort: { _id: 1 } }
            ];

            fillLogic = (data) => {
                const filled = [];
                for (let i = 0; i < 7; i++) {
                    const date = new Date(startDate);
                    date.setDate(date.getDate() + i);
                    const dateStr = date.toISOString().split('T')[0];
                    const found = data.find(d => d._id === dateStr);
                    filled.push({
                        _id: dateStr,
                        total: found ? found.total : 0
                    });
                }
                return filled;
            };
        }

        // Execute Revenue Aggregation
        const revenueData = await Transaction.aggregate(aggregationPipeline);
        const revenueByDay = fillLogic(revenueData);

        // Jobs by status (Simple count for the period)
        const jobsByStatus = await ServiceRequest.aggregate([
            { $match: { createdAt: { $gte: startDate } } },
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);

        // Top technicians (Global or Period? Usually Global for "Top Performer" status, but let's keep it consistent)
        // Let's keep existing logic which seems to be global stats based on approval, or we can filter by period too.
        // For now preventing breaking changes, keeping global.
        const topTechnicians = await Technician.find({ isApproved: true })
            .sort({ totalEarnings: -1 })
            .limit(5)
            .select('fullName garageName totalEarnings rating jobsCompleted');

        res.json({
            period,
            jobsByStatus: jobsByStatus.reduce((acc, s) => {
                acc[s._id] = s.count;
                return acc;
            }, {}),
            revenueByDay,
            topTechnicians
        });
    } catch (error) {
        console.error('Admin getReports Error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Update User Details
// @route   PUT /api/admin/users/:id
const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { type, ...updateData } = req.body;

        if (!type) {
            return res.status(400).json({ message: 'User type is required' });
        }

        // Map generic field names if they are sent from a common admin form
        if (updateData.name && !updateData.fullName) updateData.fullName = updateData.name;
        if (updateData.phone && !updateData.phoneNumber) updateData.phoneNumber = updateData.phone;

        if (type === 'technician' && updateData.businessName && !updateData.garageName) {
            updateData.garageName = updateData.businessName;
        } else if (type === 'supplier' && updateData.businessName && !updateData.storeName) {
            updateData.storeName = updateData.businessName;
        }

        let profileModel;
        if (type === 'customer') profileModel = Customer;
        else if (type === 'technician') profileModel = Technician;
        else if (type === 'supplier') profileModel = Supplier;
        else return res.status(400).json({ message: 'Invalid user type' });

        const userProfile = await profileModel.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true, runValidators: true }
        ).populate('user');

        if (!userProfile) {
            return res.status(404).json({ message: 'User profile not found' });
        }

        // Also update the linked User's phone if provided
        const newPhone = updateData.phoneNumber || updateData.phone;
        if (newPhone && userProfile.user) {
            await User.findByIdAndUpdate(userProfile.user._id, { phoneNumber: newPhone });
        }

        res.json({ success: true, message: 'User updated successfully', user: userProfile });
    } catch (error) {
        console.error('Admin updateUser Error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Suspend/Unsuspend User
// @route   POST /api/admin/users/:id/suspend
const suspendUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { type } = req.body; // 'customer', 'technician', 'supplier'

        let profile;
        if (type === 'customer') profile = await Customer.findById(id).populate('user');
        else if (type === 'technician') profile = await Technician.findById(id).populate('user');
        else if (type === 'supplier') profile = await Supplier.findById(id).populate('user');

        if (!profile || !profile.user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const newStatus = profile.user.status === 'suspended' ? 'active' : 'suspended';
        await User.findByIdAndUpdate(profile.user._id, { status: newStatus });

        res.json({ success: true, message: `User ${newStatus === 'suspended' ? 'suspended' : 'activated'} successfully`, status: newStatus });
    } catch (error) {
        console.error('Admin suspendUser Error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get User Activity History
// @route   GET /api/admin/users/:id/activity
const getUserActivity = async (req, res) => {
    try {
        const { id } = req.params;
        const { type } = req.query;

        let activity = [];

        if (type === 'technician') {
            const jobs = await ServiceRequest.find({ technician: id })
                .sort({ createdAt: -1 })
                .limit(20)
                .populate('customer', 'fullName');

            activity = jobs.map(j => ({
                id: j._id,
                type: 'job',
                title: `Service: ${j.vehicleModel}`,
                subtitle: `Customer: ${j.customer?.fullName || 'Unknown'}`,
                date: j.createdAt,
                status: j.status,
                amount: j.bill?.totalAmount || 0
            }));
        } else if (type === 'customer') {
            const [jobs, orders] = await Promise.all([
                ServiceRequest.find({ customer: id }).sort({ createdAt: -1 }).limit(10),
                Order.find({ customer: id }).sort({ createdAt: -1 }).limit(10).populate('supplier', 'storeName')
            ]);

            activity = [
                ...jobs.map(j => ({
                    id: j._id,
                    type: 'service',
                    title: `Service: ${j.vehicleModel}`,
                    subtitle: `Status: ${j.status}`,
                    date: j.createdAt,
                    status: j.status,
                    amount: j.bill?.totalAmount || 0
                })),
                ...orders.map(o => ({
                    id: o._id,
                    type: 'order',
                    title: `Order #${o._id.toString().slice(-6).toUpperCase()}`,
                    subtitle: `Store: ${o.supplier?.storeName || 'Unknown'}`,
                    date: o.createdAt,
                    status: o.status,
                    amount: o.totalAmount
                }))
            ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        } else if (type === 'supplier') {
            const orders = await Order.find({ supplier: id })
                .sort({ createdAt: -1 })
                .limit(20)
                .populate('customer', 'fullName');

            activity = orders.map(o => ({
                id: o._id,
                type: 'sale',
                title: `Order #${o._id.toString().slice(-6).toUpperCase()}`,
                subtitle: `Customer: ${o.customer?.fullName || 'Unknown'}`,
                date: o.createdAt,
                status: o.status,
                amount: o.totalAmount
            }));
        }

        res.json(activity);
    } catch (error) {
        console.error('Admin getUserActivity Error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Verify/Approve a specific document
// @route   POST /api/admin/users/:id/verify-doc
const verifyDocument = async (req, res) => {
    try {
        const { id } = req.params;
        const { type, docType, verified } = req.body;

        let profile;
        if (type === 'technician') profile = await Technician.findById(id);
        else if (type === 'supplier') profile = await Supplier.findById(id);

        if (!profile) return res.status(404).json({ message: 'User not found' });

        // Update the specific document's verified status
        if (profile.documents) {
            const docIndex = profile.documents.findIndex(d => d.type === docType);
            if (docIndex !== -1) {
                profile.documents[docIndex].verified = verified;
                await profile.save();
            }
        }

        res.json({ success: true, documents: profile.documents });
    } catch (error) {
        console.error('Admin verifyDoc Error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    getDashboard,
    getAllUsers,
    getPendingUsers,
    approveUser,
    rejectUser,
    getAllJobs,
    getJobDetails,
    cancelJob,
    getAllTransactions,
    getSettings,
    updateSettings,
    getReports,
    updateUser,
    suspendUser,
    getUserActivity,
    verifyDocument,
    getServiceZones,
    updateServiceZones
};
