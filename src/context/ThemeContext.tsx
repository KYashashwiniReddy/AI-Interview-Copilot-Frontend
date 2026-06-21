'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../lib/api';

type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
  theme: ThemeMode;
  toggleTheme: () => void;
  setThemeMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<ThemeMode>('dark');

  useEffect(() => {
    // 1. Get cached user theme
    const cachedUser = api.getUser();
    
    // 2. Resolve initial theme preference
    const savedTheme = localStorage.getItem('theme') || 
                       localStorage.getItem('landing_theme') || 
                       (cachedUser?.theme?.toLowerCase()) || 
                       'dark';
                       
    const mode = savedTheme === 'light' ? 'light' : 'dark';
    
    setTheme(mode);
    
    if (mode === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const setThemeMode = (mode: ThemeMode) => {
    setTheme(mode);
    localStorage.setItem('theme', mode);
    localStorage.setItem('landing_theme', mode);
    
    if (mode === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }
    
    // Attempt backend database sync if user is authenticated
    const cachedUser = api.getUser();
    if (cachedUser) {
      api.put('/auth/theme', { theme: mode.toUpperCase() })
        .then(() => {
          const updatedUser = { ...cachedUser, theme: mode.toUpperCase() };
          api.setUser(updatedUser);
          // Trigger storage/profile updates across layout panels
          window.dispatchEvent(new Event('user-profile-updated'));
        })
        .catch((err) => {
          console.error('Failed to sync theme preference in database:', err);
        });
    }
  };

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setThemeMode(nextTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setThemeMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
