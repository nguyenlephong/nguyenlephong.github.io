import axios from 'axios';
import config from 'lib/config/app-config';
import * as cookie from 'js-cookie';
import {SYSTEM_KEYS} from 'lib/config/constant';
import {ROUTE_NAME} from 'routers/router-name';
import ErrorHandlerService from 'services/ErrorHandlerService';


const preCall = () => {
  const access_token = cookie.get(SYSTEM_KEYS.KEY_GET_TOKEN);
  if (!navigator.cookieEnabled) window.location.href = `${ROUTE_NAME.SIGN_IN}?cookie-disable=true`;
  else if (!access_token) {
    localStorage.setItem(SYSTEM_KEYS.VISIT_PAGE_URL, window.location.pathname);
    window.location.href = `${ROUTE_NAME.SIGN_IN}?session-timeout=true`;
  } else if (access_token) {
    localStorage.removeItem(SYSTEM_KEYS.VISIT_PAGE_URL);
  }
  return access_token;
}

const header = {
  'Accept': 'application/json',
  'Content-Type': 'application/json',
  'access-control-request-origin': '*',
  'Access-Control-Allow-Origin': '*'
};

/**
 *
 * @param baseUrl
 * @param version
 * @param endpoint
 * @param method
 * @param access_token
 * @param body
 * @param cancelTokenSource
 * @returns {Promise<*>}
 */
const getPromise = (baseUrl, version, endpoint, method, access_token, body, cancelTokenSource) => {
  let url = version ? `${baseUrl}/${version}/${endpoint}` : `${baseUrl}/${endpoint}`;
  return axios({
    url,
    method: method ? method : 'GET',
    headers: {
      ...header,
      'Authorization': 'Bearer ' + access_token
    },
    data: body,
    cancelToken: cancelTokenSource?.token
  }).then(res => {
    return ErrorHandlerService.checkStatusResponse(res);
  }).catch(err => {
    return ErrorHandlerService.handleErrorHttpRequest(err.response);
  });
}

/**
 *
 * @param endpoint
 * @param method
 * @param body
 * @param cancelTokenSource
 * @returns {Promise<*>}
 */
export const callApi = (endpoint, method, body, cancelTokenSource = null) => {
  const access_token = preCall();
  return getPromise(config.api.BASE_URL, config.api.VERSION, endpoint, method, access_token, body, cancelTokenSource);
};


/**
 *
 * @param endpoint
 * @param method
 * @param body
 * @param cancelTokenSource
 * @returns {Promise<*>}
 */
export const callApiWithoutToken = (endpoint, method, body, cancelTokenSource = null) => {
  return getPromise(config.api.BASE_URL, null, endpoint, method, null, body, cancelTokenSource);
};

export const callApiExternal = (url, method, body) => {
  return axios({
    url,
    method: method ? method : 'GET',
    headers: {
      ...header
    },
    data: body
  }).then(res => {
    return ErrorHandlerService.checkStatusResponse(res);
  }).catch(err => {
    return ErrorHandlerService.handleErrorHttpRequest(err.response);
  });
}