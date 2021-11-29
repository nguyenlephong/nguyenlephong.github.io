import React, { useState } from "react";
import Head from "next/head";
import Header from "components/components/Header";
import { Fade } from "react-bootstrap";
import Footer from "components/components/Footer";
import TopButton from "components/components/TopButton";
import WrapperProvider from "components/WrapperProvider";
import { useSelector } from "reduxs/store";
import { Alert, Box, Button, Grid, Snackbar, Stack, TextField, Typography } from "@mui/material";
import { Copy } from "phosphor-react";
import { copyToClipboardLargeData } from "shared/utils/DomUtils";
import ToolDetailFooter from "components/components/ToolDetailFooter";

const MyComponent = props => {
  const chosenThemeInit = useSelector(store => store.themes).currentThemes;
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
    <WrapperProvider>
      <Head>
        <title>{ "Tools For Developer | Get all param from url to JSON object"}</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        <meta
          name="description"
          content="Tools For Developer. A passionate individual who always thrives to work on end-to-end products which develop sustainable and scalable social and technical systems to create impact."
        />
      </Head>
      <div>
        <Header theme={chosenThemeInit} />
        <Fade bottom duration={2000} distance="40px">
          <div className={"fw fh"}>
            <Typography variant={"h2"} px={2} >Get all param from url to JSON object</Typography>
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
        </Fade>
        <Footer theme={chosenThemeInit} />
        <TopButton theme={chosenThemeInit} />
      </div>
    </WrapperProvider>
  );
};

MyComponent.propTypes = {

};

export default MyComponent;