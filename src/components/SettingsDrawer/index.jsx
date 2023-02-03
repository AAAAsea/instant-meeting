import { LightMode } from "@mui/icons-material";
import { DarkModeOutlined } from "@mui/icons-material";
import { SettingsBrightness } from "@mui/icons-material";
import { AccountCircle } from "@mui/icons-material";
import { Close } from "@mui/icons-material";
import {
  Avatar,
  Box,
  Button,
  Collapse,
  Divider,
  Drawer,
  FormControlLabel,
  FormLabel,
  IconButton,
  InputAdornment,
  Slider,
  styled,
  Switch,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from "@mui/material";
import React from "react";
import { useContext } from "react";
import { SettingsContext } from "../../contexts/SettingsContext";
import { SocketContext } from "../../contexts/SocketContext";
import { MessageContext } from "../../contexts/MessageContext";
import { stringToColor } from "@/utils";
import { useState } from "react";
import { LockRounded } from "@mui/icons-material";
import { useMemo } from "react";
import { useEffect } from "react";

export const SettingsDrawer = () => {
  const { theme, setTheme, drawerOpen, setDrawerOpen } =
    useContext(SettingsContext);
  const { name, roomInfo, modifyInfo, me, roomJoinned } =
    useContext(SocketContext);
  const { message } = useContext(MessageContext);

  const [newName, setNewName] = useState(name); // to modify the name
  const [newMaxNum, setNewMaxNum] = useState(roomInfo.roomMaxNum || 5);
  const [newIsPublic, setNewIsPublic] = useState(roomInfo.isPublic);
  const [newIsLive, setNewIsLive] = useState(roomInfo.isLive);
  const [newRoomPwd, setNewRoomPwd] = useState(roomInfo.roomPwd);
  const [newRoomName, setNewRoomName] = useState(roomInfo.roomName);
  const [newRoomDesc, setNewRoomDesc] = useState(roomInfo.roomDesc);

  const isDisabled = useMemo(() => roomInfo?.owner?.id !== me.current);

  useEffect(() => {
    setNewName(name);
  }, [name]);

  useEffect(() => {
    setNewMaxNum(roomInfo.roomMaxNum);
    setNewIsLive(roomInfo.isLive);
    setNewIsPublic(roomInfo.isPublic);
    setNewRoomPwd(roomInfo.roomPwd);
    setNewRoomName(roomInfo.roomName);
    setNewRoomDesc(roomInfo.roomDesc);
  }, [roomInfo]);

  const Heading = styled(Typography)(({ theme }) => ({
    margin: "20px 0 10px",
    color: theme.palette.grey[600],
    fontWeight: 700,
    fontSize: theme.typography.pxToRem(13),
    textTransform: "uppercase",
    letterSpacing: ".08rem",
  }));
  const SubHeading = styled(Typography)(({ theme }) => ({
    margin: "20px 0 20px",
    color: theme.palette.grey[600],
    fontSize: theme.typography.pxToRem(13),
    textTransform: "uppercase",
    letterSpacing: ".08rem",
  }));
  const IconToggleButton = styled(ToggleButton)({
    display: "flex",
    justifyContent: "center",
    width: "100%",
    "& > *": {
      marginRight: "8px",
    },
  });

  const toggleDrawer = (state) => {
    return () => {
      setDrawerOpen(state);
    };
  };
  const handleChangeThemeMode = (e, theme) => {
    if (!theme) return;
    localStorage.setItem("theme", theme);
    setTheme(theme);
  };
  const handleClick = () => {
    // 姓名校验
    if (newName.trim() === "") {
      message.error("你是谁？🤔");
      return;
    } else if (newName.length > 15) {
      message.error("姓名不规范，亲人两行泪😭");
      return;
    }
    // 房间名、房间描述校验
    if (newIsPublic) {
      if (!/^\S{1,10}$/.test(newRoomName)) {
        if (newRoomName === "") {
          message.error("给你的公共房间起个名字吧😋");
        } else {
          message.error("房间名也太长了吧🥲");
        }
        return;
      }
      if (!/^\S{1,50}$/.test(newRoomDesc)) {
        if (newRoomDesc === "") {
          message.error("房间描述有利于其他人了解你的房间👈");
        } else {
          message.error("房间描述不能太长🥲");
        }
        return;
      }
    } else {
      // 密码校验
      if (!/^\w{0,15}$/.test(newRoomPwd)) {
        if (newRoomPwd.length > 15) {
          message.error("密码太长啦🥲");
        } else {
          message.error("看看你的密码🥲");
        }
        return;
      }
    }

    modifyInfo({
      name: newName.trim(),
      isPublic: newIsPublic,
      isLive: newIsLive,
      roomName: newRoomName.trim(),
      roomPwd: !newIsPublic ? newRoomPwd.trim() : "",
      roomMaxNum: newMaxNum,
      roomDesc: newRoomDesc.trim(),
    });
    setDrawerOpen(false);
    setNewName("");
  };

  return (
    <Drawer
      anchor="right"
      onClose={toggleDrawer(false)}
      open={drawerOpen}
      PaperProps={{
        elevation: 10,
        sx: { width: { xs: 310, sm: 360 }, borderRadius: "10px 0px 0px 10px" },
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          p: 2,
        }}
      >
        <Typography variant="body1" fontWeight="500">
          设置
        </Typography>
        <IconButton color="inherit" onClick={toggleDrawer(false)} edge="end">
          <Close color="primary" fontSize="small" />
        </IconButton>
      </Box>
      <Divider />
      <Box sx={{ pl: 2, pr: 2 }}>
        <Heading gutterBottom>主题模式</Heading>
        <ToggleButtonGroup
          exclusive
          value={theme}
          color="primary"
          onChange={handleChangeThemeMode}
          aria-labelledby="settings-mode"
          fullWidth
        >
          <IconToggleButton
            value="light"
            aria-label="日间"
            data-ga-event-category="settings"
            data-ga-event-action="light"
          >
            <LightMode fontSize="small" />
            日间
          </IconToggleButton>
          <IconToggleButton
            value="system"
            aria-label="系统"
            data-ga-event-category="settings"
            data-ga-event-action="system"
          >
            <SettingsBrightness fontSize="small" />
            系统
          </IconToggleButton>
          <IconToggleButton
            value="dark"
            aria-label="夜间"
            data-ga-event-category="settings"
            data-ga-event-action="dark"
          >
            <DarkModeOutlined fontSize="small" />
            夜间
          </IconToggleButton>
        </ToggleButtonGroup>

        <Heading gutterBottom>个人信息</Heading>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Avatar
            sx={{
              bgcolor: name === "" ? "" : stringToColor(name),
              mr: 2,
            }}
          >
            {name[0]}
          </Avatar>

          <TextField
            id="input-with-sx"
            label={name ? "当前昵称：" + name : "未设置昵称"}
            variant="standard"
            fullWidth
            onChange={(e) => {
              setNewName(e.target.value);
            }}
            value={newName}
            error={newName.length > 15}
            helperText={newName.length > 15 ? "最多15个字符" : ""}
            disabled={!roomJoinned}
          />
        </Box>

        <Heading gutterBottom>房间设置{isDisabled ? "（无权限）" : ""}</Heading>
        <Collapse in={!newIsPublic}>
          <div className="item">
            <TextField
              disabled={isDisabled}
              fullWidth
              label="密码"
              // variant="standard"
              value={newRoomPwd}
              placeholder="请输入房间密码"
              onKeyUp={(e) => {
                if (e.code === "Enter") {
                  handleClick();
                }
              }}
              error={newRoomPwd.length > 15 || !/^\w{0,15}$/.test(newRoomPwd)}
              helperText={
                newRoomPwd.length > 15
                  ? "密码不能超过15个字符"
                  : !/^\w{0,15}$/.test(newRoomPwd)
                  ? "密码只能包括字母、数字和下划线"
                  : "不需要密码可以留空"
              }
              onChange={(e) => setNewRoomPwd(e.target.value.trim())}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockRounded />
                  </InputAdornment>
                ),
              }}
            />
          </div>
        </Collapse>
        <Collapse in={newIsPublic}>
          <div
            className="item"
            style={{ display: !newIsPublic ? "none" : "flex" }}
          >
            <TextField
              disabled={isDisabled}
              fullWidth
              label="房间名"
              variant="standard"
              value={newRoomName}
              placeholder="请输入房间名"
              autoFocus
              onKeyUp={(e) => {
                if (e.code === "Enter") {
                  handleClick();
                }
              }}
              error={newRoomName.length > 10}
              helperText={newRoomName.length > 10 ? "最多10个字符" : ""}
              onChange={(e) => setNewRoomName(e.target.value.trim())}
            ></TextField>
          </div>
        </Collapse>
        <Collapse in={newIsPublic}>
          <div className="item">
            <TextField
              disabled={isDisabled}
              fullWidth
              label="房间描述"
              variant="standard"
              value={newRoomDesc}
              placeholder="请输入房间描述信息"
              autoFocus
              onKeyUp={(e) => {
                if (e.code === "Enter") {
                  handleClick();
                }
              }}
              error={newRoomDesc.length > 50}
              helperText={newRoomDesc.length > 50 ? "最多50个字符" : ""}
              onChange={(e) => setNewRoomDesc(e.target.value.trim())}
            ></TextField>
          </div>
        </Collapse>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <SubHeading>公开状态</SubHeading>
          <Tooltip
            title="任意用户都可以在首页看到公开的房间并进入"
            placement="top"
          >
            <FormControlLabel
              control={
                <Switch
                  disabled={isDisabled}
                  checked={newIsPublic}
                  onChange={() => {
                    setNewIsPublic(!newIsPublic);
                  }}
                />
              }
              label="公开"
            />
          </Tooltip>
        </Box>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <SubHeading>房间模式</SubHeading>
          <Tooltip
            title="无法开麦，最多只有一人可以分享屏幕（包括声音）"
            placement="top"
          >
            <FormControlLabel
              control={
                <Switch
                  disabled={isDisabled}
                  checked={newIsLive}
                  onChange={() => {
                    setNewIsLive(!newIsLive);
                  }}
                />
              }
              label="观影"
            />
          </Tooltip>
        </Box>
        <SubHeading>人数限制</SubHeading>
        <Slider
          disabled={isDisabled}
          value={newMaxNum}
          max={9}
          min={2}
          valueLabelDisplay="auto"
          onChange={(e, v) => setNewMaxNum(v)}
          marks
        />
        <Button
          fullWidth
          variant="contained"
          sx={{ mt: 2 }}
          onClick={handleClick}
          disabled={!roomJoinned}
        >
          保存
        </Button>
      </Box>
    </Drawer>
  );
};
