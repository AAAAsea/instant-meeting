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
import { IconButton, Tooltip, Icon, Avatar, Divider } from "@mui/material";
import {
  LinkOffRounded,
  DeleteRounded,
  MicOff,
  Mic,
} from "@mui/icons-material";
import { InfoOutlined } from "@mui/icons-material";

const RoomDetail = () => {
  const [slideOpen, setSlideOpen] = useState(true);
  const [showMainVideo, setShowMainVideo] = useState(false);
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
    document.title = name;
    setRoom(id);
    return () => {
      window.onbeforeunload = null;
      leaveRoom(room);
    };
  }, []);

  return (
    <div id="room-detail" className="animate__animated animate__fadeIn">
      <Divider sx={{ width: "100%" }} />

      <div className="room-main">
        <div className="room-main-left">
          {/* 主视频窗口 */}
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
                    {user.name === name ? user.name + "（我）" : user.name}
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
            open={slideOpen}
            setOpen={setSlideOpen}
            mainVideoRef={mainVideoRef}
            setShowMainVideo={setShowMainVideo}
          />
        </div>
      </div>
      {/* 下载按钮 */}
      <div
        className="progress animate__animated animate__fadeInLeft"
        style={{ display: downloading ? "flex" : "none" }}
      >
        <h5>正在下载 {currentFile.fileName}</h5>
        <CircularProgressWithLabel value={progress} />
        <Tooltip title="取消下载">
          <IconButton onClick={cancelDownload} color="primary">
            <DeleteRounded />
          </IconButton>
        </Tooltip>
      </div>
      {/* 弹幕 */}
      <Bullet />
    </div>
  );
};

export default RoomDetail;
