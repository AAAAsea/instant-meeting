import { Settings } from "@mui/icons-material";
import { IconButton } from "@mui/material";
import React from "react";
import { useContext } from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { SettingsContext } from "../../contexts/SettingsContext";
import { SettingsDrawer } from "../SettingsDrawer";
import "./index.scss";
import logo from "/video.svg";

const TopNavBar = () => {
  const navigate = useNavigate();
  const { setDrawerOpen } = useContext(SettingsContext);
  return (
    <div id="top-nav-bar">
      <img
        className="logo"
        src={logo}
        onClick={() => {
          navigate("/");
        }}
      />
      <IconButton className="settings-btn" onClick={() => setDrawerOpen(true)}>
        <Settings />
      </IconButton>
    </div>
  );
};

export default TopNavBar;
