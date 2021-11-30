import React, { useState } from "react";
import ToolDetailPageWrapper from "../../components/containers/tools/ToolDetailPageWrapper";
import { Alert, Box, Button, Grid, Snackbar, Stack, TextField, Typography } from "@mui/material";
import ToolDetailFooter from "../../components/components/ToolDetailFooter";
import { Copy } from "phosphor-react";
import { copyToClipboardLargeData } from "../../src/shared/utils/DomUtils";

const Tool004 = props => {
  const [inputData, setInputData] = useState("string a\nstring b");
  const [result, setResult] = useState(null);
  const [openSnackbar, setOpenSnackbar] = useState(null);

  const onConvertData = () => {
    let lines = inputData.split(/\n/);
    let strResult = "[\n"
    for (let i = 0; i < lines.length; i++) {
      strResult = strResult + "\t" + `"${lines[i].trim()}"` + ",\n"
    }
    strResult = strResult.substring(0, strResult.lastIndexOf(","))
    setResult(strResult + "\n]")
  }

  return (
    <ToolDetailPageWrapper
      title={"Tools For Developer | Convert multiple lines to a Javascript array format."}
      description={"Tools For Developer | convert string line to array, tools"}
    >
      <div className={"fw fh"}>
        <Typography variant={"h2"} px={2}>Enter multiple lines of things here and it will be converted to a Javascript array format.</Typography>
        <Box sx={{ padding: 2, width: "100%", height: "100%" }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Stack spacing={2}>
              <TextField
                id="data_input"
                label="Data input"
                multiline
                rows={12}
                defaultValue={inputData}
                fullWidth
                value={inputData}
                variant="filled"
                onChange={e => setInputData(e.target.value)}
              />
                <Button
                  startIcon={<Copy />}
                  sx={{ width: "100%" }} variant={"contained"} color={"success"}
                  onClick={onConvertData}>Convert</Button>
              </Stack>
            </Grid>

            <Grid item xs={12}>
              <Stack spacing={2}>
                <TextField
                  id="result"
                  label="Result"
                  multiline
                  rows={12}
                  defaultValue={result}
                  fullWidth
                  value={result}
                  variant="filled"
                />
                <Button
                  startIcon={<Copy />}
                  id="go"
                  disabled={!result}
                  sx={{ width: "100%" }} variant={"contained"} color={"success"}
                  onClick={() => {
                    copyToClipboardLargeData(result);
                    setOpenSnackbar({ type: "success", message: "Copy data result success!" });
                  }}>Copy result</Button>
              </Stack>
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

Tool004.propTypes = {

};

export default Tool004;