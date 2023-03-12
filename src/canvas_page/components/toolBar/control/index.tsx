import { Close } from "@mui/icons-material";
import { PlayArrow } from "@mui/icons-material";
import { Pause } from "@mui/icons-material";
import { Icon, Tooltip } from "@mui/material";
import React from "react";
import { useContext } from "react";
import { PauseContext } from "../../../context";
import { ToolPanelProps } from "../tool";
import './index.scss'

const selectedToolClass = "selected-tool";
interface ToolPanelProps {
  className?: string;
  setFold: (v:boolean)=>{}
}
const ToolPanel: React.FC<ToolPanelProps> = (props) => {
    const {className,setFold} = props;
    const {pause, setPause} = useContext(PauseContext);

    const quitCanvas = ()=>{
      window.electron.ipcRenderer.send("quitCanvas")
    }
    const pauseCanvas = ()=>{
      setPause(!pause)
      setFold(!pause);
      window.electron.ipcRenderer.send("pauseCanvas", !pause)
    }
    return (
        <div className={className ? `toolpanel ${className}` : "toolpanel"}>
            <span title= {pause ? '继续' : '暂停'}>
              <Icon className="tool-item" onClick={pauseCanvas}>
                {
                  !pause 
                  ? <Pause />
                  : <PlayArrow/>
                }
              </Icon>
            </span>
            <span title="退出" ><Icon className="tool-item"><Close onClick={quitCanvas}/></Icon></span>
            <div className="title">暂停/退出</div>
        </div>
    );
};

export default ToolPanel;
