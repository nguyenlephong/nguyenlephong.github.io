import React from "react";
import { BaseProvider, LightTheme } from "baseui";
import { themes } from "../lib/theme";
import { ThemeProvider } from "styled-components";
import { Action, Fab } from "react-tiny-fab";
import { useDispatch, useSelector } from "../src/reduxs/store";
import { setCurrentThemesSuccess } from "../src/reduxs/slices/themes";

const WrapperProvider = props => {
  const chosenThemeInit = useSelector(store => store.themes);
  const dispatch = useDispatch();
  
  const onChangeThemes = (theme) => {
    document.body.style.background = theme.body
    document.body.style.color = theme.text
    dispatch(setCurrentThemesSuccess(theme));
  };
  
  return (
    <BaseProvider theme={LightTheme}>
      <ThemeProvider theme={chosenThemeInit}>
        <>
          <div>
            {props.children}
          </div>
          <Fab
            mainButtonStyles={{ backgroundColor: "#e74c3c" }}
            icon={<i className="fas fa-eye" />}
            alwaysShowTitle={true}
          >
            {themes.map((t) => {
              return (
                <Action
                  key={`${t.id}`}
                  id={`theme_${t.id}`}
                  style={{ backgroundColor: t.color }}
                  text={t.title}
                  onClick={() => onChangeThemes(t.theme)}
                >
                  <i className={t.fasIcon} />
                </Action>
              );
            })}
          </Fab>
        </>
      </ThemeProvider>
    </BaseProvider>
  );
};

export default WrapperProvider;
