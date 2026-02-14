const fs = require('fs');
const path = require('path');

/**
 * Migration script to move files from flat uploads/ structure
 * to organized uploads/type/ structure
 */

const uploadsDir = path.join(__dirname, 'uploads');

// File type mappings
const typeMap = {
    images: /\.(jpg|jpeg|png|gif|webp|svg)$/i,
    videos: /\.(mp4|mov|avi|webm)$/i,
    audio: /\.(m4a|mp3|wav|aac|ogg)$/i,
    documents: /\.(pdf|doc|docx|txt|xlsx|xls)$/i
};

function migrateFiles() {
    console.log('🔄 Starting file migration...\n');

    // Ensure subdirectories exist
    Object.keys(typeMap).forEach(subdir => {
        const subdirPath = path.join(uploadsDir, subdir);
        if (!fs.existsSync(subdirPath)) {
            fs.mkdirSync(subdirPath, { recursive: true });
            console.log(`✅ Created directory: ${subdir}/`);
        }
    });

    // Get all files in uploads root
    if (!fs.existsSync(uploadsDir)) {
        console.log('❌ uploads/ directory not found');
        return;
    }

    const files = fs.readdirSync(uploadsDir);
    let movedCount = 0;
    let skippedCount = 0;

    files.forEach(filename => {
        const filePath = path.join(uploadsDir, filename);
        const stat = fs.statSync(filePath);

        // Skip directories
        if (stat.isDirectory()) {
            skippedCount++;
            return;
        }

        // Determine file type
        let targetSubdir = null;
        for (const [subdir, regex] of Object.entries(typeMap)) {
            if (regex.test(filename)) {
                targetSubdir = subdir;
                break;
            }
        }

        if (!targetSubdir) {
            console.log(`⚠️  Unknown file type, skipping: ${filename}`);
            skippedCount++;
            return;
        }

        // Move file
        const targetPath = path.join(uploadsDir, targetSubdir, filename);

        try {
            fs.renameSync(filePath, targetPath);
            console.log(`✅ Moved: ${filename} → ${targetSubdir}/`);
            movedCount++;
        } catch (error) {
            console.error(`❌ Failed to move ${filename}:`, error.message);
            skippedCount++;
        }
    });

    console.log(`\n📊 Migration complete!`);
    console.log(`   Moved: ${movedCount} files`);
    console.log(`   Skipped: ${skippedCount} items`);
}

// Run migration
migrateFiles();
