const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const { uploadFile, getFile } = require('../controllers/uploadController');
const { protect } = require('../middleware/authMiddleware');

// Upload file
router.post('/', protect, upload.single('file'), uploadFile);

// Get file (public access for viewing)
router.get('/:filename', getFile);

module.exports = router;
