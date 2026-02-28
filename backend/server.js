require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const mongoose = require('mongoose');

// Connect Database
console.log(`[DB] connecting to ${process.env.MONGO_URI?.split('@')[1] || 'LOCAL/UNKNOWN'}`);
connectDB();

const app = express();

// Security Middleware
app.use(helmet());
app.use(compression());
app.use(cors());

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10000, // Increased for development (was 2000)
    message: 'Too many requests from this IP, please try again later.',
    // Skip rate limiting for localhost/development
    skip: (req) => {
        const ip = req.ip || req.connection.remoteAddress;
        const isLocalhost = ip === '127.0.0.1' ||
            ip === '::1' ||
            ip === 'localhost' ||
            ip?.includes('127.0.0.1') ||
            ip?.includes('::ffff:127.0.0.1');

        if (isLocalhost) {
            console.log('[RateLimit] Skipping rate limit for localhost:', ip);
        }
        return isLocalhost;
    }
});
app.use(limiter);

// Simple Request Logging for debugging
app.use((req, res, next) => {
    if (req.url.includes('/upload') || req.url.includes('/files')) {
        console.log(`[REQ] ${req.method} ${req.url} - ${req.headers['content-type']}`);
    }
    next();
});

// Body Parser
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.get('/', (req, res) => {
    res.status(200).send('Vehicle Project API is running');
});

// Health Check Route (Used by Docker/Platform)
app.get('/health', async (req, res) => {
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';

    // S3 Check
    let s3Status = 'unknown';
    try {
        const { S3Client, ListBucketsCommand } = require('@aws-sdk/client-s3');
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
        s3Status = `error: ${error.message}`;
    }

    // Razorpay Check
    let razorpayStatus = 'unknown';
    try {
        const { razorpay } = require('./utils/razorpayService');
        await razorpay.orders.all({ count: 1 });
        razorpayStatus = 'connected';
    } catch (error) {
        razorpayStatus = `error: ${error.message}`;
    }

    res.status(200).json({
        status: 'OK',
        database: dbStatus,
        s3: s3Status,
        razorpay: razorpayStatus,
        timestamp: new Date().toISOString()
    });
});


// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/payment', require('./routes/razorpayRoutes'));
app.use('/api/technician', require('./routes/technicianRoutes'));
app.use('/api/customer', require('./routes/customerRoutes'));
app.use('/api/supplier', require('./routes/supplierRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));
app.use('/api/files', require('./routes/uploadRoutes')); // Serve files from MongoDB
app.use('/api/health', require('./routes/helthRoutes'));
app.use('/api/common', require('./routes/commonRoutes'));
// Removed redundant /api/health/health

// Serve static assets (fallback for old files)
app.use('/uploads', express.static('uploads'));

// Global Error Handler (Must be after routes)
const errorHandler = require('./middleware/errorMiddleware');
app.use(errorHandler);

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // Allows mobile & web to connect
        methods: ["GET", "POST"]
    },
    transports: ['polling', 'websocket'], // Important for AWS stability
    pingTimeout: 60000, // Helps keep connection alive over long distances
    pingInterval: 25000
});

// Set io to app
app.set('io', io);

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // User registers their ID by joining a room
    socket.on('register', (userId) => {
        if (userId) {
            socket.join(userId);
            console.log(`[SOCKET] Session ${socket.id} mapped to User ${userId}`);
        }
    });

    socket.on('call_offer', (data) => {
        const { targetId } = data;
        io.to(targetId).emit('call_offer', data);
        console.log(`Offer sent from ${data.callerId} to ${targetId}`);
    });

    socket.on('call_answer', (data) => {
        const { targetId } = data;
        io.to(targetId).emit('call_answer', data);
        console.log(`Answer sent to ${targetId}`);
    });

    socket.on('ice_candidate', (data) => {
        const { targetId } = data;
        io.to(targetId).emit('ice_candidate', data);
        console.log(`ICE candidate sent to ${targetId}`);
    });

    // Chat messages
    socket.on('send_message', (data) => {
        const { targetId } = data;
        io.to(targetId).emit('new_message', data);
        console.log(`Message sent to ${targetId}`);
    });

    socket.on('mark_read', (data) => {
        const { targetId, conversationId } = data;
        io.to(targetId).emit('messages_read', { conversationId });
        console.log(`Read receipt sent to ${targetId}`);
    });

    // Real-time location tracking
    socket.on('track_location', (data) => {
        const { targetId, latitude, longitude, jobId } = data;
        io.to(targetId).emit('technician_location', { latitude, longitude, jobId });
        // Silent logs to avoid flooding console
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`[SERVER] Signaling & API server running on port ${PORT}`);
    console.log(`[SERVER] Environment: ${process.env.NODE_ENV || 'development'}`);
});
