const path = require('path');
const fs = require('fs');
const File = require('../models/File');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

// Ensure uploads folder exists (for temporary storage during upload)
const ensureUploadsFolderExists = () => {
    const uploadsDir = path.join(__dirname, '../uploads');

    // Create main uploads directory if it doesn't exist
    if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
        console.log('✅ Created uploads directory:', uploadsDir);
    }

    // Create subdirectories for different file types
    const subdirs = ['images', 'videos', 'audio', 'documents'];
    subdirs.forEach(subdir => {
        const subdirPath = path.join(uploadsDir, subdir);
        if (!fs.existsSync(subdirPath)) {
            fs.mkdirSync(subdirPath, { recursive: true });
            console.log(`✅ Created ${subdir} subdirectory:`, subdirPath);
        }
    });
};

// Initialize uploads folder on module load
ensureUploadsFolderExists();

// Determine category based on mimetype
const getCategory = (mimetype) => {
    if (mimetype.startsWith('image/')) return 'images';
    if (mimetype.startsWith('video/')) return 'videos';
    if (mimetype.startsWith('audio/')) return 'audio';
    return 'documents';
};

// @desc    Upload file and store path in MongoDB
// @route   POST /api/upload
// @access  Public
const uploadFile = async (req, res) => {
    try {
        // Ensure uploads folder exists before processing
        ensureUploadsFolderExists();

        if (!req.file) {
            return ApiResponse.error(res, 'No file uploaded', 400);
        }

        // Determine category
        const category = getCategory(req.file.mimetype);

        // Create unique filename
        const filename = req.file.filename;

        // Save to MongoDB (Store PATH instead of DATA)
        const fileDoc = new File({
            filename,
            originalName: req.file.originalname,
            mimetype: req.file.mimetype,
            size: req.file.size,
            path: req.file.path, // Store the disk path
            category,
            uploadedBy: req.user?.id || null
        });

        await fileDoc.save();

        // Return URL that points to our file serving endpoint
        // You can also use direct static path if exposed: `/uploads/${category}/${filename}`
        const fileUrl = `/api/files/${filename}`;

        console.log('✅ File uploaded to Disk & DB:', {
            filename,
            mimetype: req.file.mimetype,
            size: req.file.size,
            category,
            url: fileUrl
        });

        return ApiResponse.success(res, {
            url: fileUrl,
            filename,
            mimetype: req.file.mimetype,
            size: req.file.size,
            category
        }, 'File uploaded successfully');
    } catch (error) {
        console.error('Upload error:', error);

        // Clean up file if DB save fails
        if (req.file?.path && fs.existsSync(req.file.path)) {
            try { fs.unlinkSync(req.file.path); } catch (e) { }
        }

        return ApiResponse.error(res, error.message || 'Server error uploading file', 500);
    }
};

// @desc    Get file from Disk or MongoDB (Legacy)
// @route   GET /api/files/:filename
// @access  Public
const getFile = async (req, res) => {
    try {
        const { filename } = req.params;

        const file = await File.findOne({ filename });

        if (!file) {
            return res.status(404).json({ message: 'File not found' });
        }

        // Strategy 1: Serve from Disk (New Files)
        if (file.path && fs.existsSync(file.path)) {
            // Set headers
            res.setHeader('Content-Type', file.mimetype);
            res.setHeader('Content-Disposition', `inline; filename="${file.originalName}"`);

            // Stream file
            const fileStream = fs.createReadStream(file.path);
            fileStream.pipe(res);
            return;
        }

        // Strategy 2: Serve from MongoDB Base64 (Legacy Files)
        if (file.data) {
            const fileBuffer = Buffer.from(file.data, 'base64');
            res.set({
                'Content-Type': file.mimetype,
                'Content-Length': fileBuffer.length,
                'Cache-Control': 'public, max-age=31536000',
            });
            res.send(fileBuffer);
            return;
        }

        return res.status(404).json({ message: 'File content missing' });

    } catch (error) {
        console.error('Get file error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    uploadFile,
    getFile
};

