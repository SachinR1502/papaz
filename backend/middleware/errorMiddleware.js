const ApiResponse = require('../utils/apiResponse');

/**
 * Universal error handling middleware
 */
const errorHandler = (err, req, res, next) => {
    console.error(`[ERROR] ${req.method} ${req.url}:`, err.message);

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors).map(val => val.message).join(', ');
        return ApiResponse.error(res, message, 400);
    }

    // Mongoose duplicate key error
    if (err.code === 11000) {
        return ApiResponse.error(res, 'Duplicate field value entered', 400);
    }

    // Default error
    console.error(`[ERROR_DETAILS]:`, err);
    ApiResponse.error(
        res,
        err.message || 'Server Error',
        err.statusCode || 500,
        err.stack
    );
};

module.exports = errorHandler;
