import React from "react";
import asyncComponent from 'shared/helpers/async-function/AsyncFunc';
import {ROUTE_NAME} from "./router-name";
import {Redirect} from "react-router-dom";
import {redirectUrl} from "../services/URLService";

export const RouteAppItems = [
  {
    id: 1,
    path: ROUTE_NAME.ROOT,
    exact: true,
    component: () => <Redirect to={redirectUrl(ROUTE_NAME.HOME_ACTIVE)}/>
  },
  {
    id: 2,
    path: ROUTE_NAME.HOME_ACTIVE,
    exact: true,
    component: asyncComponent(() => import("components/containers/home/HomePage"))
  },
  {
    id: 3,
    path: ROUTE_NAME.NOT_FOUND,
    exact: true,
    component: asyncComponent(() => import("components/containers/global/PageNotFound"))
  },
  {
    id: 4,
    path: ROUTE_NAME.ACCESS_DENIED,
    exact: true,
    component: asyncComponent(() => import("components/containers/global/AccessDenied"))
  },
]