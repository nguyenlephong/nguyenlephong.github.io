import React, { useState } from "react";
import ToolDetailPageWrapper from "../../components/containers/tools/ToolDetailPageWrapper";
import { Box, Grid, Typography } from "@mui/material";
import ToolDetailFooter from "../../components/components/ToolDetailFooter";
import MonacoEditor from "@monaco-editor/react";
import {
  IDEMonacoOptions,
  languageSupports,
  monacoExamplesCode
} from "../../components/containers/tools/ide-monaco/MonacoConfig";
import MonacoSettings from "../../components/containers/tools/ide-monaco/MonacoSettings";


const IDEMonacoEditor = props => {
  const [monacoTheme, setMonacoTheme] = useState("dark");
  const [selectedLanguageId, setSelectedLanguageId] = useState(20);
  const [options, setOptions] = useState(IDEMonacoOptions);
  const language = languageSupports.find(({ id }) => id === selectedLanguageId).name;

  const handleEditorWillMount = (monaco) => {
    monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
      target: monaco.languages.typescript.ScriptTarget.Latest,
      module: monaco.languages.typescript.ModuleKind.ES2015,
      allowNonTsExtensions: true,
      lib: ["es2018"]
    });
  };

  return (
    <ToolDetailPageWrapper
      title={"Tools For Developer | IDE Monaco Github Editor "}
      description={"Tools For Developer | IDE Monaco Github Editor, tools, json, javascript, java"}
    >
      <div className={"fw fh"}>
        <Typography variant={"h4"} px={2}>IDE Monaco Github Editor</Typography>
        <Box sx={{ padding: 2, width: "100%", height: "100%" }}>
          <Grid container spacing={2}>
            <Grid item xs={12} lg={8} sx={{height: {xs: 500, lg: 'unset'}}}>
              <MonacoEditor
                theme={monacoTheme}
                height="100%"
                path={language}
                defaultValue={monacoExamplesCode[selectedLanguageId] || ""}
                defaultLanguage={language}
                options={options}
                beforeMount={handleEditorWillMount}
              />
            </Grid>

            <Grid item xs={12} lg={4}>
              <MonacoSettings
                options={options}
                setOptions={setOptions}
                monacoTheme={monacoTheme}
                setMonacoTheme={setMonacoTheme}
                selectedLanguageId={selectedLanguageId}
                setSelectedLanguageId={setSelectedLanguageId} />
            </Grid>
          </Grid>
        </Box>
        <Box sx={{ padding: 2, width: "100%" }}>
          <ToolDetailFooter />
        </Box>
      </div>
    </ToolDetailPageWrapper>
  );
};

IDEMonacoEditor.propTypes = {};

export default IDEMonacoEditor;