import WrapperProvider from "../components/WrapperProvider";
import { useSelector } from "../src/reduxs/store";
import Head from "next/head";
import React, { useEffect } from "react";
import { Layout } from "antd";
import Header from "../components/components/Header";
import Footer from "../components/components/Footer";
import { Box, Grid } from "@mui/material";
import $ from "jquery";

const { Content } = Layout;
export default function poc() {
  const chosenThemeInit = useSelector(store => store.themes).currentThemes;
  useEffect(() => {
    var limits = 15.0;

    $(".card").mousemove(function(e) {
      var rect = e.target.getBoundingClientRect();
      var x = e.clientX - rect.left; //x position within the element.
      var y = e.clientY - rect.top; //y position within the element.
      var offsetX = x / rect.width;
      var offsetY = y / rect.height;

      var rotateY = ((offsetX - 0) / (1 - 0)) * (limits - -limits) + -limits;
      var rotateX = ((offsetY - 0) / (1 - 0)) * (limits - -limits) + -limits;

      var shadowOffsetX = ((offsetX - 0) / (1 - 0)) * (16 - -16) + -16;
      var shadowOffsetY = ((offsetY - 0) / (1 - 0)) * (16 - -16) + -16;

      $(this).css({
        "box-shadow": (1 / 6) * shadowOffsetX * -1 + "px " + (1 / 6) * shadowOffsetY * -1 + "px 3px rgba(0, 0, 0, 0.051), " + (2 / 6) * shadowOffsetX * -1 + "px " + (2 / 6) * shadowOffsetY * -1 + "px 7.2px rgba(0, 0, 0, 0.073), " + (3 / 6) * shadowOffsetX * -1 + "px " + (3 / 6) * shadowOffsetY * -1 + "px 13.6px rgba(0, 0, 0, 0.09), " + (4 / 6) * shadowOffsetX * -1 + "px " + (4 / 6) * shadowOffsetY * -1 + "px 24.3px rgba(0, 0, 0, 0.107), " + (5 / 6) * shadowOffsetX * -1 + "px " + (5 / 6) * shadowOffsetY * -1 + "px 45.5px rgba(0, 0, 0, 0.129), " + shadowOffsetX * -1 + "px " + shadowOffsetY * -1 + "px 109px rgba(0, 0, 0, 0.18)",
        transform: "perspective(1000px) rotateX(" + -rotateX + "deg) rotateY(" + rotateY + "deg)"
      });

      var glarePos = rotateX + rotateY + 90;
      $(this)
        .children()
        .children()
        .css("left", glarePos + "%");
    });

    $(".card").mouseleave(function(e) {
      $(".card").css({
        "box-shadow": "0px 0px 3px rgba(0, 0, 0, 0.051), 0px 0px 7.2px rgba(0, 0, 0, 0.073), 0px 0px 13.6px rgba(0, 0, 0, 0.09), 0px 0px 24.3px rgba(0, 0, 0, 0.107), 0px 0px 45.5px rgba(0, 0, 0, 0.129), 0px 0px 109px rgba(0, 0, 0, 0.18)",
        "transform": "scale(1.0)"
      });
      $(".glare").css("left", "100%");
    });

  }, []);

  return (<WrapperProvider>
      <Head>
        <title>Home page - Nguyễn Lê Phong | Full-stack Software Engineer</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        <meta
          name="description"
          content="Nguyễn Lê Phong - Full-stack Software Engineer. A passionate individual who always thrives to work on end-to-end products which develop sustainable and scalable social and technical systems to create impact."
        />
      </Head>
      <Layout>
        <Content>
          <div>
            <Header theme={chosenThemeInit} />
            <Box sx={{ padding: 4 }}>
              <div className="list-card-edu" id="list-card-edu">

                <Grid container spacing={2}>
                  <Grid item xs={12} lg={4}>
                      <div className="card" style={{ backgroundImage: `url(https://cdn.jsdelivr.net/gh/nguyenlephong/dom-pub/shared/images/cv/images/me/best_rookie.jpeg?w=248&fit=crop&auto=format)` }}>
                        <div className="glare-container">
                          <div className="glare">
                          </div>
                        </div>
                      </div>

                  </Grid>
                  <Grid item xs={12} lg={4}>
                      <div className="card card-1" style={{ backgroundImage: `url(/assests/photos/prime-mvp.png)` }}>
                        <div className="glare-container">
                          <div className="glare">
                          </div>
                        </div>
                      </div>
                  </Grid>
                  <Grid item xs={12} lg={4}>
                      <div className="card card-2" style={{
                        backgroundImage: `url(https://cdn.jsdelivr.net/gh/nguyenlephong/dom-pub/shared/images/cv/images/me/drone.JPG?w=248&fit=crop&auto=format)`,
                        backgroundPosition: "right"
                      }}>
                        <div className="glare-container">
                          <div className="glare">
                          </div>
                        </div>
                      </div>
                  </Grid>

                </Grid>

              </div>
            </Box>
            <Footer theme={chosenThemeInit} />
          </div>
        </Content>
      </Layout>
    </WrapperProvider>);
};