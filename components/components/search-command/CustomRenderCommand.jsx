import React from "react";
import PropTypes from "prop-types";

const CustomRenderCommand = props => {
  const { name, highlight = [], category, shortcut } = props;

  // handle simple highlight when searching a single key
  if (!Array.isArray(highlight)) {
    return (
      <div className="custom-render-command-suggestion">
        <span className={`custom-render-command-category ${category}`}>{category}</span>
        <span className={"custom-render-command-title"} dangerouslySetInnerHTML={{ __html: highlight || name }} />
        <kbd className="custom-render-command-shortcut">{shortcut}</kbd>
      </div>
    );
  }
  return (
    <div className="custom-render-command-suggestion">
      <span
        dangerouslySetInnerHTML={{ __html: highlight[1] || category }}
        className={`custom-render-command-category ${category}`}
      />
      <span className={"custom-render-command-label"} dangerouslySetInnerHTML={{ __html: highlight[0] || name }} />
      <kbd className="custom-render-command-shortcut">{shortcut}</kbd>
    </div>
  );
};

CustomRenderCommand.propTypes = {

};

export default CustomRenderCommand;