import React, { useState } from "react";
import { Alert, Box, Button, Grid, Snackbar, Stack, TextField, Typography } from "@mui/material";
import ToolDetailFooter from "../../../components/ToolDetailFooter";
import { Copy } from "phosphor-react";
import { copyToClipboardLargeData } from "shared/utils/DomUtils";

const DetectBrowserPage = props => {

  const [result, setResult] = useState(null);
  const [openSnackbar, setOpenSnackbar] = useState(null);

  const onDetectBrowser = () => {
    let isOpera = (!!window.opr && !!window.opr.addons) || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;

    // Firefox 1.0+
    let isFirefox = typeof InstallTrigger !== 'undefined';

    // Safari 3.0+ "[object HTMLElementConstructor]"
    let isSafari = /constructor/i.test(window.HTMLElement) || (function (p) {
      return p.toString() === "[object SafariRemoteNotification]";
    })(!window['safari'] || (typeof safari !== 'undefined' && window.safari.pushNotification));

    // Internet Explorer 6-11
    let isIE = /*@cc_on!@*/!!document.documentMode;

    // Edge 20+
    let isEdge = !isIE && !!window.StyleMedia;

    // Chrome 1 - 71
    let isChrome = !!window.chrome && (!!window.chrome.webstore || !!window.chrome.runtime);

    // Blink engine detection
    let isBlink = (isChrome || isOpera) && !!window.CSS;

    setResult({isBlink, isChrome, isOpera, isEdge, isFirefox, isSafari})
  }

  return (
    <div className={"fw fh"}>
      <Typography variant={"h2"} px={2} >Detect browser using javascript</Typography>
      <Box sx={{ padding: 2, width: "100%", height: "100%" }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Button
              sx={{ width: "100%" }}
              variant={"contained"}
              color={"info"}
              onClick={onDetectBrowser}>Detected browser current</Button>
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

DetectBrowserPage.propTypes = {

};

export default DetectBrowserPage;