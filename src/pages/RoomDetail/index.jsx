/* eslint-disable react/prop-types */
import React, { useEffect, useRef, useContext, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./index.scss";
import { stringToColor } from "@/utils";
import { SocketContext } from "@/contexts/SocketContext";
import { StyledBadge, CircularProgressWithLabel } from "@/components/MUI";
import Drawer from "@/components/Drawer";
import { Bullet } from "@/components/Bullet";
import BottomNavBar from "@/components/BottomNavBar";
import {
  IconButton,
  Tooltip,
  Icon,
  Avatar,
  Divider,
  Fade,
  Paper,
} from "@mui/material";
import {
  LinkOffRounded,
  DeleteRounded,
  MicOff,
  Mic,
} from "@mui/icons-material";
import { CancelPresentationRounded } from "@mui/icons-material";

const RoomDetail = () => {
  const [slideOpen, setSlideOpen] = useState(true);
  const [showMainVideo, setShowMainVideo] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const mainVideoRef = useRef();

  const {
    users,
    setRoom,
    setRoomCreated,
    me,
    leaveRoom,
    room,
    progress,
    downloading,
    currentFile,
    cancelDownload,
    socketDisconnectCbRef,
    name,
    speed,
    remoteControlling,
    remoteController,
    cancelRemoteControl,
  } = useContext(SocketContext);

  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (name === "") {
      navigate("/room?id=" + id);
      return;
    }
    setRoomCreated(false); // 为了下次再次创建房间
    socketDisconnectCbRef.current = () => {
      navigate("/room?type=join");
    };
    setRoom(id);
    return () => {
      window.onbeforeunload = null;
      leaveRoom(room);
    };
  }, []);

  useEffect(() => {
    document.title = `房间：${room}  昵称：${name}`;
  }, [room]);

  return (
    <div id="room-detail" className="animate__animated animate__fadeIn">
      <Divider sx={{ width: "100%" }} />

      <div className="room-main">
        <div className="room-main-left">
          {/* 主视频窗口 */}
          <Fade in={showMainVideo}>
            <div className="main-video-wrapper">
              <video
                className="main-video"
                playsInline
                muted
                autoPlay
                ref={mainVideoRef}
              />
            </div>
          </Fade>

          {/* 用户头像列表 */}
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
                  <span className="avatar-desc">
                    {user.id === me.current ? user.name + "（我）" : user.name}
                  </span>
                  <Icon
                    color={
                      user.voice &&
                      (user.peerConnected || user.id === me.current)
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
          {/* 底部导航 */}
          <BottomNavBar
            mainVideoRef={mainVideoRef}
            showMainVideo={showMainVideo}
          />
        </div>
        {/* 侧边栏 */}
        <div className="room-main-right">
          <Drawer
            tabValue={tabValue}
            setTabValue={setTabValue}
            open={slideOpen}
            setOpen={setSlideOpen}
            mainVideoRef={mainVideoRef}
            setShowMainVideo={setShowMainVideo}
          />
        </div>
      </div>
      {/* 下载按钮 */}
      <Fade in={downloading}>
        <Paper elevation={2} className="progress">
          <h5>正在下载 {currentFile.fileName}</h5>
          <CircularProgressWithLabel value={progress} />
          <span>{speed}/s</span>
          <Tooltip title="取消下载">
            <IconButton onClick={cancelDownload} color="primary">
              <DeleteRounded />
            </IconButton>
          </Tooltip>
        </Paper>
      </Fade>

      <Fade in={remoteControlling}>
        <Paper elevation={2} className="controller">
          <h5>{remoteController}正在控制您的电脑</h5>
          <Tooltip title="停止对方的远程控制">
            <IconButton onClick={cancelRemoteControl} color="error">
              <CancelPresentationRounded />
            </IconButton>
          </Tooltip>
        </Paper>
      </Fade>
      {/* 弹幕 */}
      <Bullet tabValue={tabValue} slideOpen={slideOpen} />
    </div>
  );
};

export default RoomDetail;
