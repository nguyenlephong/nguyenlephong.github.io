'use client'
import React from "react";
import {ThemeProvider, useTheme} from "./ThemeProvider";
import {CiLight} from "react-icons/ci";
import {MdDarkMode} from "react-icons/md";
import {VscColorMode} from "react-icons/vsc";
import {IoIosColorPalette} from "react-icons/io";
import {THEME_OPTS} from "@/components/theme/hooks/useThemeSetting";


const ThemeSwitcher: React.FC = () => {
  const {themeSetting, updateTheme} = useTheme();
  
  return (
    <div className={'app-theme'}>
      <div className="float-button">
        <button className="main-button"><IoIosColorPalette/></button>
        <div className="options">
          <button
            className={themeSetting.theme_setting === THEME_OPTS.LIGHT ? 'active' : ''}
            onClick={() => updateTheme('light')}
          >
            <CiLight/>
          </button>
          
          <button
            className={themeSetting.theme_setting === THEME_OPTS.DARK ? 'active' : ''}
            onClick={() => updateTheme('dark')}
          >
            <MdDarkMode/>
          </button>
          
          <button
            className={themeSetting.theme_setting === THEME_OPTS.SYSTEM ? 'active' : ''}
            onClick={() => updateTheme('system')}
          >
            <VscColorMode/>
          </button>
        </div>
      </div>
    </div>
  );
};

const AppTheme: React.FC = () => (
  <ThemeProvider>
    <ThemeSwitcher/>
  </ThemeProvider>
);

export default AppTheme;
