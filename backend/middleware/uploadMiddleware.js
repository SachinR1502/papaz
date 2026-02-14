const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads folder and subdirectories exist
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

// Initialize on module load
ensureUploadsFolderExists();

// Determine subdirectory based on file type
const getSubdirectory = (mimetype) => {
    if (mimetype.startsWith('image/')) return 'images';
    if (mimetype.startsWith('video/')) return 'videos';
    if (mimetype.startsWith('audio/')) return 'audio';
    return 'documents';
};

const storage = multer.diskStorage({
    destination(req, file, cb) {
        // Ensure folder exists before each upload
        ensureUploadsFolderExists();

        const subdir = getSubdirectory(file.mimetype);
        const destinationPath = path.join('uploads', subdir);
        cb(null, destinationPath);
    },
    filename(req, file, cb) {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
        cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});

function checkFileType(file, cb) {
    // Expanded file type support
    const filetypes = /jpg|jpeg|png|gif|webp|svg|mp4|mov|avi|mp3|m4a|wav|aac|pdf|doc|docx/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb('Error: Images, Videos, Audio, and Documents only!');
    }
}

const upload = multer({
    storage,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    }
});

module.exports = upload;
