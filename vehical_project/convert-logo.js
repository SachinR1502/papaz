const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function convertLogo() {
    const logoPath = path.join(__dirname, 'assets/logo/logo.jpeg');
    const outputDir = path.join(__dirname, 'assets/images');

    console.log('🎨 Converting PAPAZ logo to PNG icons...\n');

    try {
        // Check if logo exists
        if (!fs.existsSync(logoPath)) {
            console.error('❌ Logo file not found:', logoPath);
            console.log('Please ensure assets/logo/logo.jpeg exists');
            return;
        }

        // Main icon (1024x1024)
        await sharp(logoPath)
            .resize(1024, 1024, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
            .png()
            .toFile(path.join(outputDir, 'icon.png'));
        console.log('✅ Created icon.png (1024x1024)');

        // Android adaptive icon foreground (432x432)
        await sharp(logoPath)
            .resize(432, 432, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
            .png()
            .toFile(path.join(outputDir, 'android-icon-foreground.png'));
        console.log('✅ Created android-icon-foreground.png (432x432)');

        // Android monochrome icon (432x432, grayscale)
        await sharp(logoPath)
            .resize(432, 432, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
            .grayscale()
            .png()
            .toFile(path.join(outputDir, 'android-icon-monochrome.png'));
        console.log('✅ Created android-icon-monochrome.png (432x432, grayscale)');

        // Favicon (48x48)
        await sharp(logoPath)
            .resize(48, 48, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
            .png()
            .toFile(path.join(outputDir, 'favicon.png'));
        console.log('✅ Created favicon.png (48x48)');

        console.log('\n🎉 All icons created successfully!');
        console.log('\nNext steps:');
        console.log('1. cd android');
        console.log('2. ./gradlew clean');
        console.log('3. ./gradlew assembleRelease');
        console.log('\nYour APK will have the PAPAZ logo! 🚀');

    } catch (error) {
        console.error('❌ Error converting logo:', error.message);
        console.log('\nTrying alternative method without sharp...');
        console.log('Please install sharp: npm install sharp');
        console.log('Or manually convert logo.jpeg to PNG and replace the files in assets/images/');
    }
}

convertLogo();
