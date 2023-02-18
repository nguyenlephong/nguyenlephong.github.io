import ExperiencePage from "../components/containers/experience/Experience"
import WrapperProvider from "../components/WrapperProvider";
import { useSelector } from "../src/reduxs/store";
import Head from "next/head";
import React from "react";
import TopButton from "../components/components/TopButton";

export default function wrapperExperiencePage() {
  const chosenThemeInit = useSelector(store => store.themes).currentThemes;
  return (
    <WrapperProvider>
      <Head>
        <title>Experience page - Nguyễn Lê Phong | Full-stack Software Engineer</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        <meta name="description" content="I have worked with two product startups and one longtime outsourcing company. So I have a lot of experience in Frontend Development profession. Besides, I am also considered as a project mercenary of the outsourcing company. I have grown from such diverse projects. It also gives me confidence as a freelancer to receive projects from partners in my network of contacts. And I'm getting more and more experienced." />
      </Head>
      <ExperiencePage theme={chosenThemeInit}/>
      <TopButton theme={chosenThemeInit} />
    </WrapperProvider>
  )
};