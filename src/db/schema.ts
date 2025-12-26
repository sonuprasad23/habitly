export const SCHEMA_VERSION = 1;

export const TABLE_DEFINITIONS = {
  UserSettings: `
    CREATE TABLE IF NOT EXISTS UserSettings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      theme TEXT DEFAULT 'light',
      isFirstTimeUser INTEGER DEFAULT 1,
      notificationsEnabled INTEGER DEFAULT 1,
      biometricsEnabled INTEGER DEFAULT 0,
      quietHoursStart TEXT,
      quietHoursEnd TEXT,
      language TEXT DEFAULT 'en',
      streakVisibility INTEGER DEFAULT 1,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `,
  Habit: `
    CREATE TABLE IF NOT EXISTS Habit (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      icon TEXT,
      color TEXT,
      type TEXT DEFAULT 'boolean', -- 'boolean', 'count', 'duration'
      targetValue REAL,
      targetUnit TEXT,
      isArchived INTEGER DEFAULT 0,
      isPaused INTEGER DEFAULT 0,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `,
  HabitSchedule: `
    CREATE TABLE IF NOT EXISTS HabitSchedule (
      id TEXT PRIMARY KEY,
      habitId TEXT NOT NULL,
      frequencyType TEXT NOT NULL, -- 'daily', 'weekdays', 'specific_days', 'interval', 'weekly_quota'
      frequencyConfig TEXT, -- JSON string for days of week, interval days, or quota
      FOREIGN KEY (habitId) REFERENCES Habit (id) ON DELETE CASCADE
    );
  `,
  DailyTaskInstance: `
    CREATE TABLE IF NOT EXISTS DailyTaskInstance (
      id TEXT PRIMARY KEY,
      habitId TEXT NOT NULL,
      date TEXT NOT NULL, -- YYYY-MM-DD
      status TEXT DEFAULT 'pending', -- 'pending', 'completed', 'skipped', 'postponed'
      completionValue REAL,
      notes TEXT,
      completedAt DATETIME,
      FOREIGN KEY (habitId) REFERENCES Habit (id) ON DELETE CASCADE,
      UNIQUE(habitId, date)
    );
  `,
  TimerSession: `
    CREATE TABLE IF NOT EXISTS TimerSession (
      id TEXT PRIMARY KEY,
      habitId TEXT NOT NULL,
      startTime DATETIME NOT NULL,
      endTime DATETIME,
      duration INTEGER, -- in seconds
      wasCompleted INTEGER DEFAULT 0,
      reflection TEXT,
      FOREIGN KEY (habitId) REFERENCES Habit (id) ON DELETE CASCADE
    );
  `,
  Goal: `
    CREATE TABLE IF NOT EXISTS Goal (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      habitId TEXT,
      targetValue REAL NOT NULL,
      currentValue REAL DEFAULT 0,
      startDate DATETIME NOT NULL,
      endDate DATETIME,
      status TEXT DEFAULT 'active', -- 'active', 'achieved', 'abandoned'
      FOREIGN KEY (habitId) REFERENCES Habit (id) ON DELETE SET NULL
    );
  `,
  ReflectionEntry: `
    CREATE TABLE IF NOT EXISTS ReflectionEntry (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL,
      habitId TEXT,
      content TEXT NOT NULL,
      mood TEXT,
      FOREIGN KEY (habitId) REFERENCES Habit (id) ON DELETE CASCADE
    );
  `,
  NotificationSchedule: `
    CREATE TABLE IF NOT EXISTS NotificationSchedule (
      id TEXT PRIMARY KEY,
      habitId TEXT NOT NULL,
      time TEXT NOT NULL, -- HH:mm
      daysOfWeek TEXT, -- JSON array
      isEnabled INTEGER DEFAULT 1,
      FOREIGN KEY (habitId) REFERENCES Habit (id) ON DELETE CASCADE
    );
  `,
  BackupSnapshot: `
    CREATE TABLE IF NOT EXISTS BackupSnapshot (
      id TEXT PRIMARY KEY,
      filename TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      version INTEGER NOT NULL,
      summary TEXT
    );
  `
};

