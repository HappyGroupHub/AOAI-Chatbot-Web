import { v4 as uuid } from "uuid";

const create_prompt = (message, sys_msg) => {
  prompt = `<|im_start|>system\n${sys_msg}\n<|im_end|>`;
  prompt += `\n<|im_start|>${message["sender"]}\n${message["text"]}\n<|im_end|>`;
  prompt += "\n<|im_start|>assistant\n";
  return prompt;
};

export const chatgptQuery = async (conversations, query) => {
  let tmp =
    conversations.length >= 3
      ? conversations.slice(conversations.length - 3)
      : conversations;
  let messages = [
    {
      role: "system",
      content:
        "你是一個公共衛生專家，請回答這個領域的正確訊息，如果不確定就說'我無法回答'",
    },
    ...tmp,
    { role: "user", content: query },
  ];
  let body = {
    messages: messages,
    temperature: 0.7,
    max_tokens: 800,
    top_p: 0.91,
    stop: "<|im_end|>",
  };

  const response = await fetch(endpoint, {
    method: "post",
    headers: {
      "Content-Type": "application/json",
      "api-key": API_KEY,
    },
    body: JSON.stringify(body),
  });
  if (response.ok) return response.json();
  else {
  }
};

export const aoaiEnrichment = async (ans, tone, url, api_key) => {
  const response = await fetch(
    url + "/openai/deployments/davinci003/completions?api-version=2022-12-01",
    {
      method: "post",
      headers: {
        "Content-Type": "application/json",
        "api-key": api_key,
      },
      body: JSON.stringify({
        prompt: `請用中文以${tone}的口吻改寫這段文字: ${ans}`,
        max_tokens: 800,
      }),
    }
  );
  let res = response.json();
  if (response.ok) return res;
};

export const addToDB = (completion) => {
  completion.id = uuid();
  let url = import.meta.env.VITE_BACKEND_API_URL + "/add";
  let res = fetch(url, {
    method: "post",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(completion),
  });
  return res;
};

export const getConversationFromDB = async (userId) => {
  let url = import.meta.env.VITE_BACKEND_API_URL + "/items/" + userId + "/3";
  let response = await fetch(url, {
    method: "get",
  });
  if (response.ok) return response.json();
  else {
    console.log(response);
    console.log("getConversationFromDB error");
    return [];
  }
};
