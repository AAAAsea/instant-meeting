import React from "react";
import { useContext, useMemo, useState, useEffect } from "react";
import "./index.scss";
import CopyToClipboard from "react-copy-to-clipboard";
import { qualities } from "@/utils";
import { SocketContext } from "@/contexts/SocketContext";
import { MessageContext } from "@/contexts/MessageContext";
import { RoomInfoDialog, AlertDialog } from "@/components/MUI";
import {
  Button,
  ButtonGroup,
  DialogActions,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  MenuList,
  Box,
} from "@mui/material";

import {
  HdRounded,
  MicRounded,
  MicOffRounded,
  VideocamRounded,
  VideocamOffRounded,
  ScreenShareRounded,
  StopScreenShareRounded,
  ShareRounded,
  FullscreenRounded,
  Check,
  FullscreenExitRounded,
} from "@mui/icons-material";
import { ExitToAppRounded } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { Settings } from "@mui/icons-material";
import { SettingsContext } from "../../contexts/SettingsContext";

const BottomNavBar = (props) => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const open = Boolean(anchorEl);
  const [alertOpen, setAlertOpen] = useState(false);

  const {
    initMyVideo,
    initMyVoice,
    voiceOpen,
    videoOpen,
    videoType,
    room,
    videoQuality,
    setVideoQuality,
    isLive,
    canScreenShare,
    roomInfo,
  } = useContext(SocketContext);
  const { message } = useContext(MessageContext);
  const { drawerOpen, setDrawerOpen } = useContext(SettingsContext);

  // eslint-disable-next-line react/prop-types
  const { mainVideoRef, showMainVideo } = props;
  const navigate = useNavigate();

  const shareLink = useMemo(
    () =>
      `房间号：${room}\n房间链接：https://meet.asea.fun/room/${room}\n快来加入我的房间吧！`,
    [room]
  );

  // For Menu
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = (quality) => {
    setAnchorEl(null);
    if (/[hmsl]/.test(quality)) {
      setVideoQuality(quality);
      initMyVideo({ type: videoType, quality, open: true });
    }
  };

  const handleAlertClose = () => {
    setAlertOpen(false);
  };
  const handleConfirm = () => {
    navigate(-1);
    handleAlertClose();
  };
  const handleCancel = () => {
    handleAlertClose();
  };
  const share = () => {
    handleModalClose();
    message.success("房间已复制，快去分享吧~");
  };

  const handleFullScreen = (full) => {
    const currentFullScreenElement = document.fullscreenElement;
    if (!currentFullScreenElement) {
      if (showMainVideo) {
        setIsFullScreen(true);
        mainVideoRef.current.requestFullscreen();
      } else {
        message.warning("当前无正在观看的视频");
      }
    } else {
      if (currentFullScreenElement) {
        document.exitFullscreen();
        setIsFullScreen(false);
      }
    }
  };

  const handleModalClose = () => {
    setModalOpen(false);
  };

  const handleModalOpen = () => {
    setModalOpen(true);
  };

  const leaveRoom = () => {
    setAlertOpen(true);
  };

  useEffect(() => {
    window.onresize = () => {
      setIsFullScreen(document.fullscreenElement !== null);
    };
  }, []);

  return (
    <div id="bottom">
      <ButtonGroup
        className="menu-btns animate__animated animate__slideInUp"
        aria-label="outlined primary button group"
      >
        <Tooltip title={voiceOpen ? "麦克风已打开" : "麦克风已关闭"}>
          <IconButton
            style={{ visibility: isLive ? "hidden" : "visible" }}
            color={voiceOpen ? "error" : "primary"}
            onClick={() => {
              initMyVoice(!voiceOpen);
            }}
          >
            {voiceOpen ? <MicRounded /> : <MicOffRounded />}
          </IconButton>
        </Tooltip>

        <Tooltip title={videoOpen && videoType ? "摄像头打开" : "摄像头已关闭"}>
          <IconButton
            color={videoOpen && videoType ? "error" : "primary"}
            onClick={() => {
              initMyVideo({
                type: 1,
                quality: "h",
                open: !videoOpen || !videoType,
              });
            }}
          >
            {videoOpen && videoType ? (
              <VideocamRounded />
            ) : (
              <VideocamOffRounded />
            )}
          </IconButton>
        </Tooltip>
        <Tooltip
          title={videoOpen && !videoType ? "屏幕分享开启" : "屏幕分享已关闭"}
        >
          <IconButton
            color={videoOpen && !videoType ? "error" : "primary"}
            onClick={() => {
              if (!canScreenShare && !videoOpen) {
                message.warning("当前房间类型最多允许一人分享屏幕");
                return;
              }
              initMyVideo({
                type: 0,
                quality: "h",
                open: !videoOpen || videoType,
              });
            }}
          >
            {videoOpen && !videoType ? (
              <ScreenShareRounded />
            ) : (
              <StopScreenShareRounded />
            )}
          </IconButton>
        </Tooltip>
        <Tooltip title={`当前清晰度：${qualities.desc[videoQuality]}`}>
          <IconButton color={"primary"} onClick={handleClick}>
            <HdRounded />
          </IconButton>
        </Tooltip>
        <Tooltip title={isFullScreen ? "取消全屏" : "全屏"}>
          <IconButton
            color="primary"
            onClick={() => {
              handleFullScreen(!isFullScreen);
            }}
          >
            {isFullScreen ? <FullscreenExitRounded /> : <FullscreenRounded />}
          </IconButton>
        </Tooltip>
        <Tooltip title={`分享`}>
          <Box>
            <CopyToClipboard text={shareLink}>
              <IconButton color="primary" onClick={handleModalOpen}>
                <ShareRounded />
              </IconButton>
            </CopyToClipboard>
          </Box>
        </Tooltip>
        <Tooltip title={`离开房间`}>
          <Box>
            <IconButton color="primary" onClick={leaveRoom}>
              <ExitToAppRounded />
            </IconButton>
          </Box>
        </Tooltip>
        <Tooltip title={`设置`}>
          <Box>
            <IconButton
              color="primary"
              onClick={() => {
                setDrawerOpen(true);
              }}
            >
              <Settings />
            </IconButton>
          </Box>
        </Tooltip>
      </ButtonGroup>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          "aria-labelledby": "basic-button",
        }}
      >
        <MenuList dense>
          {Object.entries(qualities.desc).map((e) => (
            <MenuItem
              disabled={!videoOpen}
              onClick={() => {
                handleClose(e[0]);
              }}
              key={e[0]}
            >
              <ListItemIcon
                style={{
                  visibility: e[0] === videoQuality ? "visible" : "hidden",
                }}
              >
                <Check />
              </ListItemIcon>
              <ListItemText>{e[1]}</ListItemText>
            </MenuItem>
          ))}
        </MenuList>
      </Menu>

      <RoomInfoDialog
        handleClose={handleModalClose}
        open={modalOpen}
        title="房间信息"
      >
        <ul className="room-info">
          <li>
            <span>房主：</span>
            <span>{roomInfo?.owner?.name || "无"}</span>
          </li>
          <li>
            <span>房间号：</span>
            <span>{roomInfo.room}</span>
          </li>
          <li>
            <span>房间密码：</span>
            <span>{roomInfo.roomPwd || "无"}</span>
          </li>
          <li>
            <span>房间类型：</span>
            <span>{roomInfo.isLive ? "观影房" : "普通房"}</span>
          </li>
          <li>
            <span>房间名称：</span>
            <span>{roomInfo.roomName || "无"}</span>
          </li>
          <li>
            <span>房间描述：</span>
            <span>{roomInfo.roomDesc || "无"}</span>
          </li>
          <li>
            <span>是否公开：</span>
            <span>{roomInfo.isPublic ? "是" : "否"}</span>
          </li>
        </ul>
        <DialogActions>
          <Button autoFocus variant="contained" onClick={share}>
            分享
          </Button>
        </DialogActions>
      </RoomInfoDialog>

      <AlertDialog
        title="确定离开房间？"
        content="离开房间后，若房间内仍然有人，则房间不会销毁，你依然可以进入。"
        handleConfirm={handleConfirm}
        handleCancel={handleCancel}
        handleAlertClose={handleClose}
        open={alertOpen}
      ></AlertDialog>
    </div>
  );
};

export default BottomNavBar;
