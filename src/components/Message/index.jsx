import { Box, Stack, Typography, Avatar, Button } from "@mui/material";
import React from "react";

const Message = ({ msg, handleClicked }) => {
  if (msg.from.id == "user1") {
    if (msg.text)
      return (
        <>
          <Box
            sx={{
              width: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
            }}
          >
            <Box
              sx={{
                margin: "2% 0",
                paddingRight: "2%",
                display: "flex",
                flexDirection: "row-reverse",
              }}
            >
              <Avatar
                src="https://www.pngitem.com/pimgs/m/22-220721_circled-user-male-type-user-colorful-icon-png.png"
                alt="user"
              />
            </Box>
            <Box
              sx={{
                marginRight: "5%",
                borderRadius: "15px",
                border: ".862892px solid #efefef",
                boxShadow: "0 3.45157px 17.2578px rgba(0,0,0,.1)",
                width: "fit-content",
                padding: "2% 4%",
                backgroundColor: "#ffffff",
                color: "black",
                textAlign: "start",
              }}
            >
              <Typography>{msg.text}</Typography>
            </Box>
            {msg.tone && (
              <Box>
                <Typography variant="caption" sx={{ color: "gray" }}>
                  Prompt: 請使用{msg.tone}的口吻改寫
                </Typography>
              </Box>
            )}
          </Box>
        </>
      );
  } else {
    if (msg.text) {
      return (
        <>
          <Box
            sx={{
              width: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
            }}
          >
            <Stack direction="row" spacing={1} margin="2% 0">
              <Avatar
                src={
                  msg.isOpenAI
                    ? "https://a.fsdn.com/allura/s/openai-codex/icon?79624fcb195fd94801a8f821064006313d5b3e3dc73ecf53843d99ec566053c6?&w=120"
                    : "https://cdn3.iconfinder.com/data/icons/chat-bot-emoji-filled-color/300/141453384Untitled-3-512.png"
                }
                sx={{ border: "solid 2px #AEA3CD" }}
              />
              {msg.addOpenAI && (
                <Avatar src="https://a.fsdn.com/allura/s/openai-codex/icon?79624fcb195fd94801a8f821064006313d5b3e3dc73ecf53843d99ec566053c6?&w=120" />
              )}
            </Stack>
            <Box
              sx={{
                marginRight: "5%",
                borderRadius: "15px",
                border: ".862892px solid #efefef",
                boxShadow: "0 3.45157px 17.2578px rgba(0,0,0,.1)",
                width: "fit-content",
                padding: "2% 4%",
                backgroundColor: "#ffffff",
                color: "black",
                textAlign: "start",
              }}
            >
              <Typography>{msg.text}</Typography>
            </Box>
          </Box>
        </>
      );
    } else if (msg.attachments) {
      if (msg.attachments[0].content.buttons)
        return (
          <>
            <Box
              sx={{
                width: "80%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-start",
              }}
            >
              <Stack direction="row" spacing={1} margin="2% 0">
                <Avatar
                  src={
                    msg.isOpenAI
                      ? "https://a.fsdn.com/allura/s/openai-codex/icon?79624fcb195fd94801a8f821064006313d5b3e3dc73ecf53843d99ec566053c6?&w=120"
                      : "https://cdn3.iconfinder.com/data/icons/chat-bot-emoji-filled-color/300/141453384Untitled-3-512.png"
                  }
                  sx={{ border: "solid 2px #AEA3CD" }}
                />
                {msg.addOpenAI && (
                  <Avatar src="https://a.fsdn.com/allura/s/openai-codex/icon?79624fcb195fd94801a8f821064006313d5b3e3dc73ecf53843d99ec566053c6?&w=120" />
                )}
              </Stack>
              <Box
                sx={{
                  marginRight: "5%",
                  borderRadius: "15px",
                  border: ".862892px solid #efefef",
                  boxShadow: "0 3.45157px 17.2578px rgba(0,0,0,.1)",
                  width: "fit-content",
                  padding: "2% 4%",
                  backgroundColor: "#ffffff",
                  color: "black",
                  textAlign: "start",
                  marginBottom: "5%",
                }}
              >
                <Typography color="#000">您指的是?</Typography>
              </Box>
              <Stack spacing={2}>
                {msg.attachments[0].content.buttons.map((item, index) => {
                  return (
                    <Button
                      variant="outlined"
                      onClick={() => {
                        handleClicked(item.value);
                      }}
                      key={index}
                    >
                      {item.value}
                    </Button>
                  );
                })}
              </Stack>
            </Box>
          </>
        );
    }
  }
};

export default Message;
