import React from "react";
import { Box, Typography } from "@mui/material";

const ProfileSummary = (props) => {
  const { summaries, theme } = props;
  return (
    <Box>
      {summaries.map((item) => {
        return (
          <Box key={`sm_${item.id}`} id={`sm_${item.id}`} className={""}>
            <Box className={"pf-summary__title"} style={{ color: theme.text }}>
              <Typography
                sx={{ fontWeight: 600 }}>
                <i className="far fa-hand-point-right" /> {item.categories}
              </Typography>
            </Box>

            <Box className={"pf-summary__block_description"}>
              {item.descriptions.map((des, ind) => {
                return (
                  <Box
                    className={"pf-summary__title-description"}
                    key={`des_${ind}`}
                  >

                    <Typography>
                      <i className="fas fa-check" />
                      <span style={{paddingLeft: 8}} dangerouslySetInnerHTML={{ __html: des }}></span>
                    </Typography>
                  </Box>
                );
              })}
            </Box>
          </Box>
        );
      })}
    </Box>
  );
};

export default ProfileSummary;
