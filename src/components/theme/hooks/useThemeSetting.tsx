'use client'
import {useEffect, useState} from "react";

export const MODE_MEDIA_QUERY = '(prefers-color-scheme: dark)';
export const THEME = { DARK: 'dark', LIGHT: 'light' };
export const THEME_OPTS = { DARK: 'dark', LIGHT: 'light', SYSTEM: 'system' };

type ThemeType = 'dark' | 'light'
export type ThemeSettingData = {
  theme: ThemeType;
  theme_setting: 'dark' | 'light' | 'system';
};

const THEME_STORAGE_KEY = 'theme_preference';

export const useThemeSetting = () => {
  const mediaQuery = window.matchMedia(MODE_MEDIA_QUERY);
  
  const getInitialThemeSetting = (): ThemeSettingData => {
    const storedSetting = localStorage.getItem(THEME_STORAGE_KEY);
    if (storedSetting) {
      return JSON.parse(storedSetting) as ThemeSettingData;
    }
    
    // Default to system preference
    const systemTheme = mediaQuery.matches ? THEME.DARK : THEME.LIGHT;
    return {theme: systemTheme as ThemeType, theme_setting: 'system'};
  };
  
  const [themeSetting, setThemeSetting] = useState<ThemeSettingData>(getInitialThemeSetting);
  
  const updateTheme = (setting: 'dark' | 'light' | 'system') => {
    const systemTheme = mediaQuery.matches ? THEME.DARK : THEME.LIGHT;
    const newThemeSetting: ThemeSettingData = {
      theme: (setting === 'system' ? systemTheme : setting) as ThemeType,
      theme_setting: setting,
    };
    setThemeSetting(newThemeSetting);
    localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(newThemeSetting));
  };
  
  useEffect(() => {
    if (themeSetting.theme_setting === 'system') {
      const handleChange = (event: MediaQueryListEvent) => {
        const newTheme = event.matches ? THEME.DARK : THEME.LIGHT;
        setThemeSetting((prev) => {
          const updated: ThemeSettingData = { ...prev, theme: newTheme as ThemeType };
          localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(updated));
          return updated;
        });
      };
      mediaQuery.addEventListener('change', handleChange);
      
      return () => {
        mediaQuery.removeEventListener('change', handleChange);
      };
    }
  }, [themeSetting.theme_setting, mediaQuery]);
  
  return { themeSetting, updateTheme };
};
