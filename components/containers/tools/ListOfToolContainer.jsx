import React from "react";
import PropTypes from "prop-types";
import { Box, Grid } from "@mui/material";
import { tools } from "../../../lib/tools";

const ListOfToolContainer = props => {
  return (
    <Box sx={{padding: 2, width: "100%", height: "100%"}}>
      <Grid container spacing={2}>
      {tools.map(tool => {
        return (
          <Grid key={tool?.id} item xs={12} md={6} lg={4}>
            <ToolCardItem data={tool} />
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
  const {data} = props;
  return (
    <div className={"tool-card-item"}>
      <div className={"title"}>{data?.name}</div>
      <div className={"description"}>{data?.description}</div>
    </div>
  )
}