import React, { useState } from "react";
import { Alert, Box, Button, Grid, Snackbar, Stack, TextField } from "@mui/material";
import ToolDetailFooter from "../../../components/ToolDetailFooter";
import { Copy } from "phosphor-react";
import { copyToClipboardLargeData } from "shared/utils/DomUtils";

let exampleURL = `https://wp.primedata.ai/2020/11/05/testing-campaign-analytics/?utm_campaign=ARPU%20Increase%20Experiment&utm_content=30%25%20Discount&utm_promotion=Free%20shipping&utm_source=Facebook&utm_channel_tactic=Landing%20Page%20Views&utm_medium=cpc&author=nguyentlt`;

const SearchParamURLPage = props => {

  const [urlParam, setUrlParam] = useState(exampleURL);
  const [result, setResult] = useState(null);
  const [openSnackbar, setOpenSnackbar] = useState(null);

  const onGetParamObjectJSON = () => {
    const queryString = urlParam.substring(urlParam.indexOf("?"), urlParam.length);

    const urlParams = new URLSearchParams(queryString);

    const
      keys = urlParams.keys(),
      values = urlParams.values(),
      entries = urlParams.entries();

    for (const key of keys) console.log(key);

    for (const value of values) console.log(value);

    let objectJson = {};
    for (const entry of entries) {
      objectJson[entry[0]] = entry[1];
    }
    setResult(objectJson);
    return objectJson;
  };
  return (
    <div className={"fw fh"}>
      <Box sx={{ padding: 2, width: "100%", height: "100%" }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              id="urlParam"
              label="Paste URL to here:"
              multiline
              rows={12}
              fullWidth
              value={urlParam}
              variant="filled"
              onChange={e => setUrlParam(e.target.value)}
            />
          </Grid>

          <Grid item xs={12}>
            <Button
              sx={{ width: "100%" }}
              variant={"contained"}
              color={"info"}
              onClick={onGetParamObjectJSON}>Extract search param</Button>
          </Grid>

          <Grid item xs={12}>
            <Stack spacing={2}>
              <TextField
                id="result"
                label="Result"
                multiline
                rows={12}
                fullWidth
                value={JSON.stringify(result, null, 2)}
                variant="filled"
              />
              <Button
                startIcon={<Copy />}
                sx={{ width: "100%" }} variant={"contained"} color={"success"}
                onClick={() => {
                  copyToClipboardLargeData(JSON.stringify(result, null, 2));
                  setOpenSnackbar({ type: "success", message: "Copy data result after mapping success!" });
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
  );
};

SearchParamURLPage.propTypes = {};

export default SearchParamURLPage;