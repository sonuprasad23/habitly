import { getDb } from '../db/database';

const translations: any = {
  en: {
    welcome: 'Welcome to Hillside',
    getStarted: 'Get Started',
    today: 'Today',
    habits: 'Habits',
    goals: 'Goals',
    stats: 'Stats',
    settings: 'Settings',
    focusToday: 'Focus on today',
    allCaughtUp: 'All caught up! No tasks for today.',
    newHabit: 'New Habit',
    saveHabit: 'Save Habit',
    streak: 'Day Streak',
    successRate: 'Success Rate',
    totalTime: 'Total Time',
    performance: 'Performance Overview',
  },
  es: {
    welcome: 'Bienvenido a Hillside',
    getStarted: 'Empezar',
    today: 'Hoy',
    habits: 'Hábitos',
    goals: 'Metas',
    stats: 'Estadísticas',
    settings: 'Ajustes',
    focusToday: 'Concéntrate en hoy',
    allCaughtUp: '¡Todo listo! No hay tareas para hoy.',
    newHabit: 'Nuevo Hábito',
    saveHabit: 'Guardar Hábito',
    streak: 'Racha de días',
    successRate: 'Tasa de éxito',
    totalTime: 'Tiempo total',
    performance: 'Resumen de rendimiento',
  }
};

let currentLanguage = 'en';

export const setLanguage = (lang: string) => {
  if (translations[lang]) {
    currentLanguage = lang;
  }
};

export const t = (key: string) => {
  return translations[currentLanguage][key] || key;
};

export const initI18n = async () => {
  const db = getDb();
  const settings = await db.getFirstAsync<{ language: string }>('SELECT language FROM UserSettings LIMIT 1');
  if (settings?.language) {
    currentLanguage = settings.language;
  }
};

