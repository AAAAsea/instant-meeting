import React from "react";
import { useContext } from "react";
import { useRef } from "react";
import { useEffect } from "react";
import { SocketContext } from "./contexts/SocketContext";
import "./App.css";
import { keyMap } from "../utils";
import { Backdrop, Box, CircularProgress } from "@mui/material";

const mouseEventTypes = ["click", "contextmenu", "mousewheel", "mousemove"];
const keyboardEventTypes = ["keydown"];

const App = () => {
  const videoRef = useRef();
  const { stream, peerRef } = useContext(SocketContext);

  useEffect(() => {
    videoRef.current.srcObject = stream;
  }, [stream]);

  useEffect(() => {
    mouseEventTypes.forEach((mouseEvent) => {
      videoRef.current.addEventListener(
        mouseEvent,
        throttle(handleMousEvent, 80)
      );
    });
    keyboardEventTypes.forEach((keyboardEvent) => {
      window.addEventListener(keyboardEvent, handleKeyboardEvent);
    });
  }, []);

  const handleMousEvent = (e) => {
    const data = {
      type: "mouse",
      detail: e.type,
      x: e.offsetX,
      y: e.offsetY,
      width: videoRef.current.getBoundingClientRect().width,
      height: videoRef.current.getBoundingClientRect().height,
    };
    if (e.type === "mousewheel") {
      data.deltaX = e.deltaX;
      data.deltaY = e.deltaY;
    }
    if (peerRef.current._connected) {
      peerRef.current.send(JSON.stringify(data));
    }
  };

  const handleKeyboardEvent = (e) => {
    let key = e.key;
    if (keyMap[e.key]) key = keyMap[key];
    else key = key.toLowerCase();

    const modified = [];
    if (e.altKey) modified.push("alt");
    if (e.shiftKey) modified.push("shift");
    if (e.ctrlKey) modified.push("control");

    const data = {
      type: "keyboard",
      detail: e.type,
      key,
      modified,
    };
    if (peerRef.current._connected) {
      peerRef.current.send(JSON.stringify(data));
    }
  };

  const throttle = (f, t) => {
    let date = new Date();
    return (e) => {
      if (new Date() - date >= t || e.type !== "mousemove") {
        f(e);
        date = new Date();
      }
    };
  };
  return (
    <>
      <video ref={videoRef} id="remote-video" autoPlay />
      <Backdrop
        sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={stream === null}
      >
        <Box
          sx={{
            color: "#fff",
            display: "flex",
            alignItems: "center",
            gap: "5px",
          }}
        >
          <CircularProgress color="primary" />
          连接中
        </Box>
      </Backdrop>
    </>
  );
};

export default App;
