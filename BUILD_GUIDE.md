# Habit Tracker - Build & Setup Guide

## 🚀 Quick Start (Local Development)

```bash
# Install dependencies
npm install

# Start Expo development server
npm start

# Run on Android
npm run android

# Run on iOS (Mac only)
npm run ios
```

## 📱 Building APK with CodeMagic

### Prerequisites
1. Create account at [codemagic.io](https://codemagic.io)
2. Connect your GitHub repository
3. CodeMagic will auto-detect `codemagic.yaml`

### Build Steps
1. Push code to GitHub
2. CodeMagic automatically triggers build
3. Download APK from build artifacts
4. Install on Android device

### Local Android Build

```bash
# Generate native Android project
npx expo prebuild --platform android --clean

# Build Debug APK
cd android
./gradlew assembleDebug

# Build Release APK (after setting up signing)
./gradlew assembleRelease
```

## 🔧 Troubleshooting Build Issues

### "Unable to load script" Error

This usually means the JS bundle wasn't created properly.

**Fix:**
```bash
# Clean everything
rm -rf node_modules android ios
npm install
npx expo prebuild --clean

# Or for codemagic, add clean flag
npx expo prebuild --platform android --clean
```

### Build Failing at "createBundleReleaseJsAndAssets"

**Common causes:**
1. Syntax errors in code
2. Missing dependencies
3. Import errors

**Fix:**
```bash
# Check for errors
npm run android -- --verbose

# Install with legacy peer deps
npm install --legacy-peer-deps

# Clear Metro bundler cache
npx expo start --clear
```

### Gradle Build Failed

**Fix:**
```bash
cd android
./gradlew clean
./gradlew assembleDebug --stacktrace
```

## ⚙️ Configuration Files

### `codemagic.yaml`
- Configured for Node 18 and Java 17
- Builds debug APK by default (easier to debug)
- Uses `--legacy-peer-deps` for dependency resolution

### `metro.config.js`
- Metro bundler configuration
- Uses Expo's default config

### `babel.config.js`
- Babel transpilation settings
- Uses `babel-preset-expo`

## 🔑 App Signing (For Release)

### Generate Keystore

```bash
keytool -genkey -v -keystore my-release-key.keystore \
  -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
```

### Configure Gradle

Add to `android/gradle.properties`:
```properties
MYAPP_RELEASE_STORE_FILE=my-release-key.keystore
MYAPP_RELEASE_KEY_ALIAS=my-key-alias
MYAPP_RELEASE_STORE_PASSWORD=****
MYAPP_RELEASE_KEY_PASSWORD=****
```

### Build Signed APK

```bash
cd android
./gradlew assembleRelease
```

APK location: `android/app/build/outputs/apk/release/app-release.apk`

## 📦 What Gets Built

- **Debug APK**: ~50-60 MB, with debugging enabled
- **Release APK**: ~30-40 MB, optimized and minified
- **AAB** (for Play Store): ~25-35 MB

## 🎯 Best Practices

1. **Always test debug build first**
   - Easier to debug issues
   - Faster build times

2. **Use `--legacy-peer-deps`**
   - Resolves dependency conflicts
   - Required for some Expo packages

3. **Clean builds when changing config**
   ```bash
   npx expo prebuild --clean
   ```

4. **Check logs for errors**
   ```bash
   ./gradlew assembleDebug --stacktrace --info
   ```

## 🌐 CodeMagic CI/CD Tips

### Environment Variables
Add in CodeMagic UI (not in codemagic.yaml):
- `KEYSTORE_PATH`
- `KEYSTORE_PASSWORD`
- `KEY_ALIAS`
- `KEY_PASSWORD`

### Caching
CodeMagic automatically caches:
- `node_modules/`
- Gradle dependencies
- Android SDK

### Notifications
Configure in CodeMagic UI:
- Email notifications
- Slack webhooks
- Discord notifications

## 📱 Installing APK

### On Physical Device

```bash
# Install via ADB
adb install app-debug.apk

# Or transfer APK to device and install manually
```

### Testing

1. Install APK
2. Grant notification permissions
3. Test habit creation
4. Test notifications
5. Test offline functionality

## 🐛 Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| "Command not found: expo" | `npm install -g expo-cli` |
| Gradle daemon issues | `./gradlew --stop` then rebuild |
| Metro bundler stuck | `npx expo start --clear` |
| APK won't install | Enable "Unknown sources" in Android settings |
| Notifications not working | Check permissions in app settings |

## 📚 Resources

- [Expo Documentation](https://docs.expo.dev)
- [CodeMagic Docs](https://docs.codemagic.io)
- [Android Build Guide](./ANDROID_BUILD.md)
- [Main README](./README.md)

---

**Need Help?** Check the error messages carefully - they usually point to the exact issue!
