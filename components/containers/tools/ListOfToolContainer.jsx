import React from "react";
import PropTypes from "prop-types";
import { Box, Grid } from "@mui/material";

const ListOfToolContainer = props => {
  return (
    <Box sx={{padding: 2, width: "100%", height: "100%"}}>
      <Grid container spacing={2}>
      {[1,2,3,4,5].map(tool => {
        return (
          <Grid key={tool?.id} item xs={12} md={6} lg={4}>
            <ToolCardItem />
          </Grid>
        )
      })}
      </Grid>
    </Box>
  );
};

ListOfToolContainer.propTypes = {

};

export default ListOfToolContainer;


export const ToolCardItem = (props) => {
  return (
    <div className={"tool-card-item"}>
      <div>name</div>
      <div>description</div>
    </div>
  )
}