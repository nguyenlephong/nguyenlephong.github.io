import Splash from "../components/containers/splash/Splash"
import WrapperProvider from "../components/WrapperProvider";
import { useSelector } from "../src/reduxs/store";
import Head from "next/head";
import React from "react";

export default function wrapperSplashPage() {
  const chosenThemeInit = useSelector(store => store.themes).currentThemes;
  return (
    <WrapperProvider>
      <Head>
        <title>Splash page - Nguyễn Lê Phong | Full-stack Software Engineer</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        <meta
          name="description"
          content="Nguyễn Lê Phong - Full-stack Software Engineer. A passionate individual who always thrives to work on end-to-end products which develop sustainable and scalable social and technical systems to create impact."
        />
      </Head>
      <Splash theme={chosenThemeInit}/>
    </WrapperProvider>
  )
};