import React, { useState } from "react";
import {Image} from "antd"
import { Box, Grid, Stack, TextField, Typography } from "@mui/material";
import LoadingButton from '@mui/lab/LoadingButton';
import ToolDetailPageWrapper from "../../components/containers/tools/ToolDetailPageWrapper";
import { PhoneOutgoing } from "phosphor-react";
import axios from "axios";
import {get} from "lodash";
import 'antd/dist/antd.css';

const ImageGeneration = () => {
  const [prompt, setPrompt] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState("")

  const getResult = () => {
    setLoading(true)
    axios({
      url: process.env.NEXT_PUBLIC_CALL_API_TOOLS_URL,
      method: "POST",
      data: {
        "license_key": process.env.NEXT_PUBLIC_OPEN_AI_KEY,
        "url": process.env.NEXT_PUBLIC_IMAGE_GENERATION_URL,
        "method": "POST",
        "payload": {
          "prompt": prompt,
          "n": 3,
          "size": "1024x1024"
        }
      }
    }).then(res => {
      setResult(get(res, "data"));
      setLoading(false)
    }).catch(err => {
      setResult(err.response);
      setLoading(false)
    });
  }

  return (
    <ToolDetailPageWrapper
      title={"Tools For Developer | Call API online tools"}
      description={"Tools For Developer | Call API online tools, tools"}
    >
      <div className={"fw fh"}>
        <Typography variant={"h3"} px={2}>Input your description and enjoy outcome response by AI!</Typography>
        <Typography variant={"h4"} px={2}>Do not save anything!</Typography>
        <Box sx={{ padding: 2, width: "100%", height: "100%" }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={8} lg={6}>
              <TextField
                id="prompt"
                label="Prompt"
                multiline
                rows={4}
                fullWidth
                defaultValue={prompt}
                onBlur={e => setPrompt(e.target.value)}
                variant="filled"
              />
            </Grid>

            <Grid item xs={12}>
              <Stack spacing={2} direction={"row"}>
                <LoadingButton
                  loading={loading}
                  startIcon={<PhoneOutgoing size={24} />}
                  onClick={getResult}
                  variant={"contained"} color={"success"}>
                  Get Outcome
                </LoadingButton>
              </Stack>
            </Grid>


            <Grid item xs={12} md={8} lg={6}>
              <div style={{width: "100%"}}>
                <Image.PreviewGroup
                  preview={{
                    onChange: (current, prev) => console.log(`current index: ${current}, prev index: ${prev}`),
                  }}
                >
                  {result?.data?.map((i, ind) => {
                    return (
                      <Image
                        key={`image_${ind}_${i.url}`}
                        width={200}
                        src={i.url}
                      />
                    )
                  })}
                </Image.PreviewGroup>
              </div>
            </Grid>
          </Grid>
        </Box>
      </div>
    </ToolDetailPageWrapper>
  );
};

ImageGeneration.propTypes = {

};

export default ImageGeneration;
