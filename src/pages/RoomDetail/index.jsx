/* eslint-disable react/prop-types */
import React from "react";
import { useEffect } from "react";
import { useRef } from "react";
import { useContext } from "react";
import { SocketContext } from "../../contexts/SocketContext";
import BottomNavBar from "@/components/BottomNavBar";
import "./index.scss";
import { useParams } from "react-router-dom";
import { LoadingButton } from "@mui/lab";
import { Badge, CircularProgress, IconButton, Tooltip } from "@mui/material";
import { ChevronRight } from "@mui/icons-material";
import { useState } from "react";
import { ChevronLeft } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { Avatar } from "@mui/material";
import { stringToColor } from "@/utils";
import { StyledBadge, CircularProgressWithLabel } from "@/components/MUI";
import { Mic } from "@mui/icons-material";
import { MicOff } from "@mui/icons-material";
import { Icon } from "@mui/material";
import { VideocamOffRounded } from "@mui/icons-material";
import { LinkRounded } from "@mui/icons-material";
import { Tabs } from "@mui/material";
import { Tab } from "@mui/material";
import { ChatRounded } from "@mui/icons-material";
import { TextField } from "@mui/material";
import { Button } from "@mui/material";
import { formatDate, formatSize } from "@/utils/tools.js";
import { MessageContext } from "../../contexts/MessageContext";
import { VideocamRounded } from "@mui/icons-material";
import { TransitionGroup } from "react-transition-group";
import { Collapse } from "@mui/material";
import { List } from "@mui/material";
import { ListItem, LinearProgress } from "@mui/material";
import { LinkOffRounded } from "@mui/icons-material";
import { UploadFileRounded } from "@mui/icons-material";
import { SmartDisplayRounded } from "@mui/icons-material";
import { PictureAsPdfRounded } from "@mui/icons-material";
import { TheatersRounded } from "@mui/icons-material";
import { ArticleRounded } from "@mui/icons-material";
import { BackupTableRounded } from "@mui/icons-material";
import { FolderZipRounded } from "@mui/icons-material";
import { AudioFileRounded } from "@mui/icons-material";
import { InsertDriveFile } from "@mui/icons-material";
import { InsertDriveFileRounded } from "@mui/icons-material";
import { InsertPhotoRounded } from "@mui/icons-material";
import { DeleteRounded } from "@mui/icons-material";

