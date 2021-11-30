import React from "react";
import PropTypes from "prop-types";
import { useSelector } from "reduxs/store";
import WrapperProvider from "../../WrapperProvider";
import Head from "next/head";
import Header from "../../components/Header";
import { Fade } from "react-bootstrap";
import Footer from "../../components/Footer";
import TopButton from "../../components/TopButton";

const ToolDetailPageWrapper = props => {
  const chosenThemeInit = useSelector(store => store.themes).currentThemes;
  return (
    <WrapperProvider>
      <Head>
        <title>{props.title}</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        <meta
          name="description"
          content="Tools For Developer. A passionate individual who always thrives to work on end-to-end products which develop sustainable and scalable social and technical systems to create impact."
        />
      </Head>
      <div>
        <Header theme={chosenThemeInit} />
        <Fade bottom duration={2000} distance="40px">
          {props.children}
        </Fade>
        <Footer theme={chosenThemeInit} />
        <TopButton theme={chosenThemeInit} />
      </div>
    </WrapperProvider>
  );
};

ToolDetailPageWrapper.propTypes = {
  title: PropTypes.string,
  children: PropTypes.any
};

export default ToolDetailPageWrapper;