import React from "react";
import ToolDetailFooter from "../../../components/ToolDetailFooter";
import { Box, Grid, Stack, Typography } from "@mui/material";
import { LiveEditor, LiveError, LivePreview, LiveProvider } from "react-live";

const codeExampleInit = `function helloWorld() {
  return <h2>Hi, I am Nguyen Le Phong!</h2>;
}`;

const LiveReactEditorPage = props => {
  return (
    <div className={"fw fh"}>
      <Typography variant={"h2"} px={2}>React live - Component coding online</Typography>
      <Box sx={{ padding: 2, width: "100%", height: "100%" }}>
        <LiveProvider code={codeExampleInit}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <LiveEditor style={{ background: "#000" }} />
            </Grid>

            <Grid item xs={12}>
              <Stack spacing={2}>
                <Typography variant={"h5"}>Result:</Typography>
                <LiveError />
                <LivePreview />
              </Stack>
            </Grid>

          </Grid>
        </LiveProvider>
      </Box>
      <Box sx={{ padding: 2, width: "100%" }}>
        <ToolDetailFooter />
      </Box>
    </div>
  );
};

LiveReactEditorPage.propTypes = {};

export default LiveReactEditorPage;