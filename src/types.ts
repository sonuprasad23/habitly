export interface Habit {
  id: string;
  title: string;
  description?: string;
  icon?: string;
  color?: string;
  type: 'boolean' | 'count' | 'duration';
  targetValue?: number;
  targetUnit?: string;
  isArchived: number;
  isPaused: number;
  createdAt: string;
  updatedAt: string;
}

export interface HabitSchedule {
  id: string;
  habitId: string;
  frequencyType: 'daily' | 'weekdays' | 'specific_days' | 'interval' | 'weekly_quota';
  frequencyConfig: any; // e.g., { days: [1, 3, 5] } for Mon, Wed, Fri
}

export interface DailyTaskInstance {
  id: string;
  habitId: string;
  date: string; // YYYY-MM-DD
  status: 'pending' | 'completed' | 'skipped' | 'postponed';
  completionValue?: number;
  notes?: string;
  completedAt?: string;
}

export interface UserSettings {
  id: number;
  theme: 'light' | 'dark';
  isFirstTimeUser: number;
  notificationsEnabled: number;
  biometricsEnabled: number;
  quietHoursStart?: string;
  quietHoursEnd?: string;
  language: string;
  streakVisibility: number;
}

