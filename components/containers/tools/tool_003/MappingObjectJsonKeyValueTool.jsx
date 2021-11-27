import React, { useState } from "react";
import { copyToClipboardLargeData } from "../../../../src/shared/utils/DomUtils";
import { Box, TextField, Grid, Button, Stack, Alert, Snackbar } from "@mui/material";
import { Copy } from "phosphor-react";
import ToolDetailFooter from "../../../../components/components/ToolDetailFooter";

const generateID = () => {
  // I generate the UID from two parts here
  // to ensure the random number provide enough bits.
  let firstPart = (Math.random() * 46656) | 0;
  let secondPart = (Math.random() * 46656) | 0;
  firstPart = ("000" + firstPart.toString(36)).slice(-3);
  secondPart = ("000" + secondPart.toString(36)).slice(-3);
  return firstPart + secondPart;
};

const REGEX_GET_KEY_VALUE = /(".*")[:]\s(".*")/gm;
// const REGEX_GET_KEY_VALUE = /(?:\"|\')(?<key>[^"]*)(?:\"|\')(?=:)(?:\:\s*)(?:\"|\')?(?<value>true|false|[0-9a-zA-Z\+\-\,\.\$]*)/gm;
// const REGEX_GET_KEY = /"(.*)":/gm;

const fillOriginExample = `{
  "pages": {
    "string-utils": {
      "tool_001": {
        "title": "Check text is Vietnamese character",
        "is-vn-text": "Is Vietnamese character"
      }
    },
    "features": {
      "tool_003": {
        "title-origin": "Object JSON Origin",
        "title-trans": "Data translate from https://translate.google.com/",
        "title-mapping": "This is a data mapping"
      }
    }
  },
  "messages": {
    "coming-soon": "Feature coming soon!",
    "data-form": {
      "not-empty": "Data form is not empty!"
    }
  },
  "btn": {
    "convert": "Convert",
    "mapping": "Mapping",
    "copy": "Copy"
  }
}`;
const fillTextTranslateExample = `{
   "khlboi7x_4774970252465103": "Kiểm tra văn bản là ký tự tiếng Việt",
   "khlboi7x_32234126914098016": "Là chữ Việt",
   "khlboi7x_6292008802603346": "Nguồn gốc JSON đối tượng",
   "khlboi7x_5985533495787168": "Dịch dữ liệu từ https://translate.google.com/",
   "khlboi7x_11087633869463587": "Đây là ánh xạ dữ liệu",
   "khlboi7x_3075462337068702": "Sắp có tính năng!",
   "khlboi7x_6079539998823633": "Biểu mẫu dữ liệu không trống!",
   "khlboi7x_842069746242591": "Chuyển đổi",
   "khlboi7x_047821790003746534": "Lập bản đồ",
   "khlboi7x_2933663803661122": "Sao chép"
}`;

