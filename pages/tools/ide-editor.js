import React, { useState } from "react";
import ToolDetailPageWrapper from "../../components/containers/tools/ToolDetailPageWrapper";
import {
  Alert,
  Box,
  Button,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Snackbar,
  Typography
} from "@mui/material";
import AceEditor from "react-ace";

import "ace-builds/src-noconflict/mode-jsx";
import "ace-builds/src-min-noconflict/ext-searchbox";
import "ace-builds/src-min-noconflict/ext-language_tools";
import { Copy } from "phosphor-react";
import { copyToClipboardLargeData } from "../../src/shared/utils/DomUtils";
import ToolDetailFooter from "../../components/components/ToolDetailFooter";

const languages = [
  "javascript",
  "java",
  "python",
  "xml",
  "ruby",
  "sass",
  "markdown",
  "mysql",
  "json",
  "html",
  "handlebars",
  "golang",
  "csharp",
  "elixir",
  "typescript",
  "css"
];

const themes = [
  "monokai",
  "github",
  "tomorrow",
  "kuroir",
  "twilight",
  "xcode",
  "textmate",
  "solarized_dark",
  "solarized_light",
  "terminal"
];

languages.forEach(lang => {
  require(`ace-builds/src-noconflict/mode-${lang}`);
  require(`ace-builds/src-noconflict/snippets/${lang}`);
});

themes.forEach(theme => require(`ace-builds/src-noconflict/theme-${theme}`));


const IDEEditor = props => {
  const [state, setState] = useState({
    value: `function onLoad(editor) => {
  console.log("i've loaded");
}`,
    placeholder: "Typing your code",
    theme: "monokai",
    mode: "javascript",
    enableBasicAutocompletion: true,
    enableLiveAutocompletion: true,
    fontSize: 16,
    showGutter: true,
    showPrintMargin: true,
    highlightActiveLine: true,
    enableSnippets: false,
    showLineNumbers: true
  });
  const [code, setCode] = useState(`const sum = (numA , numB) => {
  return numA + numB;
}

const result = sum(1,12);
console.log("Result: ", result)`);
  const [openSnackbar, setOpenSnackbar] = useState(null);

  return (
    <ToolDetailPageWrapper
      title={"Tools For Developer | IDE Editor online"}
      description={"Tools For Developer | IDE Editor online"}
    >
      <div className={"fw fh"}>
        <Typography variant={"h2"} px={2}>IDE Editor online</Typography>
        <Box sx={{ padding: 2, width: "100%", height: "100%" }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth>
                <InputLabel id="themes">Themes</InputLabel>
                <Select
                  labelId="themes"
                  id="themes_input"
                  value={state.theme}
                  label="Themes"
                  onChange={(e) => setState({ ...state, theme: e.target.value })}
                >
                  {themes.map((item) => {
                    return (
                      <MenuItem key={item} value={item}>{item.toUpperCase()}</MenuItem>
                    );
                  })}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth>
                <InputLabel id="language">Language</InputLabel>
                <Select
                  labelId="language"
                  id="language_input"
                  value={state.mode}
                  label="Language"
                  onChange={(e) => setState({ ...state, mode: e.target.value })}
                >
                  {languages.map((item) => {
                    return (
                      <MenuItem key={item} value={item}>{item.toUpperCase()}</MenuItem>
                    );
                  })}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <AceEditor
                style={{ width: "100%" }}
                mode={state.mode}
                theme={state.theme}
                onChange={setCode}
                value={code}
                defaultValue={code}
                fontSize={state.fontSize}
                showPrintMargin={state.showPrintMargin}
                showGutter={state.showGutter}
                highlightActiveLine={state.highlightActiveLine}
                setOptions={{
                  useWorker: false,
                  enableBasicAutocompletion: state.enableBasicAutocompletion,
                  enableLiveAutocompletion: state.enableLiveAutocompletion,
                  enableSnippets: state.enableSnippets,
                  showLineNumbers: state.showLineNumbers,
                  tabSize: 2
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <Button
                startIcon={<Copy />}
                sx={{ width: "100%" }} variant={"contained"} color={"success"}
                onClick={() => {
                  copyToClipboardLargeData(code);
                  setOpenSnackbar({ type: "success", message: "Copy code success!" });
                }}>Copy code</Button>
            </Grid>
          </Grid>

          {openSnackbar &&
          <Snackbar
            anchorOrigin={{ vertical: "top", horizontal: "right" }}
            open={!!openSnackbar} autoHideDuration={6000} onClose={() => setOpenSnackbar(null)}>
            <Alert onClose={() => setOpenSnackbar(null)} severity={openSnackbar?.type} sx={{ width: "100%" }}>
              {openSnackbar.message}
            </Alert>
          </Snackbar>}
        </Box>
        <Box sx={{ padding: 2, width: "100%" }}>
          <ToolDetailFooter />
        </Box>
      </div>
    </ToolDetailPageWrapper>
  );
};

IDEEditor.propTypes = {};

export default IDEEditor;