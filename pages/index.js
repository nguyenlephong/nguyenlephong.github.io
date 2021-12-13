import React from "react";
import { useSelector } from "../src/reduxs/store";
import WrapperProvider from "../components/WrapperProvider";
import HomePage from "../components/containers/home/HomePage";
import Head from "next/head";
import TopButton from "../components/components/TopButton";

export default function wrapperHomePage() {
  const chosenThemeInit = useSelector(store => store.themes).currentThemes;
  return (
    <WrapperProvider>
      <Head>
        <title>Home page - Nguyễn Lê Phong | FullStack Software Engineer</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        <meta
          name="description"
          content="Nguyễn Lê Phong - FullStack Software Engineer. A passionate individual who always thrives to work on end-to-end products which develop sustainable and scalable social and technical systems to create impact."
        />
      </Head>
      <HomePage theme={chosenThemeInit}/>
      <TopButton theme={chosenThemeInit} />
    </WrapperProvider>
  )
};