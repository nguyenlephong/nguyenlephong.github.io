import React from "react";
import QRCodeJsPage from "../../components/containers/tools/tool_015/QRCodeJsPage";
import ToolDetailPageWrapper from "../../components/containers/tools/ToolDetailPageWrapper";

const Tool015 = props => {
  return (
    <ToolDetailPageWrapper
      title={"Tools For Developer | Create QR code JS"}
      description={"Tools For Developer | Create QR code JS"}
    >
      <QRCodeJsPage/>
    </ToolDetailPageWrapper>
  )

};

Tool015.propTypes = {

};

export default Tool015;