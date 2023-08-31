import React from "react";
import ReactDOM from "react-dom/client";

import App from "./App";
import "./index.css";
import { PublicClientApplication, EventType } from "@azure/msal-browser";

const pca = new PublicClientApplication({
  auth: {
    clientId: import.meta.env.VITE_AAD_APP_ID,
    authority: import.meta.env.VITE_AAD_AUTHORITY,
    redirectUri: import.meta.env.VITE_AAD_REDIRECT_URI,
  },
});

pca.addEventCallback((event) => {
  if (event.eventType === EventType.LOGIN_SUCCESS) {
    console.log("login success");
    pca.setActiveAccount(event.payload.account);
  }
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App msalInstance={pca} />
  </React.StrictMode>
);
