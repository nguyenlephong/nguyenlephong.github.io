import React from "react";
import configs from "../../lib/config/app-config";
import { Button, Result } from "antd";
import { firestore } from "../../lib/firebase/firebase";
import moment from "moment";
import { getFormatNotifyCrashApp,  sendSlackMessage } from "../../lib/slack-notify";
import { FIREBASE_CONST, SYSTEM_KEYS } from "../../lib/config/constant";
import { v4 as uuidv4 } from "uuid";

class ErrorBoundaryPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null,
      env: configs.app.ENV,
      errorInfo: null
    };
  }
  
  onNotifySlack = async (data) => {
    const stringErr = getFormatNotifyCrashApp(data);
    let bot = {
      unfurl_links: 1,
      username: "CrashApp Notifications", // This will appear as user name who posts the message
      channel: "#crash-notify",
      icon_url: "https://ca.slack-edge.com/T01623DCW00-U015ASLAHD3-31ee69261c96-512",
      text: `${stringErr}`,
      'icon_emoji': 'https://ca.slack-edge.com/T01623DCW00-U015ASLAHD3-31ee69261c96-512', // User icon, you can also use custom icons here
      'attachments': [{ // this defines the attachment block, allows for better layout usage
        'color': '#eed140', // color of the attachments sidebar.
        'fields': [ // actual fields
          {
            'title': 'Environment', // Custom field
            'value': 'Production', // Custom value
            'short': true // long fields will be full width
          },
          {
            'title': 'User ID',
            'value': '331',
            'short': true
          }
        ]
      }]
    }
    const slackResponse = await sendSlackMessage(configs.app.REACT_APP_SLACK_WEBHOOK_URL, bot);
    console.log('Message response', slackResponse);
  };
  
  pushErrorCrashApp = async (error, errorInfo) => {
    let itemEmail = await localStorage.getItem(SYSTEM_KEYS.EMAIL);
    let itemTenantId = await localStorage.getItem(SYSTEM_KEYS.TENANT_ID);
    
    let errorInfoCrash = {
      id: uuidv4(),
      env: configs.app.ENV,
      route: window.location.href,
      email: itemEmail,
      tenantId: itemTenantId,
      error: JSON.stringify({
        error,
        errorInfo
      }),
      userAgent: window?.navigator?.userAgent,
      createTime: moment(new Date()).unix(),
      createTimeFormat: moment(new Date()).format("LLL")
    };
    
    // configs.app.ENV !== "development" && await this.onNotifySlack(errorInfoCrash);
    configs.feature.IS_USING_FIREBASE && await firestore.collection(FIREBASE_CONST.CRASH_APP_ERROR).add(errorInfoCrash);
  };
  
  async componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    console.log("componentDidCatch Error::: ", error, errorInfo);
    await this.pushErrorCrashApp(error, errorInfo);
  }
  
  comeBackHome = () => {
    window.location.href = "/";
  };
  
  render() {
    const { errorInfo } = this.state;
    
    if (errorInfo) {
      return (
        <div
          style={{ display: "flex", flexDirection: "column", padding: 24, justifyContent: "center", height: "100vh" }}>
          <Result
            icon={null}
            title="Something wrong"
            subTitle="Sorry, the page you visited has an error. We will fix it soon, so sorry for this inconvenience."
            extra={<div style={{ display: "flex", justifyContent: "center" }}>
              <Button onClick={this.comeBackHome}>Back Home</Button>
            </div>}
          />
        </div>
      );
    }
    
    return this.props.children;
  }
}

export default ErrorBoundaryPage;