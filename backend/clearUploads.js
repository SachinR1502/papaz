const fs = require('fs');
const path = require('path');

const UPLOADS_DIR = path.join(__dirname, 'uploads');

const clearUploadsFolder = () => {
    console.log('🗑️  Clearing uploads folder...\n');

    if (!fs.existsSync(UPLOADS_DIR)) {
        console.log('⚠️  Uploads folder does not exist. Nothing to clear.');
        return;
    }

    try {
        const files = fs.readdirSync(UPLOADS_DIR);

        if (files.length === 0) {
            console.log('✅ Uploads folder is already empty.');
            return;
        }

        let deletedCount = 0;
        let errorCount = 0;

        files.forEach(file => {
            const filePath = path.join(UPLOADS_DIR, file);

            try {
                const stats = fs.statSync(filePath);

                if (stats.isDirectory()) {
                    // Recursively delete directory
                    fs.rmSync(filePath, { recursive: true, force: true });
                    console.log(`   ✓ Deleted folder: ${file}`);
                } else {
                    // Delete file
                    fs.unlinkSync(filePath);
                    console.log(`   ✓ Deleted file: ${file}`);
                }
                deletedCount++;
            } catch (err) {
                console.error(`   ✗ Error deleting ${file}:`, err.message);
                errorCount++;
            }
        });

        console.log('\n═══════════════════════════════════════');
        console.log(`✅ Deleted: ${deletedCount} items`);
        if (errorCount > 0) {
            console.log(`⚠️  Errors: ${errorCount} items`);
        }
        console.log('═══════════════════════════════════════\n');
        console.log('✅ Uploads folder cleared successfully!');

    } catch (err) {
        console.error('❌ Error clearing uploads folder:', err.message);
        process.exit(1);
    }
};

// Run the cleanup
clearUploadsFolder();
