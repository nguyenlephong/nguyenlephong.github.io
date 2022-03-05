import React, { Component } from "react";
import XLSX from "xlsx";
import { make_cols } from "./MakeColumns";
import { SheetJSFT } from "./types";
import {
  Avatar,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent, DialogContentText,
  DialogTitle, FormControl, FormHelperText,
  Grid,
  Icon, InputLabel, Select,
  Stack, MenuItem,
  Typography
} from "@mui/material";
import { Calculator, Copy, Upload } from "phosphor-react";
import { DataGrid } from "@mui/x-data-grid";
import { copyToClipboardLargeData } from "shared/utils/DomUtils";

class ExportExcelTool extends Component {
  constructor(props) {
    super(props);
    this.state = {
      pageSize: 5,
      file: {},
      data: [],
      cols: [],
      columns: [],
      dataSource: [],
      spinning: false,
      key: "",
      value: "",
      isHiddenUploadBtn: false,
      isHiddenHandleBtn: false,
      openDialogConfirm: false
    };
    this.handleFile = this.handleFile.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }


  handleChange(e) {
    const files = e.target.files;
    if (files && files[0]) this.setState({ file: files[0], isHiddenUploadBtn: true });
  }

  handleFile() {
    this.setState({ spinning: true });
    /* Boilerplate to set up FileReader */
    // console.log(JSON.stringify(this.state.data, null, 2));
    const reader = new FileReader();
    const rABS = !!reader.readAsBinaryString;

    reader.onload = (e) => {
      /* Parse data */
      const bstr = e.target.result;
      const wb = XLSX.read(bstr, { type: rABS ? "binary" : "array", bookVBA: true });
      /* Get first worksheet */
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      /* Convert array of arrays */
      const data = XLSX.utils.sheet_to_json(ws);
      /* Update state */
      this.setState({ data: data, cols: make_cols(ws["!ref"]) });

      if (data.length > 0) {
        this.handleGenerateTable(data);
      }
    };

    if (rABS) {
      reader.readAsBinaryString(this.state.file);
    } else {
      reader.readAsArrayBuffer(this.state.file);
    }
  }

  copyToClipboard = (value) => {
    const el = document.createElement("textarea");
    el.value = value;
    document.body.appendChild(el);
    el.select();
    document.execCommand("copy");
    document.body.removeChild(el);
  };

  handleGenerateTable = (data) => {
    let columns = [];
    let dataSource = data;
    const header = Object.keys(data[0]);

    header.map((val, ind) => {
      let obj = {
        field: val,
        headerName: val,
        key: val,
        width: 200
      };

      if (ind <= 0) {
        obj["fixed"] = "left";
      }
      if (ind === header.length - 1) {
        obj["fixed"] = "right";
      }
      return columns.push(obj);
    });

    dataSource = dataSource.map((x, ind) => {
      return {
        ...x,
        id: ind
      };
    });

    this.setState({
      columns: columns,
      dataSource: dataSource,
      spinning: false,
      isHiddenHandleBtn: true
    });
  };

  handleImportObj = async () => {
    let size = this.state.dataSource.length;
    this.setState({ spinning: true });
    if (size > 200) {
      copyToClipboardLargeData(JSON.stringify(this.state.dataSource));
      this.props.setOpenSnackbar({
        message: "Copy into clipboard success!",
        type: "success"
      });
      this.setState({ spinning: false });
    } else {
      this.copyToClipboard(JSON.stringify(this.state.dataSource));
      this.setState({ spinning: false });
      this.props.setOpenSnackbar({
        message: "Copy into clipboard success!",
        type: "success"
      });
    }
  };

  onCopyJSONMessageType = () => {
    let key = this.state.key
    let value = this.state.value
    let data = this.state.dataSource

    let results = {}
    data.forEach(item => {
      if(item[value]) results[item[key]] = item[value]
    })
    copyToClipboardLargeData(JSON.stringify(results));
    this.onCloseDialogConfirmCopyJSONAction()
    this.props.setOpenSnackbar({
      message: "Copy into clipboard success!",
      type: "success"
    });
  }

  onCloseDialogConfirmCopyJSONAction = () => {
    this.setState({openDialogConfirm: false})
  }

  getRowPerPageList = () => {
    let size = this.state.data.length;
    if(size < 10) return [5]
    if(size < 100) return [5, 10, 20, 50]
    if(size < 200) return [5, 10, 20, 50, 100]
    if(size < 500) return [5, 10, 20, 50, 100, 200]
    if(size < 1000) return [5, 10, 20, 50, 100, 200, 500]
    if(size < 10000) return [ 50, 100, 200, 500, 1000, 2000]
    return [5]
  }

