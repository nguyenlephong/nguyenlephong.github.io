import React from "react";

class LogoLoader extends React.Component {
  render() {
    const theme = this.props.theme;

    return (
      <svg
        className="raw_logo"
        xmlns="http://www.w3.org/2000/svg"
        width="563"
        height="236"
        viewBox="0 0 563 236"
      >
        <text
          id="Nguyễn_Lê_Phong"
          data-name="Nguyễn Lê Phong"
          transform="translate(0 203)"
          fill={theme.body}
          fontSize="72"
          fontFamily="Apple-Chancery, Apple Chancery"
        >
          <tspan x="0" y="0">
            Nguy
          </tspan>
          <tspan y="0" fontFamily="Thonburi">
            ễ
          </tspan>
          <tspan y="0">n Lê Phong</tspan>
        </text>
        <text
          id="Dom_s"
          data-name="Dom's"
          transform="translate(193 80)"
          fill={theme.body}
          fontSize="72"
          fontFamily="Apple-Chancery, Apple Chancery"
        >
          <tspan x="0" y="0">
            Dom&apos;s
          </tspan>
        </text>

        <defs>
          <style
            dangerouslySetInnerHTML={{
              __html: `
		.letter{
			opacity: 0;
			-webkit-animation: fadein 2s linear forwards 2.5s;
			-o-animation: fadein 2s linear forwards 2.5s;
			-moz-animation: fadein 2s linear forwards 2.5s;
			animation: fadein 2s linear forwards 2.5s;
		}

		@-webkit-keyframes fadein{
			from{
				opacity: 0;
			}
			to{
				opacity: 1;
			}
		}

		@-webkit-keyframes dash{
			from{
				stroke-dashoffset: 800;
			}
			to{
				stroke-dashoffset: 0;
			}
		}
    `,
            }}
          />
        </defs>
      </svg>
    );
  }
}

export default LogoLoader;
