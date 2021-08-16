import React from "react";
import { Fade } from "react-reveal";
import { greeting } from "../../lib/portfolio.js";
import configs from "../../lib/config/app-config"

export default function Footer(props) {
  return (
    <div className="footer-div">
      <Fade>
        <p className="footer-text"
           style={{ color: props.theme.secondaryText }}>
          <span>Version: {configs.app.VERSION} - </span>
          Made with <span role="img">❤️</span> by {greeting.title}
        </p>
        
      </Fade>
    </div>
  );
}
