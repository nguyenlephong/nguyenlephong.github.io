import React, {useEffect, useState} from 'react';
import {Route, Switch} from 'react-router-dom';
import {ConnectedRouter} from 'connected-react-router';
import {RouteAppItems} from './route-options';
import ErrorBoundaryPage from "components/containers/global/ErrorBoundaryPage";
import {NOTIFICATION_MESSAGE} from "../../lib/config/config-app";
import {notification} from "antd";
import {useNetwork} from "react-use";
import {SYSTEM_KEYS} from "../../lib/config/constant";
import * as cookie from "js-cookie";
import {LIST_LANGUAGES} from "services/i18n";
import {useTranslation} from "react-i18next";

const PublicRoutes = ({history}) => {
  const state = useNetwork();
  const {i18n} = useTranslation();
  const [networkStatus, setNetworkStatus] = useState(null);

  useEffect(() => {
    setNetworkStatus(state)
    if (state.online !== networkStatus?.online && state?.online === false) {
      notification.warn({
        message: 'The network connection is lost!',
        duration: NOTIFICATION_MESSAGE.duration,
        className: 'pd__message--error',
        placement: "bottomLeft"
      });
    }

    if (networkStatus?.online === false && state.online !== networkStatus?.online && state?.online === true) {
      notification.success({
        message: 'The network ready connected!',
        duration: NOTIFICATION_MESSAGE.duration,
        className: 'pd__message--success',
        placement: "bottomLeft"
      });
    }
  }, [state, networkStatus])

  useEffect(() => {
    let access_token = cookie.get(SYSTEM_KEYS.KEY_GET_TOKEN);
    if (access_token) {
      const url = localStorage.getItem(SYSTEM_KEYS.VISIT_PAGE_URL)
      localStorage.removeItem(SYSTEM_KEYS.VISIT_PAGE_URL)
      if (url) window.location.href = url;
    }
  }, [])

  useEffect(()=>{
    let location = window.location
    let postUrl = location.href.substring(location.origin.length + ("/me".length + 1))
    let langKey = postUrl.substring(0, postUrl.indexOf("/"))
    if(LIST_LANGUAGES.includes(langKey)){
      i18n.changeLanguage(langKey).then(() => {
        console.log(`Update to ${langKey} language success`)
      });
    }
  },[i18n])

  return (
    <ConnectedRouter history={history}>
      <ErrorBoundaryPage>
        <Switch>
          {
            RouteAppItems.map((Item) => {
              return (
                <Route
                  key={Item.id}
                  exact={Item.exact}
                  path={Item.path}
                  component={Item.component}
                />
              )
            })
          }
        </Switch>
      </ErrorBoundaryPage>
    </ConnectedRouter>
  );
};

export default PublicRoutes;
