import React, { useState } from "react";
import ToolDetailPageWrapper from "../../components/containers/tools/ToolDetailPageWrapper";
import { Box, Grid, Typography } from "@mui/material";
import ToolDetailFooter from "../../components/components/ToolDetailFooter";
import ExampleMarkdownFile from "../../components/containers/tools/tool_014/ExampleMarkdown.md";
import dynamic from "next/dynamic";

const MDEditor = dynamic(
  () => import("@uiw/react-md-editor"),
  { ssr: false }
);

const MarkdownLiveEditor = props => {
  const [markdownValue, setMarkdownValue] = useState(ExampleMarkdownFile);

  const handleChangeMarkdown = (value) => {
    setMarkdownValue(value);
  };


  return (
    <ToolDetailPageWrapper
      title={"Tools For Developer | NextJS Markdown live editor - Component coding online"}
      description={"Tools For Developer | NextJS Markdown live editor - Component coding online, tools"}
    >
      <div className={"fw fh"}>
        <Typography variant={"h2"} px={2}>NextJS Markdown live editor - Component coding online</Typography>
        <Box sx={{ padding: 2, width: "100%", height: "100%" }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <MDEditor style={{ minWidth: 480 }} height={600} value={markdownValue} onChange={handleChangeMarkdown} />
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

MarkdownLiveEditor.propTypes = {};

export default MarkdownLiveEditor;