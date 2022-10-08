import CurriculumVitaePage from "../components/containers/cv/CurriculumVitaePage"
import WrapperProvider from "../components/WrapperProvider";
import { useSelector } from "../src/reduxs/store";
import Head from "next/head";
import React from "react";
import TopButton from "../components/components/TopButton";

export default function wrapperCurriculumVitaePage() {
  const chosenThemeInit = useSelector(store => store.themes).currentThemes;
  return (
    <WrapperProvider>
      <Head>
        <title>Curriculum Vitae - Nguyễn Lê Phong - CV | FullStack Software Engineer</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        <meta
          name="description"
          content="Nguyễn Lê Phong - FullStack Software Engineer. I am available on almost every social media. You can message me, I will reply within 24 hours. I can help you with ReactJS, JavaScript, ReactNative, Android, Kotlin, Java, Spring Boot, Opensource Development, AI."
        />
      </Head>
      <CurriculumVitaePage theme={chosenThemeInit}/>
      <TopButton theme={chosenThemeInit} />
    </WrapperProvider>
  )
};