import ContactPage from "../components/containers/contact/ContactComponent"
import WrapperProvider from "../components/WrapperProvider";
import { useSelector } from "../src/reduxs/store";
import Head from "next/head";
import React from "react";
import TopButton from "../components/components/TopButton";

export default function wrapperContactPage() {
  const chosenThemeInit = useSelector(store => store.themes).currentThemes;
  return (
    <WrapperProvider>
      <Head>
        <title>Contact page - Nguyễn Lê Phong | Full-stack Software Engineer</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        <meta
          name="description"
          content="Nguyễn Lê Phong - Full-stack Software Engineer. I am available on almost every social media. You can message me, I will reply within 24 hours. I can help you with ReactJS, JavaScript, ReactNative, Android, Kotlin, Java, Spring Boot, Opensource Development, AI."
        />
      </Head>
      <ContactPage theme={chosenThemeInit}/>
      <TopButton theme={chosenThemeInit} />
    </WrapperProvider>
  )
};