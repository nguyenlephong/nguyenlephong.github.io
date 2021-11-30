import React from "react";
import MappingObjectJsonKeyValueTool from "../../components/containers/tools/tool_003/MappingObjectJsonKeyValueTool";
import ToolDetailPageWrapper from "../../components/containers/tools/ToolDetailPageWrapper";

const Tool003 = (props) => {
  return (
    <ToolDetailPageWrapper
      title={"Tools For Developer | Translate Json i18n to another language"}
      description={"Tools For Developer | Translate Json i18n to another language"}
    >
      <MappingObjectJsonKeyValueTool/>
    </ToolDetailPageWrapper>
  )
};

Tool003.propTypes = {

};

export default Tool003;