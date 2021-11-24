import React, { useState } from "react";
import PropTypes from "prop-types";
import { Box, Grid, Button } from "@mui/material";
import { tools } from "../../../lib/tools";
import BubbleUI from "react-bubble-ui";
import "react-bubble-ui/dist/index.css";

const ListOfToolContainer = props => {
  const [typeDisplay, setTypeDisplay] = useState("bubble");
  return (
    <Box sx={{ padding: 2, width: "100%", height: "100%", }}>
      <Grid container spacing={2}>
        <Grid item>
          <Button onClick={() => setTypeDisplay("list")} variant="contained">List</Button>
        </Grid>
        <Grid item>
          <Button onClick={() => setTypeDisplay("bubble")} variant="contained">Bubble</Button>
        </Grid>
      </Grid>

      {typeDisplay === "list" &&
      <Box sx={{
        height: "calc(100vh - 220px)",
        overflow: "auto",
        mt: 2
      }}>
        <Grid container spacing={2}>
          {tools.map(tool => {
            return (
              <Grid key={tool?.id} item xs={12} md={6} lg={4}>
                <ToolCardItem data={tool} />
              </Grid>
            );
          })}
        </Grid>
      </Box>}

      {typeDisplay === "bubble" &&
      <Box mt={2}>
        <BubbleUI className="bubbleUI" options={{
          size: 180,
          minSize: 20,
          gutter: 8,
          provideProps: true,
          numCols: 6,
          fringeWidth: 160,
          yRadius: 130,
          xRadius: 220,
          cornerRadius: 50,
          showGuides: false,
          compact: true,
          gravitation: 5
        }}>
          {tools.map((company, i) => {
            return <ChildBubbleElement {...company} key={i} />;
          })}
        </BubbleUI>

      </Box>}
    </Box>
  );
};

ListOfToolContainer.propTypes = {};

export default ListOfToolContainer;


export const ToolCardItem = (props) => {
  const { data } = props;
  return (
    <div className={"tool-card-item"}>
      <div className={"title"}>{data?.name}</div>
      <div className={"description"}>{data?.description}</div>
    </div>
  );
};

const ChildBubbleElement = props => {
  return (
    <div
      style={{
        backgroundColor: props.backgroundColor + "d0"
      }}
      className={"companyBubble"}
    >

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          transition: "opacity 0.1s ease",
          opacity: props.bubbleSize > 50 ? 1 : 0,
          pointerEvents: "none"
        }}
      >
        <img
          src={`./companyLogos/${props.symbol}.svg`}
          alt=""
          style={{
            width: 50,
            borderRadius: `50%`,
            marginBottom: 10
          }}
        />
        <p
          style={{
            color: props.textColor,
            fontSize: 14,
            marginBottom: 6,
            fontWeight: 1000,
            maxWidth: 150,
            textAlign: "center"
          }}
        >
          {props.name}
        </p>
        <p
          style={{
            color: props.textColor,
            fontSize: 14,
            marginBottom: 5,
            maxWidth: 100,
            opacity: 0.5
          }}
        >
          {props.key}
        </p>
      </div>
    </div>
  );
};