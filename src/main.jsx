import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "animate.css";
import { MessageContextProvider } from "@/contexts/MessageContext";
import { SocketContextProvider } from "@/contexts/SocketContext";
import { SettingsContextProvider } from "@/contexts/SettingsContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  // <React.StrictMode>
  <SettingsContextProvider>
    <MessageContextProvider>
      <SocketContextProvider>
        <App />
      </SocketContextProvider>
    </MessageContextProvider>
  </SettingsContextProvider>
  // </React.StrictMode>
);
