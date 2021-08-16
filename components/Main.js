import React, { Component } from "react";
import { Route, Switch, HashRouter } from "react-router-dom";
import Home from "./containers/home/HomePage";
import Splash from "./containers/splash/Splash";
import Education from "./containers/education/EducationComponent";
import Experience from "./containers/experience/Experience";
import Contact from "./containers/contact/ContactComponent";
import Projects from "./containers/projects/Projects";
import { settings } from "../lib/portfolio.js";
import AboutPage from "./containers/about/AboutPage";
// import Opensource from "../pages/opensource/Opensource";

export default class Main extends Component {
  render() {
    if (settings.isSplash) {
      return (
        <div>
          <HashRouter basename="/">
            <Switch>
              <Route
                path="/"
                exact
                render={(props) => (
                  <Splash {...props} theme={this.props.theme} />
                )}
              />
              <Route
                path="/home"
                render={(props) => <Home {...props} theme={this.props.theme} />}
              />
              <Route
                path="/about"
                render={(props) => (
                  <AboutPage {...props} theme={this.props.theme} />
                )}
              />
              <Route
                path="/experience"
                exact
                render={(props) => (
                  <Experience {...props} theme={this.props.theme} />
                )}
              />
              <Route
                path="/education"
                render={(props) => (
                  <Education {...props} theme={this.props.theme} />
                )}
              />
              {/*<Route*/}
              {/*  path="/opensource"*/}
              {/*  render={(props) => (*/}
              {/*    <Opensource {...props} theme={this.props.theme} />*/}
              {/*  )}*/}
              {/*/>*/}
              <Route
                path="/contact"
                render={(props) => (
                  <Contact {...props} theme={this.props.theme} />
                )}
              />
              <Route
                path="/splash"
                render={(props) => (
                  <Splash {...props} theme={this.props.theme} />
                )}
              />
              <Route
                path="/projects"
                render={(props) => (
                  <Projects {...props} theme={this.props.theme} />
                )}
              />
            </Switch>
          </HashRouter>
        </div>
      );
    } else {
      return (
        <div>
          <HashRouter basename="/">
            <Switch>
              <Route
                path="/"
                exact
                render={(props) => <Home {...props} theme={this.props.theme} />}
              />
              <Route
                path="/home"
                render={(props) => <Home {...props} theme={this.props.theme} />}
              />
              <Route
                path="/about"
                render={(props) => (
                  <AboutPage {...props} theme={this.props.theme} />
                )}
              />
              <Route
                path="/experience"
                exact
                render={(props) => (
                  <Experience {...props} theme={this.props.theme} />
                )}
              />
              <Route
                path="/education"
                render={(props) => (
                  <Education {...props} theme={this.props.theme} />
                )}
              />
              {/*<Route*/}
              {/*  path="/opensource"*/}
              {/*  render={(props) => (*/}
              {/*    <Opensource {...props} theme={this.props.theme} />*/}
              {/*  )}*/}
              {/*/>*/}
              <Route
                path="/contact"
                render={(props) => (
                  <Contact {...props} theme={this.props.theme} />
                )}
              />
              {/* <Route
							path="/splash"
							render={(props) => (
								<Splash
									{...props}
									theme={this.props.theme}
								/>
							)}
						/> */}
              <Route
                path="/projects"
                render={(props) => (
                  <Projects {...props} theme={this.props.theme} />
                )}
              />
            </Switch>
          </HashRouter>
        </div>
      );
    }
  }
}
