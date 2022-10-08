import React, { Component } from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { Fade } from "react-reveal";
import { useTheme } from "@mui/material/styles";
import { Box, CardMedia, Typography } from "@mui/material";
import AppBar from "@mui/material/AppBar";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import SwipeableViews from "react-swipeable-views";
import ToolDetailFooter from "../../components/ToolDetailFooter";
import { TabPanel, a11yProps } from "../../containers/tools/tool_016/RoadMapPage";
import { greeting } from "../../../lib/portfolio";

class CurriculumVitaePage extends Component {
  render() {
    const theme = this.props.theme;
    return (
      <div className="contact-main">
        <Header theme={theme} />
        <div className="basic-contact">
          <Fade bottom duration={1000} distance="40px">
            <CVContainer />
          </Fade>


        </div>
        <Footer theme={this.props.theme} onToggle={this.props.onToggle} />
      </div>
    );
  }
}

export default CurriculumVitaePage;


const CVContainer = (props) => {
  const theme = useTheme();
  const [value, setValue] = React.useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const handleChangeIndex = (index) => {
    setValue(index);
  };
  return (
    <div className={"fw fh"}>
      <Typography variant={"h2"} px={2}>Nguyễn Lê Phong - Curriculum Vitae</Typography>
      <Typography variant={"h4"} px={2}>
        Figma Design: <a href={"https://www.figma.com/file/BdvNRjXSIMQpjmf0aF7Ljw/Profile-CV"} target={"_blank"}
                         style={{ color: "blue" }}>https://www.figma.com/file/BdvNRjXSIMQpjmf0aF7Ljw/Profile-CV</a>
      </Typography>

      <Box sx={{ padding: 2, width: "100%", height: "100%" }}>
        <Box sx={{ bgcolor: "background.paper", width: "100%" }}>
          <AppBar position="static">
            <Tabs
              value={value}
              onChange={handleChange}
              indicatorColor="secondary"
              textColor="inherit"
              variant="scrollable"
              scrollButtons
              allowScrollButtonsMobile
              aria-label="road-map-tab"
            >
              <Tab label="CV Landscape" {...a11yProps(0)} />
              <Tab label="CV Portrait" {...a11yProps(1)} />
            </Tabs>
          </AppBar>

          <SwipeableViews
            axis={theme.direction === "rtl" ? "x-reverse" : "x"}
            index={value}
            onChangeIndex={handleChangeIndex}
          >
            <TabPanel value={value} index={0} dir={theme.direction}>
              <CardMedia
                component="img"
                alt="green iguana"
                image={greeting.cv_landscape}
              />
            </TabPanel>
            <TabPanel value={value} index={1} dir={theme.direction}>
              <CardMedia
                component="img"
                alt="green iguana"
                image={greeting.cv_portrait}
              />
            </TabPanel>

          </SwipeableViews>
        </Box>
      </Box>
      <Box sx={{ padding: 2, width: "100%" }}>
        <ToolDetailFooter />
      </Box>
    </div>
  );
};