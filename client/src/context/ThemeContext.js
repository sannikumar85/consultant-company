import React, { createContext, useState, useContext, useEffect } from 'react';

const ThemeContext = createContext();

// Professional color schemes
const themes = {
  light: {
    name: 'light',
    primary: {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a',
    },
    background: {
      primary: '#ffffff',
      secondary: '#f8fafc',
      accent: '#f1f5f9',
    },
    text: {
      primary: '#0f172a',
      secondary: '#64748b',
      accent: '#334155',
    },
    border: {
      primary: '#e2e8f0',
      secondary: '#cbd5e1',
    }
  },
  dark: {
    name: 'dark',
    primary: {
      50: '#0f172a',
      100: '#1e293b',
      200: '#334155',
      300: '#475569',
      400: '#64748b',
      500: '#94a3b8',
      600: '#cbd5e1',
      700: '#e2e8f0',
      800: '#f1f5f9',
      900: '#f8fafc',
    },
    background: {
      primary: '#0f172a',
      secondary: '#1e293b',
      accent: '#334155',
    },
    text: {
      primary: '#f8fafc',
      secondary: '#cbd5e1',
      accent: '#94a3b8',
    },
    border: {
      primary: '#334155',
      secondary: '#475569',
    }
  },
  professional: {
    name: 'professional',
    primary: {
      50: '#f0f9ff',
      100: '#e0f2fe',
      200: '#bae6fd',
      300: '#7dd3fc',
      400: '#38bdf8',
      500: '#0ea5e9',
      600: '#0284c7',
      700: '#0369a1',
      800: '#075985',
      900: '#0c4a6e',
    },
    background: {
      primary: '#ffffff',
      secondary: '#fafbfc',
      accent: '#f4f6f8',
    },
    text: {
      primary: '#0f172a',
      secondary: '#475569',
      accent: '#64748b',
    },
    border: {
      primary: '#e5e7eb',
      secondary: '#d1d5db',
    }
  },
  bright: {
    name: 'bright',
    primary: {
      50: '#fffef7',
      100: '#fffbeb',
      200: '#fef3c7',
      300: '#fde68a',
      400: '#fcd34d',
      500: '#fbbf24',
      600: '#f59e0b',
      700: '#d97706',
      800: '#b45309',
      900: '#92400e',
    },
    background: {
      primary: '#ffffff',
      secondary: '#fffef7',
      accent: '#fef3c7',
    },
    text: {
      primary: '#000000',
      secondary: '#374151',
      accent: '#111827',
    },
    border: {
      primary: '#fcd34d',
      secondary: '#f59e0b',
    }
  }
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    // Check localStorage for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    return savedTheme || 'professional';
  });

  const [colorMode, setColorMode] = useState(() => {
    const savedColorMode = localStorage.getItem('colorMode');
    return savedColorMode || 'light';
  });

  useEffect(() => {
    // Apply theme to document root
    const root = document.documentElement;
    
    // Remove all existing theme classes
    root.classList.remove('light-mode', 'dark-mode', 'professional-mode');
    
    // Add current theme class
    root.classList.add(`${theme}-mode`);
    
    // Apply CSS custom properties for current theme
    const currentTheme = themes[theme] || themes.professional;
    
    // Set CSS custom properties
    Object.entries(currentTheme.primary).forEach(([key, value]) => {
      root.style.setProperty(`--color-primary-${key}`, value);
    });
    
    Object.entries(currentTheme.background).forEach(([key, value]) => {
      root.style.setProperty(`--color-bg-${key}`, value);
    });
    
    Object.entries(currentTheme.text).forEach(([key, value]) => {
      root.style.setProperty(`--color-text-${key}`, value);
    });
    
    Object.entries(currentTheme.border).forEach(([key, value]) => {
      root.style.setProperty(`--color-border-${key}`, value);
    });
    
    // Save theme preference to localStorage
    localStorage.setItem('theme', theme);
    localStorage.setItem('colorMode', colorMode);
  }, [theme, colorMode]);

  const toggleTheme = () => {
    const themeKeys = Object.keys(themes);
    const currentIndex = themeKeys.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themeKeys.length;
    setTheme(themeKeys[nextIndex]);
  };

  const toggleColorMode = () => {
    setColorMode(prevMode => prevMode === 'dark' ? 'light' : 'dark');
  };

  const setThemeByName = (themeName) => {
    if (themes[themeName]) {
      setTheme(themeName);
    }
  };

  const getCurrentTheme = () => {
    return themes[theme] || themes.professional;
  };

  const value = {
    theme,
    colorMode,
    themes,
    currentTheme: getCurrentTheme(),
    toggleTheme,
    toggleColorMode,
    setTheme: setThemeByName,
    setColorMode,
    isDark: colorMode === 'dark',
    isLight: colorMode === 'light',
    isProfessional: theme === 'professional'
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
