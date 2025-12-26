import * as SQLite from 'expo-sqlite';
import { TABLE_DEFINITIONS, SCHEMA_VERSION } from './schema';

let db: SQLite.SQLiteDatabase;

export const initDatabase = async () => {
  if (!db) {
    db = await SQLite.openDatabaseAsync('habit_tracker.db');
  }

  // Set pragmas
  await db.execAsync('PRAGMA foreign_keys = ON;');

  // Create tables sequentially
  for (const [tableName, definition] of Object.entries(TABLE_DEFINITIONS)) {
    try {
      await db.execAsync(definition);
    } catch (error) {
      console.error(`Error creating table ${tableName}:`, error);
    }
  }

  // Initialize UserSettings if empty
  const userSettings = await db.getAllAsync('SELECT * FROM UserSettings LIMIT 1');
  if (userSettings.length === 0) {
    await db.runAsync('INSERT INTO UserSettings (isFirstTimeUser) VALUES (1)');
  }

  return db;
};

export const getDb = () => {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase first.');
  }
  return db;
};

// Migration logic placeholder
export const runMigrations = async () => {
  // In a real app, you'd check a user_version PRAGMA and run incremental updates
  // For now, we rely on CREATE TABLE IF NOT EXISTS
  const currentDb = await initDatabase();
  const versionInfo = await currentDb.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  
  if (versionInfo && versionInfo.user_version < SCHEMA_VERSION) {
    // Run migrations for specific versions
    // Example: if (versionInfo.user_version < 2) { ... }
    await currentDb.execAsync(`PRAGMA user_version = ${SCHEMA_VERSION}`);
  }
};

