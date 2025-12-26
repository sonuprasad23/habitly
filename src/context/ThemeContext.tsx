import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { getDb } from '../db/database';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  colors: typeof LightColors;
}

const LightColors = {
  background: '#f8fafc',
  card: '#ffffff',
  text: '#1e293b',
  textMuted: '#64748b',
  primary: '#6366f1',
  border: '#e2e8f0',
};

const DarkColors = {
  background: '#0f172a',
  card: '#1e293b',
  text: '#f8fafc',
  textMuted: '#94a3b8',
  primary: '#818cf8',
  border: '#334155',
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemScheme = useColorScheme();
  const [theme, setTheme] = useState<Theme>(systemScheme || 'light');

  useEffect(() => {
    async function loadTheme() {
      const db = getDb();
      const settings = await db.getFirstAsync<{ theme: string }>('SELECT theme FROM UserSettings LIMIT 1');
      if (settings?.theme) {
        setTheme(settings.theme as Theme);
      }
    }
    loadTheme();
  }, []);

  const toggleTheme = async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    const db = getDb();
    await db.runAsync('UPDATE UserSettings SET theme = ?', [newTheme]);
  };

  const colors = theme === 'light' ? LightColors : DarkColors;

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};

