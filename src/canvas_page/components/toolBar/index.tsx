import React, { useContext } from "react";
import "./index.scss";
import ToolPanel from "./tool";
import ShapePanel from "./shape";
import ThickSelector from "./thickSelector";
import ColorPanel from "./colorPanel";
import OtherOperator from "./other";
import Control from "./control";
import { Divider, Fade, Icon } from "@mui/material";
import { Close } from "@mui/icons-material";
import { useEffect } from "react";
import { useRef } from "react";
import { PauseContext } from "../../context";
import { useState } from "react";
import { ArrowDropDown } from "@mui/icons-material";
import { KeyboardArrowDownRounded } from "@mui/icons-material";

const Toolbar = (): JSX.Element => {
  const toolbar = useRef<HTMLElement>();
  const [fold, setFold] = useState(false);
  const timeoutRef = useRef();

  useEffect(()=>{
    toolbar.current.addEventListener('mouseenter', () => {
      window.electron.ipcRenderer.send('mouseenter');
      clearTimeout(timeoutRef.current);
    })
    toolbar.current.addEventListener('mouseleave', () => {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(()=>{setFold(true)}, 2000);
      window.electron.ipcRenderer.send('mouseleave')
    })
  },[])
  return (
      <div className="toolbar" ref={toolbar} style={{top: fold ? '-150px' : 0}}>
          <ToolPanel className="toolbar-item" />
          <Divider className="divider" orientation="vertical" flexItem />
          <ShapePanel className="toolbar-item" />
          <Divider className="divider" orientation="vertical" flexItem />
          <ThickSelector className="toolbar-item" />
          <Divider className="divider" orientation="vertical" flexItem />
          <ColorPanel className="toolbar-item" />
          <Divider className="divider" orientation="vertical" flexItem />
          <OtherOperator />
          <Divider className="divider" orientation="vertical" flexItem />
          <Control setFold={setFold} />
          <Fade in={fold} timeout={500}>
            <div className="toolbar-btn" onClick={()=>{setFold(false)}}>
                <KeyboardArrowDownRounded/>
            </div>
          </Fade>
      </div>
  );
};

export default Toolbar;
