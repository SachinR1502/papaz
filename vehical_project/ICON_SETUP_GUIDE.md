# How to Set PAPAZ Logo as App Icon

## Problem
Android requires PNG format for app icons, not JPEG. The logo.jpeg file won't work properly.

## Solution
Convert your logo to PNG format and replace the existing icon files.

---

## Step-by-Step Instructions

### Option 1: Online Conversion (Easiest)

1. **Convert JPEG to PNG:**
   - Go to: https://www.iloveimg.com/convert-to-png
   - Upload `assets/logo/logo.jpeg`
   - Download the converted PNG file

2. **Replace Icon Files:**
   
   **Main Icon (1024x1024px recommended):**
   ```bash
   # Resize to 1024x1024 and save as:
   assets/images/icon.png
   ```

   **Android Adaptive Icon Foreground (432x432px):**
   ```bash
   # Resize to 432x432 and save as:
   assets/images/android-icon-foreground.png
   ```

   **Android Monochrome Icon (432x432px, grayscale):**
   ```bash
   # Convert to grayscale, resize to 432x432, save as:
   assets/images/android-icon-monochrome.png
   ```

### Option 2: Using ImageMagick (Command Line)

```bash
# Install ImageMagick (if not installed)
brew install imagemagick

# Convert and resize main icon
convert assets/logo/logo.jpeg -resize 1024x1024 assets/images/icon.png

# Convert and resize adaptive icon foreground
convert assets/logo/logo.jpeg -resize 432x432 assets/images/android-icon-foreground.png

# Convert to monochrome
convert assets/logo/logo.jpeg -colorspace Gray -resize 432x432 assets/images/android-icon-monochrome.png
```

### Option 3: Using Expo's Icon Generator

```bash
# Use Expo's built-in icon generator
npx expo-generate-icons assets/logo/logo.jpeg
```

---

## Recommended Icon Sizes

| File | Size | Purpose |
|------|------|---------|
| `icon.png` | 1024x1024 | Main app icon (all platforms) |
| `android-icon-foreground.png` | 432x432 | Android adaptive icon foreground |
| `android-icon-background.png` | 432x432 | Android adaptive icon background |
| `android-icon-monochrome.png` | 432x432 | Android monochrome icon (themed) |
| `splash.png` | 1284x2778 | Splash screen |

---

## After Replacing Icons

### 1. Clean Build
```bash
cd android
./gradlew clean
```

### 2. Rebuild Native Code
```bash
cd ..
npx expo prebuild --clean
```

### 3. Build APK
```bash
cd android
./gradlew assembleRelease
```

### 4. Find APK
```
android/app/build/outputs/apk/release/app-release.apk
```

---

## Quick Fix (Temporary)

If you just want to test quickly:

1. Copy your logo:
   ```bash
   # Make sure it's PNG format first!
   cp assets/logo/logo.png assets/images/icon.png
   ```

2. Rebuild:
   ```bash
   cd android
   ./gradlew clean
   ./gradlew assembleRelease
   ```

---

## Verification

After building, check the APK:

1. Install the APK on your device
2. Look at the home screen
3. The PAPAZ logo should now appear

If it still doesn't show:
- Make sure the PNG files are properly sized
- Make sure there's no transparency issues
- Try using a solid background color

---

## Current Configuration

Your `app.json` is now set to use:
- Main icon: `./assets/images/icon.png`
- Android foreground: `./assets/images/android-icon-foreground.png`
- Android background: `./assets/images/android-icon-background.png` (light blue)
- Android monochrome: `./assets/images/android-icon-monochrome.png`

Just replace these PNG files with your PAPAZ logo in PNG format!
