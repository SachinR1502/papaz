/**
 * Centralized API response helper to ensure consistency across all endpoints
 */
class ApiResponse {
    static success(res, data, message = 'Success', statusCode = 200) {
        return res.status(statusCode).json({
            success: true,
            message,
            data
        });
    }

    static error(res, message = 'Internal Server Error', statusCode = 500, error = null) {
        return res.status(statusCode).json({
            success: false,
            message,
            error: process.env.NODE_ENV === 'development' ? error : undefined
        });
    }
}

module.exports = ApiResponse;
