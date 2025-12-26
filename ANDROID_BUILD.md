# Android Build Guide - Local App

Complete guide to building the Habit Tracker app for Android using Android Studio. This is a fully local app - no backend or cloud services required!

## Prerequisites

- **Android Studio** Flamingo (2022.2.1) or newer
- **JDK** 11 or newer
- **Android SDK** with build tools
- **Node.js** 18+ installed

## Step 1: Generate Native Android Code

Expo's "prebuild" generates the native Android project files.

```bash
# In project root directory
npx expo prebuild --platform android

# This creates the 'android' folder
```

**Note:** If you already have an `android` folder and want to regenerate:

```bash
npx expo prebuild --platform android --clean
```

## Step 2: Open in Android Studio

1. Open Android Studio
2. Click **File → Open**
3. Navigate to your project and select the **android** folder
4. Click **OK**
5. Wait for Gradle sync to complete (this may take several minutes)

## Step 3: Configure Build

### 3.1 Verify Package Name

In `android/app/build.gradle`, confirm:

```gradle
defaultConfig {
    applicationId "com.habittracker.app"
    minSdkVersion 23
    targetSdkVersion 34
    // ...
}
```

### 3.2 Check Permissions

In `android/app/src/main/AndroidManifest.xml`, verify permissions:

```xml
<uses-permission android:name="android.permission.VIBRATE" />
<uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />
<uses-permission android:name="android.permission.USE_BIOMETRIC" />
<uses-permission android:name="android.permission.SCHEDULE_EXACT_ALARM" />
```

Note: No internet permission needed - this app is 100% local!

## Step 4: Build Debug APK

### Option A: Using Android Studio GUI

1. Click **Build** → **Build Bundle(s) / APK(s)** → **Build APK(s)**
2. Wait for build to complete
3. Click **locate** in the notification to find the APK

APK location: `android/app/build/outputs/apk/debug/app-debug.apk`

### Option B: Using Gradle Command Line

```bash
cd android
./gradlew assembleDebug
```

APK location: `android/app/build/outputs/apk/debug/app-debug.apk`

## Step 5: Build Release APK

### 5.1 Generate Signing Key

```bash
cd android/app

# Generate keystore
keytool -genkey -v -keystore release.keystore -alias habittracker -keyalg RSA -keysize 2048 -validity 10000

# Follow prompts to set passwords
# Remember these passwords!
```

### 5.2 Configure Signing

Create/edit `android/gradle.properties` and add:

```properties
MYAPP_RELEASE_STORE_FILE=release.keystore
MYAPP_RELEASE_KEY_ALIAS=habittracker
MYAPP_RELEASE_STORE_PASSWORD=your_store_password
MYAPP_RELEASE_KEY_PASSWORD=your_key_password
```

**Important:** Add `gradle.properties` to `.gitignore`!

### 5.3 Update Build Configuration

Edit `android/app/build.gradle`:

```gradle
android {
    ...
    signingConfigs {
        release {
            if (project.hasProperty('MYAPP_RELEASE_STORE_FILE')) {
                storeFile file(MYAPP_RELEASE_STORE_FILE)
                storePassword MYAPP_RELEASE_STORE_PASSWORD
                keyAlias MYAPP_RELEASE_KEY_ALIAS
                keyPassword MYAPP_RELEASE_KEY_PASSWORD
            }
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            shrinkResources true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
}
```

### 5.4 Build Release APK

```bash
cd android
./gradlew assembleRelease
```

APK location: `android/app/build/outputs/apk/release/app-release.apk`

## Step 6: Build Android App Bundle (AAB)

For Google Play Store, you need an AAB file:

```bash
cd android
./gradlew bundleRelease
```

AAB location: `android/app/build/outputs/bundle/release/app-release.aab`

## Step 7: Test the App

### On Emulator

1. In Android Studio, click **Run → Select Device**
2. Choose an emulator or create new AVD
3. Click **Run** (green play button)

### On Physical Device

1. Enable **Developer Options** on your Android device:
   - Go to Settings → About Phone
   - Tap Build Number 7 times
