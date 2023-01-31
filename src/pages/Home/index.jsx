import { Button } from "@mui/material";
import React, { useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import "./index.scss";
import Footer from "@/components/Footer";
import logo from "/video.svg";
import {
  VideoCameraFrontRounded,
  PersonRounded,
  GroupRounded,
} from "@mui/icons-material";
import { SocketContext } from "@/contexts/SocketContext";

const Home = () => {
  const navigate = useNavigate();
  const { getPublicRooms, publicRooms } = useContext(SocketContext);

  useEffect(() => {
    getPublicRooms();
  }, []);

  return (
    <>
      <div id="home">
        <img
          id="logo"
          src={logo}
          onClick={() => {
            navigate("/");
          }}
        />
        <div className="home-main">
          <div className="h1-container">
            <div className="h1-bg"></div>
            <h1 className="animate__animated animate__zoomIn">
              Instant Meeting
            </h1>
          </div>
          <div className="start-btn animate__animated animate__zoomIn">
            <Button
              size="large"
              color="primary"
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
            <div
              className="room-item animate__animated animate__zoomIn"
              key={index}
              onClick={() => {
                navigate("/room?id=" + room.room);
              }}
            >
              <div className="person-count">
                <PersonRounded></PersonRounded>
                {room.membersCount}/5
              </div>
              <h2 className="room-name">{room.roomName}</h2>
              <p className="room-desc">{room.roomDesc}</p>
              <div className="room-footer">@ {room.name}</div>
            </div>
          ))}
        </div>
        <Footer></Footer>
      </div>
    </>
  );
};

export default Home;
