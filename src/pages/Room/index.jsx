import React, { useContext, useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Create from "@/components/Create";
import Join from "@/components/Join";
import TopNavBar from "@/components/TopNavBar";
import { SocketContext } from "@/contexts/SocketContext";
import "./index.scss";
import { Box, Tab, Tabs } from "@mui/material";
import { VideoCameraFrontRounded } from "@mui/icons-material";
import { GroupRounded } from "@mui/icons-material";

const Room = () => { 
  const [search, setSearch] = useSearchParams();
  const type = search.get("type");
  const { setUsers, setRoomCreated, setRoomJoinned } = useContext(SocketContext);

  const [value, setValue] = useState(type === "create" ? 0 : 1);
  useEffect(() => {
    setUsers([]);
    setRoomCreated(false);
    setRoomJoinned(false);
  }, []);

  return (
    <div id="room">
      <TopNavBar />
      <Tabs
        className="room-tabs"
        centered
        textColor="inherit"
        value={value}
        onChange={(e, val) => {
          setValue(val);
        }}
      >
        <Tab icon={<VideoCameraFrontRounded />} />
        <Tab icon={<GroupRounded />} />
      </Tabs>
      <Box>{value ? <Join /> : <Create />}</Box>
    </div>
  );
};

export default Room;