2. Enable **USB Debugging** in Developer Options
3. Connect device via USB
4. Device should appear in Android Studio's device selector
5. Click **Run**

### Install APK Manually

```bash
# Install debug APK
adb install android/app/build/outputs/apk/debug/app-debug.apk

# Or release APK
adb install android/app/build/outputs/apk/release/app-release.apk
```

## Troubleshooting

### Gradle Sync Failed

**Solution:**
```bash
cd android
./gradlew clean
./gradlew --stop
```

Then in Android Studio: **File → Invalidate Caches → Invalidate and Restart**

### Build Errors

**Common issues:**
1. **Java version mismatch**: Use JDK 11 or 17
2. **Android SDK missing**: Install via Android Studio SDK Manager
3. **Gradle version**: Let Android Studio update automatically

### App Crashes on Launch

**Check:**
1. Check Android Logcat for errors in Android Studio
2. Ensure minimum SDK version is correct (23+)
3. Verify all permissions in AndroidManifest.xml
4. Try clean build: `./gradlew clean assembleDebug`

### Notifications Not Working

**Verify:**
1. App has notification permissions
2. Notification channel is properly created
3. Check device notification settings
4. Test on Android 8.0+ (notification channels required)

## App Configuration

### Version and Build Numbers

Update in `android/app/build.gradle`:

```gradle
defaultConfig {
    versionCode 1     // Increment for each release
    versionName "1.0.0"  // Semantic versioning
}
```

### App Icons and Splash Screen

Icons are generated from `assets/` folder:
- `assets/icon.png` - App icon (1024x1024)
- `assets/adaptive-icon.png` - Android adaptive icon
- `assets/splash-icon.png` - Splash screen

After updating icons, run:
```bash
npx expo prebuild --clean
```

### ProGuard Rules

For release builds, add to `android/app/proguard-rules.pro`:

```pro
# Keep notification classes
-keep class * extends android.app.NotificationChannel { *; }

# Keep SQLite
-keep class org.sqlite.** { *; }

# React Native
-keep class com.facebook.react.** { *; }
```

## Publishing to Google Play Store

### 1. Prepare Release

- Build signed AAB (see Step 6)
- Test thoroughly on multiple devices
- Prepare store listing materials:
  - App icon (512x512)
  - Screenshots (at least 2)
  - Feature graphic (1024x500)
  - App description

### 2. Create Google Play Developer Account

- Sign up at https://play.google.com/console
- Pay one-time $25 registration fee

### 3. Upload App

1. Create new app in Play Console
2. Complete store listing
3. Upload AAB file
4. Set pricing (free or paid)
5. Submit for review

### 4. Update Process

For updates:
1. Increment `versionCode` in build.gradle
2. Update `versionName`
3. Build new AAB
4. Upload to Play Console
5. Submit for review

## Features for Android

The app includes Android-specific optimizations:

- **Local Notifications**: Smart reminder system
- **Biometric Authentication**: Fingerprint/Face unlock
- **Adaptive Icons**: Follows Android design guidelines
- **Edge-to-Edge**: Modern full-screen experience
- **Dark Theme**: Material You support
- **SQLite Database**: Fast local storage

## Performance Tips

1. **Enable ProGuard** for release builds (reduces size by ~40%)
2. **Use release builds** for testing performance
3. **Enable R8** (default in newer Android Studio)
4. **Optimize images** in assets folder

## Size Optimization

Release APK size comparison:
- Debug: ~50-60 MB
- Release (with ProGuard): ~25-35 MB
- AAB (Google Play): ~20-30 MB download

## Next Steps

- Test on various Android versions (6.0+)
- Test on different screen sizes
- Test notification scheduling
- Test biometric authentication
- Test data persistence

## Resources

- [Expo Documentation](https://docs.expo.dev)
- [React Native Documentation](https://reactnative.dev)
- [Android Studio Guide](https://developer.android.com/studio)
- [Google Play Publishing](https://support.google.com/googleplay/android-developer)

---

**Local-Only App** - No backend or cloud services needed!
**Privacy-First** - All data stays on device
**Simple Setup** - Just build and install!
