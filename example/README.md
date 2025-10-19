# Document Scanner Example App

This is an example React Native app demonstrating the usage of `react-native-document-scanner` on both iOS and Android.

## Features Demonstrated

- Basic document scanning
- Multi-page document scanning
- Image quality settings
- Displaying scanned images
- Error and cancellation handling

## Prerequisites

### iOS
- Xcode 12.0 or later
- CocoaPods installed
- iOS 13.0+ device or simulator
- macOS for development

### Android
- Android Studio
- Android SDK (API level 35 recommended)
- Java Development Kit (JDK) 11 or later
- Android device or emulator with API level 21+
- Google Play Services (for ML Kit)
- Build Tools 35.0.0

## Installation

### Quick Start

#### Option 1: Automated Setup (Recommended)

```bash
cd example
./setup.sh
```

This script will:
- ✅ Install Node dependencies
- ✅ Setup iOS (if on macOS)
- ✅ Setup Android
- ✅ Verify configuration

#### Option 2: Manual Setup

```bash
cd example
yarn install
# This automatically runs 'pod install' for iOS
```

### Platform-Specific Guides

- 🤖 **Android**: See [ANDROID_BUILD_QUICK_START.md](./ANDROID_BUILD_QUICK_START.md) for quick Android build guide
- 📱 **iOS & Android**: See [BUILD.md](./BUILD.md) for comprehensive build instructions

### Quick Commands

```bash
# Install dependencies
yarn install

# Run on Android
yarn android

# Run on iOS
yarn ios

# Start Metro bundler
yarn start
```

## Running the App

### iOS

```bash
yarn ios
```

### Android

```bash
yarn android
```

### Full Build Guide

See **[BUILD.md](./BUILD.md)** for:
- ✅ Complete build instructions
- ✅ Platform-specific setup
- ✅ Troubleshooting common issues
- ✅ Performance tips
- ✅ Production builds
- ✅ Debugging tips

## Testing New Architecture

### Enable New Architecture on iOS

1. Open `ios/Podfile`
2. Add or uncomment:
```ruby
ENV['RCT_NEW_ARCH_ENABLED'] = '1'
```
3. Run:
```bash
cd ios
pod install
cd ..
yarn ios
```

### Enable New Architecture on Android

1. Open `android/gradle.properties`
2. Add or set:
```properties
newArchEnabled=true
```
3. Run:
```bash
yarn android
```

## Usage

1. Launch the app
2. Tap the "START SCAN" button
3. Point your camera at a document
4. The scanner will automatically detect document edges
5. Follow on-screen instructions to capture
6. For multi-page documents, tap "+" to add more pages
7. Tap "Save" when done
8. Scanned images will appear at the bottom of the screen

## Code Overview

### Main App Component

```javascript
import { launchScanner } from 'react-native-document-scanner';

const App = () => {
  const [images, setImages] = useState([]);

  const startScan = async () => {
    const results = await launchScanner({ quality: 0.8 });
    if (results?.images?.length) {
      setImages(results.images);
    }
  };

  return (
    <View>
      <Button title="START SCAN" onPress={startScan} />
      {images.map(image => (
        <Image key={image.fileName} source={{ uri: image.uri }} />
      ))}
    </View>
  );
};
```

## Platform-Specific Notes

### iOS
- Requires camera permission in Info.plist (already configured)
- Uses VisionKit framework
- Supports both PNG and JPEG output based on quality setting

### Android
- Requires camera permission in AndroidManifest.xml (already configured)
- Uses Google ML Kit Document Scanner
- Requires Google Play Services
- Always outputs JPEG format

## Troubleshooting

### iOS Issues

**Error: "Camera permission denied"**
- Solution: Check that `NSCameraUsageDescription` is in `ios/DocumentScan/Info.plist`

**Error: "Module not found"**
- Solution: Run `cd ios && pod install && cd ..`

### Android Issues

**Error: "Incompatible Java and Gradle" or "Cannot sync the project"**
- Solution: The example uses Gradle 8.5 which is compatible with Java 21
- If your Android Studio uses a different Java version, you have two options:
  1. Update Android Studio to use Java 21 (in Preferences > Build, Execution, Deployment > Build Tools > Gradle > Gradle JDK)
  2. Or change Gradle version in `android/gradle/wrapper/gradle-wrapper.properties`:
     - For Java 17: Use `gradle-7.6-all.zip`
     - For Java 11: Use `gradle-7.3-all.zip`

**Error: "ML Kit not available"**
- Solution: Ensure Google Play Services is installed on your device/emulator
- For emulators: Use an image with Google Play Services (not AOSP)

**Error: "CAMERA permission not granted"**
- Solution: Check `android/app/src/main/AndroidManifest.xml` has camera permission
- Manually grant permission in device settings if needed

**Build Error**
- Solution: Clean and rebuild
```bash
cd android
./gradlew clean
cd ..
yarn android
```

### General Issues

**Metro bundler cache issues**
```bash
yarn start --reset-cache
```

**Node modules issues**
```bash
rm -rf node_modules
yarn install
```

## Modifying the Example

### Change Image Quality

Edit `App.js`:
```javascript
const results = await launchScanner({ 
  quality: 0.5  // Range: 0.0 to 1.0
});
```

### Enable Base64 Output

Edit `App.js`:
```javascript
const results = await launchScanner({ 
  quality: 0.8,
  includeBase64: true  // Adds base64 string to result
});
```

### Access Scanned Data

```javascript
const results = await launchScanner();

if (results.didCancel) {
  console.log('User cancelled');
} else if (results.error) {
  console.log('Error:', results.errorMessage);
} else if (results.images) {
  results.images.forEach(image => {
    console.log('URI:', image.uri);
    console.log('Size:', image.fileSize);
    console.log('Dimensions:', image.width, 'x', image.height);
    console.log('Type:', image.type);
    console.log('Filename:', image.fileName);
    if (image.base64) {
      console.log('Base64:', image.base64.substring(0, 50) + '...');
    }
  });
}
```

## Project Structure

```
example/
├── android/          # Android native project
├── ios/              # iOS native project
├── App.js            # Main app component
├── index.js          # Entry point
├── package.json      # Dependencies
└── README.md         # This file
```

## React Native Version

This example is built with **React Native 0.78.0** and **React 18.3.1**. The `react-native-document-scanner` module requires React Native 0.78.0 or higher for production use (to support stable new architecture features).

## Additional Resources

- [Main README](../README.md) - Full module documentation
- [Migration Guide](../MIGRATION.md) - Upgrade instructions
- [Changelog](../CHANGELOG.md) - Version history

## Support

If you encounter issues:
1. Check this README's troubleshooting section
2. Review the main [README](../README.md)
3. Check [existing issues](https://github.com/dariyd/react-native-document-scanner/issues)
4. Create a new issue with details about your problem

## License

MIT

