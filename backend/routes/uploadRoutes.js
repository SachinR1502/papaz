const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const { uploadFile, uploadMultipleFiles, getFile } = require('../controllers/uploadController');
const { protect } = require('../middleware/authMiddleware');

// Upload single file
router.post('/', protect, upload.single('file'), uploadFile);

// Upload multiple files (bulk)
router.post('/bulk', protect, upload.array('files', 10), uploadMultipleFiles);

// Get file (public access for viewing)
router.get('/:filename', getFile);

module.exports = router;
