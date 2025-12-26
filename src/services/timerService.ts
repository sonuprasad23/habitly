import { getDb } from '../db/database';
import * as Crypto from 'expo-crypto';

export const logTimerSession = async (
  habitId: string,
  startTime: Date,
  endTime: Date,
  duration: number,
  wasCompleted: boolean,
  reflection?: string
) => {
  const db = getDb();
  const id = Crypto.randomUUID();

  await db.runAsync(
    `INSERT INTO TimerSession (id, habitId, startTime, endTime, duration, wasCompleted, reflection)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      habitId,
      startTime.toISOString(),
      endTime.toISOString(),
      duration,
      wasCompleted ? 1 : 0,
      reflection || ''
    ]
  );

  // If completed, update the daily task instance if it exists
  const dateStr = startTime.toISOString().split('T')[0];
  const task = await db.getFirstAsync<{ id: string }>(
    'SELECT id FROM DailyTaskInstance WHERE habitId = ? AND date = ?',
    [habitId, dateStr]
  );

  if (task && wasCompleted) {
    await db.runAsync(
      'UPDATE DailyTaskInstance SET status = "completed", completedAt = ? WHERE id = ?',
      [new Date().toISOString(), task.id]
    );
  }

  return id;
};

export const getTimerSessions = async (habitId: string) => {
  const db = getDb();
  return await db.getAllAsync(
    'SELECT * FROM TimerSession WHERE habitId = ? ORDER BY startTime DESC',
    [habitId]
  );
};

