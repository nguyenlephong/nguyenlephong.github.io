import React, { useEffect, useState } from "react";
import Header from "../../../components/components/Header";
import Footer from "../../../components/components/Footer";
import TopButton from "../../../components/components/TopButton";
import { useRouter } from 'next/router'
import { useSelector } from "reduxs/store";
import WrapperProvider from "../../../components/WrapperProvider";
import Head from "next/head";
import MappingObjectJsonKeyValueTool from "../../../components/containers/tools/tool_003/MappingObjectJsonKeyValueTool";
import { Fade } from "react-bootstrap";
import Router from 'next/router'

const ToolDetailPage = (props) => {
  const chosenThemeInit = useSelector(store => store.themes).currentThemes;
  const [toolData, setToolData] = useState(null)
  const router = useRouter()

  const { slug } = router.query


  const getToolContentPageByToolId = (toolSlug) => {
    switch (toolSlug) {
      case "translate-data-json-i18n-to-another-language":
        setToolData({
          id: 3,
          title: "Amulet Store | Translate Json i18n to another language",
          description: "Amulet Store | Translate Json i18n to another language",
          component: <MappingObjectJsonKeyValueTool/>
        });
        break;
      default:
        setToolData(null);
        Router.push('/coming-soon')
        break;
    }
  };

  useEffect(()=>{
    slug && getToolContentPageByToolId(slug)
  },[slug])

  if(!toolData) return <React.Fragment/>

  return (
    <WrapperProvider>
      <Head>
        <title>{toolData.title}</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        <meta
          name="description"
          content="Tools For Developer. A passionate individual who always thrives to work on end-to-end products which develop sustainable and scalable social and technical systems to create impact."
        />
      </Head>
      <div>
        <Header theme={chosenThemeInit} />
        <Fade bottom duration={2000} distance="40px">
          {toolData.component}
        </Fade>
        <Footer theme={chosenThemeInit} />
        <TopButton theme={chosenThemeInit} />
      </div>
    </WrapperProvider>
  )

};

export default ToolDetailPage;