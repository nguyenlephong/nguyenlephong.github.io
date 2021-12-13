import React, { useState } from "react";
import PropTypes from "prop-types";
import { Box } from "@mui/material";
import { Chrono } from "react-chrono";
import { useWindowSize } from "react-use";

const ExperienceTimeline = props => {
  const { width } = useWindowSize();
  return (
    <Box sx={{
      display: "flex",
      justifyContent: "center"
    }}>
      <Box sx={ width > 1680 ? { width: 1024 } : {}}>
        <Chrono
          useReadMore={false}
          items={props.timelines}
          slideShow
          mode={width < 767 ? "VERTICAL" : "VERTICAL_ALTERNATING"}
        />
      </Box>
    </Box>
  );
};

ExperienceTimeline.propTypes = {
  timelines: PropTypes.array
};

export default ExperienceTimeline;