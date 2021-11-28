import React, { useEffect, useState } from "react";
import Header from "../../../components/components/Header";
import Footer from "../../../components/components/Footer";
import TopButton from "../../../components/components/TopButton";
import { useRouter } from 'next/router'
import { useSelector } from "reduxs/store";
import WrapperProvider from "../../../components/WrapperProvider";
import Head from "next/head";
import MappingObjectJsonKeyValueTool from "../../../components/containers/tools/tool_003/MappingObjectJsonKeyValueTool";
import SearchParamURLPage from "../../../components/containers/tools/tool_009/SearchParamURLPage";
import { Fade } from "react-bootstrap";
import Router from 'next/router'
import DetectBrowserPage from "../../../components/containers/tools/tool_011/DetectBrowserPage";
import RoadMapPage from "../../../components/containers/tools/tool_016/RoadMapPage";
import LiveReactEditorPage from "../../../components/containers/tools/tool_012/LiveReactEditorPage";
import QRCodeJsPage from "../../../components/containers/tools/tool_015/QRCodeJsPage";

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

      case "search-param-url":
        setToolData({
          id: 9,
          title: "Amulet Store | Get all param from url to JSON object",
          description: "Amulet Store | Get all param from url to JSON object, tools",
          component: <SearchParamURLPage/>
        });
        break;

      case "detect-browser-using-javascript":
        setToolData({
          id: 11,
          title: "Amulet Store | Detect browser using javascript",
          description: "Amulet Store | Detect browser using javascript, tools",
          component: <DetectBrowserPage/>
        });
        break;

      case "react-live-coding":
        setToolData({
          id: 12,
          title: "Amulet Store | React live - Component coding online",
          description: "Amulet Store | React live - Component coding online, tools",
          component: <LiveReactEditorPage/>
        });
        break;

      case "qr-code-js":
        setToolData({
          id: 15,
          title: "Amulet Store | Create QR code JS",
          description: "Amulet Store | qr code js, create QR code, tools",
          component: <QRCodeJsPage/>
        });
        break;

      case "roadmap-developer":
        setToolData({
          id: 16,
          title: "Amulet Store | Roadmap for developer, reactjs, frontend, backend, tools",
          description: "Amulet Store | Roadmap for developer, reactjs, frontend, backend, tools",
          component: <RoadMapPage/>
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