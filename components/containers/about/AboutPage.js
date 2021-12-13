import React, { useCallback, useState } from "react";
import Gallery from "react-photo-gallery";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import Carousel, { Modal, ModalGateway } from "react-images";
import { photos, summaries, videos } from "../../../lib/about-data";
import ListOfVideosComponent from "./ListOfVideosComponent";
import ProfileSummaryComponent from "./ProfileSummaryComponent";

const AboutPage = (props) => {
  const theme = props.theme;

  const [currentImage, setCurrentImage] = useState(0);
  const [viewerIsOpen, setViewerIsOpen] = useState(false);

  const openLightbox = useCallback((event, { photo, index }) => {
    setCurrentImage(index);
    setViewerIsOpen(true);
  }, []);

  const closeLightbox = () => {
    setCurrentImage(0);
    setViewerIsOpen(false);
  };

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

        <Gallery
          targetRowHeight={420}
          columns={4}
          direction="row"
          photos={photos}
          onClick={openLightbox}
        />

        <ModalGateway>
          {viewerIsOpen ? (
            <Modal onClose={closeLightbox}>
              <Carousel
                currentIndex={currentImage}
                views={photos.map((x) => ({
                  ...x,
                  srcset: x.srcSet,
                  caption: x.title,
                }))}
              />
            </Modal>
          ) : null}
        </ModalGateway>

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