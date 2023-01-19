import { Alert } from "@mui/material";
import { Snackbar } from "@mui/material";
import React, { ReactDOM } from "react";
import { useContext } from "react";
import { useState } from "react";
import { MessageContext } from "@/contexts/MessageContext";

const Message = () => {
  const { messageOpen, messageContent, setMessageOpen, messageType } =
    useContext(MessageContext);
  const handleClose = () => {
    setMessageOpen(false);
  };
  return (
    <Snackbar
      open={messageOpen}
      anchorOrigin={{
        vertical: "top",
        horizontal: "center",
      }}
      autoHideDuration={2000}
      onClose={handleClose}
    >
      <Alert
        variant="filled"
        onClose={handleClose}
        severity={messageType}
        sx={{ width: "100%" }}
      >
        {messageContent}
      </Alert>
    </Snackbar>
  );
};

export default Message;
