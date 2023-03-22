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
import { qualities, notify, formatSize } from "../utils";
import isEle from "is-electron";

const SocketContext = createContext();

// const socket = io("http://localhost:5000/");
const socket = io("https://meet.asea.fun/");
const peers = {};

// eslint-disable-next-line react/prop-types
const SocketContextProvider = ({ children }) => {
  const [call, setCall] = useState(null);
  const [callAccepted, setCallAccepted] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  const [name, setName] = useState("");
  const [userVideo, setUserVideo] = useState([]);
  const [myVideo, setMyVideo] = useState(null);
  const [room, setRoom] = useState(""); // make the room controlled cause of the input
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [speakerOpen, setSpeakerOpen] = useState(false); // spaker
  const [videoOpen, setVideoOpen] = useState(false);
  const [videoType, setVideoType] = useState(1); // 1 camera,  0 screen
  const [videoQuality, setVideoQuality] = useState("h"); // h m l
  const [roomCreating, setRoomCreating] = useState(false);
  const [roomJoinning, setRoomJoinning] = useState(false);
  const [roomJoinned, setRoomJoinned] = useState(false);
  const [roomCreated, setRoomCreated] = useState(false);
  const [roomErrorMsg, setRoomErrorMsg] = useState("");
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [publicRooms, setPublicRooms] = useState([]);
  const [isLive, setIsLive] = useState(false);
  const [canScreenShare, setCanScreenShare] = useState(true);
  const [progress, setProgress] = useState(0);
  const [downloading, setDownloading] = useState(false);
  const [currentFile, setCurrentFile] = useState({});
  const [roomPwd, setRoomPwd] = useState("");
  const [roomInfo, setRoomInfo] = useState({
    maxNum: 5,
    isPublic: false,
    isLive: false,
    roomName: "",
    roomDesc: "",
    roomPwd: "",
  });
  const [isElectron] = useState(isEle());
  const [speed, setSpeed] = useState(0);
  const [remoteControlDialog, setRemoteControlDialog] = useState({
    open: false,
    name: "",
    id: "",
  });
  const [remoteControlling, setRemoteControlling] = useState(false);
  const [remoteController, setRemoteController] = useState("");

  const { message } = useContext(MessageContext);

  const me = useRef("");
  const eventBucket = useRef([]); // 收集每个peer的监听事件
  const stream = useRef(null); // useEffect里面只能拿到初始值，故出此下策
  const usersRef = useRef([]); // 同上
  const messagesRef = useRef([]); // 同上
  const roomJoinnedCbRef = useRef(null);
  const roomCreatedCbRef = useRef(null);
  const socketDisconnectCbRef = useRef(null);
  const slideOpenRef = useRef(true);
  const filesRef = useRef([]);
  const downloadingRef = useRef(false);
  const currentFileRef = useRef({
    fileName: "",
    fileSize: 0,
    fileBuffer: [],
    currentSize: 0,
  });
  const remoteControlPeerRef = useRef();

  useEffect(() => {
    socket.on("me", (id) => (me.current = id));

    socket.on("setPublicRooms", (publicRooms) => {
      setPublicRooms([...publicRooms]);
    });

    socket.on("createRoomSuccess", ({ room, id, name, roomInfo }) => {
      setRoom(room);
      setRoomCreating(false);
      setRoomCreated(true);
      setRoomJoinned(true);
      setRoomInfo(roomInfo);
      roomCreatedCbRef.current && roomCreatedCbRef.current(room);
      roomCreatedCbRef.current = null;
      usersRef.current = [{ id, name, peerConnected: true }];
      setUsers(usersRef.current); // 只有我自己
      message.success("创建成功");
    });

    socket.on(
      "joined",
      ({ users, newUser, room, isLive, canScreenShare, roomInfo }) => {
        if (newUser.id === me.current) {
          roomJoinnedCbRef.current && roomJoinnedCbRef.current();
          roomJoinnedCbRef.current = null;
          usersRef.current = [];
        }
        message.info(`${newUser.name}进入了房间`);
        setRoomInfo(roomInfo);
        setRoom(room);
        setIsLive(isLive);
        setCanScreenShare(canScreenShare);
        if (users.length === 1) {
          setRoomJoinning(false);
          setRoomJoinned(true);
          return;
        }
        // 与未连接的用户建立连接
        users.forEach((user) => {
          if (user.id !== socket.id && !peers[user.id]) {
            getPeerConnection(user.id, user.name, newUser.id !== socket.id);
          }
          if (usersRef.current.findIndex((e) => e.id === user.id) < 0) {
            usersRef.current.push(user);
          }
        });
        setUsers([...usersRef.current]);
      }
    );

    // 每次收到peerConn，取出对应的signal事件执行
    socket.on("peerConn", ({ from, signal, type, name }) => {
      // console.log("peerConn");
      if (type === "remoteControl") {
        if (!peers[from]) getPeerConnection(from, name, false, type);
      }
      eventBucket.current[from] && eventBucket.current[from](signal);
    });

    socket.on("setVoice", ({ userId, open }) => {
      const user = usersRef.current.find((user) => user.id === userId);
      if (user) {
        user.voice = open;
        setUsers([...usersRef.current]);
      }
    });

    socket.on("setVideo", ({ userId, open, type }) => {
      const user = usersRef.current.find((user) => user.id === userId);
      if (user) {
        user.video = open;
        setUsers([...usersRef.current]);
      }
      if (!type) {
        setCanScreenShare(!open);
      }
    });

    socket.on("removeUser", ({ userId, name }) => {
      peers[userId] && peers[userId].destroy();
      message.info(`${name}离开了房间`);
      usersRef.current.splice(
        usersRef.current.findIndex((e) => e.id === userId),
        1
      );
      setUsers([...usersRef.current]);
    });

    socket.on("joinError", ({ msg }) => {
      message.error(msg);
      setRoomErrorMsg(msg);
      setRoomJoinning(false);
    });

    socket.on("sendMessage", (data) => {
      messagesRef.current.push(data);
      setMessages([...messagesRef.current]);
      if (
        data.id !== me.current &&
        (document.hidden ||
          !slideOpenRef.current ||
          document.fullscreenElement !== null)
      )
        notify(data.name, data.msg);
    });

    socket.on("downloadFile", ({ fileIndex, userId }) => {
      sendData(filesRef.current[fileIndex], peers[userId]);
    });

    socket.on("updateInfo", ({ roomInfo, id }) => {
      message.success("修改成功");
      if (me.current === id) setName(roomInfo.name);
      const user = usersRef.current.find((e) => e.id === id);
      user && (user.name = roomInfo.name);
      setRoomInfo(roomInfo);
      setUsers([...usersRef.current]);
    });

    socket.on("updateError", ({ msg }) => {
      message.error(msg);
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

    socket.on("requestRemoteControl", ({ id, name }) => {
      if(Boolean(localStorage.getItem("ignoreRemoteControl"))) return; // 忽略远程控制请求
      setRemoteControlDialog({ ...remoteControlDialog, name, id, open: true });
    });

    socket.on("answerRemoteControl", ({ answer, id, name }) => {
      if (answer) {
        const user = usersRef.current.find((user) => user.id === id);
        window.electron.ipcRenderer.send("remoteControlStart", { name, id });
      } else {
        message.warning(`${name}拒绝了你的远程控制请求`);
      }
    });

    return () => {
      peers.forEach((peer) => {
        peer.destroy();
      });
    };
  }, []);

  // WebRTC建立连接
  const getPeerConnection = (userId, userName, isInitiator, type) => {
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

    // console.log(peer);

    peer.on("signal", (signal) => {
      // console.log("signal");
      socket.emit("peerConn", {
        signal,
        to: userId,
        from: me.current,
        name,
        isInitiator,
      });
    });

    peer.on("stream", (stream) => {
      // console.log("stream");
      const user = usersRef.current.find((user) => user.id === userId);
      user.stream = stream;
      setUsers([...usersRef.current]);
    });

    peer.on("connect", () => {
      if (type === "remoteControl") {
        remoteControlPeerRef.current = peer;
        peers[userId] = peer;
        setRemoteController(userName);
        setRemoteControlling(true);
        // console.log("获取屏幕", peer);
        navigator.mediaDevices
          .getUserMedia({
            audio: {
              mandatory: {
                chromeMediaSource: "desktop",
              },
            },
            video: {
              mandatory: {
                chromeMediaSource: "desktop",
              },
            },
          })
          .then((stream) => {
            // console.log(stream);
            peer.addStream(stream);
          })
          .catch((err) => {
            console.log(err);
            message.error("当前设备或浏览器未支持屏幕共享");
          });
      } else {
        if (stream.current) peer.addStream(stream.current);
        // console.log("connected");
        const user = usersRef.current.find((user) => user.id === userId);
        user && (user.peerConnected = true);
        setUsers([...usersRef.current]);
        peers[userId] = peer;
        setRoomJoinning(false);
        setRoomJoinned(true);
      }

      message.success(`与${userName}已连接`);
    });

    peer.on("close", () => {
      const user = usersRef.current.find((user) => user.id === userId);
      user && (user.peerConnected = false);
      delete peers[userId];
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
      if (type === "remoteControl") {
        setRemoteControlling(false);
        message.error(`与${userName}连接失败`);
        return;
      }
    });

    peer.on("error", (err) => {
      if (type === "remoteControl") {
        setRemoteControlling(false);
        message.error(`与${userName}连接失败`);
        return;
      }
      const user = usersRef.current.find((user) => user.id === userId);
      user && (user.peerConnected = false);
      console.log(err);
      setRoomJoinning(false);
      setRoomErrorMsg("音视频连接失败");
      message.error(`与${userName}连接失败`);
    });

    peer.on("data", (data) => {
      if (type === "remoteControl") {
        const str = new TextDecoder("utf-8").decode(data);
        const events = JSON.parse(str);
        // console.log(events);
        window.electron.ipcRenderer.send("robot", events);
        return;
      }
      if (!downloadingRef.current) return;
      if (isElectron) {
        window.electron.ipcRenderer.send("downloading", data);
      } else {
        currentFileRef.current.fileBuffer.push(data);
      }

      currentFileRef.current.currentSize += data.length;
      setProgress(
        Math.round(
          (currentFileRef.current.currentSize /
            currentFileRef.current.fileSize) *
            100
        )
      );
      if (
        currentFileRef.current.currentSize >= currentFileRef.current.fileSize &&
        downloadingRef.current
      ) {
        message.success("下载完毕");
        setProgress(0);
        if (isElectron) {
          window.electron.ipcRenderer.send("downloadOver");
          message.success("下载完毕");
        } else {
          const received = new Blob(currentFileRef.current.fileBuffer);
          const downloadAnchor = document.createElement("a");
          downloadAnchor.href = URL.createObjectURL(received);
          downloadAnchor.download = currentFileRef.current.fileName;
          downloadAnchor.click();
        }

        currentFileRef.current = {
          fileName: "",
          fileSize: 0,
          fileBuffer: [],
          currentSize: 0,
        };
        setDownloading(false);
        downloadingRef.current = false;
        setCurrentFile(currentFileRef.current);
      }
    });

    // 收集signal事件，待socket响应时触发
    eventBucket.current[userId] = (signal) => peer.signal(signal);
  };

  // 初始化音频
  const initMyVoice = (open) => {
    // 关闭麦克风
    if (!open) {
      if (!stream.current) return;
      const oldMicroPhoneTrack = stream.current
        .getAudioTracks()
        .find((track) => track.label !== "System Audio");
      oldMicroPhoneTrack && oldMicroPhoneTrack.stop();
      socket.emit("setVoice", { id: me.current, open, room });
      setVoiceOpen(open);
      return;
    }

    // 打开音频
    const originStream = stream.current;
    const handlePromise = (currentStream) => {
      setVoiceOpen(open);
      socket.emit("setVoice", { id: me.current, open, room });

      if (!stream.current) {
        stream.current = currentStream;
        setMyVideo(currentStream);
      }
      const oldMicroPhoneTrack = stream.current
        .getAudioTracks()
        .find((track) => track.label !== "System Audio");
      const newMicroPhoneTrack = currentStream.getAudioTracks()[0];

      oldMicroPhoneTrack && stream.current.removeTrack(oldMicroPhoneTrack);
      stream.current.addTrack(newMicroPhoneTrack);
      // console.log(stream.current.getTracks())

      // 之前没有stream的话需要通知添加stream，否则更新track
      if (!originStream) {
        setMyVideo(stream.current);
        for (let peer in peers) {
          // console.log(peers[peer])
          peers[peer].addStream(stream.current);
        }
      } else {
        for (let peer in peers) {
          // 之前没有音频轨道的话需要添加，否则替换
          if (oldMicroPhoneTrack) {
            peers[peer].replaceTrack(
              oldMicroPhoneTrack,
              newMicroPhoneTrack,
              myVideo
            );
          } else {
            peers[peer].addTrack(newMicroPhoneTrack, myVideo);
          }
        }
      }
    };
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({
          audio: true,
        })
        .then(handlePromise)
        .catch((err) => {
          console.log(err);
          message.error("当前设备或浏览器不支持话筒");
        });
    } else {
      message.error("当前设备或浏览器不支持话筒");
    }
  };

  // 初始化视频
  const initMyVideo = ({ type, quality = videoQuality, open, sourceId }) => {
    // 关闭视频
    if (!open) {
      setVideoOpen(open);
      if (!stream.current) return;
      const oldVideoTrack = stream.current.getVideoTracks()[0];
      oldVideoTrack && oldVideoTrack.stop();
      // 如果关闭的是屏幕共享，则暂停声音
      if (!type) {
        const oldAudioTrack = stream.current.getAudioTracks()[0];
        oldAudioTrack && oldAudioTrack.stop();
      }
      socket.emit("setVideo", { id: me.current, open, room, type });
      return;
    }

    // 保存之前的stream用于判断之前是否addStream
    const originStream = stream.current;

    const handlePromise = (currentStream) => {
      socket.emit("setVideo", { id: me.current, open, room, type });
      setVideoOpen(open);
      setVideoType(type);

      // 需要监听用户停止屏幕共享的事件
      if (!type) {
        currentStream.getVideoTracks()[0].onended = () => {
          // console.log('ended')
          initMyVideo({ type, open: false });
        };
      }
      if (!stream.current) {
        stream.current = currentStream;
        setMyVideo(currentStream);
      }

      const oldVideoTrack = stream.current.getVideoTracks()[0];
      const newVideoTrack = currentStream.getVideoTracks()[0];
      oldVideoTrack && stream.current.removeTrack(oldVideoTrack);
      stream.current.addTrack(newVideoTrack);

      const newAudioTrack = currentStream.getAudioTracks()[0];
      const oldAudioTrack = stream.current.getAudioTracks()[0];
      if (newAudioTrack && isLive) {
        oldAudioTrack && stream.current.removeTrack(oldAudioTrack);
        stream.current.addTrack(newAudioTrack);
      }

      // 之前没有stream的话需要通知添加stream
      if (!originStream) {
        setMyVideo(stream.current);
        for (let peer in peers) {
          // console.log(peers[peer])
          peers[peer].addStream(stream.current);
        }
      } else {
        for (let peer in peers) {
          // 视频轨道的替换或新增
          if (oldVideoTrack) {
            oldVideoTrack.stop();
            peers[peer].replaceTrack(oldVideoTrack, newVideoTrack, myVideo);
          } else if (newVideoTrack) {
            peers[peer].addTrack(newVideoTrack, myVideo);
          }

          // 视频轨道的替换或新增
          if (oldAudioTrack) {
            oldAudioTrack.stop();
            peers[peer].replaceTrack(oldAudioTrack, newAudioTrack, myVideo);
          } else if (newAudioTrack) {
            peers[peer].addTrack(newAudioTrack, myVideo);
          }
        }
      }
    };
    // camera 1  or screen 0
    if (type) {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices
          .getUserMedia({
            video: qualities[quality],
          })
          .then(handlePromise)
          .catch(() => {
            message.error("调用摄像头权限失败");
          });
      } else {
        message.error("当前设备或浏览器不支持摄像头");
      }
    } else {
      if (navigator.mediaDevices) {
        if (!isElectron && navigator.mediaDevices.getDisplayMedia) {
          navigator.mediaDevices
            .getDisplayMedia({
              video: qualities[quality],
              audio: isLive,
            })
            .then(handlePromise)
            .catch((err) => {
              console.log(err);
              initMyVideo({ type, open: false });
              message.error("调用摄像头权限失败");
            });
        } else if (isElectron) {
          navigator.mediaDevices
            .getUserMedia({
              audio: isLive
                ? {
                    mandatory: {
                      chromeMediaSource: "desktop",
                      chromeMediaSourceId: sourceId,
                    },
                  }
                : false,
              video: {
                mandatory: {
                  chromeMediaSource: "desktop",
                  chromeMediaSourceId: sourceId,
                  ...qualities[quality],
                },
              },
            })
            .then(handlePromise)
            .catch((err) => {
              console.log(err);
              initMyVideo({ type, open: false });
              message.error("调用摄像头权限失败");
            });
        }
      } else {
        message.error("当前设备或浏览器未支持屏幕共享");
      }
    }
  };

  // 创建房间
  const createRoom = (data) => {
    // console.log('createRoom')
    setRoomCreating(true);
    setName(name.trim());
    data.isElectron = isElectron;
    socket.emit("createRoom", data);
  };

  // 加入房间
  const joinRoom = ({ room, roomPwd }) => {
    if (room === "") {
      message.error("请输入房间号");
      return;
    }
    setRoomJoinning(true);
    setName(name.trim());
    socket.emit("joinRoom", { room, name: name.trim(), roomPwd, isElectron });
  };

  // 离开房间
  const leaveRoom = (room) => {
    setName("");
    setRoom("");
    setRoomJoinned(false);
    messagesRef.current = [];
    setMessages([]);
    socket.emit("leaveRoom", { room, name: name.trim() });
  };

  // 获取公共房间
  const getPublicRooms = () => {
    socket.emit("getPublicRooms");
  };

  // 发送消息
  const sendMessage = (msg, type) => {
    const file = msg;
    if (type === "file") {
      filesRef.current.push(file);
      msg = msg.name;
    }
    socket.emit("sendMessage", {
      name,
      msg,
      type,
      room,
      file: {
        fileIndex: filesRef.current.length - 1,
        fileSize: file.size,
        fileName: file.name,
      },
      time: new Date(),
    });
  };

  // 下载文件
  const downloadFile = async ({ file, userId }) => {
    if (users.findIndex((user) => user.id === userId) === -1) {
      message.warning("该用户不在房间，文件不可下载");
      return;
    }
    if (!peers[userId] || !peers[userId]._connected) {
      message.warning("未建立连接，文件暂时不可下载");
      return;
    }
    if (userId === me.current) {
      return;
    }
    if (downloading) {
      message.warning("当前已有下载任务");
      return;
    }
    let speedInterval;
    const start = () => {
      setDownloading(true);
      downloadingRef.current = true;
      // speed
      let lastSize = 0;
      clearInterval(speedInterval);
      speedInterval = setInterval(() => {
        if (!downloadingRef.current) clearInterval(speedInterval);
        setSpeed(formatSize(currentFileRef.current.currentSize - lastSize));
        lastSize = currentFileRef.current.currentSize;
      }, 1000);

      const { fileIndex, fileSize, fileName } = file;
      currentFileRef.current = {
        currentSize: 0,
        fileName,
        fileSize,
        fileBuffer: [],
      };
      setCurrentFile(currentFileRef.current);
      socket.emit("downloadFile", {
        fileIndex,
        userId,
      });
    };
    if (isElectron) {
      window.electron.ipcRenderer
        .invoke("dialog:openDirectory")
        .then((directoryPath) => {
          if (!directoryPath) return;
          window.electron.ipcRenderer.send("downloadStart", {
            fileName: file.fileName,
            directoryPath,
          });
          start();
        });
    } else {
      start();
    }
  };

  // 发送文件数据
  function sendData(file, peer) {
    let start = 0;
    let chunkSize = 64 * 1024; // chrome 最大256KB，但不同浏览器有差，16保险，尽量在16-64之间

    const fileReader = new FileReader();
    const readSlice = () => {
      const end = Math.min(start + chunkSize, file.size);
      const slice = file.slice(start, end);
      fileReader.readAsArrayBuffer(slice);
    };
    let readTimeOut = null;
    const delay = 0.1; // Wait when the dataChannel is full
    fileReader.onload = (e) => {
      if (start >= file.size) {
        return;
      }
      try {
        peer.send(e.target.result);
        start += chunkSize;
        readSlice();
      } catch (e) {
        clearTimeout(readTimeOut);
        readTimeOut = setTimeout(() => {
          try {
            readSlice();
          } catch (e) {
            // console.log('忙碌')
          }
        }, delay * 1000);
      }
    };

    readSlice();
  }

  // 取消下载
  const cancelDownload = () => {
    message.error("下载已取消");
    if (isElectron) {
      window.electron.ipcRenderer.send("downloadCanceled");
    }

    currentFileRef.current = {
      fileName: "",
      fileSize: 0,
      fileBuffer: [],
      currentSize: 0,
    };
    downloadingRef.current = false;
    setDownloading(false);
    // setCurrentFile(currentFileRef.current); // 注释掉防止闪烁
  };

  const modifyInfo = (data) => {
    // console.log(data);
    socket.emit("updateInfo", { ...data, room });
  };

  const requestRemoteControl = ({ id }) => {
    socket.emit("requestRemoteControl", { id, name });
  };

  const answerRemoteControl = ({ id, answer }) => {
    socket.emit("answerRemoteControl", { id, answer, name });
  };

  const cancelRemoteControl = () => {
    remoteControlPeerRef.current.destroy();
    setRemoteControlling(false);
    setRemoteController("");
  };

  return (
    <SocketContext.Provider
      value={{
        me,
        call,
        callAccepted,
        callEnded,
        myVideo,
        setMyVideo,
        name,
        setName,
        initMyVideo,
        createRoom,
        joinRoom,
        peers,
        voiceOpen,
        initMyVoice,
        videoOpen,
        videoType,
        room,
        setRoom,
        roomCreating,
        roomJoinning,
        setRoomJoinning,
        roomCreated,
        roomJoinned,
        setRoomCreated,
        roomErrorMsg,
        users,
        setUsers,
        speakerOpen,
        videoQuality,
        setVideoQuality,
        messages,
        setMessages,
        sendMessage,
        getPublicRooms,
        publicRooms,
        roomJoinnedCbRef,
        roomCreatedCbRef,
        socketDisconnectCbRef,
        setRoomJoinned,
        leaveRoom,
        isLive,
        setIsLive,
        canScreenShare,
        slideOpenRef,
        sendData,
        downloadFile,
        progress,
        downloading,
        currentFile,
        cancelDownload,
        roomPwd,
        setRoomPwd,
        roomInfo,
        isElectron,
        speed,
        modifyInfo,
        remoteControlDialog,
        setRemoteControlDialog,
        requestRemoteControl,
        answerRemoteControl,
        remoteControlling,
        remoteController,
        cancelRemoteControl,
        stream,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export { SocketContextProvider, SocketContext };
