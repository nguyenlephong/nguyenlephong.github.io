import React from "react";
import { Box, CardMedia, Typography } from "@mui/material";
import ToolDetailFooter from "../../../components/ToolDetailFooter";
import PropTypes from 'prop-types';
import SwipeableViews from 'react-swipeable-views';
import { useTheme } from '@mui/material/styles';
import AppBar from '@mui/material/AppBar';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';

export function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`full-width-tabpanel-${index}`}
      aria-labelledby={`full-width-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

export function a11yProps(index) {
  return {
    id: `full-width-tab-${index}`,
    'aria-controls': `full-width-tabpanel-${index}`,
  };
}
const RoadMapPage = props => {
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
      <Typography variant={"h2"} px={2} >Roadmap for developer</Typography>
      <Typography variant={"h4"} px={2} >
        Source: <a href={"https://roadmap.sh/"} target={"_blank"}>https://roadmap.sh/</a>
      </Typography>

      <Box sx={{ padding: 2, width: "100%", height: "100%" }}>
        <Box sx={{ bgcolor: 'background.paper', width: "100%" }}>
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
              <Tab label="Frontend" {...a11yProps(0)} />
              <Tab label="Backend" {...a11yProps(1)} />
              <Tab label="Devops" {...a11yProps(2)} />
              <Tab label="Android" {...a11yProps(3)} />
              <Tab label="ReactJS" {...a11yProps(4)} />
            </Tabs>
          </AppBar>

          <SwipeableViews
            axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
            index={value}
            onChangeIndex={handleChangeIndex}
          >
            <TabPanel value={value} index={0} dir={theme.direction}>
              <CardMedia
                component="img"
                alt="green iguana"
                image="https://roadmap.sh/roadmaps/frontend.png"
              />
            </TabPanel>
            <TabPanel value={value} index={1} dir={theme.direction}>
              <CardMedia
                component="img"
                alt="green iguana"
                image="https://roadmap.sh/roadmaps/backend.png"
              />
            </TabPanel>
            <TabPanel value={value} index={2} dir={theme.direction}>
              <CardMedia
                component="img"
                alt="green iguana"
                image="https://roadmap.sh/roadmaps/devops.png"
              />
            </TabPanel>
            <TabPanel value={value} index={3} dir={theme.direction}>
              <CardMedia
                component="img"
                alt="green iguana"
                image="https://roadmap.sh/roadmaps/android/roadmap.svg"
              />
            </TabPanel>
            <TabPanel value={value} index={4} dir={theme.direction}>
              <CardMedia
                component="img"
                alt="green iguana"
                image="https://roadmap.sh/roadmaps/react.png"
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

RoadMapPage.propTypes = {

};

export default RoadMapPage;