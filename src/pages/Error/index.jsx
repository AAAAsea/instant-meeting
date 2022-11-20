import { useRouteError } from "react-router-dom";
import React from 'react'
import './index.css'
import { Button } from "@mui/material";
import { HomeRounded } from "@mui/icons-material";
import { NavLink } from "react-router-dom";
import { useNavigate } from "react-router-dom";

const Error = () => {
  const error = useRouteError();
  const navigate = useNavigate();
  return (
    <div id="error-page">
      <h1>Oops!</h1>
      <p>
        <i>{error.statusText || error.message}</i>
      </p>
      <Button variant="contained" endIcon={<HomeRounded></HomeRounded>} onClick={() => {
        navigate('/')
      }}>
        回到主页
      </Button>
    </div>
  );
}

export default Error
