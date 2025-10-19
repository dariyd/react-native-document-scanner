# Android Implementation

This is the Android implementation of react-native-document-scanner using Google ML Kit Document Scanner API.

## Features

- Uses Google ML Kit Document Scanner API
- Automatic document detection and edge detection
- Multi-page scanning support
- Automatic perspective correction
- Image quality and compression options
- Support for both old and new React Native architecture

## Requirements

- **Minimum SDK**: Android API level 21 (Android 5.0)
- **Target SDK**: Android API level 35 (Android 15) - required by Google Play Store
- **Compile SDK**: Android API level 35
- Google Play Services
- Camera permission

## Implementation Details

The module uses:
- `com.google.android.gms:play-services-mlkit-document-scanner` for document scanning
- React Native bridge for old architecture
- TurboModule support for new architecture

## Publishing

If you want to publish the lib as a maven dependency, follow these steps before publishing a new version to npm:

1. Be sure to have the Android [SDK](https://developer.android.com/studio/index.html) and [NDK](https://developer.android.com/ndk/guides/index.html) installed
2. Be sure to have a `local.properties` file in this folder that points to the Android SDK and NDK
```
ndk.dir=/Users/{username}/Library/Android/sdk/ndk-bundle
sdk.dir=/Users/{username}/Library/Android/sdk
```
3. Delete the `maven` folder
4. Run `./gradlew publishToMavenLocal` or `./gradlew publish`
5. Verify that latest set of generated files is in the maven folder with the correct version number

**Note**: The library now uses the modern `maven-publish` plugin (compatible with Gradle 8+) instead of the deprecated `maven` plugin.
