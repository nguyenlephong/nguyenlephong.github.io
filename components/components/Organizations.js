import React, { Component } from "react";
import { Fade } from "react-reveal";
import OrganizationList from "./OrganizationList";
import OrganizationsData from "../../src/shared/opensource/organizations.json";

class Organizations extends Component {
  render() {
    const theme = this.props.theme;
    return (
      <div id="organizations">
        <div className="organizations-header-div">
          <Fade bottom duration={2000} distance="20px">
            <h1 className="organizations-header" style={{ color: theme.text }}>
              Contributed Organizations
            </h1>
          </Fade>
        </div>
        <OrganizationList logos={OrganizationsData["data"]} />
      </div>
    );
  }
}

export default Organizations;
