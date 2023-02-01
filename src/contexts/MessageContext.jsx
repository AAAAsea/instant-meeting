import React, { useState } from "react";
import { createContext } from "react";

const MessageContext = createContext();

const MessageContextProvider = ({ children }) => {
  const [messageOpen, setMessageOpen] = useState(false);
  const [messageContent, setMessageContent] = useState(false);
  const [messageType, setMessageType] = useState("success");
  const showMessage = (type, content) => {
    setMessageOpen(true);
    setMessageType(type);
    setMessageContent(content);
  };
  const message = {
    success(content) {
      showMessage("success", content);
    },
    error(content) {
      showMessage("error", content);
    },
    warning(content) {
      showMessage("warning", content);
    },
    info(content) {
      showMessage("info", content);
    },
  };
  return (
    <MessageContext.Provider
      value={{
        messageOpen,
        setMessageOpen,
        messageContent,
        messageType,
        message,
      }}
    >
      {children}
    </MessageContext.Provider>
  );
};

export { MessageContextProvider, MessageContext };
