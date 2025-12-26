import { getDb } from '../db/database';
import { DailyTaskInstance, Habit, HabitSchedule } from '../types';
import * as Crypto from 'expo-crypto';
import { format, getDay, parseISO, addDays, differenceInDays } from 'date-fns';

export const generateTasksForDate = async (date: Date) => {
  const db = getDb();
  const dateStr = format(date, 'yyyy-MM-dd');
  const dayOfWeek = getDay(date); // 0 (Sun) to 6 (Sat)

  // 1. Get all active (not archived, not paused) habits and their schedules
  const habitsWithSchedules = await db.getAllAsync<{
    habitId: string;
    frequencyType: string;
    frequencyConfig: string;
    createdAt: string;
  }>(`
    SELECT H.id as habitId, S.frequencyType, S.frequencyConfig, H.createdAt
    FROM Habit H
    JOIN HabitSchedule S ON H.id = S.habitId
    WHERE H.isArchived = 0 AND H.isPaused = 0
  `);

  const tasksToCreate: any[] = [];

  for (const row of habitsWithSchedules) {
    const config = JSON.parse(row.frequencyConfig);
    let isDue = false;

    switch (row.frequencyType) {
      case 'daily':
        isDue = true;
        break;
      case 'weekdays':
        isDue = dayOfWeek >= 1 && dayOfWeek <= 5;
        break;
      case 'specific_days':
        // config.days is array of 0-6
        isDue = config.days.includes(dayOfWeek);
        break;
      case 'interval':
        // config.every is number of days
        const start = parseISO(row.createdAt.split(' ')[0]);
        const diff = differenceInDays(date, start);
        isDue = diff % config.every === 0;
        break;
      case 'weekly_quota':
        // Quota is handled differently in UI, but we can generate a daily task
        // if they haven't met the quota yet. For simplicity, generate daily
        // and let the UI handle the "X times per week" logic.
        isDue = true; 
        break;
    }

    if (isDue) {
      // Check if task already exists
      const existing = await db.getFirstAsync(
        'SELECT id FROM DailyTaskInstance WHERE habitId = ? AND date = ?',
        [row.habitId, dateStr]
      );

      if (!existing) {
        tasksToCreate.push({
          id: Crypto.randomUUID(),
          habitId: row.habitId,
          date: dateStr,
          status: 'pending'
        });
      }
    }
  }

  // Batch insert new tasks
  if (tasksToCreate.length > 0) {
    await db.withTransactionAsync(async () => {
      for (const task of tasksToCreate) {
        await db.runAsync(
          'INSERT INTO DailyTaskInstance (id, habitId, date, status) VALUES (?, ?, ?, ?)',
          [task.id, task.habitId, task.date, task.status]
        );
      }
    });
  }
};

export const getTasksForDate = async (date: Date) => {
  const db = getDb();
  const dateStr = format(date, 'yyyy-MM-dd');
  return await db.getAllAsync<DailyTaskInstance & { title: string; icon: string; color: string; type: string; targetValue: number }>(`
    SELECT T.*, H.title, H.icon, H.color, H.type, H.targetValue
    FROM DailyTaskInstance T
    JOIN Habit H ON T.habitId = H.id
    WHERE T.date = ?
  `, [dateStr]);
};

export const updateTaskStatus = async (taskId: string, status: string, value?: number) => {
  const db = getDb();
  const completedAt = status === 'completed' ? new Date().toISOString() : null;
  await db.runAsync(
    'UPDATE DailyTaskInstance SET status = ?, completionValue = ?, completedAt = ? WHERE id = ?',
    [status, value || null, completedAt, taskId]
  );
};