const RoomDetail = () => {
  const [slideOpen, setSlideOpen] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [showMainVideo, setShowMainVideo] = useState(false);
  const [msg, setMsg] = useState("");
  const [twinkle, setTwinkle] = useState(false);
  const [unReadMsgCount, setUnReadMsgCount] = useState(-1);
  const [modalOpen, setModalOpen] = useState(false);

  const {
    myVideo,
    users,
    setUsers,
    joinRoom,
    setRoom,
    roomJoinning,
    name,
    setName,
    setRoomCreated,
    me,
    videoOpen,
    roomErrorMsg,
    roomJoinned,
    messages,
    sendMessage,
    setMessages,
    setRoomJoinned,
    leaveRoom,
    room,
    isLive,
    slideOpenRef,
    downloadFile,
    setDownloadingFile,
    progress,
    downloading,
    currentFile,
    cancelDownload,
    socketDisconnectCbRef,
  } = useContext(SocketContext);

  const { id } = useParams();
  const myVideoRef = useRef();
  const userVideoRef = useRef();
  const mainVideoRef = useRef();
  const chatContainerRef = useRef();
  const twinkleTimeOutRef = useRef();

  const navigate = useNavigate();

  const handleChangeTab = (e, value) => {
    setTabValue(value);
    if (value) setUnReadMsgCount(0);
  };

  const handleSendMessage = () => {
    if (msg.trim() === "" || msg.trim().length > 100) {
      return;
    }
    sendMessage(msg.trim());
    setMsg("");
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file.size === 0) {
      message.warning("文件为空");
      return;
    }
    sendMessage(file, "file");
  };

  const handleOpenBtnClick = () => {
    setSlideOpen(true);
    slideOpenRef.current = true;
    setTwinkle(false);
    if (tabValue) setUnReadMsgCount(0);
  };

  const FileIcon = (props) => {
    const fileName = props.fileName.toLowerCase();
    const suffix = fileName.split(".")[fileName.split(".").length - 1];
    let type;
    if (
      ["jpg", "jpeg", "png", "gif", "webp", "tif", "tiff", "bmp"].includes(
        suffix
      )
    ) {
      type = "pic";
    } else if (["mp3", "flac", "ogg", "aac"].includes(suffix)) {
      type = "audio";
    } else if (["mp4", "wav", "avi"].includes(suffix)) {
      type = "video";
    } else if (suffix === "pdf") {
      type = "pdf";
    } else if (suffix === "ppt" || suffix === "pptx") {
      type = "ppt";
    } else if (suffix === "doc" || suffix === "docx") {
      type = "doc";
    } else if (suffix === "xls" || suffix === "xlsx") {
      type = "xls";
    } else if (["zip", "rar", "7z"].includes(suffix)) {
      type = "zip";
    } else {
      type = "other";
    }
    const map = {
      pic: <InsertPhotoRounded></InsertPhotoRounded>,
      audio: <AudioFileRounded></AudioFileRounded>,
      video: <SmartDisplayRounded></SmartDisplayRounded>,
      pdf: <PictureAsPdfRounded></PictureAsPdfRounded>,
      ppt: <TheatersRounded></TheatersRounded>,
      doc: <ArticleRounded></ArticleRounded>,
      xls: <BackupTableRounded></BackupTableRounded>,
      zip: <FolderZipRounded></FolderZipRounded>,
      other: <InsertDriveFileRounded></InsertDriveFileRounded>,
    };

    return map[type];
  };

  const handleClose = () => {
    setModalOpen(false);
  };

  const handleOpen = () => {
    setModalOpen(true);
  };

  useEffect(() => {
    if (name === "") {
      navigate("/room?id=" + id);
      return;
    }
    setRoomCreated(false); // 为了下次再次创建房间
    // window.onbeforeunload = (e) => {
    //   e.preventDefault();
    //   e.returnValue = ("确定离开当前页面吗？");
    // }
    socketDisconnectCbRef.current = () => {
      navigate("/room?type=join");
    };
    document.title = name;
    setRoom(id);
    return () => {
      window.onbeforeunload = null;
      leaveRoom(room);
      setUsers([]);
    };
  }, []);

  useEffect(() => {
    // 自己关闭摄像头
    if (!videoOpen && myVideo === mainVideoRef.current.srcObject) {
      setShowMainVideo(false);
    } else {
      // 当前用户关闭摄像头
      const currentUser = users.find(
        (user) => user.stream === mainVideoRef.current.srcObject
      );
      if (!currentUser || !currentUser.video) {
        setShowMainVideo(false);
      }
    }

    // 更新侧边栏自己摄像头
    if (myVideoRef.current.srcObject !== myVideo)
      myVideoRef.current.srcObject = myVideo;

    // 更新侧边栏其他用户
    userVideoRef.current.childNodes.forEach((e) => {
      const user = users.find((user) => user.id === e.getAttribute("data"));
      const video = e.querySelector("video");
      // console.log(user)
      if (user && video.srcObject !== user.stream) {
        video.srcObject = user.stream;
      }
    });
  }, [myVideo, users, videoOpen]);
  useEffect(() => {
    chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    if (!slideOpen) {
      setTwinkle(true);
      clearTimeout(twinkleTimeOutRef.current);
      twinkleTimeOutRef.current = setTimeout(() => {
        setTwinkle(false);
      }, 5000);
      setUnReadMsgCount(unReadMsgCount + 1);
    } else {
      if (!tabValue) setUnReadMsgCount(unReadMsgCount + 1);
    }
  }, [messages]);

  return (
    <div id="room-detail" className="animate__animated animate__fadeIn">
      {downloading ? (
        <div className="progress animate__animated animate__fadeInLeft">
          <h5>正在下载 {currentFile.fileName}</h5>
          <CircularProgressWithLabel value={progress} />
          <Tooltip title="取消下载">
            <IconButton onClick={cancelDownload} color="primary">
              <DeleteRounded />
            </IconButton>
          </Tooltip>
        </div>
      ) : (
        <></>
      )}
      <div
        style={{
          visibility: showMainVideo ? "visible" : "hidden",
        }}
        className="main-video-wrapper"
      >
        <video
          className="main-video"
          playsInline
          muted
          autoPlay
          ref={mainVideoRef}
        />
      </div>
      <div
        style={{
          visibility: showMainVideo ? "hidden" : "visible",
        }}
        className="avatar-wrapper"
      >
        {users.map((user) => (
          <div
            className="avatar-item animate__animated animate__zoomIn"
            key={user.id}
          >
            <StyledBadge
              overlap="circular"
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              variant="dot"
              color="error"
              invisible={!user.video || !user.peerConnected}
            >
              <Avatar
                className="avatar-main "
                sizes="large"
                sx={{
                  bgcolor: stringToColor(user.name),
                  width: 60,
                  height: 60,
                }}
              >
                {user.name[0]}
              </Avatar>
            </StyledBadge>
            <div className="avatar-footer">
              <span className="avatar-desc">{user.name}</span>
              <Icon
                color={
                  user.voice && (user.peerConnected || user.id === me.current)
                    ? "error"
                    : "primary"
                }
              >
                {user.peerConnected || user.id === me.current ? (
                  user.voice ? (
                    <Mic />
                  ) : (
                    <MicOff />
                  )
                ) : (
                  <LinkOffRounded />
                )}
              </Icon>
            </div>
          </div>
        ))}
      </div>

      <div
        className={twinkle ? "open-slide-btn twinkle" : "open-slide-btn"}
        onClick={handleOpenBtnClick}
      >
        <Badge
          badgeContent={unReadMsgCount}
          color="primary"
          anchorOrigin={{
            vertical: "top",
            horizontal: "left",
          }}
        >
          <ChevronLeft color="primary" />
        </Badge>
      </div>
      {/* 侧边栏 */}
      <div
        style={{ transform: slideOpen ? "translateX(0)" : "translateX(100%)" }}
        className="slide-wrapper"
      >
        <div className="slide-header">
          <IconButton
            onClick={() => {
              setSlideOpen(false);
              slideOpenRef.current = false;
            }}
          >
            <ChevronRight color="primary" />
          </IconButton>
          <Tabs
            textColor="inherit"
            value={tabValue}
            onChange={handleChangeTab}
            aria-label="icon tabs example"
          >
            <Tab icon={<VideocamRounded />} />

            <Tab
              icon={
                <Badge
                  badgeContent={unReadMsgCount}
                  color="primary"
                  anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "left",
                  }}
                >
                  <ChatRounded />
                </Badge>
              }
            />
          </Tabs>
        </div>

        <div
          className="slide-body"
          style={{
            transform: !tabValue ? "translateX(0)" : "translateX(-50%)",
          }}
        >
          <div className="all-video-wrapper">
            <div className="video-wrapper my-video-wrapper">
              <span className="mask">{name}📍</span>
              <Icon
                color="primary"
                className="video-mask"
                style={{ visibility: videoOpen ? "hidden" : "visible" }}
              >
                <VideocamOffRounded />
              </Icon>
              <video
                style={{ visibility: videoOpen ? "visible" : "hidden" }}
                onClick={(e) => {
                  setShowMainVideo(e.target.srcObject !== null);
                  mainVideoRef.current.srcObject = e.target.srcObject;
                }}
                className="video-item"
                playsInline
                autoPlay
                muted
                ref={myVideoRef}
              ></video>
            </div>
            <div className="other-video" ref={userVideoRef}>
              {users
                .filter((user) => user.id !== me.current)
                .map((user) => (
                  <div className="video-wrapper" key={user.id} data={user.id}>
                    <span className="mask">{user.name}</span>
                    <Icon
                      color="primary"
                      className="video-mask"
                      style={{
                        visibility:
                          user.peerConnected && user.video
                            ? "hidden"
                            : "visible",
                      }}
                    >
                      {user.peerConnected ? (
                        <VideocamOffRounded />
                      ) : (
                        <LinkOffRounded />
                      )}
                    </Icon>
                    <video
                      style={{ visibility: user.video ? "visible" : "hidden" }}
                      onClick={(e) => {
                        setShowMainVideo(e.target.srcObject !== null);
                        mainVideoRef.current.srcObject = e.target.srcObject;
                      }}
                      className="video-item"
                      playsInline
                      autoPlay
                    ></video>
                  </div>
                ))}
            </div>
          </div>
          <div className="all-chat-wrapper">
            <ul className="message-wrapper" ref={chatContainerRef}>
              {messages.map((e, index) => (
                <li className="message-item" key={index}>
                  <div
                    className="message-header"
                    style={{
                      color: me.current === e.id ? "#05d77e" : "#6e6ce9",
                    }}
                  >
                    <span>{e.name}</span>
                    <span>{formatDate(e.time, "hh:mm:ss")}</span>
                  </div>
                  {e.type === "file" ? (
                    <div
                      className="message-content file-message"
                      onClick={() => {
                        downloadFile({ file: e.file, userId: e.id });
                      }}
                    >
                      <div className="file-icon">
                        <FileIcon fileName={e.file.fileName} />
                      </div>
                      <div className="file-info">
                        <Tooltip title={e.file.fileName}>
                          <span className="file-name">{e.file.fileName}</span>
                        </Tooltip>
                        <span className="file-size">
                          {formatSize(e.file.fileSize)}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="message-content">{e.msg}</div>
                  )}
                </li>
              ))}
            </ul>
            <div className="input-wrapper">
              <Tooltip title="发送文件" placement="top">
                <IconButton
                  color="primary"
                  aria-label="upload picture"
                  component="label"
                >
                  <input hidden type="file" onChange={handleFileChange} />
                  <UploadFileRounded />
                </IconButton>
              </Tooltip>
              <TextField
                value={msg}
                className="input-text-field"
                id="filled-multiline-static"
                multiline
                rows={5}
                placeholder="按下回车发送..."
                variant="filled"
                color="primary"
                label={msg.trim().length > 100 ? "超出限制" : ""}
                error={msg.trim().length > 100}
                onChange={(e) => setMsg(e.target.value)}
                onKeyUp={(e) => {
                  if (e.code === "Enter") {
                    handleSendMessage();
                  }
                }}
              />
              <Button
                variant="contained"
                className="send-btn"
                size="small"
                onClick={handleSendMessage}
              >
                发送
              </Button>
            </div>
          </div>
        </div>
      </div>
      <List
        className="bullet-chat"
        style={{ opacity: slideOpen && tabValue ? "0" : "1" }}
      >
        <TransitionGroup>
          {messages.map((e, index) => (
            <Collapse key={e.time + index + e.id}>
              <ListItem className="bullet-chat-item">
                <span className="bullet-chat-name">{e.name}</span>:
                {e.type === "file" ? (
                  <span className="bullet-chat-content">【文件】 {e.msg}</span>
                ) : (
                  <span className="bullet-chat-content">{e.msg}</span>
                )}
              </ListItem>
            </Collapse>
          ))}
        </TransitionGroup>
      </List>
      <BottomNavBar
        mainVideoRef={mainVideoRef}
        showMainVideo={showMainVideo}
      ></BottomNavBar>
    </div>
  );
};

export default RoomDetail;
