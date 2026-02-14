const Device = require('../models/Device');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get logged in user's devices
// @route   GET /api/customer/devices
// @route   GET /api/technician/devices
// @route   GET /api/supplier/devices
// @route   GET /api/admin/devices
const getMyDevices = asyncHandler(async (req, res) => {
    const devices = await Device.find({ user: req.user._id }).sort({ lastActive: -1 });

    return ApiResponse.success(res, devices, 'Devices fetched successfully');
});

// @desc    Register or Update Device Info
// @route   POST /api/*/device (or /api/auth/device)
const registerDevice = asyncHandler(async (req, res) => {
    let { name, type, deviceId, fcmToken, location } = req.body;

    // Fallback if name is missing but type is present
    if (!name && type) name = `Unknown ${type} Device`;
    if (!name) name = 'Unknown Device';

    if (!deviceId) {
        return ApiResponse.error(res, 'Device ID is required', 400);
    }

    // Capture IP from request
    const ip = req.ip || req.connection.remoteAddress;

    let device = await Device.findOne({ deviceId, user: req.user._id });

    if (device) {
        // Update existing device
        device.name = name;
        device.type = type || device.type;
        device.ip = ip;
        if (location) device.location = location;
        if (fcmToken) device.fcmToken = fcmToken; // If we support push notifications later
        device.lastActive = Date.now();
        device.isCurrent = true;
        await device.save();
    } else {
        // Create new device
        // Ideally mark others as not current, but multiple devices can be active. 
        // Logic for current session usually handled by JWT but tracking 'isCurrent' is nice for UI.
        await Device.updateMany({ user: req.user._id }, { isCurrent: false });

        device = await Device.create({
            user: req.user._id,
            name,
            type: type || 'Unknown',
            deviceId,
            ip,
            location,
            isCurrent: true
        });
    }

    return ApiResponse.success(res, device, 'Device registered successfully');
});

// @desc    Remove a device (Logout from that device)
// @route   DELETE /api/*/devices/:id
const removeDevice = asyncHandler(async (req, res) => {
    const device = await Device.findOne({ _id: req.params.id, user: req.user._id });

    if (!device) {
        return ApiResponse.error(res, 'Device not found', 404);
    }

    await Device.findByIdAndDelete(req.params.id);

    return ApiResponse.success(res, null, 'Device removed successfully');
});

// @desc    Get devices of a specific user (Admin only)
// @route   GET /api/admin/users/:id/devices
const getUserDevices = asyncHandler(async (req, res) => {
    const devices = await Device.find({ user: req.params.id }).sort({ lastActive: -1 });
    return ApiResponse.success(res, devices, 'User devices fetched successfully');
});

module.exports = {
    getMyDevices,
    removeDevice,
    getUserDevices,
    registerDevice
};
