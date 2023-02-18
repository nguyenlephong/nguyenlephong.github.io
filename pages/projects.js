import ProjectsPage from "../components/containers/projects/Projects"
import WrapperProvider from "../components/WrapperProvider";
import { useSelector } from "../src/reduxs/store";
import Head from "next/head";
import React from "react";
import TopButton from "../components/components/TopButton";

export default function wrapperProjectsPage() {
  const chosenThemeInit = useSelector(store => store.themes).currentThemes;
  return (
    <WrapperProvider>
      <Head>
        <title>Projects page - Nguyễn Lê Phong | Full-stack Software Engineer</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        <meta
          name="description"
          content="Nguyễn Lê Phong - Full-stack Software Engineer. My projects make use of a vast variety of latest technology tools. My best experience is to using ReactJS to build a website as a Single Page Application (SPA)."
        />
      </Head>
      <ProjectsPage theme={chosenThemeInit}/>
      <TopButton theme={chosenThemeInit} />
    </WrapperProvider>
  )
};