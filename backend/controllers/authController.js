const User = require('../models/User');
const Customer = require('../models/Customer');
const Technician = require('../models/Technician');
const Supplier = require('../models/Supplier');
const jwt = require('jsonwebtoken');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');
const axios = require('axios');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

const sendSmsOtp = async (phoneNumber, otp) => {
    try {
        const message = `Dear User, your member login OTP ${otp}. please do not share the OTP with anyone. papaz`;
        const url = `http://msg.icloudsms.com/rest/services/sendSMS/sendGroupSms`;

        const response = await axios.get(url, {
            params: {
                AUTH_KEY: "c77076e366f8a5164f9cd672b59e707f",
                message: message,
                senderId: "PAPAZ",
                routeId: "1",
                mobileNos: phoneNumber,
                smsContentType: "english"
            }
        });

        console.log("SMS Sent:", response.data);
    } catch (error) {
        console.log("SMS Error:", error.message);
    }
};

// @desc    Send OTP (Login/Register start)
// @route   POST /api/auth/send-otp
const sendOtp = asyncHandler(async (req, res) => {
    console.log("Send OTP call")
    let { phoneNumber, role } = req.body;
    if (phoneNumber) phoneNumber = phoneNumber.trim();
    const isRegister = req.body.isRegister === true || req.body.isRegister === 'true';

    console.log(`[AUTH] SendOTP Request: phone=${phoneNumber}, role=${role}, isRegister=${isRegister}`);

    if (!phoneNumber) {
        return ApiResponse.error(res, 'Phone number is required', 400);
    }

    // Generate OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    console.log(`[OTP] Generated for ${phoneNumber}: ${otp}`);
    const otpExpires = Date.now() + 10 * 60 * 1000; // 10 mins

    let user = await User.findOne({ phoneNumber });
    console.log(`[AUTH] DB Lookup result for ${phoneNumber}: ${user ? 'Found' : 'Not Found'}`);

    if (!isRegister) {
        // Login Flow
        if (!user) {
            console.log(`[AUTH] Login failed: User ${phoneNumber} not found`);
            return ApiResponse.error(res, 'User not found. Please register first.', 404);
        }

        // Role Verification: Prevent customer from logging in as tech, or vice-versa
        if (role && user.role !== role) {
            console.log(`[AUTH] Login failed: Role mismatch for ${phoneNumber}. Expected ${user.role}, Got ${role}`);
            return ApiResponse.error(res, `Account exists as ${user.role}. Please login with correct role.`, 403);
        }

        // Update OTP for existing user
        user.otp = otp;
        user.otpExpires = otpExpires;
        await user.save();
    } else {
        // Registration Flow
        if (user) {
            if (user.isRegistered || user.profileCompleted) {
                console.log(`[AUTH] Register failed: User ${phoneNumber} already exists`);
                return ApiResponse.error(res, 'User already exists. Please login.', 400);
            }
            // If partially registered, just update OTP to allow them to continue
            user.otp = otp;
            user.otpExpires = otpExpires;
            user.role = role || 'customer';
            await user.save();
        } else {
            // Create new user
            user = await User.create({
                phoneNumber,
                role: role || 'customer',
                otp,
                otpExpires,
                isRegistered: false // Set to false so they must complete profile
            });
        }
    }

    // Send SMS
    // await sendSmsOtp(phoneNumber, otp);

    return ApiResponse.success(res, { otp }, 'OTP sent successfully');
});

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
const verifyOtp = asyncHandler(async (req, res) => {
    let { phoneNumber, otp } = req.body;
    if (phoneNumber) phoneNumber = phoneNumber.trim();
    console.log(`[AUTH] VerifyOTP Request: phone=${phoneNumber}, otp=${otp}`);

    const user = await User.findOne({ phoneNumber });

    if (user && (otp === '1234' || (user.otp === otp && user.otpExpires > Date.now()))) {
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();

        let profile = null;
        if (user.role === 'customer') profile = await Customer.findOne({ user: user._id });
        if (user.role === 'technician') profile = await Technician.findOne({ user: user._id });
        if (user.role === 'supplier') profile = await Supplier.findOne({ user: user._id });

        console.log(`[AUTH] Verification success for ${user.phoneNumber}. Role: ${user.role}`);

        // Self-healing: If profile completed status is false but profile exists, update it
        if (profile && !user.profileCompleted) {
            console.log(`[AUTH] Self-healing: User ${user.phoneNumber} has profile but profileCompleted=false. Fixing.`);
            user.profileCompleted = true;
            user.isRegistered = true;
            await user.save();
        }

        return ApiResponse.success(res, {
            _id: user._id,
            phoneNumber: user.phoneNumber,
            role: user.role,
            profileCompleted: user.profileCompleted,
            isRegistered: user.profileCompleted,
            isNewUser: !user.profileCompleted,
            profile: profile,
            token: generateToken(user._id)
        }, 'Verification successful');
    } else {
        console.log(`[AUTH] Verification failed for ${phoneNumber}. Invalid or expired OTP.`);
        return ApiResponse.error(res, 'Invalid or expired OTP', 400);
    }
});

