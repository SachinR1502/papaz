const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ApiResponse = require('../utils/apiResponse');

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select('-otp');

            if (!req.user) {
                return ApiResponse.error(res, 'User not found in system', 401);
            }

            return next();
        } catch (error) {
            console.error('[AUTH MIDDLEWARE] Token error:', error.message);
            return ApiResponse.error(res, 'Not authorized, token failed', 401);
        }
    }

    if (!token) {
        return ApiResponse.error(res, 'Not authorized, no session token found', 401);
    }
};

// Admin only middleware - must be used after protect
const adminOnly = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        return ApiResponse.error(res, 'Access denied. Administrator privileges required.', 403);
    }
};

module.exports = { protect, adminOnly };