const MappingKeyValueTool = () => {

  const [isActiveMapping, setIsActiveMapping] = useState(true);

  const [openSnackbar, setOpenSnackbar] = useState(null);

  const [objOrigin, setObjOrigin] = useState(null);
  const [objTranslate, setObjTranslate] = useState(null);
  const [objMapping, setObjMapping] = useState(null);

  const [keyMapping, setKeyMapping] = useState(null);

  const fillDataOrigin = () => {
    setObjOrigin(fillOriginExample);
  };

  const onCloseSnackbar = () => {
    setOpenSnackbar(null);
  };

  const fillDataTranslate = () => {
    setIsActiveMapping(false);
    setObjTranslate(fillTextTranslateExample);
  };

  const onChangeObjText = (v, fName) => {
    if (fName === "ORIGIN") {
      setObjOrigin(v);
    } else if (fName === "TRANSLATE") {
      setObjTranslate(v);
    }
  };

  const onPrepareData = () => {
    if (!objOrigin) {
      setOpenSnackbar({ type: "error", message: "You not yet paste data handle!" });
      return;
    }

    let objCopyToTrans = {};

    let dataKeyMap = [];
    let dataMatchKeyValue = objOrigin.match(REGEX_GET_KEY_VALUE);

    dataMatchKeyValue.forEach(itemKV => {
      let raws = itemKV.split(": ");
      let keyItem = raws[0].match(/(?:"[^"]*"|^[^"]*$)/)[0].replace(/"/g, "");
      let valueItem = raws[1].match(/(?:"[^"]*"|^[^"]*$)/)[0].replace(/"/g, "");
      let id = generateID();
      let objKeyMap = {
        keyGen: id,
        keyOri: keyItem,
        valueOri: valueItem
      };

      objCopyToTrans[id] = valueItem;

      dataKeyMap.push(objKeyMap);

    });

    setKeyMapping(dataKeyMap);
    copyToClipboardLargeData(JSON.stringify(objCopyToTrans, null, 2));

    setOpenSnackbar({ type: "success", message: "Copy data handle before translate success!" });
  };

  const onMappingData = () => {
    if (!objTranslate) {
      setOpenSnackbar({ type: "error", message: "You not yet paste data translate!" });
      return;
    }

    let objectMappingUpdate = objOrigin;
    // s1: get list of key gen => loop KEYGEN of objTran => get value P
    // console.log("objTranslate: ", objTranslate)
    let dataTrans = JSON.parse(objTranslate);
    let keyGenArr = Object.keys(dataTrans);
    // console.log("keyGenArr: ", keyGenArr)

    keyGenArr.forEach(itemKeyGen => {
      // console.log("itemKeyGen: ", itemKeyGen)
      let valueTrans = dataTrans[itemKeyGen];

      // s2: get keyS2 mapping base on KEYGEN (objTran)
      let mappingFind = keyMapping.find(x => x.keyGen === itemKeyGen);
      // console.log("mappingFind: ", mappingFind)
      // s3: replace value P (for value of string origin), at place have key === keyS2 (s2)
      let strOri = `"${mappingFind?.keyOri}": "${mappingFind?.valueOri}"`;
      let strTran = `"${mappingFind?.keyOri}": "${valueTrans}"`;
      objectMappingUpdate = objectMappingUpdate.replace(strOri, strTran);
    });

    setObjMapping(objectMappingUpdate);
    setOpenSnackbar({ type: "success", message: "Great! Mapping data success!" });
  };

  return (

    <div className={"fw fh"}>
      <Box sx={{ padding: 2, width: "100%", height: "100%" }}>
        <Grid container spacing={2}>
          <Grid item xs={12} lg={6}>
            <Stack spacing={2}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Button sx={{ width: "100%" }} variant={"outlined"} onClick={fillDataOrigin}>Fill data
                    (example)</Button>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Button sx={{ width: "100%" }} variant={"contained"} color={"info"} onClick={onPrepareData}>Copy Data
                    Custom</Button>
                </Grid>
              </Grid>
              <TextField
                id="objOrigin"
                label="Object JSON Origin"
                multiline
                rows={12}
                fullWidth
                value={objOrigin}
                variant="filled"
                onChange={(e) => onChangeObjText(e.target.value, "ORIGIN")}
              />
            </Stack>

          </Grid>

          <Grid item xs={12} lg={6}>
            <Stack spacing={2}>
              <Button disabled={!objOrigin} onClick={fillDataTranslate} variant={"outlined"}>Fill data after
                translate (example)</Button>
              <TextField
                id="objTranslate"
                label="Data translate from https://translate.google.com/"
                multiline
                fullWidth
                rows={12}
                value={objTranslate}
                variant="filled"
                onChange={(e) => {
                  setIsActiveMapping(false);
                  onChangeObjText(e.target.value, "TRANSLATE");
                }}
              />

            </Stack>
          </Grid>

          <Grid item xs={12}>
            <Stack spacing={2}>
              <Button disabled={isActiveMapping} sx={{ width: "100%" }} variant={"contained"} color={"success"}
                      onClick={onMappingData}>Mapping Data</Button>
              <TextField
                id="objMapping"
                label="This is a data mapping"
                multiline
                fullWidth
                rows={12}
                value={objMapping}
                variant="filled"
              />
              <Button
                startIcon={<Copy />}
                sx={{ width: "100%" }} variant={"contained"} color={"success"}
                onClick={() => {
                  copyToClipboardLargeData(objMapping);
                  setOpenSnackbar({type: "success", message: "Copy data result after mapping success!"})
                }}>Copy result</Button>
            </Stack>
          </Grid>


        </Grid>
      </Box>

      {openSnackbar &&
      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        open={!!openSnackbar} autoHideDuration={6000} onClose={onCloseSnackbar}>
        <Alert onClose={onCloseSnackbar} severity={openSnackbar?.type} sx={{ width: "100%" }}>
          {openSnackbar.message}
        </Alert>
      </Snackbar>}

      <Box sx={{ padding: 2, width: "100%"}}>
        <ToolDetailFooter/>
      </Box>
    </div>

  );
};

export default MappingKeyValueTool;