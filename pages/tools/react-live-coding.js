import React from "react";
import LiveReactEditorPage from "../../components/containers/tools/tool_012/LiveReactEditorPage";
import ToolDetailPageWrapper from "../../components/containers/tools/ToolDetailPageWrapper";

const Tool012 = props => {
  return (
    <ToolDetailPageWrapper
      title={"Tools For Developer | React live - Component coding online"}
      description={"Tools For Developer | React live - Component coding online"}
    >
      <LiveReactEditorPage/>
    </ToolDetailPageWrapper>
  )
};

Tool012.propTypes = {

};

export default Tool012;