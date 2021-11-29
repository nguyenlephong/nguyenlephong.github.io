import React from "react";
import WrapperProvider from "../../components/WrapperProvider";
import Head from "next/head";
import Header from "../../components/components/Header";
import { Fade } from "react-bootstrap";
import Footer from "../../components/components/Footer";
import TopButton from "../../components/components/TopButton";
import { useSelector } from "reduxs/store";
import LiveReactEditorPage from "../../components/containers/tools/tool_012/LiveReactEditorPage";

const Tool012 = props => {
  const chosenThemeInit = useSelector(store => store.themes).currentThemes;
  return (

    <WrapperProvider>
      <Head>
        <title>Tools For Developer | React live - Component coding online</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        <meta
          name="description"
          content="Tools For Developer. A passionate individual who always thrives to work on end-to-end products which develop sustainable and scalable social and technical systems to create impact."
        />
      </Head>
      <div>
        <Header theme={chosenThemeInit} />
        <Fade bottom duration={2000} distance="40px">
          <LiveReactEditorPage/>
        </Fade>
        <Footer theme={chosenThemeInit} />
        <TopButton theme={chosenThemeInit} />
      </div>
    </WrapperProvider>
  );
};

Tool012.propTypes = {

};

export default Tool012;