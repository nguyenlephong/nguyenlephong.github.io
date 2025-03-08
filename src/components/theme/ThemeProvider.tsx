'use client'
import React, {createContext, PropsWithChildren, useContext, useEffect} from "react";
import {useThemeSetting} from "@/components/theme/hooks/useThemeSetting";

const ThemeContext = createContext<ReturnType<typeof useThemeSetting> | null>(null);

export const ThemeProvider = ({ children }: PropsWithChildren) => {
  const theme = useThemeSetting(); 
  
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme.themeSetting.theme);
  }, [theme.themeSetting.theme]);
  
  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
