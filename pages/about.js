import React from "react";
import AboutPage from "../components/containers/about/AboutPage";
import WrapperProvider from "../components/WrapperProvider";
import { useSelector } from "../src/reduxs/store";
import { Helmet } from "react-helmet";


export default function wrapperAboutPage() {
  const chosenThemeInit = useSelector(store => store.themes).currentThemes;
  return (
    <WrapperProvider>
      <Helmet>
        <title>About page - Nguyễn Lê Phong | FullStack Software Engineer</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        <meta
          name="description"
          content="Nguyễn Lê Phong - FullStack Software Engineer. A passionate individual who always thrives to work on end-to-end products which develop sustainable and scalable social and technical systems to create impact."
        />
      </Helmet>
      <AboutPage theme={chosenThemeInit}/>
    </WrapperProvider>
  )
};
