import React from "react";
import { Grid } from "@mui/material";

const ListOfVideosComponent = (props) => {
  const { videos } = props;

  return (
    <Grid container spacing={2} className="list-of-video_wrapper">
      {videos.map((item, ind) => {
        return (
          <Grid
            item={true}
            xs={12}
            lg={6}
            xl={4}
            key={item.id}
            id={`score_board-video_${ind}`}
            className="item_videos"
          >
            <iframe
              width="100%"
              height="315"
              title={item.title}
              src={`${item.url}`}
              frameBorder="0"
              allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </Grid>
        );
      })}

    </Grid>
  );
};

export default ListOfVideosComponent;