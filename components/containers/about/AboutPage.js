import React, { useCallback, useState } from "react";
// import Gallery from "react-photo-gallery";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import Carousel, { Modal, ModalGateway } from "react-images";
import { photos, summaries, videos } from "../../../lib/about-data";
import ListOfVideosComponent from "./ListOfVideosComponent";
import ProfileSummaryComponent from "./ProfileSummaryComponent";
import { ImageList, ImageListItem } from "@mui/material";
import { useWindowSize } from "react-use";

const AboutPage = (props) => {
  const {width} = useWindowSize()
  const theme = props.theme;

  // const [currentImage, setCurrentImage] = useState(0);
  // const [viewerIsOpen, setViewerIsOpen] = useState(false);

  // const openLightbox = useCallback((event, { photo, index }) => {
  //   setCurrentImage(index);
  //   setViewerIsOpen(true);
  // }, []);
  //
  // const closeLightbox = () => {
  //   setCurrentImage(0);
  //   setViewerIsOpen(false);
  // };

  return (
    <div className="contact-main about-header">
      <Header theme={theme} />

      <div className="basic-contact ">
        <div className={"about"}>
          <h1 className="skills-header" style={{ color: theme.text }}>
            Abouts
          </h1>

          <ProfileSummaryComponent summaries={summaries} theme={theme} />
        </div>

        <h1 className="skills-header" style={{ color: theme.text }}>
          My Gallery
        </h1>

        <ImageList variant="masonry" cols={width > 1368 ? 3 : width < 768 ? 1 : 2} gap={12}>
          {photos.map((item) => (
            <ImageListItem key={item.src} sx={{borderRadius: 8}}>
              <img
                src={`${item.src}?w=248&fit=crop&auto=format`}
                srcSet={`${item.src}?w=248&fit=crop&auto=format&dpr=2 2x`}
                alt={item.alt}
                loading="lazy"
              />
            </ImageListItem>
          ))}
        </ImageList>

        {/*<Gallery*/}
        {/*  targetRowHeight={420}*/}
        {/*  columns={4}*/}
        {/*  direction="row"*/}
        {/*  photos={photos}*/}
        {/*  onClick={openLightbox}*/}
        {/*/>*/}

        {/*<ModalGateway>*/}
        {/*  {viewerIsOpen ? (*/}
        {/*    <Modal onClose={closeLightbox}>*/}
        {/*      <Carousel*/}
        {/*        currentIndex={currentImage}*/}
        {/*        views={photos.map((x) => ({*/}
        {/*          ...x,*/}
        {/*          srcset: x.srcSet,*/}
        {/*          caption: x.title,*/}
        {/*        }))}*/}
        {/*      />*/}
        {/*    </Modal>*/}
        {/*  ) : null}*/}
        {/*</ModalGateway>*/}

        <h1 className="skills-header" style={{ color: theme.text }}>
          My Videos
        </h1>
        <ListOfVideosComponent videos={videos} />
      </div>
      <Footer theme={props.theme} onToggle={props.onToggle} />
    </div>
  );
};

export default AboutPage;