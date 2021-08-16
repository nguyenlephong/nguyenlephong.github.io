console.log("%cENVIRONMENT: %s", "color: green; font-size: 32px; font-weight: bold", process.env.REACT_APP_NODE_ENV);
const globalApp = {
  app: {
    VERSION: "v1.0.0",
    CDN_PATH: "https://cdn.jsdelivr.net/gh/nguyenlephong/dom-pub/shared/images/cv",
    NEXT_PUBLIC_GOOGLE_ANALYTICS: "G-RLXNC58343",
    CONTEXT_PATH: "",
    ENV: process.env.REACT_APP_NODE_ENV || "production",
    REACT_APP_SLACK_WEBHOOK_URL: "https://hooks.slack.com/services/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",
  },
  api: {
    VERSION: process.env.REACT_APP_VERSION || "v1.0.0",
    BASE_URL: process.env.REACT_APP_HOST_API_META_ROUTER || "http://localhost:8080/api",
  },
  firebaseConfig: {
    apiKey: "AIzaSyBZ282TP-4BSjr9elgUcEzT-YTy5AEleJw",
    authDomain: "dom-cv.firebaseapp.com",
    projectId: "dom-cv",
    storageBucket: "dom-cv.appspot.com",
    messagingSenderId: "119170362380",
    appId: "1:119170362380:web:ff5ed9190fdfe7f5539229",
    measurementId: "G-PYY5WGN3GQ",
    serverKey: "",
    webPushCert: ""
  },
  feature: {
    IS_USING_FIREBASE: true,
    IS_SHOW_VERSION: process.env.REACT_APP_IS_SHOW_VERSION === "true",
    IS_SHOW_MULTIPLE_LANGUAGE: process.env.REACT_APP_IS_SHOW_MULTIPLE_LANGUAGE === "true"
  }
}

export default globalApp;