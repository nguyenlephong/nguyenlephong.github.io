import React  from "react";
import SearchParamURLPage from "../../components/containers/tools/tool_009/SearchParamURLPage";
import ToolDetailPageWrapper from "../../components/containers/tools/ToolDetailPageWrapper";

const Tool009 = props => {
  return (
    <ToolDetailPageWrapper
      title={"Tools For Developer | Get all param from url to JSON object"}
      description={"Tools For Developer | Get all param from url to JSON object"}
    >
      <SearchParamURLPage/>
    </ToolDetailPageWrapper>
  )
};

Tool009.propTypes = {

};

export default Tool009;