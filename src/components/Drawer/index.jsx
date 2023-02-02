import React from "react";

import {
  Avatar,
  Badge,
  Box,
  Button,
  Chip,
  Divider,
  Fade,
  Icon,
  IconButton,
  Paper,
  Tab,
  Tabs,
  TextField,
  Tooltip,
} from "@mui/material";

import {
  ChevronLeft,
  InsertPhotoRounded,
  AudioFileRounded,
  SmartDisplayRounded,
  PictureAsPdfRounded,
  TheatersRounded,
  ArticleRounded,
  BackupTableRounded,
  FolderZipRounded,
  InsertDriveFileRounded,
  VideocamRounded,
  LinkOffRounded,
  UploadFileRounded,
  VideocamOffRounded,
  ChatRounded,
  ChevronRight,
} from "@mui/icons-material";

/* eslint-disable react/prop-types */
import { useEffect, useRef, useContext, useState } from "react";
import { SocketContext } from "../../contexts/SocketContext";
import { stringToColor, formatDate, formatSize } from "@/utils";
import "./index.scss";

function Drawer(props) {
  const {
    open,
    setOpen,
    mainVideoRef,
    setShowMainVideo,
    tabValue,
    setTabValue,
  } = props;

  const [msg, setMsg] = useState("");
  const [twinkle, setTwinkle] = useState(false);
  const [unReadMsgCount, setUnReadMsgCount] = useState(-1);

  const myVideoRef = useRef();
  const userVideoRef = useRef();
  const chatContainerRef = useRef();
  const twinkleTimeOutRef = useRef();

  const {
    myVideo,
    users,
    name,
    me,
    videoOpen,
    messages,
    sendMessage,
    slideOpenRef,
    downloadFile,
  } = useContext(SocketContext);

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
    setOpen(true);
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
    if (!open) {
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
    <div className="drawer">
      <Fade in={!open}>
        <div
          className={twinkle ? "open-slide-btn twinkle" : "open-slide-btn"}
          onClick={handleOpenBtnClick}
        >
          <Badge
            badgeContent={unReadMsgCount}
            color="primary"
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "left",
            }}
          >
            <IconButton sx={{ bgcolor: "background.light" }}>
              <ChevronLeft color="primary" />
            </IconButton>
          </Badge>
        </div>
      </Fade>
      <div
        style={{ marginRight: open ? 0 : "-200px" }}
        className="slide-wrapper"
      >
        <div className="slide-header">
          <IconButton
            onClick={() => {
              setOpen(false);
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
          <div className="all-video-wrapper .beautify-scroll">
            <Box
              className="video-wrapper my-video-wrapper"
              sx={{ bgcolor: "background.light" }}
            >
              <Chip
                className="mask"
                avatar={
                  <Avatar
                    sx={{
                      bgcolor: stringToColor(name),
                      width: 20,
                      height: 20,
                    }}
                  >
                    {name[0]}
                  </Avatar>
                }
                label={name + "（我）"}
              />
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
                  if (mainVideoRef.current.srcObject !== e.target.srcObject)
                    mainVideoRef.current.srcObject = e.target.srcObject;
                }}
                className="video-item"
                playsInline
                autoPlay
                muted
                ref={myVideoRef}
              ></video>
            </Box>
            <Divider />
            <div className="other-video" ref={userVideoRef}>
              {users
                .filter((user) => user.id !== me.current)
                .map((user) => (
                  <Box
                    className="video-wrapper"
                    key={user.id}
                    data={user.id}
                    sx={{ bgcolor: "background.light" }}
                  >
                    <Chip
                      className="mask"
                      avatar={
                        <Avatar
                          sx={{
                            bgcolor: stringToColor(user.name),
                            width: 20,
                            height: 20,
                          }}
                        >
                          {user.name[0]}
                        </Avatar>
                      }
                      label={user.name}
                    />
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
                  </Box>
                ))}
            </div>
          </div>
          <div className="all-chat-wrapper">
            <Box
              className="message-wrapper"
              ref={chatContainerRef}
              sx={{ bgcolor: "background.light" }}
            >
              {messages.map((e, index) => (
                <div className="message-item" key={index}>
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
                    <Paper
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
                    </Paper>
                  ) : (
                    <div className="message-content">{e.msg}</div>
                  )}
                </div>
              ))}
            </Box>
            <div className="input-wrapper">
              {/* <Divider /> */}
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
              <Divider />
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
    </div>
  );
}

export default Drawer;
