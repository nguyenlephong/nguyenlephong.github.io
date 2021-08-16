import i18n from 'i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';
import {initReactI18next} from 'react-i18next';

import translationEN from 'locales/en.translation.json';
import translationVI from 'locales/vi.translation.json';

// the translations
const resources = {
  en: {
    translation: translationEN
  },
  vi: {
    translation: translationVI
  }
};

const env = process.env.REACT_APP_NODE_ENV;
const optsDetection = {
  // order and from where user language should be detected
  // order: ['path', 'querystring', 'cookie', 'localStorage', 'sessionStorage', 'navigator', 'htmlTag',  'subdomain'],
  order: ['path', "querystring", 'cookie', 'localStorage', 'sessionStorage', 'htmlTag', 'navigator', 'subdomain'],
  
  // keys or params to lookup language from
  lookupFromPathIndex: 1,
  lookupQuerystring: 'lng',
  lookupCookie: 'i18next',
  lookupLocalStorage: 'i18nextLng',
  lookupSessionStorage: 'i18nextLng',
  lookupFromSubdomainIndex: 0,
  
  // cache user language on
  caches: ['localStorage', 'cookie'],
  excludeCacheFor: ['cimode'], // languages to not persist (cookie, localStorage)
  
  // optional expire and domain for set cookie
  cookieMinutes: 10,
  cookieDomain: window.location.origin,
  
  // optional htmlTag with lang attribute, the default is:
  htmlTag: document.documentElement,
  
  // optional set cookie options, reference:[MDN Set-Cookie docs](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie)
  cookieOptions: {path: '/', sameSite: 'strict'}
}


export const LIST_LANGUAGES = [
  "en", "vi", "de-de", "sg-zh"
]

export const LANGUAGES_ENUM = {
  VI: 'vi',
  EN: 'en',
  DE: 'de-de',
  SG: 'sg-zh',
}

i18n
// load translation using http -> see /public/locales
// learn more: https://github.com/i18next/i18next-http-backend
.use(Backend)
// detect user language
// learn more: https://github.com/i18next/i18next-browser-languageDetector
.use(LanguageDetector)
// pass the i18n instance to react-i18next.
.use(initReactI18next)
// init i18next
// for all options read: https://www.i18next.com/overview/configuration-options
.init({
  detection: optsDetection,
  resources,
  // lng: "en",
  // fallbacks: true,
  fallbackLng: 'en',
  debug: env === "development",
  
  interpolation: {
    escapeValue: false, // not needed for react as it escapes by default
  },
  
  // Allowed languages
  supportedLngs: LIST_LANGUAGES,
  
  react: {
    wait: true,
    bindI18n: 'languageChanged loaded',
    // bindI18n: 'languageChanged loaded',
  }
});

export default i18n;