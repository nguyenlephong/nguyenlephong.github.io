import React, { Component } from "react";
import { Fade } from "react-reveal";
import { certifications } from "../../lib/portfolio";
import CertificationCard from "./CertificationCard";
import { Box } from "@mui/material";

class Certifications extends Component {
  render() {
    const theme = this.props.theme;
    return (
      <div className="main" id="certs">
        <div className="certs-header-div">
          <Fade bottom duration={2000} distance="20px">
            <h1 className="certs-header" style={{ color: theme.text }}>
              Certifications
            </h1>
          </Fade>
        </div>

        <Box sx={{pt: 2}} className="certs-body-div">
          {certifications.certifications.map((cert) => {
            return <CertificationCard certificate={cert} theme={theme} />;
          })}
        </Box>
      </div>
    );
  }
}

export default Certifications;