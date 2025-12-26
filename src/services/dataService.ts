import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { getDb } from '../db/database';
import { SCHEMA_VERSION } from '../db/schema';

export const exportData = async () => {
  const db = getDb();
  const tables = ['Habit', 'HabitSchedule', 'DailyTaskInstance', 'TimerSession', 'Goal', 'ReflectionEntry', 'UserSettings'];
  const exportPayload: any = {
    version: SCHEMA_VERSION,
    timestamp: new Date().toISOString(),
    data: {}
  };

  for (const table of tables) {
    exportPayload.data[table] = await db.getAllAsync(`SELECT * FROM ${table}`);
  }

  const json = JSON.stringify(exportPayload);
  const fileUri = `${FileSystem.documentDirectory}habit_backup_${Date.now()}.json`;
  
  await FileSystem.writeAsStringAsync(fileUri, json);
  
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(fileUri);
  }
};

export const importData = async (jsonString: string) => {
  const db = getDb();
  const payload = JSON.parse(jsonString);

  if (payload.version > SCHEMA_VERSION) {
    throw new Error('Incompatible backup version. Please update your app.');
  }

  await db.withTransactionAsync(async () => {
    // 1. Merge Habits
    for (const habit of payload.data.Habit) {
      const existing = await db.getFirstAsync('SELECT id FROM Habit WHERE id = ?', [habit.id]);
      if (existing) {
        await db.runAsync(
          'UPDATE Habit SET title=?, description=?, icon=?, color=?, type=?, targetValue=?, targetUnit=?, isArchived=?, isPaused=?, updatedAt=CURRENT_TIMESTAMP WHERE id=?',
          [habit.title, habit.description, habit.icon, habit.color, habit.type, habit.targetValue, habit.targetUnit, habit.isArchived, habit.isPaused, habit.id]
        );
      } else {
        await db.runAsync(
          'INSERT INTO Habit (id, title, description, icon, color, type, targetValue, targetUnit, isArchived, isPaused, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [habit.id, habit.title, habit.description, habit.icon, habit.color, habit.type, habit.targetValue, habit.targetUnit, habit.isArchived, habit.isPaused, habit.createdAt]
        );
      }
    }

    // 2. Merge Schedules
    for (const schedule of payload.data.HabitSchedule) {
      await db.runAsync(
        'INSERT OR REPLACE INTO HabitSchedule (id, habitId, frequencyType, frequencyConfig) VALUES (?, ?, ?, ?)',
        [schedule.id, schedule.habitId, schedule.frequencyType, schedule.frequencyConfig]
      );
    }

    // 3. Merge Task Instances
    for (const task of payload.data.DailyTaskInstance) {
      await db.runAsync(
        'INSERT OR REPLACE INTO DailyTaskInstance (id, habitId, date, status, completionValue, notes, completedAt) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [task.id, task.habitId, task.date, task.status, task.completionValue, task.notes, task.completedAt]
      );
    }

    // Add other tables as needed...
  });
};

