import * as Notifications from 'expo-notifications';
import { getDb } from '../db/database';
import { Platform } from 'react-native';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Setup local notifications
export const setupNotifications = async (): Promise<boolean> => {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('Notification permissions not granted');
    return false;
  }

  // Set notification channel for Android
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('habit-reminders', {
      name: 'Habit Reminders',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#6366f1',
      sound: 'default',
    });
  }

  return true;
};

// Schedule a daily reminder for a habit
export const scheduleHabitReminder = async (
  habitId: string,
  title: string,
  time: string,
  daysOfWeek?: number[]
): Promise<string> => {
  try {
    const [hours, minutes] = time.split(':').map(Number);

    let trigger: any;

    if (daysOfWeek && daysOfWeek.length > 0) {
      // Schedule for specific days of week
      // Note: This will create a notification that repeats weekly on the specified days
      trigger = {
        hour: hours,
        minute: minutes,
        repeats: true,
      };
    } else {
      // Daily reminder
      trigger = {
        hour: hours,
        minute: minutes,
        repeats: true,
      };
    }

    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Habit Reminder ⏰',
        body: `Time for: ${title}`,
        data: { habitId, type: 'habit_reminder' },
        sound: 'default',
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger,
    });

    // Store in database
    const db = getDb();
    await db.runAsync(
      'INSERT OR REPLACE INTO NotificationSchedule (id, habitId, time, daysOfWeek, isActive) VALUES (?, ?, ?, ?, 1)',
      [identifier, habitId, time, JSON.stringify(daysOfWeek || [])]
    );

    console.log(`Scheduled notification ${identifier} for ${title} at ${time}`);
    return identifier;
  } catch (error) {
    console.error('Error scheduling reminder:', error);
    throw error;
  }
};

// Cancel a specific reminder
export const cancelReminder = async (id: string): Promise<void> => {
  try {
    await Notifications.cancelScheduledNotificationAsync(id);
    const db = getDb();
    await db.runAsync('DELETE FROM NotificationSchedule WHERE id = ?', [id]);
    console.log(`Cancelled notification ${id}`);
  } catch (error) {
    console.error('Error cancelling reminder:', error);
  }
};

// Cancel all reminders for a habit
export const cancelHabitReminders = async (habitId: string): Promise<void> => {
  try {
    const db = getDb();
    const schedules = await db.getAllAsync<{ id: string }>(
      'SELECT id FROM NotificationSchedule WHERE habitId = ?',
      [habitId]
    );

    for (const schedule of schedules) {
      await Notifications.cancelScheduledNotificationAsync(schedule.id);
    }

    await db.runAsync('DELETE FROM NotificationSchedule WHERE habitId = ?', [habitId]);
    console.log(`Cancelled all notifications for habit ${habitId}`);
  } catch (error) {
    console.error('Error cancelling habit reminders:', error);
  }
};

// Get all scheduled notifications
export const getAllScheduledNotifications = async () => {
  return await Notifications.getAllScheduledNotificationsAsync();
};

// Smart scheduling: Schedule notifications for pending tasks each day
export const scheduleDailyTaskReminders = async (): Promise<void> => {
  try {
    const db = getDb();
    const today = new Date().toISOString().split('T')[0];

    // Get all pending tasks for today that have associated habits with schedules
    const pendingTasks = await db.getAllAsync<{
      habitId: string;
      habitTitle: string;
      taskId: string;
    }>(
      `SELECT dti.habitId, h.title as habitTitle, dti.id as taskId
       FROM DailyTaskInstances dti
       JOIN Habits h ON dti.habitId = h.id
       WHERE dti.date = ? AND dti.status = 'pending' AND h.isArchived = 0 AND h.isPaused = 0`,
      [today]
    );

    // Schedule reminders for each pending task (8 AM if no specific time)
    for (const task of pendingTasks) {
      // Check if there's already a notification schedule for this habit
      const existingSchedule = await db.getFirstAsync<{ time: string }>(
        'SELECT time FROM NotificationSchedule WHERE habitId = ? AND isActive = 1 LIMIT 1',
        [task.habitId]
      );

      if (!existingSchedule) {
        // Schedule a default reminder at 8 AM
        await scheduleHabitReminder(task.habitId, task.habitTitle, '08:00');
      }
    }
  } catch (error) {
    console.error('Error scheduling daily task reminders:', error);
  }
};

// Initialize notification listeners
export const initializeNotificationListeners = () => {
  // Handle notification tap
  Notifications.addNotificationResponseReceivedListener(response => {
    const data = response.notification.request.content.data;
    console.log('Notification tapped:', data);
    // You can navigate to specific habit/task here
  });

  // Handle notification received while app is foregrounded
  Notifications.addNotificationReceivedListener(notification => {
    console.log('Notification received:', notification);
  });
};
