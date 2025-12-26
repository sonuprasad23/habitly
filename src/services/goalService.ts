import { getDb } from '../db/database';
import * as Crypto from 'expo-crypto';

export interface Goal {
  id: string;
  title: string;
  habitId?: string;
  targetValue: number;
  currentValue: number;
  startDate: string;
  endDate?: string;
  status: 'active' | 'achieved' | 'abandoned';
}

export const createGoal = async (goal: Omit<Goal, 'id' | 'currentValue' | 'status'>) => {
  const db = getDb();
  const id = Crypto.randomUUID();

  await db.runAsync(
    `INSERT INTO Goal (id, title, habitId, targetValue, currentValue, startDate, endDate, status)
     VALUES (?, ?, ?, ?, 0, ?, ?, 'active')`,
    [id, goal.title, goal.habitId || null, goal.targetValue, goal.startDate, goal.endDate || null]
  );

  return id;
};

export const getGoals = async () => {
  const db = getDb();
  return await db.getAllAsync<Goal & { habitTitle?: string }>(`
    SELECT G.*, H.title as habitTitle
    FROM Goal G
    LEFT JOIN Habit H ON G.habitId = H.id
    WHERE G.status = 'active'
  `);
};

export const updateGoalProgress = async (goalId: string) => {
  const db = getDb();
  const goal = await db.getFirstAsync<Goal>(`SELECT * FROM Goal WHERE id = ?`, [goalId]);
  
  if (!goal || !goal.habitId) return;

  // Aggregate data based on habit type
  const habit = await db.getFirstAsync<{ type: string }>(`SELECT type FROM Habit WHERE id = ?`, [goal.habitId]);
  
  let current = 0;
  if (habit?.type === 'duration') {
    const result = await db.getFirstAsync<{ total: number }>(
      `SELECT SUM(duration) as total FROM TimerSession WHERE habitId = ? AND startTime >= ?`,
      [goal.habitId, goal.startDate]
    );
    current = (result?.total || 0) / 60; // in minutes
  } else {
    const result = await db.getFirstAsync<{ count: number }>(
      `SELECT COUNT(*) as count FROM DailyTaskInstance WHERE habitId = ? AND status = 'completed' AND date >= ?`,
      [goal.habitId, goal.startDate.split('T')[0]]
    );
    current = result?.count || 0;
  }

  await db.runAsync(
    `UPDATE Goal SET currentValue = ?, status = CASE WHEN ? >= targetValue THEN 'achieved' ELSE 'active' END WHERE id = ?`,
    [current, current, goalId]
  );
};

