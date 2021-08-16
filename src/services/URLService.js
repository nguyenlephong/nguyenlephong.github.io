import {SYSTEM_KEYS} from "lib/config/constant";
import {LANGUAGE_DEFAULT} from "lib/config/config-app";

/**
 *
 * @returns {string}
 */
export const getLanguageCurrent = () => {
  let lang = localStorage.getItem(SYSTEM_KEYS.I18N)
  if(!lang){
    localStorage.setItem(SYSTEM_KEYS.I18N, LANGUAGE_DEFAULT)
    lang = LANGUAGE_DEFAULT
  }
  document.getElementsByTagName("body")[0].setAttribute("lang", lang)
  return lang;
}

/**
 *
 * @param url
 * @param params
 * @returns {*}
 */
export const redirectUrl = (url, params) => {
  if (!params) params = getLanguageCurrent()
  return url?.replace(":lang", params)
}

/**
 *
 * @param pathname
 * @param lang
 * @param index
 * @returns {*}
 */
export const urlUpdateLang = (pathname = window.location.pathname, lang, index = 1) => {
  if (!lang) lang = getLanguageCurrent()
  
  let urlArr = pathname.split("/")
  urlArr[index + 1] = lang;
  return urlArr.join("/");
}

/**
 *
 * @param urlParam
 * @returns {{}}
 */
export const getSearchParamFromUrl = (urlParam) => {
  if (urlParam.indexOf("?") === -1) {
    return null;
  }
  
  const queryString = urlParam.substring(urlParam.indexOf("?"), urlParam.length);
  
  const urlParams = new URLSearchParams(queryString);
  
  const
    // keys = urlParams.keys(),
    // values = urlParams.values(),
    entries = urlParams.entries();
  
  // for (const key of keys) console.table(key);
  
  // for (const value of values) console.table(value);
  
  let objectJson = {}
  for (const entry of entries) {
    objectJson[entry[0]] = entry[1]
  }
  
  return objectJson;
}

const url = {
  getSearchParamFromUrl,
  redirectUrl
}

export default url;