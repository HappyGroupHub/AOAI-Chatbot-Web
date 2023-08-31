import { useEffect, useState, useRef } from "react";
import {
  Box,
  IconButton,
  Stack,
  TextField,
  Select,
  FormControl,
  MenuItem,
  InputLabel,
  FormControlLabel,
  Checkbox,
  Fab,
  Typography,
  Alert,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import SendIcon from "@mui/icons-material/Send";
import ReactLoading from "react-loading";
import { SSE } from "sse";
import { SeverityLevel } from "@microsoft/applicationinsights-web";
import {
  AuthenticatedTemplate,
  UnauthenticatedTemplate,
  useMsal,
} from "@azure/msal-react";

import Message from "../../components/Message";
import {
  startConversation,
  postUserQuery,
  getConversation,
} from "../../services/webAppBot";
import {
  aoaiEnrichment,
  addToDB,
  getConversationFromDB,
} from "../../services/chatGPT";
import { searchDocs, summarizeDocs } from "../../services/embeddings";
import styled from "styled-components";

const useStyles = makeStyles({
  select: {
    "&:before": {
      borderColor: "white",
    },
    "&:after": {
      borderColor: "white",
    },
    "&:not(.Mui-disabled):hover::before": {
      borderColor: "white",
    },
  },
  icon: {
    fill: "white",
  },
  root: {
    color: "white",
  },
});

const testMessages = {
  ChatGPT: {
    from: { id: "bot" },
    text: "你好，我是ChatGPT機器人",
    isOpenAI: true,
  },
  "Azure Cognitive Search": {
    from: { id: "bot" },
    text: "我是CDC FAQ機器人，有什麼我可以協助您的嗎?",
    isOpenAI: false,
    addOpenAI: false,
  },
  "AOAI Embeddings": {
    from: { id: "bot" },
    text: "我是整合了AOAI的CDC FAQ機器人，有什麼我可以協助您的嗎?",
    isOpenAI: false,
    addOpenAI: true,
  },
};

const StyledForm = styled.form`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  background-color: white;
  width: 20em;
  margin-top: 10%;
  padding: 2em;
  border-radius: 2em;
  box-shadow: rgba(0, 0, 0, 0.1) 0px 4px 30px;
`;

const ChatBox = styled(Box)`
  width: 50vw;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

const ControlBar = styled(Box)`
  display: flex;
  width: 55vw;
  justify-content: space-between;
  align-items: center;
`;

const MsgStack = styled(Stack)`
  width: 50vw;
  height: 60vh;
  display: flex;
  overflow: auto;
`;

const Home = ({ mode, appInsights }) => {
  const [conversationID, setConversationID] = useState();
  const [conversations, setConversations] = useState([""]);
  const [requestID, setRequestID] = useState("");
  const [userQuery, setUserQuery] = useState("");
  const [tone, setTone] = useState("");
  const [payload, setPayload] = useState({});
  const [enabled, setEnabled] = useState(false);
  const [hasPast, setHasPast] = useState(false);
  const [retry, setRetry] = useState(false);
  const [result, setResult] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [apiEndpoint, setApiEndpoint] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [limitReached, setLimitReached] = useState(false);
  const [username, setUsername] = useState(null);

  const resultRef = useRef();
  const convObjRef = useRef();
  const stackRef = useRef(null);

  const { instance, accounts } = useMsal();
  const styles = useStyles();

  const handleClick = () => {
    appInsights.trackEvent({
      name: "ButtonClick",
      properties: { buttonId: "sendQuery", mode: mode },
    });
    appInsights.flush();
  };

  const handleMsgOption = (msg) => {
    setIsLoading(true);

    if (conversations.length !== 0)
      setConversations([
        ...conversations,
        { from: { id: "user1" }, text: msg, tone: tone },
      ]);
    else {
      setConversations(["", { from: { id: "user1" }, text: msg, tone: tone }]);
    }
    setPayload({
      type: "message",
      from: {
        id: "user1",
      },
      text: msg,
      tone: tone,
    });
    setRetry(false);
  };

  const handleLimitReached = (err) => {
    appInsights.trackException({
      exception: err,
      severityLevel: SeverityLevel.Error,
    });
    setLimitReached(true);
    setIsLoading(false);
  };

  const handleStreamResponse = async () => {
    setIsStreaming(true);
    setResult("");
    let lastConvs =
      conversations.length >= 3
        ? conversations.slice(conversations.length - 3)
        : conversations;
    const tmp = [];
    for (const conv of lastConvs) {
      if (conv.from.id === "bot")
        tmp.push({
          role: "assistant",
          content: conv.text,
        });
      else
        tmp.push({
          role: "user",
          content: conv.text,
        });
    }

    let messages = [
      {
        role: "system",
        content:
          "你是一個公共衛生專家，請回答這個領域的正確訊息，如果不確定就說'我無法回答'",
      },
      ...tmp,
      { role: "user", content: userQuery },
    ];
    let body = {
      messages: messages,
      temperature: 0.75,
      max_tokens: 800,
      top_p: 0.95,
      stop: "<|im_end|>",
      stream: true,
      n: 1,
    };
    let source = new SSE(
      apiEndpoint +
        "openai/deployments/gpt-35-turbo/chat/completions?api-version=2023-03-15-preview",
      {
        headers: {
          "Content-Type": "application/json",
          "api-key": apiKey,
        },
        method: "POST",
        payload: JSON.stringify(body),
      }
    );

    source.addEventListener("message", (e) => {
      if (e.data != "[DONE]") {
        let payload = JSON.parse(e.data);

        let text = payload.choices[0].delta.content;
        if (text) {
          resultRef.current = resultRef.current + text;
          setResult(resultRef.current);
          if (payload) convObjRef.current = payload;
        }
      } else {
        source.close();

        setIsStreaming(false);
        const updatedConv = [
          ...conversations,
          { from: { id: "user1" }, text: userQuery, tone: tone },
          {
            from: { id: "bot" },
            text: resultRef.current,
            isOpenAI: true,
          },
        ];
        console.log(updatedConv);

        setConversations(updatedConv);
        addToDB({
          user_id: username,
          role: "user",
          content: userQuery,
        });
        addToDB({
          user_id: username,
          role: "assistant",
          content: resultRef.current,
          model: convObjRef.current.model,
        });
      }
    });
    source.addEventListener("error", (e) => {
      const err = JSON.parse(e.data);
      source.close();
      handleLimitReached(err);
      setIsStreaming(false);
    });
    source.stream();
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setSubmitted(true);
  };

  const sendQuery = () => {
    handleClick();

    if (mode != "ChatGPT") setIsLoading(true);

    if (conversations.length !== 0)
      setConversations([
        ...conversations,
        { from: { id: "user1" }, text: userQuery, tone: tone },
      ]);
    else {
      setConversations([
        "",
        { from: { id: "user1" }, text: userQuery, tone: tone },
      ]);
    }
    if (mode == "Azure Cognitive Search") {
      setPayload({
        type: "message",
        from: {
          id: "user1",
        },
        text: userQuery,
      });
    } else if (mode == "ChatGPT") {
      if (!hasPast) {
        addToDB({
          user_id: username,
          role: "assistant",
          content: "你好，我是ChatGPT機器人",
        });
      }

      handleStreamResponse();
    } else if (mode == "AOAI Embeddings") {
      searchDocs(
        apiEndpoint +
          "openai/deployments/text-similarity-curie-001/embeddings?api-version=2023-05-15",
        apiKey,
        userQuery
      ).then((data) => {
        if (!enabled) {
          setConversations([
            ...conversations,
            { from: { id: "user1" }, text: userQuery },
            {
              from: { id: "bot" },
              text: data[0],
              isOpenAI: false,
              addOpenAI: true,
            },
          ]);
          setIsLoading(false);
        } else {
          summarizeDocs(data)
            .then((res) => {
              setConversations([
                ...conversations,
                { from: { id: "user1" }, text: userQuery },
                {
                  from: { id: "bot" },
                  text: res.choices[0].message.content,
                  isOpenAI: false,
                  addOpenAI: true,
                },
              ]);
              setIsLoading(false);
            })
            .catch((error) => {
              handleLimitReached(error);
            });
        }
      });
    }
  };

  // handle the streaming response from OpenAI
  useEffect(() => {
    resultRef.current = result;
  }, [result]);

  // keep the conversation box scrolled to the bottom when new messages are added
  useEffect(() => {
    if (stackRef.current)
      stackRef.current.scrollTop = stackRef.current.scrollHeight;
  }, [conversations, result]);

  // get the username from the account object
  useEffect(() => {
    if (accounts.length > 0) {
      setUsername(accounts[0].username);
    }
  }, [accounts]);

  // handle redirect from Azure AD, and get the username
  useEffect(() => {
    const handleRedirect = async () => {
      const authResult = await instance.handleRedirectPromise();
      if (authResult) {
        setUsername(authResult.account.username);
      }
    };
    handleRedirect().catch((error) => {
      console.log(error);
    });
  }, [instance]);

  useEffect(() => {
    if (mode == "ChatGPT" && conversations.length == 1) {
      getConversationFromDB(username).then((res) => {
        if (res.length == 0) return;

        setHasPast(res.length > 0);
        const tmp = [""];
        for (const item of res) {
          if (item["role"] == "assistant") {
            tmp.push({
              from: { id: "bot" },
              text: item["content"],
              isOpenAI: true,
            });
          } else {
            tmp.push({
              from: { id: "user1" },
              text: item["content"],
            });
          }
        }

        setConversations(tmp);
      });
    }
  }, [mode, username]);

  useEffect(() => {
    setUserQuery("");
    setConversations([""]);
    setResult("");
    setTone("");
    if (mode == "Azure Cognitive Search") {
      startConversation().then((data) => {
        if (data) {
          setConversationID(data.conversationId);
        } else {
          setConversationID("");
        }
      });
    }
  }, [mode]);

  useEffect(() => {
    if (mode == "Azure Cognitive Search") {
      postUserQuery(payload, conversationID)
        .then((data) => {
          setRequestID(data.id);
        })
        .catch((error) => {
          console.log(error);
        });
    }
  }, [payload, retry]);

  useEffect(() => {
    // set timeout for 1 minute if limitReached is true and set it back to false after 1 minute
    if (limitReached) {
      setTimeout(() => {
        setLimitReached(false);
        setConversations(conversations.slice(0, -1));
      }, 60000);
    }
  }, [limitReached]);

  useEffect(() => {
    if (mode == "Azure Cognitive Search" && conversationID) {
      getConversation(conversationID).then((data) => {
        // console.log(data.activities);
        let activity = data.activities.slice(-1)[0];
        if (
          (activity.text === "未找到答案") |
          (activity.text === "No QnAMaker answers found.")
        ) {
          if (!retry) {
            console.log("try again");
            setRetry(true);
            return;
          }
        }
        if (tone) {
          aoaiEnrichment(activity.text, tone, apiEndpoint, apiKey)
            .then((res) => {
              activity.text = res.choices[0].text;
              activity.addOpenAI = true;
              setConversations([...conversations, activity]);
              setIsLoading(false);
            })
            .catch((error) => {
              handleLimitReached(error);
            });
        } else {
          setConversations([...conversations, activity]);
          setIsLoading(false);
        }
      });
    }
  }, [requestID]);

  useEffect(() => {
    const autoSubmit = async () => {
      if (import.meta.env.VITE_AOAI_DEV_MODE === 'true') {
        // You can add your logic here to populate apiEndpoint and apiKey from .env
        // For example:
        const endpoint = import.meta.env.VITE_AOAI_ENDPOINT;
        const key = import.meta.env.VITE_AOAI_API_KEY;
        setApiEndpoint(endpoint);
        setApiKey(key);

        // Perform automatic form submission
        await handleSubmit(new Event('submit'));
      }
    };

    autoSubmit();
  }, []);

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        marginTop: "2%",
      }}
    >
      <AuthenticatedTemplate>
        {!submitted && (
          <StyledForm
            // ref={form}
            autoComplete="off"
            onSubmit={handleSubmit}
          >
            <Typography variant="h6" color="black" mb={3}>
              AOAI credential
            </Typography>
            <TextField
              label="API Endpoint"
              onChange={(e) => setApiEndpoint(e.target.value)}
              required
              variant="outlined"
              color="secondary"
              type="text"
              sx={{ mb: 3 }}
              fullWidth
            />
            <TextField
              label="API Key"
              onChange={(e) => setApiKey(e.target.value)}
              required
              variant="outlined"
              color="secondary"
              type="password"
              fullWidth
              sx={{ mb: 3 }}
            />
            <Fab
              variant="extended"
              color="primary"
              sx={{ width: "100%" }}
              type="submit"
            >
              <SendIcon sx={{ mr: 1 }} />
              Send
            </Fab>
          </StyledForm>
        )}
        {submitted && (
          <ChatBox>
            <ControlBar>
              <h3>{mode}</h3>
              {mode == "Azure Cognitive Search" && (
                <FormControl
                  variant="filled"
                  sx={{ width: "13em", color: "white" }}
                >
                  <InputLabel
                    sx={{
                      color: "white !important",
                    }}
                  >
                    AOAI Tone-Enhanced
                  </InputLabel>
                  <Select
                    className={styles.select}
                    inputProps={{
                      classes: {
                        icon: styles.icon,
                        root: styles.root,
                      },
                    }}
                    value={tone}
                    sx={{ color: "white" }}
                    onChange={(event) => {
                      setTone(event.target.value);
                    }}
                  >
                    <MenuItem value={null}>
                      <em>None</em>
                    </MenuItem>
                    <MenuItem value="專家">專家</MenuItem>
                    <MenuItem value="小孩">小孩</MenuItem>
                    <MenuItem value="活潑">活潑</MenuItem>
                    <MenuItem value="工程師">工程師</MenuItem>
                    <MenuItem value="業務">業務</MenuItem>
                  </Select>
                </FormControl>
              )}
              {mode == "AOAI Embeddings" && (
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={enabled}
                      onChange={(e) => {
                        setEnabled(e.target.checked);
                      }}
                      sx={{
                        color: "white",
                      }}
                    />
                  }
                  label="AOAI Enabled"
                />
              )}
            </ControlBar>

            <Stack
              className={styles.scroll}
              direction="column"
              justifyContent="space-between"
              spacing={5}
              sx={{
                background: "white",
                padding: "1.5em",
                borderRadius: "20px",
              }}
            >
              <MsgStack ref={stackRef} direction="column" spacing={2}>
                {!(hasPast && mode == "ChatGPT") && (
                  <Message
                    msg={testMessages[mode]}
                    handleClicked={handleMsgOption}
                  />
                )}
                {conversations.slice(1).map((msg, index) => {
                  return (
                    <Message
                      msg={msg}
                      handleClicked={handleMsgOption}
                      key={index}
                    />
                  );
                })}

                {isStreaming && (
                  <Message
                    msg={{
                      from: { id: "bot" },
                      text: result,
                      isOpenAI: true,
                    }}
                    handleClicked={handleMsgOption}
                    key="streaming"
                  />
                )}
                {isLoading && (
                  <Box
                    sx={{
                      width: "100%",
                      display: "flex",
                      justifyContent: "center",
                    }}
                  >
                    <ReactLoading type="bubbles" color="gray" />
                  </Box>
                )}
                {limitReached && (
                  <Box
                    sx={{
                      width: "100%",
                      display: "flex",
                      justifyContent: "center",
                      marginTop: "3em",
                    }}
                  >
                    <Alert
                      severity="warning"
                      sx={{ borderRadius: "2em", width: "fit-content" }}
                    >
                      Usage Limit Reached, please try again after 1 minute.
                    </Alert>
                  </Box>
                )}
                <br />
              </MsgStack>
              <Box
                sx={{
                  width: "100%",
                  display: "flex",
                }}
              >
                <TextField
                  spellCheck={false}
                  sx={{
                    flexGrow: 1,
                    marginRight: 2,
                  }}
                  value={userQuery}
                  onChange={(event) => setUserQuery(event.target.value)}
                />
                <IconButton variant="contained" onClick={sendQuery}>
                  <SendIcon color="primary" />
                </IconButton>
              </Box>
            </Stack>
          </ChatBox>
        )}
      </AuthenticatedTemplate>
      <UnauthenticatedTemplate>
        <Typography variant="h6">Please sign in to use the chatbot.</Typography>
      </UnauthenticatedTemplate>
    </Box>
  );
};

export default Home;
