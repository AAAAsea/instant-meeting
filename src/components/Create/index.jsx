import "./index.css";
import React, { useState, useEffect, useContext } from "react";
import { MessageContext } from "@/contexts/MessageContext";
import { SocketContext } from "@/contexts/SocketContext";
import { useNavigate } from "react-router-dom";
import { LoadingButton } from "@mui/lab";
import { VideoCameraFrontRounded } from "@mui/icons-material";
import {
  FormControlLabel,
  Switch,
  Collapse,
  Tooltip,
  TextField,
  Paper,
  Slider,
  Box,
  FormLabel,
} from "@mui/material";

const Create = () => {
  const [isPublic, setIsPublic] = useState(false);
  const [roomPwd, setRoomPwd] = useState("");
  const [roomName, setRoomName] = useState("");
  const [roomDesc, setRoomDesc] = useState("");
  const [roomMaxNum, setRoomMaxNum] = useState(5);
  const { message } = useContext(MessageContext);
  const {
    createRoom,
    name,
    setName,
    roomCreating,
    roomCreatedCbRef,
    isLive,
    setIsLive,
  } = useContext(SocketContext);

  const navigate = useNavigate();

  useEffect(() => {
    document.title = ""; // 需要改变一下才能有反应，不知为啥
    document.title = "创建房间";
  }, []);

  const handleClick = () => {
    // 姓名校验
    if (name.trim() === "") {
      message.error("你是谁？🤔");
      return;
    } else if (name.length > 15) {
      message.error("姓名不规范，亲人两行泪😭");
      return;
    }
    // 房间名、房间描述校验
    if (isPublic) {
      if (!/^\S{1,10}$/.test(roomName)) {
        if (roomName === "") {
          message.error("给你的公共房间起个名字吧😋");
        } else {
          message.error("房间名也太长了吧🥲");
        }
        return;
      }
      if (!/^\S{1,50}$/.test(roomDesc)) {
        if (roomDesc === "") {
          message.error("房间描述有利于其他人了解你的房间👈");
        } else {
          message.error("房间描述不能太长🥲");
        }
        return;
      }
    } else {
      // 密码校验
      if (!/^\w{0,15}$/.test(roomPwd)) {
        if (roomPwd.length > 15) {
          message.error("密码太长啦🥲");
        } else {
          message.error("看看你的密码🥲");
        }
        return;
      }
    }
    // 创建成功后的回调
    roomCreatedCbRef.current = (room) => {
      navigate("/room/" + room);
    };

    createRoom({
      name: name.trim(),
      roomName: roomName.trim(),
      roomPwd: !isPublic ? roomPwd.trim() : "",
      isPublic,
      roomDesc: roomDesc.trim(),
      isLive,
      roomMaxNum,
    });
  };
  // slider
  const marks = [
    {
      value: 2,
      label: "2",
    },
    {
      value: 5,
      label: "5",
    },
    {
      value: 9,
      label: "9",
    },
  ];
  return (
    <>
      <Paper className="container animate__animated " elevation={10}>
        <h2 className="animate__animated animate__fadeIn">创建房间</h2>
        <form className="form animate__animated animate__fadeIn">
          <div className="item animate__animated animate__fadeIn">
            <TextField
              fullWidth
              label="姓名"
              variant="standard"
              value={name}
              placeholder="请输入您的姓名"
              autoFocus
              onKeyUp={(e) => {
                if (e.code === "Enter") {
                  handleClick();
                }
              }}
              error={name.length > 15}
              helperText={name.length > 15 ? "最多15个字符" : ""}
              onChange={(e) => setName(e.target.value)}
            ></TextField>
          </div>
          <Collapse in={!isPublic}>
            <div className="item">
              <TextField
                fullWidth
                label="密码"
                variant="standard"
                value={roomPwd}
                placeholder="请输入房间密码"
                onKeyUp={(e) => {
                  if (e.code === "Enter") {
                    handleClick();
                  }
                }}
                error={roomPwd.length > 15 || !/^\w{0,15}$/.test(roomPwd)}
                helperText={
                  roomPwd.length > 15
                    ? "密码不能超过15个字符"
                    : !/^\w{0,15}$/.test(roomPwd)
                    ? "密码只能包括字母、数字和下划线"
                    : "不需要密码可以留空"
                }
                onChange={(e) => setRoomPwd(e.target.value.trim())}
              ></TextField>
            </div>
          </Collapse>
          <Collapse in={isPublic}>
            <div
              className="item"
              style={{ display: !isPublic ? "none" : "flex" }}
            >
              <TextField
                fullWidth
                label="房间名"
                variant="standard"
                value={roomName}
                placeholder="请输入房间名"
                autoFocus
                onKeyUp={(e) => {
                  if (e.code === "Enter") {
                    handleClick();
                  }
                }}
                error={roomName.length > 10}
                helperText={roomName.length > 10 ? "最多10个字符" : ""}
                onChange={(e) => setRoomName(e.target.value.trim())}
              ></TextField>
            </div>
          </Collapse>
          <Collapse in={isPublic}>
            <div className="item">
              <TextField
                fullWidth
                label="房间描述"
                variant="standard"
                value={roomDesc}
                placeholder="请输入房间描述信息"
                autoFocus
                onKeyUp={(e) => {
                  if (e.code === "Enter") {
                    handleClick();
                  }
                }}
                error={roomDesc.length > 50}
                helperText={roomDesc.length > 50 ? "最多50个字符" : ""}
                onChange={(e) => setRoomDesc(e.target.value.trim())}
              ></TextField>
            </div>
          </Collapse>
          <Box
            sx={{
              textAlign: "left",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <FormLabel sx={{ whiteSpace: "nowrap" }}>人数限制：</FormLabel>
            <Slider
              value={roomMaxNum}
              max={9}
              min={2}
              valueLabelDisplay="auto"
              marks={marks}
              onChange={(e, v) => setRoomMaxNum(v)}
            />
          </Box>
          <div className="item switch-btn">
            <Tooltip
              title="任意用户都可以在首页看到公开的房间并进入"
              placement="top"
            >
              <FormControlLabel
                control={
                  <Switch
                    checked={isPublic}
                    onChange={() => {
                      setIsPublic(!isPublic);
                    }}
                  />
                }
                label="公开"
              />
            </Tooltip>
            <Tooltip
              title="无法开麦，最多只有一人可以分享屏幕（包括声音）"
              placement="top"
            >
              <FormControlLabel
                control={
                  <Switch
                    checked={isLive}
                    onChange={() => {
                      setIsLive(!isLive);
                    }}
                  />
                }
                label="观影"
              />
            </Tooltip>
          </div>

          <LoadingButton
            fullWidth
            endIcon={<VideoCameraFrontRounded />}
            loading={roomCreating}
            loadingIndicator="创建中..."
            className="submit-btn"
            variant="contained"
            onKeyUp={(e) => {
              if (e.code === "Enter") {
                handleClick();
              }
            }}
            onClick={handleClick}
          >
            创建
          </LoadingButton>
        </form>
      </Paper>
    </>
  );
};

export default Create;
