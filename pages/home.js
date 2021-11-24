import HomePage from "../components/containers/home/HomePage"
import WrapperProvider from "../components/WrapperProvider";
import { useSelector } from "../src/reduxs/store";
import Head from "next/head";
import React from "react";
import { Layout } from "antd";
const {Content} = Layout;

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
      <Layout>
        <Content>
          <HomePage theme={chosenThemeInit}/>
        </Content>
      </Layout>
    </WrapperProvider>
  )
};