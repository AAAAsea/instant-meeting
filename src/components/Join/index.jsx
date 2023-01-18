import { TextField } from "@mui/material";
import { Paper } from "@mui/material";
import { Button } from "@mui/material";
import React from "react";
import { useContext } from "react";
import "./index.css";
import { SocketContext } from "@/contexts/SocketContext";
import { useNavigate } from "react-router-dom";
import { MessageContext } from "../../contexts/MessageContext";
import { GroupRounded } from "@mui/icons-material";
import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useState } from "react";

const Join = () => {
  const [roomPwd, setRoomPwd] = useState("");
  const {
    name,
    setName,
    room,
    setRoom,
    joinRoom,
    roomJoinnedCbRef,
    roomJoinned,
  } = useContext(SocketContext);
  const { message } = useContext(MessageContext);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");

  const handleClick = () => {
    if (room === "") {
      message.warning("请输入房间号");
      return;
    }
    if (!/^\S{1,15}$/.test(name)) {
      message.warning("请输入合法的用户名");
      return;
    }

    joinRoom({ room, roomPwd: roomPwd.trim() });
    roomJoinnedCbRef.current = () => {
      navigate("/room/" + room);
    };
  };

  useEffect(() => {
    document.title = ""; // 需要改变一下才能有反应，不知为啥
    document.title = "加入房间";
    id && setRoom(id);
  }, []);
  return (
    <>
      <Paper className="container">
        <h2 className="animate__animated animate__fadeIn">加入房间</h2>
        <form className="form animate__animated animate__fadeIn">
          <div className="item">
            <TextField
              fullWidth
              label="房间号"
              type="number"
              placeholder="请输入房间号"
              variant="standard"
              autoFocus
              value={room}
              onKeyUp={(e) => {
                if (e.code === "Enter") {
                  handleClick();
                }
              }}
              onChange={(e) => setRoom(e.target.value.trim())}
            ></TextField>
          </div>
          <div className="item">
            <TextField
              fullWidth
              label="姓名"
              variant="standard"
              value={name}
              autoFocus={id !== null}
              placeholder="请输入您的姓名"
              error={name.length > 15}
              helperText={name.length > 15 ? "最多15个字符" : ""}
              onKeyUp={(e) => {
                if (e.code === "Enter") {
                  handleClick();
                }
              }}
              onChange={(e) => setName(e.target.value)}
            ></TextField>
          </div>
          <div className="item">
            <TextField
              fullWidth
              label="密码"
              variant="standard"
              value={roomPwd}
              placeholder="请输入房间密码"
              error={roomPwd.length > 15}
              helperText={"没有密码可以留空"}
              onKeyUp={(e) => {
                if (e.code === "Enter") {
                  handleClick();
                }
              }}
              onChange={(e) => setRoomPwd(e.target.value.trim())}
            ></TextField>
          </div>
          <Button
            fullWidth
            endIcon={<GroupRounded />}
            className="submit-btn"
            variant="contained"
            onClick={handleClick}
          >
            加入
          </Button>
        </form>
      </Paper>
    </>
  );
};

export default Join;
