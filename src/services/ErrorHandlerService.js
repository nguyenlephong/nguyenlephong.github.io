import RouterName from "routers/router-name";
import {message} from "antd";
import {NOTIFICATION_MESSAGE} from "../../lib/config/config-app";

/**
 *
 * @param dataResponse
 * @returns {*}
 */
export const checkStatusResponse = (dataResponse) => {
  let status = dataResponse.code
  switch (status) {
    case 401:
      window.location.href = RouterName.ROUTE_NAME.SIGN_IN
      return dataResponse;
    case 503:
      // showMessage(dataResponse.data)
      return dataResponse;
    
    default:
      // window.location.href = RouterName.ROUTE_NAME.ACCESS_DENIED
      return dataResponse;
  }
}

/**
 *
 * @param content
 * @returns {MessageType}
 */
export const showMessage = (content) => {
  return (
    message.error({
      content: content ? content : 'Message not defined from BE',
      duration: NOTIFICATION_MESSAGE.duration
    })
  )
}

/**
 *
 * @param errorData
 * @returns {{status}|*|null}
 */
export const handleErrorHttpRequest = (errorData) => {
  if (!errorData?.status) return null;
  
  switch (errorData.status) {
    case 400:
    case 503:
      // showMessage(errorData.data?.message)
      return errorData;
    
    case 401:
      if (!window.location.href.includes('sign-in'))
        window.location.href = RouterName.ROUTE_NAME.SIGN_IN
      return errorData;
    
    case 403:
      window.location.href = RouterName.ROUTE_NAME.ACCESS_DENIED
      return errorData;
    
    case 404:
    case 405:
      // showMessage(errorData?.data?.detail ? errorData?.statusText : errorData?.data)
      return errorData;
    
    default:
      // showMessage(errorData.data ? errorData.data.message : JSON.stringify(errorData.data)+"")
      return errorData;
  }
}

const errorGlobal = {
  checkStatusResponse,
  handleErrorHttpRequest
}

export default errorGlobal;