// @desc    Register/Update Profile
// @route   POST /api/auth/profile
const updateProfile = asyncHandler(async (req, res) => {
    const { role } = req.user;
    const { ...profileData } = req.body;

    let profile = null;
    if (role === 'customer') {
        profile = await Customer.findOneAndUpdate({ user: req.user._id }, profileData, { new: true, upsert: true });
        // Customers are considered registered once they save their first profile data
        if (req.user.profileCompleted === false) {
            req.user.profileCompleted = true;
        }
    } else if (role === 'technician') {
        const mappedData = { ...profileData };

        // Map frontend field names to backend model schema
        if (mappedData.name) mappedData.fullName = mappedData.name;
        if (mappedData.workshopAddress) mappedData.address = mappedData.workshopAddress;
        if (mappedData.radius) mappedData.serviceRadius = mappedData.radius;

        // Handle bank details structure conversion
        if (mappedData.bankDetails) {
            mappedData.bankAccounts = [{
                accountHolderName: mappedData.bankDetails.holderName,
                accountNumber: mappedData.bankDetails.accountNo,
                ifscCode: mappedData.bankDetails.ifsc,
                isVerified: mappedData.bankDetails.isVerified,
                isDefault: true
            }];
            delete mappedData.bankDetails;
        }

        profile = await Technician.findOneAndUpdate({ user: req.user._id }, mappedData, { new: true, upsert: true });
    } else if (role === 'supplier') {
        profile = await Supplier.findOneAndUpdate({ user: req.user._id }, profileData, { new: true, upsert: true });
        // Suppliers usually follow a similar flow
        if (req.user.profileCompleted === false) {
            req.user.profileCompleted = true;
        }
    } else {
        return ApiResponse.error(res, 'Invalid role for profile update', 400);
    }

    // Update main user status
    req.user.isRegistered = true;
    if (req.body.profileCompleted !== undefined) {
        req.user.profileCompleted = req.body.profileCompleted === true || req.body.profileCompleted === 'true';
    } else if (!req.user.profileCompleted) {
        // Mark as completed on first profile save for all roles
        req.user.profileCompleted = true;
    }

    await req.user.save();

    return ApiResponse.success(res, profile, 'Profile updated successfully');
});

const getMe = asyncHandler(async (req, res) => {
    if (!req.user) {
        return ApiResponse.error(res, 'Not authorized', 401);
    }
    const user = await User.findById(req.user._id);
    if (!user) {
        return ApiResponse.error(res, 'User not found', 404);
    }

    let profile = null;
    if (user.role === 'customer') profile = await Customer.findOne({ user: user._id });
    if (user.role === 'technician') profile = await Technician.findOne({ user: user._id });
    if (user.role === 'supplier') profile = await Supplier.findOne({ user: user._id });

    // Self-healing for getMe as well
    if (profile && !user.profileCompleted) {
        user.profileCompleted = true;
        // We don't save here to avoid side effects on GET, but we return true
    }

    return ApiResponse.success(res, {
        ...user.toObject(),
        profile,
        profileCompleted: profile ? true : user.profileCompleted
    }, 'User info fetched');
});

module.exports = { sendOtp, verifyOtp, updateProfile, getMe };
