import React, { useEffect, useState } from "react";
import { Box, Grid, Button, Typography } from "@mui/material";
import { tools } from "../../../lib/tools";
import BubbleUI from "react-bubble-ui";
import "react-bubble-ui/dist/index.css";
import Link from "next/link";

const ListOfToolContainer = props => {
  const [typeDisplay, setTypeDisplay] = useState("bubble");
  const [toolsData, setToolsData] = useState(tools);
  const changeContrast = () => {
    let toolsUpdate = [];
    let R, G, B, C, L;

    tools.forEach(tool => {
      R = (Math.floor(Math.random() * 256));
      G = (Math.floor(Math.random() * 256));
      B = (Math.floor(Math.random() * 256));
      tool.backgroundColor = "rgb(" + R + "," + G + "," + B + ")";

      C = [R / 255, G / 255, B / 255];

      for (let i = 0; i < C.length; ++i) {
        if (C[i] <= 0.03928) {
          C[i] = C[i] / 12.92;
        } else {
          C[i] = Math.pow((C[i] + 0.055) / 1.055, 2.4);
        }
      }

      L = 0.2126 * C[0] + 0.7152 * C[1] + 0.0722 * C[2];

      if (L > 0.179) {
        tool.textColor = "#000";
      } else {
        tool.textColor = "#fff";
      }

      toolsUpdate.push(tool);
    });

    setToolsData(toolsUpdate);
  };

  useEffect(() => {
    changeContrast();
  }, []);

  return (
    <Box sx={{ padding: 2, width: "100%", height: "100%" }}>
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
          {toolsData.map(tool => {
            return (
                <Link key={tool?.id}  href={`/tools/${tool.slug}`}>
              <Grid item xs={12} md={6} lg={4}>
                  <ToolCardItem data={tool} />
              </Grid>
                </Link>
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
          {toolsData.map((tool, i) => {
            return (
              <ChildBubbleElement key={i} {...tool} />
            );
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
    <Link href={`/tools/${props.slug}`}>

    <Box
      title={props.description}
      style={{
        backgroundColor: props.backgroundColor
      }}
      className={"companyBubble"}
    >

      <Box
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
        <Typography
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
        </Typography>
        <Typography
          style={{
            color: props.textColor,
            fontSize: 14,
            marginBottom: 5,
            maxWidth: 100,
            opacity: 0.5
          }}
        >
          {props.key}
        </Typography>
      </Box>
    </Box>

    </Link>
  );
};