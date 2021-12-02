import React, { useState } from "react";
import ToolDetailPageWrapper from "../../components/containers/tools/ToolDetailPageWrapper";
import { Alert, Box, Grid, Snackbar, Typography } from "@mui/material";
import ToolDetailFooter from "../../components/components/ToolDetailFooter";
import ExportExcelTool from "../../components/containers/tools/tool_002/ExportExcelTool";

const ExtractDataExcelFile = props => {
  const [openSnackbar, setOpenSnackbar] = useState(null);
  return (
    <ToolDetailPageWrapper
      title={"Tools For Developer | Export data excel to json format"}
      description={"Tools For Developer | Export data excel to json format, tools"}
    >
      <div className={"fw fh"}>
        <Typography variant={"h2"} px={2}>NextJS Export data excel to json format</Typography>
        <Box sx={{ padding: 2, width: "100%", height: "100%" }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <ExportExcelTool setOpenSnackbar={setOpenSnackbar} />
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

ExtractDataExcelFile.propTypes = {};

export default ExtractDataExcelFile;