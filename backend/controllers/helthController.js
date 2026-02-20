const ApiResponse = require('../utils/apiResponse');
const mongoose = require('mongoose');
const { S3Client, ListBucketsCommand } = require('@aws-sdk/client-s3');
const { razorpay } = require('../utils/razorpayService');

// Health Controller
const healthController = async (req, res) => {
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';

    // S3 Check
    let s3Status = 'unknown';
    try {
        const s3 = new S3Client({
            region: process.env.AWS_REGION,
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            }
        });
        await s3.send(new ListBucketsCommand({}));
        s3Status = 'connected';
    } catch (error) {
        // console.error('[HEALTH] S3 Connection failed:', error.message);
        s3Status = `error: ${error.message}`;
    }

    // Razorpay Check
    let razorpayStatus = 'unknown';
    try {
        // Test connectivity by fetching orders (limited to 1)
        await razorpay.orders.all({ count: 1 });
        razorpayStatus = 'connected';
    } catch (error) {
        // console.error('[HEALTH] Razorpay Check failed:', error.message);
        razorpayStatus = `error: ${error.message}`;
    }

    return ApiResponse.success(res, {
        database: dbStatus,
        s3: s3Status,
        razorpay: razorpayStatus,
        timestamp: new Date().toISOString()
    }, 'System health status');
};

module.exports = healthController;
