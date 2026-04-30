import React, { createContext, useContext, useState, useEffect } from 'react';
import { loadData, saveData } from '../utils/storage';

const STORAGE_KEY = '@theme';

export const DARK_THEME = {
  mode: 'dark',
  bg: '#0B0B10',
  card: '#15151D',
  cardAlt: '#1B1B26',
  text: '#F8FAFC',
  subText: '#A1A1B5',
  border: '#272736',
  tabBar: '#101018',
  header: '#111118',
  input: '#13131A',
  inputBorder: '#2B2B3A',
  placeholder: '#7A7A8C',
  icon: '#A1A1B5',
  divider: '#272736',
  modalBg: '#161621',
};

export const LIGHT_THEME = {
  mode: 'light',
  bg: '#F3F4F6',
  card: '#FFFFFF',
  cardAlt: '#E5E7EB',
  text: '#000000',
  subText: '#1F2937',
  border: '#CBD5E1',
  tabBar: '#FFFFFF',
  header: '#FFFFFF',
  input: '#FFFFFF',
  inputBorder: '#9CA3AF',
  placeholder: '#374151',
  icon: '#111827',
  divider: '#CBD5E1',
  modalBg: '#FFFFFF',
};

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    loadData(STORAGE_KEY).then((val) => {
      if (val !== null) setIsDark(val === 'dark');
    });
  }, []);

  const toggleTheme = async () => {
    const next = !isDark;
    setIsDark(next);
    await saveData(STORAGE_KEY, next ? 'dark' : 'light');
  };

  const theme = isDark ? DARK_THEME : LIGHT_THEME;

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
