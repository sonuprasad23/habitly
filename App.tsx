import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { CheckCircle2, ListTodo, BarChart2, Settings as SettingsIcon, Target } from 'lucide-react-native';
import { initDatabase } from './src/db/database';
import TodayScreen from './src/screens/TodayScreen';
import HabitsScreen from './src/screens/HabitsScreen';
import HabitEditScreen from './src/screens/HabitEditScreen';
import StatsScreen from './src/screens/StatsScreen';
import GoalsScreen from './src/screens/GoalsScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import ReflectionsScreen from './src/screens/ReflectionsScreen';
import WeeklyReviewScreen from './src/screens/WeeklyReviewScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import LockScreen from './src/components/LockScreen';
import { getDb } from './src/db/database';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { createStackNavigator } from '@react-navigation/stack';
import { setupNotifications, initializeNotificationListeners, scheduleDailyTaskReminders } from './src/services/notificationService';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function HabitsStack() {
  const { colors } = useTheme();
  return (
    <Stack.Navigator screenOptions={{
      headerStyle: { backgroundColor: colors.card, elevation: 0, shadowOpacity: 0 },
      headerTitleStyle: { fontWeight: 'bold', color: colors.text },
      headerTintColor: colors.primary,
    }}>
      <Stack.Screen name="HabitsList" component={HabitsScreen} options={{ title: 'Habits' }} />
      <Stack.Screen name="HabitEdit" component={HabitEditScreen} options={{ title: 'Edit Habit' }} />
    </Stack.Navigator>
  );
}

function StatsStack() {
  const { colors } = useTheme();
  return (
    <Stack.Navigator screenOptions={{
      headerStyle: { backgroundColor: colors.card, elevation: 0, shadowOpacity: 0 },
      headerTitleStyle: { fontWeight: 'bold', color: colors.text },
      headerTintColor: colors.primary,
    }}>
      <Stack.Screen name="StatsMain" component={StatsScreen} options={{ title: 'Statistics' }} />
      <Stack.Screen name="Reflections" component={ReflectionsScreen} options={{ title: 'Reflections' }} />
      <Stack.Screen name="WeeklyReview" component={WeeklyReviewScreen} options={{ title: 'Weekly Review' }} />
    </Stack.Navigator>
  );
}

function AppContent() {
  const [isReady, setIsReady] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const { theme, colors } = useTheme();

  useEffect(() => {
    async function prepare() {
      try {
        // Initialize database
        await initDatabase();
        const db = getDb();
        const settings = await db.getFirstAsync<{ isFirstTimeUser: number, biometricsEnabled: number }>('SELECT isFirstTimeUser, biometricsEnabled FROM UserSettings LIMIT 1');

        setShowOnboarding(settings?.isFirstTimeUser === 1);
        setIsLocked(settings?.biometricsEnabled === 1);

        // Setup local notifications
        const notificationsEnabled = await setupNotifications();
        if (notificationsEnabled) {
          initializeNotificationListeners();
          // Schedule smart daily reminders
          await scheduleDailyTaskReminders();
        }
      } catch (e) {
        console.warn(e);
      } finally {
        setIsReady(true);
      }
    }
    prepare();
  }, []);

  if (!isReady) {
    return null;
  }

  if (isLocked) {
    return <LockScreen onUnlock={() => setIsLocked(false)} />;
  }

  if (showOnboarding) {
    return <OnboardingScreen onComplete={() => setShowOnboarding(false)} />;
  }

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => {
            if (route.name === 'Today') return <CheckCircle2 size={size} color={color} />;
            if (route.name === 'Habits') return <ListTodo size={size} color={color} />;
            if (route.name === 'Goals') return <Target size={size} color={color} />;
            if (route.name === 'Stats') return <BarChart2 size={size} color={color} />;
            if (route.name === 'Settings') return <SettingsIcon size={size} color={color} />;
            return null;
          },
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: 'gray',
          tabBarStyle: {
            backgroundColor: colors.card,
            borderTopColor: colors.border,
          },
          headerShown: true,
          headerStyle: {
            backgroundColor: colors.card,
            elevation: 0,
            shadowOpacity: 0,
            borderBottomWidth: 0,
          },
          headerTitleStyle: {
            fontWeight: 'bold',
            color: colors.text,
          },
        })}
      >
        <Tab.Screen name="Today" component={TodayScreen} />
        <Tab.Screen name="Habits" component={HabitsStack} options={{ headerShown: false }} />
        <Tab.Screen name="Goals" component={GoalsScreen} />
        <Tab.Screen name="Stats" component={StatsStack} options={{ headerShown: false }} />
        <Tab.Screen name="Settings" component={SettingsScreen} />
      </Tab.Navigator>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
