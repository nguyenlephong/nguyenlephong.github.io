import React, { useEffect, useState } from "react";
import ToolDetailFooter from "../../../components/ToolDetailFooter";
import { Alert, Box, Button, Grid, Snackbar, Stack, TextField, Typography } from "@mui/material";
import QRCode from "qrcode";
import { saveAs } from "file-saver";
import { Copy } from "phosphor-react";

const opts = {
  errorCorrectionLevel: "H",
  type: "image/jpeg",
  quality: 0.3,
  margin: 1,
  color: {
    dark: "#010599FF",
    light: "#FFBF60FF"
  }
};

const QRCodeJsPage = props => {

  const [isFirstRun, setIsFirstRun] = useState(false);
  const [qrCodeData, setQrCodeData] = useState("https://nguyenlephong.github.io/");
  const [openSnackbar, setOpenSnackbar] = useState(null);


  const rawQrCode = () => {

    QRCode.toDataURL(qrCodeData, opts, function(err, url) {
      if (err) throw err;
      let img = document.getElementById("qr-code-area");
      img.src = url;
    });

    let canvas = document.getElementById("qr-code-area-canvas");
    QRCode.toCanvas(canvas, qrCodeData, function(error) {
      if (error) console.error(error);
    });
  };

  const saveQrCode = () => {

    let canvas = document.getElementById("qr-code-area-canvas");

    canvas.toBlob(function(blob) {
      saveAs(blob, "amulet-store-qrcode.png");
    });

    setOpenSnackbar({
      type: "success",
      message: "Download QR Code success!"
    })

  };

  useEffect(() => {
    setIsFirstRun(true);
  }, []);

  if (isFirstRun) {
    setIsFirstRun(false);
    rawQrCode();
  }
  return (
    <div className={"fw fh"}>
      <Typography variant={"h2"} px={2}>Creative QR code which you want</Typography>
      <Box sx={{ padding: 2, width: "100%", height: "100%" }}>
        <Grid container spacing={2}>
          <Grid item xs={12} lg={8}>
            <Stack spacing={2}>
              <Typography variant={"h5"}>Input data which you want to compress into qr code</Typography>
              <TextField
                multiline
                rows={8}
                fullWidth
                value={qrCodeData}
                onChange={(e) => setQrCodeData(e.target.value)}
                id={"text-obj-origin"}
                variant="filled"
              />
            </Stack>
          </Grid>

          <Grid item xs={12} lg={4}>
            <Stack spacing={2}>
              <Button
                sx={{ width: "fit-content" }}
                variant={"contained"}
                color={"success"}
                data-tut="btn-get-qr-code" onClick={rawQrCode}>
                Render QrCode
              </Button>
              <img className={"pd-mg-top-8"} data-tut="qr-code-render" width={200} height={200} alt={qrCodeData}
                   id={"qr-code-area"} />

              <canvas id="qr-code-area-canvas" style={{ display: "none" }} />
            </Stack>
          </Grid>

          <Grid item xs={12} lg={8}>
            <Button
              startIcon={<Copy />}
              sx={{ width: "100%" }} variant={"contained"} color={"success"}
              onClick={() => {
                saveQrCode();
                setOpenSnackbar({ type: "success", message: "Copy data result after mapping success!" });
              }}>
              Save Qr Code by Image
            </Button>
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

QRCodeJsPage.propTypes = {};

export default QRCodeJsPage;