import React from "react";
import { Col, Row } from "antd";

const ListOfVideosComponent = (props) => {
  const { videos } = props;

  return (
    <Row gutter={[24, 24]} className="list-of-video_wrapper">
      {videos.map((item, ind) => {
        return (
          <Col
            sm={8}
            key={item.id}
            id={`score_board-video_${ind}`}
            className="item_videos"
          >
            <iframe
              width="560"
              height="315"
              title={item.title}
              src={`${item.url}`}
              frameBorder="0"
              allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </Col>
        );
      })}
  
    </Row>
  );
};

export default ListOfVideosComponent;
