import { getDb } from '../db/database';
import { Habit, HabitSchedule } from '../types';
import * as Crypto from 'expo-crypto';

export const createHabit = async (habit: Omit<Habit, 'id' | 'createdAt' | 'updatedAt'>, schedule: Omit<HabitSchedule, 'id' | 'habitId'>) => {
  const db = getDb();
  const habitId = Crypto.randomUUID();
  const scheduleId = Crypto.randomUUID();

  await db.withTransactionAsync(async () => {
    await db.runAsync(
      `INSERT INTO Habit (id, title, description, icon, color, type, targetValue, targetUnit) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [habitId, habit.title, habit.description || '', habit.icon || '', habit.color || '', habit.type, habit.targetValue || null, habit.targetUnit || '']
    );

    await db.runAsync(
      `INSERT INTO HabitSchedule (id, habitId, frequencyType, frequencyConfig) 
       VALUES (?, ?, ?, ?)`,
      [scheduleId, habitId, schedule.frequencyType, JSON.stringify(schedule.frequencyConfig)]
    );
  });

  return habitId;
};

export const getHabits = async (includeArchived = false) => {
  const db = getDb();
  const query = includeArchived 
    ? 'SELECT * FROM Habit' 
    : 'SELECT * FROM Habit WHERE isArchived = 0';
  return await db.getAllAsync<Habit>(query);
};

export const archiveHabit = async (id: string) => {
  const db = getDb();
  await db.runAsync('UPDATE Habit SET isArchived = 1, updatedAt = CURRENT_TIMESTAMP WHERE id = ?', [id]);
};

