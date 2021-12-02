import React, { useState } from "react";
import ToolDetailPageWrapper from "../../components/containers/tools/ToolDetailPageWrapper";
import {
  Alert,
  Box, Button,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Snackbar, Stack,
  TextField,
  Typography
} from "@mui/material";
import axios from "axios";
import ToolDetailFooter from "../../components/components/ToolDetailFooter";
import { Copy, Cpu, PhoneOutgoing } from "phosphor-react";
import { copyToClipboardLargeData } from "shared/utils/DomUtils";

const CallApiOnlineTools = props => {

  const [headerInput, setHeaderInput] = useState({
    "Accept": "application/json",
    "Content-Type": "application/json",
    "access-control-request-origin": "*",
    "Access-Control-Allow-Origin": "*",
    "Authorization": " Bearer "
  });

  const [curlString, setCurlString] = useState("");
  const [bodyInput, setBodyInput] = useState(null);
  const [endpoint, setEndpoint] = useState("https://api.amuletstore.net/health-check");
  const [method, setMethod] = useState("GET");
  const [resultResponse, setResultResponse] = useState({});
  const [openSnackbar, setOpenSnackbar] = useState(null);

  const onCallApi = () => {
    return axios({
      url: endpoint,
      method,
      headers: {
        ...headerInput
      },
      data: bodyInput
    }).then(res => {
      setResultResponse(res);
    }).catch(err => {
      setResultResponse(err.response);
    });
  };

  const onMappingRequest = () => {
    if (!curlString) {
      setOpenSnackbar({
        message: "Curl is not empty!!!",
        type: "error"
      });
      return;
    }

    let arr = curlString.split("\\");
    let res = {
      endpoint: null,
      header: {},
      body: null
    };

    for (let i = 0; i < arr.length; i++) {
      let item = arr[i];
      if (item.includes("curl")) {
        res.endpoint = item.substring(item.indexOf("curl") + 6, item.length - 2);
      } else if (item.includes("-H")) {
        let headerItem = item.substring(item.indexOf("-H") + 4, item.length - 2);
        let arrKeyHeader = headerItem.split(":");
        res.header[arrKeyHeader[0].toString()] = arrKeyHeader[1].trim();
      } else if (item.includes("--data-binary")) {
        let bodyItem = item.substring(item.indexOf("--data-binary") + 15, item.length - 2);
        res.body = JSON.parse(`${bodyItem}`);
      }
    }

    if (res.endpoint) {
      setEndpoint(res.endpoint);
      setHeaderInput(res.header);
      setBodyInput(res.body);

      setOpenSnackbar({
        message: "Convert success, please help me update method manual. Thanks!",
        type: "success"
      });
    }
  };

  return (
    <ToolDetailPageWrapper
      title={"Tools For Developer | Call API online tools"}
      description={"Tools For Developer | Call API online tools, tools"}
    >
      <div className={"fw fh"}>
        <Typography variant={"h2"} px={2}>Call API online tools</Typography>
        <Box sx={{ padding: 2, width: "100%", height: "100%" }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={8}>
              <TextField
                label={"Result"}
                id="result_input"
                fullWidth
                onChange={e => setEndpoint(e.target.value)}
                value={endpoint}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel id="method">Method</InputLabel>
                <Select
                  labelId="method"
                  id="method_input"
                  value={method}
                  label="Method"
                  onChange={(e) => setMethod(e.target.value)}
                >
                  <MenuItem value="PUT">PUT</MenuItem>
                  <MenuItem value="UPDATE">UPDATE</MenuItem>
                  <MenuItem value="DELETE">DELETE</MenuItem>
                  <MenuItem value="GET">GET</MenuItem>
                  <MenuItem value="POST">POST</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                id="header_data"
                label="Header Data"
                multiline
                rows={12}
                fullWidth
                key={JSON.stringify(headerInput, null, 2)}
                defaultValue={JSON.stringify(headerInput, null, 2)}
                // value={JSON.stringify(headerInput, null, 2)}
                onBlur={e => setHeaderInput(JSON.parse(e.target.value))}
                variant="filled"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                id="body_data"
                label="Body Data"
                multiline
                rows={12}
                fullWidth
                key={JSON.stringify(bodyInput, null, 2)}
                // value={JSON.stringify(bodyInput, null, 2)}
                defaultValue={JSON.stringify(bodyInput, null, 2)}
                onBlur={e => setBodyInput(JSON.parse(e.target.value))}
                variant="filled"
              />
            </Grid>

            <Grid item xs={12}>
              <Stack spacing={2}>
                <Typography variant={"h4"}>Or using curl string</Typography>
                <Typography variant={"h6"}>Paste Curl string into here</Typography>
                <TextField
                  id="curl"
                  label="Curl"
                  multiline
                  rows={12}
                  fullWidth
                  value={curlString}
                  placeholder={`curl 'https://api.amuletstore.net/health-check' \\
  -H 'Connection: keep-alive' \\
  -H 'Access-Control-Allow-Origin: *' \\
  -H 'Accept: application/json' \\
  -H 'access-control-request-origin: *' \\
  -H 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.183 Safari/537.36' \\
  -H 'Content-Type: application/json' \\
  -H 'Origin: http://localhost:3000' \\
  -H 'Sec-Fetch-Site: cross-site' \\
  -H 'Sec-Fetch-Mode: cors' \\
  -H 'Sec-Fetch-Dest: empty' \\
  -H 'Referer: http://localhost:3000/' \\
  -H 'Accept-Language: vi-VN,vi;q=0.9,fr-FR;q=0.8,fr;q=0.7,en-US;q=0.6,en;q=0.5' \\
  --compressed`}
                  onChange={e => setCurlString(e.target.value)}
                  variant="filled"
                />
              </Stack>
            </Grid>

            <Grid item xs={12}>
              <Stack spacing={2} direction={"row"}>
                <Button
                  startIcon={<Cpu size={24} />}
                  disabled={!curlString}
                  onClick={onMappingRequest}
                  variant={"contained"} color={"success"}>
                  Extract data and mapping help me
                </Button>

                <Button
                  startIcon={<PhoneOutgoing size={24} />}
                  onClick={onCallApi}
                  variant={"contained"} color={"success"}>
                  Call Api
                </Button>
              </Stack>
            </Grid>


            <Grid item xs={12}>
              <Stack spacing={2}>
                <TextField
                  id="result"
                  label="Result Response"
                  multiline
                  rows={12}
                  fullWidth
                  value={JSON.stringify(resultResponse, null, 2)}
                  disabled={false}
                  variant="filled"
                />

                <Button
                  startIcon={<Copy />}
                  sx={{ width: "100%" }} variant={"contained"} color={"success"}
                  onClick={() => {
                    copyToClipboardLargeData(JSON.stringify(resultResponse, null, 2));
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

CallApiOnlineTools.propTypes = {};

export default CallApiOnlineTools;