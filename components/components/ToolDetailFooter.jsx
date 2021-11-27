import React from "react";
import ButtonShareContainer from "../../components/components/ButtonShareContainer";
import { Button, Grid } from "@mui/material";
import { GithubLogo } from "phosphor-react";

const ToolDetailFooter = props => {
  return (
    <Grid container={true} spacing={2}>
      <Grid item xs={12}>
        <a
          rel={"noreferrer"}
          href={"https://github.com/nguyenlephong/nguyenlephong.github.io/tree/master/components/containers/tools"}
          target={"_blank"}>
          <Button startIcon={<GithubLogo size={24} />} color={"secondary"} variant={"contained"}>View source code on
            github</Button>
        </a>
      </Grid>
      <Grid item sx={12}>
        <ButtonShareContainer
          title={window.document.title}
          description={window.document.title}
          thumbnail={null}
          url={window.location.href}
        />
      </Grid>
    </Grid>
  );
};

ToolDetailFooter.propTypes = {};

export default ToolDetailFooter;