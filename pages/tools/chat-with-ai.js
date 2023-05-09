import React, { useState } from "react";
import { Box, Grid, Stack, TextField, Typography } from "@mui/material";
import LoadingButton from '@mui/lab/LoadingButton';
import ToolDetailPageWrapper from "../../components/containers/tools/ToolDetailPageWrapper";
import { PhoneOutgoing } from "phosphor-react";
import axios from "axios";
import {get} from "lodash";

const ChatWithAI = () => {
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
        "url": process.env.NEXT_PUBLIC_CHAT_COMPLETIONS_URL,
        "method": "POST",
        "payload": {
          "model": "gpt-3.5-turbo",
          "messages": [
            {
              "role": "user",
              "content": prompt
            }
          ]
        }
      }
    }).then(res => {
      setResult(get(res, "data.choices[0].message.content"));
      setLoading(false)
    }).catch(err => {
      setResult(err.response);
      setLoading(false)
    });
  }

  return (
    <ToolDetailPageWrapper
      title={"Tools For Developer | chat with AI tools"}
      description={"Tools For Developer | chat with AI tools, tools"}
    >
      <div className={"fw fh"}>
        <Typography variant={"h3"} px={2}>Input your question and enjoy outcome response by AI!</Typography>
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
              <TextField
                id="result"
                label="Response"
                multiline
                rows={8}
                fullWidth
                defaultValue={result}
                variant="filled"
              />
            </Grid>
          </Grid>
        </Box>
      </div>
    </ToolDetailPageWrapper>
  );
};

ChatWithAI.propTypes = {

};

export default ChatWithAI;
