import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { SocketContextProvider } from "./contexts/SocketContext";
import { MessageContextProvider } from "@/contexts/MessageContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  // <React.StrictMode>
  <MessageContextProvider>
    <SocketContextProvider>
      <App />
    </SocketContextProvider>
  </MessageContextProvider>
  // </React.StrictMode>
);
