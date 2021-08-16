import React from "react";
import {ROUTE_NAME} from "routers/router-name";
import appConfig from "lib/config/app-config";
import {Button, Result} from "antd";
import {BUTTON_TYPE, SYSTEM_KEYS} from "lib/config/constant";
import {generateID} from "shared/utils/UniqueID";
import moment from "moment";
import {redirectUrl} from "services/URLService";
import SlackService, {getFormatNotifyCrashApp} from "services/SlackNotifyService";

class ErrorBoundaryPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null,
      env: appConfig.app.ENV,
      errorInfo: null
    };
  }
  
  onNotifySlack = (data) => {
    SlackService.bug('Something bad happened!'); // Posts to #bugs by default
    
    const stringErr = getFormatNotifyCrashApp(data);
    
    SlackService.send({
      channel: '#crash-notify',
      icon_url: 'https://ca.slack-edge.com/T01623DCW00-U015ASLAHD3-31ee69261c96-512',
      text: `${stringErr}`,
      unfurl_links: 1,
      username: 'Bot Of DOM'
    });
    
  };
  
  pushErrorCrashApp = async (error, errorInfo) => {
    let itemEmail = await localStorage.getItem(SYSTEM_KEYS.EMAIL);
    let itemTenantId = await localStorage.getItem(SYSTEM_KEYS.TENANT_ID);
    let latestVersion = "None";
    let currentVersion = "None";
    let timeBuildVersion = "None";
    
    let errorInfoCrash = {
      id: generateID(),
      env: appConfig.app.ENV,
      route: window.location.href,
      email: itemEmail,
      tenantId: itemTenantId,
      error: JSON.stringify({
        error,
        errorInfo
      }),
      userAgent: window?.navigator?.userAgent,
      latestVersion: latestVersion,
      currentVersion: currentVersion,
      timeBuildVersion: timeBuildVersion,
      createTime: moment(new Date()).unix(),
      createTimeFormat: moment(new Date()).format("LLL")
    }
    this.onNotifySlack(errorInfoCrash)
    
  }
  
  async componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    })
    console.log("componentDidCatch Error::: ", error, errorInfo)
    await this.pushErrorCrashApp(error, errorInfo)
  }
  
  comeBackHome = () => {
    window.location.href = redirectUrl(ROUTE_NAME.HOME_ACTIVE);
  }
  
  render() {
    const {errorInfo} = this.state
    
    if (errorInfo) {
      return (
        <div style={{display: "flex", flexDirection: "column", padding: 24, justifyContent: "center", height: "100vh"}}>
          <Result
            status="500"
            title="Something wrong"
            subTitle="Sorry, the page you visited has an error. We will fix it soon, so sorry for this inconvenience."
            extra={<div style={{display: "flex", justifyContent: "center"}}>
              <Button onClick={this.comeBackHome} className={BUTTON_TYPE.OUTLINE_GREEN}>Back Home</Button>
            </div>}
          />
        </div>
      );
    }
    
    return this.props.children;
  }
}

export default ErrorBoundaryPage;