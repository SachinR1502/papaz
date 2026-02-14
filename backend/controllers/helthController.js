const ApiResponse = require('../utils/apiResponse');

// Health Controller
const healthController = (req, res) => {
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    return ApiResponse.success(res, {
        database: dbStatus,
        timestamp: new Date().toISOString()
    }, 'System healthy');
};

module.exports = healthController;
