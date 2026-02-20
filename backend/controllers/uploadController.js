const path = require('path');
const fs = require('fs');
const File = require('../models/File');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

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
        if (!req.file) {
            return ApiResponse.error(res, 'No file uploaded', 400);
        }

        const category = getCategory(req.file.mimetype);
        const filename = req.file.key.split('/').pop();

        const fileDoc = new File({
            filename,
            originalName: req.file.originalname,
            mimetype: req.file.mimetype,
            size: req.file.size,
            path: req.file.location,
            category,
            uploadedBy: req.user?.id || null
        });

        await fileDoc.save();

        return ApiResponse.success(res, {
            url: req.file.location,
            filename,
            mimetype: req.file.mimetype,
            size: req.file.size,
            category
        }, 'File uploaded successfully');
    } catch (error) {
        console.error('Upload error:', error);
        return ApiResponse.error(res, error.message || 'Server error uploading file', 500);
    }
};

const uploadMultipleFiles = async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return ApiResponse.error(res, 'No files uploaded', 400);
        }

        const uploadResults = [];

        for (const file of req.files) {
            const category = getCategory(file.mimetype);
            const filename = file.key.split('/').pop();

            const fileDoc = new File({
                filename,
                originalName: file.originalname,
                mimetype: file.mimetype,
                size: file.size,
                path: file.location,
                category,
                uploadedBy: req.user?.id || null
            });

            await fileDoc.save();

            uploadResults.push({
                url: file.location,
                filename,
                mimetype: file.mimetype,
                size: file.size,
                category
            });
        }

        return ApiResponse.success(res, uploadResults, `${req.files.length} files uploaded successfully`);
    } catch (error) {
        console.error('Bulk upload error:', error);
        return ApiResponse.error(res, error.message || 'Server error uploading files', 500);
    }
};

// @desc    Get file from Disk, S3 or MongoDB (Legacy)
// @route   GET /api/files/:filename
// @access  Public
const getFile = async (req, res) => {
    try {
        const { filename } = req.params;

        const file = await File.findOne({ filename });

        if (!file) {
            return res.status(404).json({ message: 'File not found' });
        }

        // Strategy 1: Redirect to S3 (New Files)
        if (file.path && file.path.startsWith('http')) {
            return res.redirect(file.path);
        }

        // Strategy 2: Serve from Disk (Local Files)
        if (file.path && fs.existsSync(file.path)) {
            res.setHeader('Content-Type', file.mimetype);
            res.setHeader('Content-Disposition', `inline; filename="${file.originalName}"`);
            const fileStream = fs.createReadStream(file.path);
            fileStream.pipe(res);
            return;
        }

        // Strategy 3: Serve from MongoDB Base64 (Legacy Files)
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
    uploadMultipleFiles,
    getFile
};


