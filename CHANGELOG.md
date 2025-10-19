# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2025-10-19

### 🎉 Major Release - Android Support & New Architecture

This is a major release that adds Android support and React Native new architecture (Fabric/TurboModules) compatibility while maintaining full backward compatibility with version 1.x.

### Added

#### Platform Support
- ✅ **Android support** using Google ML Kit Document Scanner API
  - Minimum Android API level 21 (Android 5.0)
  - Automatic document detection and edge detection
  - Multi-page scanning support
  - Automatic perspective correction
  - Same API as iOS for cross-platform consistency

#### Architecture Support
- ✅ **React Native new architecture support** (Fabric/TurboModules)
  - Works with React Native 0.71+ new architecture
  - Backward compatible with old architecture
  - Automatic detection and adaptation
  - iOS: TurboModule with codegen
  - Android: TurboReactPackage with new architecture flag

#### Developer Experience
- ✅ **TypeScript definitions** (`index.d.ts`)
  - Full type safety for all APIs
  - IntelliSense support in VS Code and other IDEs
  - Comprehensive JSDoc comments

#### Documentation
- ✅ **Comprehensive README updates**
  - Cross-platform installation instructions
  - Platform differences documentation
  - New architecture setup guide
  - Troubleshooting section
  - Usage examples for both platforms

- ✅ **Migration guide** (`MIGRATION.md`)
  - Detailed upgrade instructions from 1.x to 2.0
  - Platform-specific setup steps
  - Common issues and solutions
  - Testing checklist

- ✅ **Android implementation docs**
  - ML Kit integration details
  - Requirements and dependencies
  - Publishing instructions

### Changed

#### iOS
- Updated podspec to support both old and new architecture
- Added conditional compilation for new architecture (`RCT_NEW_ARCH_ENABLED`)
- Improved module implementation with better architecture detection

#### Android
- Implemented full document scanning functionality using ML Kit
- Added activity result handling for scan results
- Implemented image processing with quality and base64 options
- Added BuildConfig flag for architecture detection

#### JavaScript
- Enhanced module loading with fallback mechanism
- Better error handling for missing modules
- Improved Promise/callback dual support

#### Build Configuration
- Updated Android SDK versions (compileSdkVersion 33, minSdkVersion 21)
- Added ML Kit dependency (`play-services-mlkit-document-scanner:16.0.0-beta1`)
- Added codegen configuration for new architecture
- Updated package.json with new metadata and keywords

#### Example Project
- Updated Android manifest with camera permission
- Verified iOS Info.plist has camera permission
- Example app works on both platforms

### Technical Details

#### New Files
- `src/NativeDocumentScanner.ts` - Codegen spec for new architecture
- `index.d.ts` - TypeScript definitions
- `MIGRATION.md` - Migration guide
- `CHANGELOG.md` - This file

#### Modified Files
- `index.js` - Enhanced module loading for both architectures
- `package.json` - Updated version, description, and configuration
- `ios/DocumentScanner.h` - Added new architecture support
- `ios/DocumentScanner.m` - Added TurboModule implementation
- `react-native-document-scanner.podspec` - New architecture dependencies
- `android/build.gradle` - Updated dependencies and SDK versions
- `android/src/main/java/com/reactlibrary/DocumentScannerModule.java` - Complete ML Kit implementation
- `android/src/main/java/com/reactlibrary/DocumentScannerPackage.java` - TurboReactPackage support
- `README.md` - Comprehensive documentation updates
- `android/README.md` - Android-specific documentation

### Dependencies

#### React Native
- **Minimum version: 0.78.0** (required for stable new architecture support)
- React 18.2.0+

#### iOS
- VisionKit (iOS 13.0+)
- React Native new architecture dependencies (optional, for new arch):
  - React-Codegen
  - RCT-Folly
  - ReactCommon/turbomodule/core

#### Android
- Google ML Kit Document Scanner: `16.0.0-beta1`
- AndroidX libraries (included with React Native)
- Google Play Services (required on device)
- Target SDK: API level 35 (Android 15) - Google Play Store requirement
- Minimum SDK: API level 21 (Android 5.0)

### Platform Parity

The following features are now available on both platforms with identical APIs:

| Feature | iOS | Android |
|---------|-----|---------|
| Document scanning | ✅ | ✅ |
| Multi-page scanning | ✅ | ✅ |
| Image quality control | ✅ | ✅ |
| Base64 encoding | ✅ | ✅ |
| Cancel handling | ✅ | ✅ |
| Error handling | ✅ | ✅ |
| Old architecture | ✅ | ✅ |
| New architecture | ✅ | ✅ |

### Backward Compatibility

✅ **Fully backward compatible** - No breaking changes from 1.x. All existing code will continue to work without modifications.

### Known Limitations

- Android requires Google Play Services (not available on some devices/emulators)
- ML Kit Document Scanner is in beta on Android
- Android always outputs JPEG format (iOS can output PNG when quality=1.0)

### Upgrade Instructions

See [MIGRATION.md](./MIGRATION.md) for detailed upgrade instructions.

---

## [1.0.1] - Previous Version

### Features
- iOS-only implementation
- VisionKit document scanning
- Multi-page scanning
- Image quality control
- Base64 encoding option

---

[2.0.0]: https://github.com/dariyd/react-native-document-scanner/compare/v1.0.1...v2.0.0
[1.0.1]: https://github.com/dariyd/react-native-document-scanner/releases/tag/v1.0.1

