import React from "react";
import PropTypes from "prop-types";

const SublimeCommand = props => {
  const { name, highlight, shortcut } = props;
  return (
    <div>
      {highlight ? (
        <span dangerouslySetInnerHTML={{ __html: highlight }} />
      ) : (
        <span>{name}</span>
      )}
      <kbd className="sublime-shortcut">{shortcut}</kbd>
    </div>
  );
};

SublimeCommand.propTypes = {
  name: PropTypes.string,
  highlight: PropTypes.string,
  shortcut: PropTypes.string
};

export default SublimeCommand;