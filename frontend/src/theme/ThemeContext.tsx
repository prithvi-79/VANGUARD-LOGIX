import React, { createContext, useContext, useLayoutEffect, useState } from 'react';

export type ThemeMode = 'dark' | 'light';

export interface ThemeContextType {
  theme: ThemeMode;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function applyThemeToDOM(theme: ThemeMode) {
  if (typeof document === 'undefined') return;
  document.documentElement.setAttribute('data-theme', theme);
  document.documentElement.dataset.theme = theme;
  document.documentElement.classList.toggle('dark', theme === 'dark');
  document.documentElement.classList.toggle('light', theme === 'light');

  if (document.body) {
    document.body.setAttribute('data-theme', theme);
    document.body.dataset.theme = theme;
    document.body.classList.toggle('dark', theme === 'dark');
    document.body.classList.toggle('light', theme === 'light');
  }

  const rootEl = document.getElementById('root');
  if (rootEl) {
    rootEl.setAttribute('data-theme', theme);
    rootEl.dataset.theme = theme;
    rootEl.classList.toggle('dark', theme === 'dark');
    rootEl.classList.toggle('light', theme === 'light');
  }
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    try {
      const saved = localStorage.getItem('vanguard_tactical_theme');
      return saved === 'dark' ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  });

  useLayoutEffect(() => {
    applyThemeToDOM(theme);
    try {
      localStorage.setItem('vanguard_tactical_theme', theme);
    } catch {}
  }, [theme]);

  const toggleTheme = () => {
    setThemeState((prev) => {
      const next: ThemeMode = prev === 'dark' ? 'light' : 'dark';
      applyThemeToDOM(next);
      try {
        localStorage.setItem('vanguard_tactical_theme', next);
      } catch {}
      return next;
    });
  };

  const setTheme = (mode: ThemeMode) => {
    applyThemeToDOM(mode);
    try {
      localStorage.setItem('vanguard_tactical_theme', mode);
    } catch {}
    setThemeState(mode);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
