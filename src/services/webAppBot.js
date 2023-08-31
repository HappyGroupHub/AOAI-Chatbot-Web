const API_KEY = import.meta.env.VITE_KB_API_KEY;
const header = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${API_KEY}`,
};

// start a conversation with directline api in botframework
export const startConversation = async () => {
  const API_URL =
    "https://directline.botframework.com/v3/directline/conversations";
  let response = await fetch(API_URL, {
    method: "post",
    headers: header,
  });
  if (response.ok) return response.json();
};

export const postUserQuery = async (payload, conversationId) => {
  console.log("POST request initiated for conversationId: ", conversationId);
  const API_URL = `https://directline.botframework.com/v3/directline/conversations/${conversationId}/activities`;
  let response = await fetch(API_URL, {
    method: "post",
    headers: header,
    body: JSON.stringify(payload),
  });
  if (response.ok) return response.json();
  else {
    console.error("POST request failed", response);
    throw new Error("POST request failed");
  }
};

export const getConversation = async (conversationId) => {
  console.log("GET request initiated for conversationId: ", conversationId);
  const API_URL = `https://directline.botframework.com/v3/directline/conversations/${conversationId}/activities`;
  let response = await fetch(API_URL, {
    method: "get",
    headers: header,
  });
  if (response.ok) {
    return response.json();
  } else {
    throw new Error(`getConversation failed: ${response.status}`);
  }
};
