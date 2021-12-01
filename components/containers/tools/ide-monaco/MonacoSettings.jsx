import React, { useState, useRef } from "react";

import Editor from "@monaco-editor/react";
import monacoThemes from "monaco-themes/themes/themelist";

import { Box, Button, Divider, Grid, MenuItem, Stack, TextField, Typography } from "@mui/material";
import { languageSupports } from "./MonacoConfig";
import { defineTheme } from "./MonacoEffect";

const MonacoSettings = props => {
  const { setSelectedLanguageId, selectedLanguageId, monacoTheme, setMonacoTheme, setOptions, options } = props;
  const [isEditorReady, setIsEditorReady] = useState(false);
  const editorRef = useRef();

  function handleLanguageChange(ev) {
    setSelectedLanguageId(ev.target.value);
  }

  function handleThemeChange(ev) {
    const theme = ev.target.value;

    if (["vs-dark", "light"].includes(theme)) {
      setMonacoTheme(theme);
    } else {
      defineTheme(theme).then(_ => setMonacoTheme(theme));
    }
  }

  function getEditorValue() {
    return editorRef.current?.getValue();
  }

  function handleEditorDidMount(editor, monaco) {
    setIsEditorReady(true);
    editorRef.current = editor;
  }

  function handleApply() {
    const currentValue = getEditorValue();
    let options;
    try {
      options = JSON.parse(currentValue);
      setOptions(options);
    } catch {
      // showNotification({
      //   message: 'Seems like options file is not a valid json, please double check it.',
      //   variant: "error",
      // });
    }
  }

  return (
    <Box>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Stack>
            <Typography variant="h6">Languages</Typography>
            <TextField
              select
              variant="filled"
              fullWidth={true}
              value={selectedLanguageId}
              onChange={handleLanguageChange}
              label="Language"
            >
              {languageSupports.map(language => (
                <MenuItem key={language.id} value={language.id}>
                  {language.name}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
        </Grid>


        <Grid item xs={12}>
          <Stack>
            <Typography variant="h6">Themes</Typography>
            <TextField
              select
              variant="filled"
              value={monacoTheme}
              onChange={handleThemeChange}
              fullWidth={true}
              label="Theme"
            >
              {["vs-dark", "light"].map(theme => (
                <MenuItem key={theme} value={theme}>
                  {theme}
                </MenuItem>
              ))}
              <MenuItem disabled><Divider /></MenuItem>
              {Object.entries(monacoThemes).map(([themeId, themeName]) => (
                <MenuItem key={themeId} value={themeId}>
                  {themeName}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
        </Grid>

        <Grid item xs={12}>
          <Stack>
            <Typography variant="h6">Options</Typography>
            <Typography variant="subtitle2" gutterBottom>
              Now you can change options below, press apply and see result in the left side editor
            </Typography>

            <Editor
              theme={monacoTheme}
              language="json"
              height={400}
              options={options}
              value={JSON.stringify(options, null, 2)}
              onMount={handleEditorDidMount}
            />

            <Button pt={2} variant="contained" color={"success"} disabled={!isEditorReady}
                    onClick={handleApply}>Apply</Button>
          </Stack>
        </Grid>
      </Grid>

    </Box>
  );
};

export default MonacoSettings;