  render() {
    const { columns, dataSource } = this.state;

    return (
      <Stack spacing={2}>

        <Box>
          <Typography pb={2} variant={"h4"}>Upload excel file here:</Typography>
          {!this.state.isHiddenUploadBtn &&
          <Button
            pt={2}
            startIcon={<Upload size={24} /> }
            variant={"contained"} color={"success"}>
            <label htmlFor="file">
              Upload
            </label>
          </Button>
          }

          <input
            style={{ display: "none" }} type="file" className="form-control" id="file" accept={SheetJSFT}
            onChange={this.handleChange} />
          <br />
        </Box>


        {
          this.state.file.name &&
          <Box className="file_uploads">
            <Stack direction={"row"} spacing={2}>
              <Avatar
                className="file_img" shape="square"
                src={`https://calendarmedia.blob.core.windows.net/assets/c215d361-2f49-42c6-93e6-176f7b48c78b-small.png`} />
              <Typography variant={"h4"}>{this.state.file.name}</Typography>
            </Stack>
          </Box>
        }

        <Grid container spacing={2}>
          {
            this.state.file.name &&
            <Grid item xs={12}>
              <Stack direction="row" spacing={2}>
                <Button
                  startIcon={<Upload size={24} />}
                  variant={"contained"}
                  color={"primary"}>
                  <label htmlFor="file">
                    Upload another File
                  </label>
                </Button>

                <Button
                  variant={"contained"}
                  color={"success"}
                  startIcon={<Calculator size={24} />}
                  onClick={this.handleFile}
                  loading={this.state.spinning}
                  loadingPosition="start"
                >
                  Handle data
                </Button>

                {
                  this.state.data.length > 0 &&
                  <Button
                    variant={"contained"}
                    color={"success"}
                    onClick={this.handleImportObj}
                    startIcon={<Copy size={24} />}
                  >
                    <Icon type="save" /> Copy Data
                  </Button>
                }

                {
                  this.state.data.length > 0 &&
                  <Button
                    variant={"contained"}
                    color={"success"}
                    onClick={() => {this.setState({openDialogConfirm: true})}}
                    startIcon={<Copy size={24} />}
                  >
                    <Icon type="save" /> Copy JSON With Key/Value Message
                  </Button>
                }
              </Stack>
            </Grid>
          }

          {
            this.state.data.length > 0 &&
            <Grid
              sx={{
                height: 600,
                width: "100%"
              }}
              item xs={12}>
              <DataGrid
                pageSize={this.state.pageSize}
                onPageSizeChange={(newPageSize) => this.setState({ pageSize: newPageSize })}
                rows={dataSource}
                columns={columns}
                rowsPerPageOptions={this.getRowPerPageList()}
                checkboxSelection
              />
            </Grid>
          }
        </Grid>

        <Dialog open={this.state.openDialogConfirm} onClose={this.onCloseDialogConfirmCopyJSONAction}>
          <DialogTitle>Choose Key and Value to create JSON </DialogTitle>
          <DialogContent>
            <DialogContentText>
              Choose two columns to mapping JSON {`<key>:<value>`}
            </DialogContentText>

            <Stack>
              <FormControl sx={{ m: 1, minWidth: 120 }}>
                <InputLabel id="select-key-label">KEY</InputLabel>
                <Select
                  labelId="select-key-label"
                  id="select-key"
                  value={this.state.key}
                  label="KEY"
                  onChange={e => this.setState({key: e.target.value})}
                >

                  {
                    this.state.columns.map(col => {
                      return (
                          <MenuItem key={col.key} value={col.key}>{col.key}</MenuItem>
                        )
                    })
                  }
                </Select>
                <FormHelperText>Key of message</FormHelperText>
              </FormControl>

              <FormControl sx={{ m: 1, minWidth: 120 }}>
                <InputLabel id="select-value-label">Value</InputLabel>
                <Select
                  labelId="select-value-label"
                  id="select-value"
                  value={this.state.value}
                  label="Value"
                  onChange={e => this.setState({value: e.target.value})}
                >

                  {
                    this.state.columns.map(col => {
                      return (
                        <MenuItem key={col.key} value={col.key}>{col.key}</MenuItem>
                      )
                    })
                  }
                </Select>
                <FormHelperText>Value of key</FormHelperText>
              </FormControl>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.onCloseDialogConfirmCopyJSONAction}>Cancel</Button>
            <Button onClick={this.onCopyJSONMessageType}>Copy</Button>
          </DialogActions>
        </Dialog>

      </Stack>
    );
  }
}

export default ExportExcelTool;