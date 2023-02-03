import { Box, Button, Paper } from "@mui/material";
import React, { useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import "./index.scss";
import Footer from "@/components/Footer";
import {
  VideoCameraFrontRounded,
  PersonRounded,
  GroupRounded,
} from "@mui/icons-material";
import { SocketContext } from "@/contexts/SocketContext";
import { SettingsDrawer } from "../../components/SettingsDrawer";
import TopNavBar from "../../components/TopNavBar";

const Home = () => {
  const navigate = useNavigate();
  const { getPublicRooms, publicRooms } = useContext(SocketContext);

  useEffect(() => {
    getPublicRooms();
    document.title = "Instant Meeting";
  }, []);

  return (
    <Box
      id="home"
      sx={{
        bgcolor: "background.main",
        color: "text.main",
      }}
    >
      <TopNavBar />
      <div className="home-main">
        <div className="h1-container">
          <div className="h1-bg"></div>
          <h1 className="animate__animated animate__zoomIn">Instant Meeting</h1>
        </div>
        <div className="start-btn animate__animated animate__zoomIn">
          <Button
            size="large"
            variant="contained"
            startIcon={<VideoCameraFrontRounded />}
            onClick={() => {
              navigate("/room?type=create");
            }}
            className=""
          >
            Create
          </Button>
          <Button
            size="large"
            color="neutral"
            variant="contained"
            endIcon={<GroupRounded />}
            onClick={() => {
              navigate("/room?type=join");
            }}
            className=""
          >
            Join
          </Button>
        </div>
      </div>
      <div className="public-rooms">
        {publicRooms.map((room, index) => (
          <Paper
            elevation={10}
            className="room-item animate__animated animate__zoomIn"
            key={index}
            onClick={() => {
              navigate("/room?id=" + room.room);
            }}
          >
            <div className="person-count">
              <PersonRounded></PersonRounded>
              {room.membersCount}/{room.roomMaxNum}
            </div>
            <h2 className="room-name">{room.roomName}</h2>
            <p className="room-desc">{room.roomDesc}</p>
            <div className="room-footer">@ {room.name}</div>
          </Paper>
        ))}
      </div>
      <Footer />
    </Box>
  );
};

export default Home;
