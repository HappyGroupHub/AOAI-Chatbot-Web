import { useState, useEffect, React } from "react";
import { Box } from "@mui/material";

import Home from "./pages/Home";
import "./App.css";
import { MsalProvider } from "@azure/msal-react";
import { NavBar } from "./components/NavBar";
import { ApplicationInsights } from "@microsoft/applicationinsights-web";

const appInsights = new ApplicationInsights({
  config: {
    connectionString:
      "InstrumentationKey=920756ed-0d03-45e1-8e3d-f42ce4f10903;IngestionEndpoint=https://southeastasia-1.in.applicationinsights.azure.com/;LiveEndpoint=https://southeastasia.livediagnostics.monitor.azure.com/",
    // process.env.REACT_APP_APPINSIGHT_INSTRUMENT_KEY
    // Optional fields
    enableAutoRouteTracking: true,
    enableUnhandledPromiseRejectionTracking: true,
    enableRequestTrackingTelemetryModule: true,
    disableFetchTracking: false,
  },
});

appInsights.loadAppInsights();

function App({ msalInstance }) {
  const [mode, setMode] = useState("ChatGPT");

  return (
    <MsalProvider instance={msalInstance}>
      <Box className="App">
        <NavBar mode={mode} setMode={setMode} />
        <Home mode={mode} appInsights={appInsights} />
      </Box>
    </MsalProvider>
  );
}

export default App;
