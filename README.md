# Habit Tracker - Local-Only Mobile App

A simple, powerful habit tracking application built with React Native (Expo). All data stored locally on your device with smart local notifications. No cloud, no backend, no internet required!

## ✨ Features

- 📱 **Fully Local** - All data stored on your device
- 📊 **Habit Tracking** - Create, track, and manage daily habits
- 🎯 **Goals Management** - Set and track long-term goals
- 📈 **Statistics & Analytics** - Visual progress tracking with charts
- 🔔 **Smart Notifications** - Local reminders for your habits
- 🌓 **Dark Mode** - Beautiful light and dark themes
- 🔒 **Biometric Lock** - Optional fingerprint/face ID protection
- 💾 **SQLite Database** - Fast, reliable local storage
- 🚀 **Offline First** - Works anywhere, anytime

## 🏗️ Architecture

- **Frontend**: React Native with Expo
- **Database**: SQLite (local)
- **Notifications**: Expo Notifications (local only)
- **State Management**: React Context
- **Navigation**: React Navigation

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and npm
- **Expo CLI** (`npm install -g expo-cli`)
- **Android Studio** (for Android builds) OR
- **Xcode** (for iOS builds on Mac)

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm start

# Or run directly on platform
npm run android   # Android
npm run ios       # iOS (Mac only)
npm run web       # Web
```

## 📱 Building for Android

### Quick Build

```bash
# Generate native Android project
npx expo prebuild

# Open in Android Studio
# File → Open → select the 'android' folder

# Or build APK directly
cd android
./gradlew assembleRelease

# APK will be in: android/app/build/outputs/apk/release/
```

### Detailed Guide

See **[ANDROID_BUILD.md](ANDROID_BUILD.md)** for complete instructions including:
- Development setup
- Debug APK building
- Release signing
- Google Play Store publishing

## 🎯 How It Works

### Local Storage
- All habits, tasks, and goals stored in SQLite database
- Data never leaves your device
- Instant access, no internet needed
- Fast and reliable

### Smart Notifications
- Schedule reminders for each habit
- Daily, weekly, or custom schedules
- Automatic rescheduling for pending tasks
- All handled locally by your device

### No Account Needed
- No registration, no login
- Start tracking immediately
- Complete privacy
- Your data is yours alone

## 📊 Features in Detail

### Habit Management
- Create habits with custom icons and colors
- Set frequency (daily, weekdays, custom days)
- Track boolean, count, or duration types
- Archive or pause habits temporarily

### Progress Tracking
- Daily task completion
- Streak counting
- Calendar heatmap visualization
- Weekly/monthly statistics

### Goals
- Set long-term goals
- Link to related habits
- Track progress percentage
- Target dates and milestones

### Reflections
- Daily journal entries
- Weekly reviews
- Track mood and learnings
- Export your reflections

## 🔧 Development Scripts

```bash
npm start         # Start Expo dev server
npm run android   # Run on Android device/emulator
npm run ios       # Run on iOS (Mac only)
npm run web       # Run in web browser
```

## 📂 Project Structure

```
testapp/
├── src/
│   ├── screens/          # App screens (Today, Habits, Goals, Stats, Settings)
│   ├── components/       # Reusable UI components
│   ├── services/         # Business logic (habits, tasks, notifications)
│   ├── db/              # SQLite database setup and schema
│   ├── context/         # React context (theme, etc.)
│   ├── utils/           # Helper functions
│   └── types.ts         # TypeScript type definitions
├── assets/              # Images, icons, fonts
├── App.tsx              # Main app entry point
├── app.json             # Expo configuration
└── package.json         # Dependencies
```

## 🔐 Privacy & Security

- **100% Local** - No data sent to servers
- **No Tracking** - No analytics or telemetry
- **Biometric Lock** - Optional device lock
- **Open Source** - Fully transparent code
- **Offline First** - No internet permission required (Android)

## 📊 Local Database Schema

**SQLite Tables:**
- `Habits` - Habit definitions
- `HabitSchedule` - Frequency configurations
- `DailyTaskInstances` - Completion records
- `Goals` - User goals
- `Reflections` - Journal entries
- `Analytics` - Usage statistics
- `NotificationSchedule` - Reminder settings
- `UserSettings` - App preferences

## 🔔 Notification System

Smart local notifications that:
- Schedule daily reminders for habits
- Respect your quiet hours
- Auto-schedule for pending tasks
- Work completely offline
- No server or cloud required

## 🎨 Customization

- **Themes**: Light and dark mode
- **Colors**: Custom colors for each habit
- **Icons**: Emoji icons for visual distinction
- **Languages**: i18n support (coming soon)

## 🐛 Troubleshooting

**App won't start:**
- Run `npm install` to ensure dependencies are installed
- Clear Expo cache: `expo start -c`

**Notifications not working:**
- Check notification permissions in device settings
- Ensure notification permissions granted
- Try rescheduling reminders

**Data not saving:**
- Check device storage space
- Ensure app has storage permissions
- Try restarting the app

**Build errors:**
- Run `npx expo prebuild --clean`
- Delete `node_modules` and run `npm install`
- Check Android Studio SDK is up to date

## 📱 Supported Platforms

- ✅ **Android** 6.0+ (API 23+)
- ✅ **iOS** 13.0+
- ✅ **Web** (Progressive Web App)

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Open Pull Request

## 📝 License

MIT License - feel free to use for personal or commercial projects

## 🙏 Acknowledgments

- Expo team for amazing framework
- React Native community
- All open-source contributors

---

**Need Help?** Open an issue or check [ANDROID_BUILD.md](ANDROID_BUILD.md) for build instructions.

**100% Local. 100% Private. 100% Yours.**
