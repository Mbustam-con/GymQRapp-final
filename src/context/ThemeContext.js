import React, { createContext, useContext, useState, useEffect } from 'react';
import { Appearance } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

const lightTheme = {
  primary: '#007AFF',
  secondary: '#5856D6',
  accent: '#FF9500',
  background: '#FFFFFF',
  surface: '#F8F9FA',
  cardBackground: '#FFFFFF',
  text: '#000000',
  textSecondary: '#666666',
  textTertiary: '#999999',
  border: '#E5E5E7',
  success: '#34C759',
  warning: '#FF9500',
  error: '#FF3B30',
  cardShadow: '#000000',
  qrBackground: '#FFFFFF',
  headerBackground: '#FFFFFF',
  isDark: false,
};

const darkTheme = {
  primary: '#0A84FF',
  secondary: '#5E5CE6',
  accent: '#FF9F0A',
  background: '#000000',
  surface: '#1C1C1E',
  cardBackground: '#2C2C2E',
  text: '#FFFFFF',
  textSecondary: '#AEAEB2',
  textTertiary: '#8E8E93',
  border: '#38383A',
  success: '#30D158',
  warning: '#FF9F0A',
  error: '#FF453A',
  cardShadow: '#000000',
  qrBackground: '#FFFFFF',
  headerBackground: '#1C1C1E',
  isDark: true,
};

export const ThemeProvider = ({ children }) => {
  const [themeMode, setThemeMode] = useState('system'); // 'light', 'dark', 'system'
  const [currentTheme, setCurrentTheme] = useState(lightTheme);

  useEffect(() => {
    loadThemePreference();
    
    // Listen for system theme changes
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      if (themeMode === 'system') {
        setCurrentTheme(colorScheme === 'dark' ? darkTheme : lightTheme);
      }
    });

    return () => subscription?.remove();
  }, [themeMode]);

  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('@theme_preference');
      if (savedTheme) {
        const mode = savedTheme;
        setThemeMode(mode);
        
        if (mode === 'system') {
          const systemScheme = Appearance.getColorScheme();
          setCurrentTheme(systemScheme === 'dark' ? darkTheme : lightTheme);
        } else {
          setCurrentTheme(mode === 'dark' ? darkTheme : lightTheme);
        }
      } else {
        // Default to system theme
        const systemScheme = Appearance.getColorScheme();
        setCurrentTheme(systemScheme === 'dark' ? darkTheme : lightTheme);
      }
    } catch (error) {
      console.error('Error loading theme preference:', error);
    }
  };

  const changeTheme = async (mode) => {
    try {
      setThemeMode(mode);
      await AsyncStorage.setItem('@theme_preference', mode);
      
      if (mode === 'system') {
        const systemScheme = Appearance.getColorScheme();
        setCurrentTheme(systemScheme === 'dark' ? darkTheme : lightTheme);
      } else {
        setCurrentTheme(mode === 'dark' ? darkTheme : lightTheme);
      }
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };

  const value = {
    theme: currentTheme,
    themeMode,
    changeTheme,
    isDark: currentTheme.isDark,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};