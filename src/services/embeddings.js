import axios from "axios";

export const getEmbeddings = async (url, apiKey, text) => {
  const headers = {
    "Content-Type": "application/json",
    "api-key": apiKey,
  };
  const data = JSON.stringify({
    input: text,
  });

  return axios
    .post(url, data, { headers })
    .then((res) => {
      return res.data;
    })
    .catch((err) => {
      console.log(err);
      return "";
    });
};

export const searchDocs = async (endpoint, apiKey, userQuery) => {
  const body = await getEmbeddings(endpoint, apiKey, userQuery);
  console.log(body);
  let url = import.meta.env.VITE_BACKEND_API_URL + "/search";
  return fetch(url, {
    method: "post",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ data: JSON.stringify(body) }),
  }).then((response) => {
    if (response.ok) return response.json();
  });
};

export const summarizeDocs = async (docs) => {
  let messages = [
    {
      role: "system",
      content: "你是專門代表疾管署發言的問答機器人",
    },
    {
      role: "user",
      content: `
    '''
    
    ${docs.join("")}
    
    '''

    請用專業的口吻來簡化以上文字，且不要用本文開頭
    
    '''`,
    },
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
};
