import React, {
  createContext,
  useEffect,
  useRef,
  useState,
  useContext,
} from "react";
import { io } from "socket.io-client";
import Peer from "simple-peer";
import { MessageContext } from "@/contexts/MessageContext";
import isEle from "is-electron";

const SocketContext = createContext();

const socket = io("https://meet.asea.fun/");
const peers = {};

// eslint-disable-next-line react/prop-types
const SocketContextProvider = ({ children }) => {
  const { message } = useContext(MessageContext);
  const [stream, setStream] = useState(null);

  const [name, setName] = useState("test");

  const me = useRef("");
  const userRef = useRef({});
  const eventBucket = useRef([]); // 收集每个peer的监听事件
  const peerRef = useRef(null);

  useEffect(() => {
    window.electron.onStartRemote((_event, user) => {
      userRef.current = user;
      document.title = `正在远程控制${user.name}`;
      getPeerConnection(user.id, user.name, true);
    });

    socket.on("me", (id) => {
      me.current = id;
      // console.log(me.current);
    });

    // 每次收到peerConn，取出对应的signal事件执行
    socket.on("peerConn", ({ from, signal }) => {
      eventBucket.current[from] && eventBucket.current[from](signal);
    });

    socket.on("disconnect", () => {
      message.error("已断开连接");
      setRoomErrorMsg("已断开连接");
      setRoomJoinned(false);
      socketDisconnectCbRef.current && socketDisconnectCbRef.current();

      if (downloading) message.error("连接断开，传输中断");
      currentFileRef.current = {
        fileName: "",
        fileSize: 0,
        fileBuffer: [],
        currentSize: 0,
      };
      setDownloading(false);
      downloadingRef.current = false;
      setCurrentFile(currentFileRef.current);
    });

    socket.on("connection", () => {
      message.success("已连接");
    });
  }, []);

  // WebRTC建立连接
  const getPeerConnection = (userId, userName, isInitiator) => {
    const peer = new Peer({
      initiator: isInitiator,
      trickle: false,
      config: {
        iceServers: [
          {
            urls: "turn:asea.fun:3478",
            credential: "password",
            username: "username",
          },
        ],
      },
    });

    peerRef.current = peer;

    peer.on("signal", (signal) => {
      // console.log("signal");
      socket.emit("peerConn", {
        signal,
        to: userId,
        from: me.current,
        name,
        isInitiator,
        type: "remoteControl",
      });
    });

    peer.on("stream", (stream) => {
      // console.log(stream);
      setStream(stream);
    });

    peer.on("data", (e) => {
      // console.log(e);
    });

    peer.on("connect", () => {
      // console.log("connected");

      message.success(`与${userName}已连接`);
    });

    peer.on("close", () => {
      // console.log("close");
      message.error("远程控制已断开");
      window.electron.ipcRenderer.send("remoteControlClosed");
    });

    peer.on("error", (err) => {
      message.error(`与${userName}连接失败`);
      window.electron.ipcRenderer.send("remoteControlClosed");
    });

    // 收集signal事件，待socket响应时触发
    eventBucket.current[userId] = (signal) => peer.signal(signal);
  };

  return (
    <SocketContext.Provider value={{ stream, peerRef }}>
      {children}
    </SocketContext.Provider>
  );
};

export { SocketContextProvider, SocketContext };
