import ScssVariables from "./_variable.style.scss";

export const InputStyle = {
  height: 40,
  boxSizing: 'border-box',
  borderRadius: 8,
  color: '#141415',
  transition: 'all 0.3s ease',
}

export const MessageErrorStyle = {
  textAlign: 'end',
  color: 'red',
  right: '6px',
  fontSize: '10px',
}

export const InputErrorStyle = {
  height: 40,
  boxSizing: 'border-box',
  borderRadius: 8,
  border: "1px solid #E84B2C",
  outline: 0,
  boxShadow: "rgb(255 24 24 / 20%) 0px 0px 0px 2px",
  background: "#FEE9E2",
  transition: 'all 0.3s ease',
}

const styleAnd = {
  delay: true,
  borderStyle: "solid",
  borderColor: "#0A495C",
  borderWidth: 3,
  fromAnchor: "left",
  toAnchor: "left",
  orientation: "h",
  zIndex: 5,
  className: "line-and--style",
};

const styleOr = {
  delay: true,
  borderStyle: "solid",
  borderColor: "#7B5514",
  borderWidth: 3,
  fromAnchor: "left",
  toAnchor: "left",
  orientation: "h",
  zIndex: 3,
  className: "line-or--style",
};

const styleWithinClass = {
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'flex-start',
  position: 'relative',
  overflow: 'auto',
  width: '100%',
}

export const TypeSegmentStyle = {
  styleAnd,
  styleOr,
  styleWithinClass
}

export const CLASS_CSS_PREFIX = {

  // common page
  SIDEBAR_PREFIX: ScssVariables['sidebarPrefix'],
  TOPBAR_PREFIX: ScssVariables['topbarPrefix'],
  BLOCK_CONDITION: ScssVariables['cdpBlockCondition'],

  STR_UTIL_PAGE: ScssVariables['strUtilPage'],
  EXCEL_TOOL_PAGE: ScssVariables['excelToolPage'],
  MAPPING_OBJECT_KEY_VALUE_TOOL: ScssVariables['mappingObjKValuePage'],
  IDE_PAGE: ScssVariables['idePage'],
  FAKE_DATA_VN_PAGE: ScssVariables['fakeDataVNPage'],
}

const styleGlobal = {
  MessageErrorStyle: MessageErrorStyle,
  InputStyle: InputStyle,
  InputErrorStyle: InputErrorStyle,
  TypeSegmentStyle: TypeSegmentStyle
}

export default styleGlobal;