import EducationPage from "../components/containers/education/EducationComponent"
import WrapperProvider from "../components/WrapperProvider";
import { useSelector } from "../src/reduxs/store";
import Head from "next/head";
import React from "react";
import TopButton from "../components/components/TopButton";

export default function wrapperEducationPage() {
  const chosenThemeInit = useSelector(store => store.themes).currentThemes;
  return (
    <WrapperProvider>
      <Head>
        <title>Education page - Nguyễn Lê Phong | Full-stack Software Engineer</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        <meta
          name="description"
          content="Nguyễn Lê Phong - Full-stack Software Engineer. I received an excellent diploma (runner-up - 2019) from my esteemed principal for consistently having the best academic performance."
        />
      </Head>
      <EducationPage theme={chosenThemeInit}/>
      <TopButton theme={chosenThemeInit} />
    </WrapperProvider>
  )
};