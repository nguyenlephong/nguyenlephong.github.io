import React, { Component } from "react";
import { Fade } from "react-reveal";
import Link from "next/link";
import { greeting, settings } from "../../lib/portfolio.js";

const onMouseEnter = (event, color) => {
  const el = event.target;
  el.style.backgroundColor = color;
};

const onMouseOut = (event) => {
  const el = event.target;
  el.style.backgroundColor = "transparent";
};

class Header extends Component {
  render() {
    const theme = this.props.theme;
    const link = settings.isSplash ? "/splash" : "home";
    return (
      <Fade top duration={1000} distance="20px">
        <div>
          <header className="header">
            <Link href={link} className="logo">
              <div className={"wrapper-logo"}>
                <span style={{ color: theme.text }}> &lt;</span>
                <span className="logo-name" style={{ color: theme.text }}>
                {greeting.logo_name}
              </span>
                <span style={{ color: theme.text }}>/&gt;</span>
              </div>
            </Link>
  
            <input className="menu-btn" type="checkbox" id="menu-btn" />
            <label className="menu-icon" htmlFor="menu-btn">
              <span className="navicon" />
            </label>
  
            <ul className="menu" style={{ backgroundColor: theme.body }}>
              <li>
                <Link href="/home">
                  <div
                    className={"menu-nav-link-item"}
                    style={{ color: theme.text }}
                    onMouseEnter={(event) => onMouseEnter(event, theme.highlight)}
                    onMouseOut={(event) => onMouseOut(event)}
                  >
                    Home
                  </div>
                </Link>
              </li>
    
              <li>
                <Link href="/about">
                  <div
                    className={"menu-nav-link-item"}
                    style={{ color: theme.text }}
                    onMouseEnter={(event) => onMouseEnter(event, theme.highlight)}
                    onMouseOut={(event) => onMouseOut(event)}
                  >
                    About
                  </div>
                </Link>
              </li>
    
              <li>
                <Link href="/education">
                  <div
                    className={"menu-nav-link-item"}
                    style={{ color: theme.text }}
                    onMouseEnter={(event) => onMouseEnter(event, theme.highlight)}
                    onMouseOut={(event) => onMouseOut(event)}
                  >
                    Education
                  </div>
                </Link>
              </li>
    
              <li>
                <Link href="/experience">
                  <div
                    className={"menu-nav-link-item"}
                    style={{ color: theme.text }}
                    onMouseEnter={(event) => onMouseEnter(event, theme.highlight)}
                    onMouseOut={(event) => onMouseOut(event)}
                  >
                    Experience
                  </div>
                </Link>
              </li>
              <li>
                <Link href="/projects">
                  <div
                    className={"menu-nav-link-item"}
                    style={{ color: theme.text }}
                    onMouseEnter={(event) => onMouseEnter(event, theme.highlight)}
                    onMouseOut={(event) => onMouseOut(event)}
                  >
                    Projects
                  </div>
                </Link>
              </li>

              {false && (
                <li>
                  <Link
                    href="/opensource"
                    activeStyle={{ fontWeight: "bold" }}
                    style={{ color: theme.text }}
                    onMouseEnter={(event) =>
                      onMouseEnter(event, theme.highlight)
                    }
                    onMouseOut={(event) => onMouseOut(event)}
                  >
                    Open Source
                  </Link>
                </li>
              )}
    
              <li>
                <Link href="/contact">
                  <div
                    className={"menu-nav-link-item"}
                    style={{ color: theme.text }}
                    onMouseEnter={(event) => onMouseEnter(event, theme.highlight)}
                    onMouseOut={(event) => onMouseOut(event)}
                  >
                    Contact Me
                  </div>
                </Link>
              </li>
            </ul>
          </header>
        </div>
      </Fade>
    );
  }
}
export default Header;
