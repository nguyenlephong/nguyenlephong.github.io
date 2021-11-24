
import React, { useState } from "react";
import { copyToClipboardLargeData } from "../../../../src/shared/utils/DomUtils";
import { NOTIFICATION_MESSAGE } from "../../../../lib/config/config-app";
import {Button, Row,Col } from "react-bootstrap";
import { ThumbsUp } from "phosphor-react";

const prefixCss = "mapping-obj-key-val-tool-page";

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

  const [objOrigin, setObjOrigin] = useState(null);
  const [objTranslate, setObjTranslate] = useState(null);
  const [objMapping, setObjMapping] = useState(null);

  const [keyMapping, setKeyMapping] = useState(null);

  const fillDataOrigin = () => {
    setObjOrigin(fillOriginExample);
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
      message.error({
        content: "You not yet paste data handle!",
        duration: NOTIFICATION_MESSAGE.duration,
        className: "pd__message--error",
        icon: <ClosedIcon fill={"#863a32"} className={"pd__message--error"} />
      });
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
    message.success({
      content: "Copy data handle before translate success!",
      duration: NOTIFICATION_MESSAGE.duration,
      className: "pd__message--success",
      icon: <ThumbsUp size={24} />
    });

  };

  const onMappingData = () => {
    if (!objTranslate) {
      message.error({
        content: "You not yet paste data translate!",
        duration: NOTIFICATION_MESSAGE.duration,
        className: "pd__message--error",
        icon: <ClosedIcon fill={"#863a32"} className={"pd__message--error"} />
      });
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
    message.success({
      content: "Great! Mapping data success!",
      duration: NOTIFICATION_MESSAGE.duration,
      className: "pd__message--success",
      icon: <ThumbsUp size={24} />
    });
  };

  return (

    <div className={"fw fh"}>


      <Row gutter={[24, 24]}>
        <Col xs={12}>
          <Row className={`${prefixCss}__field--item`}>
            <Col xs={12} style={{ height: 80 }}>

              <Space align={"center"} className={"pd-flex-between"}>
                <Title level={3} className={`${prefixCss}__title`}>
                  Object JSON Origin
                </Title>
                <Button variant="success" onClick={fillDataOrigin}>Fill data example</Button>
              </Space>
            </Col>

            <Col xs={12}>
              <TextArea
                autoFocus={true}
                value={objOrigin}
                onChange={(e) => onChangeObjText(e.target.value, "ORIGIN")}
                id={"text-obj-origin"} rows={14} />
            </Col>
          </Row>
        </Col>

        <Col xs={12}>
          <Row className={`${prefixCss}__field--item`}>
            <Col xs={12} style={{ height: 80 }}>
              <Space align={"center"} className={"pd-flex-between"}>
                <Title level={3} className={`${prefixCss}__title`}>
                  Data translate from https://translate.google.com/
                </Title>
                <Button variant="success" disabled={!objOrigin} onClick={fillDataTranslate}>Fill
                  data after translate</Button>
              </Space>
            </Col>

            <Col xs={12}>
              <TextArea
                value={objTranslate}
                onChange={(e) => {
                  setIsActiveMapping(false);
                  onChangeObjText(e.target.value, "TRANSLATE");
                }}
                id={"text-obj-trans"} rows={14} />
            </Col>
          </Row>
        </Col>
      </Row>

      <Row gutter={[24, 24]}>
        <Col xs={12} className={"pd-flex-between"}>
          <Button variant="success" onClick={onPrepareData}>Copy Data Custom</Button>
          <Button
            variant="success"
            disabled={isActiveMapping}
            onClick={onMappingData}>Mapping</Button>
        </Col>

        <Col xs={12}>
          <div className={`${prefixCss}__field--item`}>
            <Space className={"pd-flex-between"}>
              <Title level={2} className={`${prefixCss}__title`}>
                This is a data mapping

              </Title>
              <Button variant="success"
                      onClick={() => copyToClipboardLargeData(objMapping)}>Copy</Button>
            </Space>
            <TextArea
              value={objMapping}
              onChange={(e) => onChangeObjText(e.target.value, "ORIGIN")}
              id={"text-obj-mapping"}
              rows={14} />

            <TextField
              id="outlined-multiline-static"
              label="Multiline"
              multiline
              rows={4}
              defaultValue="Default Value"
            />
          </div>
        </Col>
      </Row>
    </div>

  );
};

export default MappingKeyValueTool;