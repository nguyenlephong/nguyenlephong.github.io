import React from "react";
import PropTypes from "prop-types";
import ProjectLanguages from "./ProjectLanguages";
import { Box, Card, CardContent, Stack, Typography } from "@mui/material";

const ProjectCard = props => {
  const { repo, theme } = props;

  const openRepoInNewTab = (url) => {
    let win = window.open(url, "_blank");
    win.focus();
  };

  return (
    <Card
      // sx={{ maxWidth: 345 }}
      className="repo-card-div"
      key={repo.id}
      onDoubleClick={() => openRepoInNewTab(repo.url)}
      style={{ backgroundColor: theme.highlight }}
    >
      <CardContent>
        <Box className="repo-name-div">
          <svg
            aria-hidden="true"
            className="octicon repo-svg"
            height="16"
            role="img"
            viewBox="0 0 12 16"
            width="12"
          >
            <path
              fillRule="evenodd"
              d="M4 9H3V8h1v1zm0-3H3v1h1V6zm0-2H3v1h1V4zm0-2H3v1h1V2zm8-1v12c0 .55-.45 1-1 1H6v2l-1.5-1.5L3 16v-2H1c-.55 0-1-.45-1-1V1c0-.55.45-1 1-1h10c.55 0 1 .45 1 1zm-1 10H1v2h2v-1h3v1h5v-2zm0-10H2v9h9V1z"
            />
          </svg>
          <p className="repo-name" style={{ color: theme.text }}>
            {repo.name}
          </p>
        </Box>

        <Typography className="repo-description" sx={{ color: theme.text }}>
          {repo.description}
        </Typography>

        <Stack spacing={2} className="repo-details">
          <ProjectLanguages
            className="repo-languages"
            logos={repo.languages}
          />
          <Typography
            // className="repo-creation-date subTitle"
            sx={{ color: theme.secondaryText, textAlign: "left" }}
          >
            Created on {repo.createdAt.split("T")[0]}
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
};

ProjectCard.propTypes = {
  repo: PropTypes.shape({
    languages: PropTypes.array,
    id: PropTypes.string,
    name: PropTypes.string,
    createdAt: PropTypes.string,
    url: PropTypes.string,
    isFork: PropTypes.bool,
    description: PropTypes.string
  })
};

export default ProjectCard;