import React  from "react";
import { Box, Tooltip, Typography } from "@mui/material";

const ProjectLanguages = (props) => {
  return (
    <Box>
      <div className="software-skills-main-div">
        <Box sx={{
          display: "flex",
          alignItems: "center",

        }}>
          {props.logos.map((logo) => {
            return (
              <Tooltip title={logo.name} key={logo.name}>
                <Typography
                  sx={{ fontSize: 32, ml: 2, mt: 2 }}
                  className="iconify"
                  data-icon={logo.iconifyClass}
                  data-inline="false"
                />
              </Tooltip>
            );
          })}
        </Box>
      </div>
    </Box>
  );
};

export default ProjectLanguages;