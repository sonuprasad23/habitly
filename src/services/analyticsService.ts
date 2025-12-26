import { getDb } from '../db/database';
import { format, subDays, isSameDay, parseISO } from 'date-fns';

export const getStreak = async (habitId: string) => {
  const db = getDb();
  const completions = await db.getAllAsync<{ date: string }>(
    'SELECT date FROM DailyTaskInstance WHERE habitId = ? AND status = "completed" ORDER BY date DESC',
    [habitId]
  );

  if (completions.length === 0) return 0;

  let streak = 0;
  let currentDate = new Date();
  
  // Check if today or yesterday was completed to continue streak
  const lastCompletionDate = parseISO(completions[0].date);
  if (differenceInDays(currentDate, lastCompletionDate) > 1) {
    return 0;
  }

  for (let i = 0; i < completions.length; i++) {
    const compDate = parseISO(completions[i].date);
    const expectedDate = subDays(lastCompletionDate, i);
    
    if (isSameDay(compDate, expectedDate)) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
};

export const getCompletionRate = async (habitId: string, days: number = 30) => {
  const db = getDb();
  const startDate = format(subDays(new Date(), days), 'yyyy-MM-dd');
  
  const stats = await db.getFirstAsync<{ total: number, completed: number }>(`
    SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed
    FROM DailyTaskInstance
    WHERE habitId = ? AND date >= ?
  `, [habitId, startDate]);

  if (!stats || stats.total === 0) return 0;
  return (stats.completed / stats.total) * 100;
};

export const getTimeSpent = async (habitId: string, days: number = 7) => {
  const db = getDb();
  const startDate = format(subDays(new Date(), days), 'yyyy-MM-dd');

  const result = await db.getFirstAsync<{ totalDuration: number }>(`
    SELECT SUM(duration) as totalDuration
    FROM TimerSession
    WHERE habitId = ? AND startTime >= ?
  `, [habitId, startDate]);

  return result?.totalDuration || 0;
};

export const getLast7DaysCompletion = async (habitId: string) => {
  const db = getDb();
  const results = [];
  for (let i = 6; i >= 0; i--) {
    const date = format(subDays(new Date(), i), 'yyyy-MM-dd');
    const task = await db.getFirstAsync<{ status: string }>(
      'SELECT status FROM DailyTaskInstance WHERE habitId = ? AND date = ?',
      [habitId, date]
    );
    results.push({
      date,
      completed: task?.status === 'completed' ? 1 : 0
    });
  }
  return results;
};

export const getSuggestedReminderTime = async (habitId: string) => {
  const db = getDb();
  const completions = await db.getAllAsync<{ completedAt: string }>(
    'SELECT completedAt FROM DailyTaskInstance WHERE habitId = ? AND status = "completed" AND completedAt IS NOT NULL',
    [habitId]
  );

  if (completions.length < 3) return null;

  // Simple average of completion times
  let totalMinutes = 0;
  for (const comp of completions) {
    const date = parseISO(comp.completedAt);
    totalMinutes += date.getHours() * 60 + date.getMinutes();
  }

  const avgMinutes = Math.floor(totalMinutes / completions.length);
  const hours = Math.floor(avgMinutes / 60);
  const minutes = avgMinutes % 60;

  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

function differenceInDays(d1: Date, d2: Date) {
  const t2 = d2.getTime();
  const t1 = d1.getTime();
  return Math.floor((t1 - t2) / (24 * 3600 * 1000));
}

