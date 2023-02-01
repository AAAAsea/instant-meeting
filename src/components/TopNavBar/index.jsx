import { Settings } from "@mui/icons-material";
import { IconButton } from "@mui/material";
import React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { SettingsDrawer } from "../SettingsDrawer";
import "./index.scss";
import logo from "/video.svg";

const TopNavBar = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  return (
    <div id="top-nav-bar">
      <img
        className="logo"
        src={logo}
        onClick={() => {
          navigate("/");
        }}
      />
      <IconButton className="settings-btn" onClick={() => setOpen(!open)}>
        <Settings />
      </IconButton>
      <SettingsDrawer open={open} setOpen={setOpen} />
    </div>
  );
};

export default TopNavBar;
