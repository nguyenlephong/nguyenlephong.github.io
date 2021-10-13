import Document, { Head, Html, Main, NextScript } from "next/document";
import React from "react";
import { ServerStyleSheet } from "styled-components";
import configs from "../lib/config/app-config";

export default class MyDocument extends Document {
  
  render() {
    return (
      <Html lang="en">
        <Head>
          {/*Global site tag (gtag.js) - Google Analytics*/}
          <script async src="https://www.googletagmanager.com/gtag/js?id=G-RLXNC58343"></script>
    
          <script
            dangerouslySetInnerHTML={{
              __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${configs.app.NEXT_PUBLIC_GOOGLE_ANALYTICS}', {
              page_path: window.location.pathname,
            });
          `
            }}
          />
          <script
            dangerouslySetInnerHTML={{
              __html: `
            !function(){var follower=window.follower=window.follower||[];if(!follower.initialize)if(follower.invoked)window.console&&console.error&&console.error("PrimeDATA snippet included twice.");else{follower.invoked=!0;follower.methods=["initWebPush","initWebPopup","utils","trackSubmit","trackClick","trackLink","trackForm","pageview","personalize","identify","initialize","reset","group","track","ready","alias","debug","page","once","off","on","addSourceMiddleware","addIntegrationMiddleware","setAnonymousId","addDestinationMiddleware"];follower.factory=function(t){return function(){var e=Array.prototype.slice.call(arguments);e.unshift(t);follower.push(e);return follower}};for(var t=0;t<follower.methods.length;t++){var e=follower.methods[t];follower[e]=follower.factory(e)}follower.load=function(t,e){var n=document.createElement("script");n.type="text/javascript";n.async=!0;n.src="https://dev.primedata.ai/powehi/mining.js";var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(n,a);follower._loadOptions=e};follower.SNIPPET_VERSION="0.1.0";
    follower.load();
    const primeJsOpts = {
      scope: 'JS-1zRR7Fp8BIo5T0uglpSAv27AlW6',
      url: 'https://dev.primedata.ai/powehi',
      writeKey: '1zRR7K1d1NXYwSQJLQSJEEl6P9p',
      initialPageProperties: {
        pageInfo: {
         destinationURL: location.href
        }
      },
      webPush: {
        enabled: false,
        options: {
          showLogs: false,
          endpoint: 'https://dev.primedata.ai',
          firebaseMessagingSwUrl: "./firebase-messaging-sw.js",
          firebaseConfig: {
            authDomain: "primedata-ai-c128b.firebaseapp.com",
            projectId: "primedata-ai-c128b",
            storageBucket: "primedata-ai-c128b.appspot.com",
            messagingSenderId: "615374224384",
            appId: "1:615374224384:web:b6e95abaf525c339e76ce5",
            apiKey: "AIzaSyB0cQZgXYVCTaKE6dk_voN5tle_HXNCaUU"
          }
        }
      },
      webPopup: {
        enabled: false,
        options: {
          showLogs: false,
          onsiteWorkerPath: "./posjs-worker.js",
          endpoint: 'https://dev.primedata.ai'
        }
      }
    };
    follower.initialize({"Prime Data": primeJsOpts})
    
    if (opts.webPush && opts.webPush.enabled) {
      firebase && firebase.initializeApp(opts.webPush.options.firebaseConfig);
      follower.initWebPush(opts.webPush.options);
    }
  
    if(opts.webPopup && opts.webPopup.enabled){
      follower.initWebPopup(opts)
    }
  }}();
          `
            }}
          />
        </Head>
        
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

// `getInitialProps` belongs to `_document` (instead of `_app`),
// it's compatible with server-side generation (SSG).
MyDocument.getInitialProps = async (ctx) => {
  const sheet = new ServerStyleSheet()
  
  // Resolution order
  //
  // On the server:
  // 1. app.getInitialProps
  // 2. page.getInitialProps
  // 3. document.getInitialProps
  // 4. app.render
  // 5. page.render
  // 6. document.render
  //
  // On the server with error:
  // 1. document.getInitialProps
  // 2. app.render
  // 3. page.render
  // 4. document.render
  //
  // On the client
  // 1. app.getInitialProps
  // 2. page.getInitialProps
  // 3. app.render
  // 4. page.render

  // Render app and page and get the context of the page with collected side effects.
  const originalRenderPage = ctx.renderPage;
  
  ctx.renderPage = () =>
    originalRenderPage({
      enhanceApp: (App) => (props) => sheet.collectStyles(<App {...props} />),
    });

  const initialProps = await Document.getInitialProps(ctx);

  
  return {
    ...initialProps,
    // Styles fragment is rendered after the app and page rendering finish.
    styles: [
      ...React.Children.toArray(initialProps.styles),
      sheet.getStyleElement()
    ],
  };
};