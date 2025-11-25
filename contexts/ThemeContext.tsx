
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Theme } from '../types';
import { THEMES } from '../themes';

interface ThemeContextType {
  theme: Theme;
  setThemeId: (id: string) => void;
  currentThemeId: string;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeId, setThemeId] = useState('dark');
  const theme = THEMES[themeId] || THEMES['dark'];

  return (
    <ThemeContext.Provider value={{ theme, setThemeId, currentThemeId: themeId }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
