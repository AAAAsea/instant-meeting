import { Link } from "@mui/material";
import React from "react";
import "./index.css";
const Footer = () => {
  return (
    <footer>
      Copyright © 2022-2023{" "}
      <Link
        href="https://asea.fun"
        style={{ fontSize: "20px", fontWeight: "bold" }}
      >
        Asea
      </Link>
    </footer>
  );
};

export default Footer;
