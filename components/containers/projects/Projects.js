import React, { Component } from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
// import GithubRepoCard from "../../components/GithubRepoCard";
import Button from "../../components/Button";
import { Fade } from "react-reveal";
import { projectsHeader } from "../../../lib/portfolio.js";
import ProjectsData from "../../../src/shared/opensource/projects.json";
import ProjectsImg from "./ProjectsImg";
import { Box, Grid, Typography } from "@mui/material";
import ProjectCard from "../../components/ProjectCard";
import Masonry from '@mui/lab/Masonry';

class Projects extends Component {
  render() {
    const theme = this.props.theme;
    return (
      <div className="projects-main">
        <Header theme={theme} />
        <Box className="basic-projects">
          <Fade bottom duration={2000} distance="40px">
            <Box className="projects-heading-div">
              <Box className="projects-heading-img-div">
                <ProjectsImg theme={theme} />
              </Box>
              <Box className="projects-heading-text-div">
                <h1
                  className="projects-heading-text"
                  style={{ color: theme.text }}
                >
                  {projectsHeader.title}
                </h1>
                <Typography

                  className="projects-header-detail-text subTitle"
                  sx={{ color: theme.secondaryText, pt: 2 }}
                >
                  {projectsHeader["description"]}
                </Typography>
              </Box>
            </Box>
          </Fade>
        </Box>

        <Box sx={{padding: 2}}>
          <Masonry
            columns={{
              xs: 1, md: 2, lg:3, xl:4
            }}
            spacing={2}
            defaultHeight={450}
            defaultColumns={4}
            defaultSpacing={2}
          >
            {ProjectsData.data.map((repo) => {
              return (
                  <Fade key={repo.id} bottom duration={2000} distance="40px">
                    <ProjectCard repo={repo} theme={theme} />
                  </Fade>
              )
            })}
          </Masonry>
        </Box>

        {/*<div className="repo-cards-div-main">*/}
        {/*  {ProjectsData.data.map((repo) => {*/}
        {/*    return <GithubRepoCard repo={repo} theme={theme} />;*/}
        {/*  })}*/}
        {/*</div>*/}

        <Button
          text={"More Projects"}
          className="project-button"
          href="https://github.com/nguyenlephong"
          newTab={true}
          theme={theme}
        />
        <Footer theme={this.props.theme} onToggle={this.props.onToggle} />
      </div>
    );
  }
}

export default Projects;