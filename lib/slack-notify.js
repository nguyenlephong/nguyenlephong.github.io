import axios from "axios";

export const getFormatNotifyCrashApp = data => {
  let res = ""
  const title = "*Notification Warning By Bot*\n";
  const message = "*Error! An error occurred. Crash app!!!*\n";
  const env = `*ENV: ${  data.env  }*\n`;
  
  const wrapperCode = "```\n"
  
  let info = `Below this is a information: \n${  wrapperCode}`
  const email = `Email: ${  data.email  }\n`;
  const route = `Route: ${  data.route  }\n`;
  const tenantId = `TenantId: ${  data.tenantId  }\n`;
  const userAgent = `User Agent: ${  data.userAgent  }\n`;
  const latestVersion = `Package Version: ${  data.latestVersion  }\n`;
  const currentVersion = `Current Version: ${  data.currentVersion  }\n`;
  const timeBuildVersion = `Build Version Time: ${  data.timeBuildVersion  }\n`;
  const createTimeFormat = `Crash App Time: ${  data.createTimeFormat  }\n${  wrapperCode}`;
  
  let errorInfo = "*Error catch: *\n";
  const dataError = wrapperCode + data.error + wrapperCode;
  
  
  info = info  + email + route + tenantId + userAgent + latestVersion + currentVersion + timeBuildVersion + createTimeFormat;
  
  errorInfo += dataError;
  
  res = res + title + message + env + info + errorInfo;
  
  return res;
}

/**
 * Handles the actual sending request.
 * We're turning the https.request into a promise here for convenience
 * @param webhookURL
 * @param messageBody
 * @return {Promise}
 */
export const sendSlackMessage = (webhookURL, messageBody) => {
  // make sure the incoming message body can be parsed into valid JSON
  try {
    messageBody = JSON.stringify(messageBody);
  } catch (e) {
    throw new Error('Failed to stringify messageBody', e);
  }
  // general request options, we defined that it's a POST request and content is JSON

  return axios({
    url: webhookURL,
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'access-control-request-origin': '*',
      'Access-Control-Allow-Origin': '*'
    },
    data: messageBody,
  })
  
  return axios.post(webhookURL, JSON.stringify(messageBody), {
    withCredentials: false,
    transformRequest: [(data, headers) => {
      delete headers.post["Content-Type"]
      return data
    }]
  })
}
