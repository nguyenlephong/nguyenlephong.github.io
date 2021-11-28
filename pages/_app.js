import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import Head from "next/head";
import Router, { useRouter } from "next/router";
import ProgressBar from "@badrap/bar-of-progress";
import { Provider as ReduxProvider } from "react-redux";
import { persistor, store } from "../src/reduxs/store";
import { PersistGate } from "redux-persist/lib/integration/react";
import * as ga from "../lib/ga";
import { Box } from "@mui/material";
import CommandPalette from "react-command-palette";
import { tools } from "../lib/tools";

import "react-tiny-fab/dist/styles.css";
import "react-bubble-ui/dist/index.css";
// import "react-command-palette/dist/themes/sublime.css";
// import "react-command-palette/dist/themes/chrome.css";

// import SublimeCommand from "../components/components/search-command/SublimeCommand";
import HeaderCommand from "../components/components/search-command/HeaderCommand";
// import ChromeCommand from "../components/components/search-command/ChromeCommand";
import CustomRenderCommand from "../components/components/search-command/CustomRenderCommand";
// import { chromeCommandThemes } from "../lib/theme";


import "../public/assests/styles/Header.css";
import "../public/assests/styles/404.scss";
import "../public/assests/styles/ToggleSwitch.scss";
import "../public/assests/styles/Footer.css";
import "../public/assests/styles/TopButton.css";
import "../public/assests/styles/CertificationCard.css";
import "../public/assests/styles/DegreeCard.css";
import "../public/assests/styles/CompetitiveSites.css";
import "../public/assests/styles/EducationComponent.css";
import "../public/assests/styles/Experience.css";
import "../public/assests/styles/ExperienceCard.css";
import "../public/assests/styles/ExperienceAccordion.css";
import "../public/assests/styles/Projects.css";
import "../public/assests/styles/Opensource.css";
import "../public/assests/styles/Splash.css";
import "../public/assests/styles/LoaderLogo.css";
import "../public/assests/styles/Button.css";
import "../public/assests/styles/BlogCard.css";
import "../public/assests/styles/GithubRepoCard.css";
import "../public/assests/styles/IssueCard.css";
import "../public/assests/styles/IssueChart.css";
import "../public/assests/styles/OrganizationList.css";
import "../public/assests/styles/ProjectLanguages.css";
import "../public/assests/styles/PullRequestCard.css";
import "../public/assests/styles/PullRequestChart.css";
import "../public/assests/styles/SocialMedia.css";
import "../public/assests/styles/SoftwareSkill.css";
import "../public/assests/styles/TalkCard.css";
import "../public/assests/styles/ContactComponent.css";
import "../public/assests/styles/Achievement.css";
import "../public/assests/styles/Blog.css";
import "../public/assests/styles/Certifications.css";
import "../public/assests/styles/Contact.css";
import "../public/assests/styles/Educations.css";
import "../public/assests/styles/Greeting.css";
import "../public/assests/styles/Issues.css";
import "../public/assests/styles/OpensourceCharts.css";
import "../public/assests/styles/Organizations.css";
import "../public/assests/styles/Podcast.css";
import "../public/assests/styles/Project.css";
import "../public/assests/styles/PullRequests.css";
import "../public/assests/styles/Skills.css";
import "../public/assests/styles/StartupProjects.css";
import "../public/assests/styles/Talks.css";
import "../public/assests/styles/App.scss";
import "../public/assests/styles/index.css";
import "../public/assests/font-awesome/css/all.css";
import "../public/assests/styles/ToolsPage.scss";
import "tailwindcss/tailwind.css";
import "../public/assests/styles/SearchCommand.style.scss";


const progress = new ProgressBar({
  size: 2,
  color: "#18A0FB",
  className: "bar-of-progress",
  delay: 100
});

Router.events.on("routeChangeStart", progress.start);
Router.events.on("routeChangeComplete", progress.finish);
Router.events.on("routeChangeError", progress.finish);

export default function MyApp(props) {
  const { Component, pageProps } = props;
  const router = useRouter();
  const [commands, setCommands] = useState([]);

  useEffect(() => {
    const handleRouteChange = (url) => {
      ga.pageview(url);
    };
    //When the component is mounted, subscribe to router changes and log those page views
    router.events.on("routeChangeComplete", handleRouteChange);

    // If the component is unmounted, unsubscribe from the event with the `off` method
    return () => {
      router.events.off("routeChangeComplete", handleRouteChange);
    };
  }, [router.events]);

  const initSearchCommand = () => {
    let commandsTool = [];
    tools.forEach(tool => {
      commandsTool.push({
        name: tool.name,
        command() {
          document.location.href = `/tools/${tool.slug}`;
        },
        category: "Tools"
      });
    });
    commandsTool.push({
      id: 1,
      shortcut: "⌘ Esc",
      name: "Close panel",
      category: "System",
      command() {
        // do something
      }
    });
    setCommands(commandsTool);
  };

  useEffect(() => {
    // Remove the server-side injected CSS.
    const jssStyles = document.querySelector("#jss-server-side");
    if (jssStyles) {
      jssStyles.parentElement.removeChild(jssStyles);
    }

    initSearchCommand();

  }, []);


  return (
    <>
      <Head>
        <title>Nguyễn Lê Phong - CV - FullStack Software Engineer</title>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, minimum-scale=1, maximum-scale=1.0, user-scalable=no, shrink-to-fit=no"
        />
        <meta name="theme-color" content="#000000" />
        <meta charSet="utf-8" />
        <link rel="icon" href="https://cdn.jsdelivr.net/gh/nguyenlephong/dom-pub/shared/images/cv/images/dom220.png" />
        <link rel="manifest" href="../manifest.json" />

        <meta
          name="description"
          content="Nguyễn Lê Phong - FullStack Software Engineer. A passionate individual who always thrives to work on end-to-end products which develop sustainable and scalable social and technical systems to create impact."
        />
        <meta property="og:title" content="Nguyen Le Phong | FullStack Software Engineer" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://nguyenlephong.github.io/dom-profile" />

        <script src="https://code.iconify.design/1/1.0.4/iconify.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/animejs/2.0.2/anime.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r119/three.min.js"></script>

        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css"
        />

      </Head>
      <ReduxProvider store={store}>
        <PersistGate loading={<React.Fragment />} persistor={persistor}>
          <Component {...pageProps} />

          <Box>
            <CommandPalette
              hotKeys="command+k"
              placeholder="Try typing '?st', '>st' or 'st'"
              defaultInputValue=">"
              options={{
                keys: ["name", "category"]
              }}
              // theme={chromeCommandThemes}
              // renderCommand={SublimeCommand}
              filterSearchQuery={inputValue => {
                // strip action keys "? or >" from input before searching commands, ex:
                // "?something" or ">something" should search using "something" as the query
                return inputValue.replace(/^(>|\?)/g, "");
              }}
              trigger={(<React.Fragment/>)}
              maxDisplayed={20}
              renderCommand={CustomRenderCommand}
              header={<HeaderCommand/>}
              commands={commands} />
          </Box>
        </PersistGate>
      </ReduxProvider>
    </>
  );
}

MyApp.propTypes = {
  Component: PropTypes.elementType.isRequired,
  pageProps: PropTypes.object.isRequired
};