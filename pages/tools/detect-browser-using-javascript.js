import React from "react";
import DetectBrowserPage from "../../components/containers/tools/tool_011/DetectBrowserPage";
import ToolDetailPageWrapper from "../../components/containers/tools/ToolDetailPageWrapper";

const Tool011 = (props) => {
  return (
    <ToolDetailPageWrapper
      title={"Tools For Developer | Detect browser using javascript"}
      description={"Tools For Developer | Detect browser using javascript, tools"}
    >
      <DetectBrowserPage/>
    </ToolDetailPageWrapper>
  )
};

Tool011.propTypes = {

};

export default Tool011;