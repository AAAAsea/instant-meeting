import { Link } from "@mui/material";
import isElectron from "is-electron";
import React from "react";
import "./index.css";
const Footer = () => {
  return (
    <footer>
      Copyright © 2022-2023{" "}
      <Link
        underline="none"
        href="https://asea.fun"
        style={{ fontSize: "20px", fontWeight: "bold" }}
        onClick={(e)=>{
          if(isElectron()){
            e.preventDefault();
            window.electron.ipcRenderer.send('openExternalUrl',"https://asea.fun")
          }
        }}
      >
        Asea
      </Link>
    </footer>
  );
};

export default Footer;
