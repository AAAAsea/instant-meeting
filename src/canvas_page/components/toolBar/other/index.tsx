import React from "react";
import "./index.scss";
import {useContext} from "react";
import {DispatcherContext, PauseContext} from "../../../context";
import {CLEAR_EVENT, REDO_EVENT, UNDO_EVENT} from "../../../util/dispatcher/event";
import { ClearAll } from "@mui/icons-material";
import { Undo } from "@mui/icons-material";
import { Redo } from "@mui/icons-material";
import { Icon } from "@mui/material";
import { Pause } from "@mui/icons-material";
import { PlayArrow } from "@mui/icons-material";
import { Close } from "@mui/icons-material";
import { Save } from "@mui/icons-material";
import useDesktopCapture from "../../../hooks/useDesktopCapture";


const OtherOperator = (props) => {
    const dispatcherContext = useContext(DispatcherContext);
    const {className,setFold} = props;
    const {pause, setPause} = useContext(PauseContext);

    const quitCanvas = ()=>{
      window.electron.ipcRenderer.send("quitCanvas")
    }
    const pauseCanvas = (state)=>{
      setPause(state)
      window.electron.ipcRenderer.send("pauseCanvas", state)
    }

    const clearCanvas = () => {
        dispatcherContext.dispatcher.dispatch(CLEAR_EVENT);
    };
    const undo = () => {
        dispatcherContext.dispatcher.dispatch(UNDO_EVENT);
    };
    const redo = () => {
        dispatcherContext.dispatcher.dispatch(REDO_EVENT);
    };

    const save = () => {
      setFold(true);
      pauseCanvas(true);
      useDesktopCapture();
    }

    return (
        <div className="otherOperator">
            <div className="operator-content">
                <span title="清空画布" className="operator-item">
                    <ClearAll onClick={clearCanvas} />
                </span>
                <span title="后退" className="operator-item">
                    <Undo onClick={undo} />
                </span>
                <span title="前进" className="operator-item">
                    <Redo onClick={redo} />
                </span>
                <span title= {"保存"} onClick={save}>
                  <Icon className="operator-item">
                    <Save />
                  </Icon>
                </span>
                <span title= {pause ? '继续' : '暂停'}>
                  <Icon className="operator-item" onClick={()=>{pauseCanvas(!pause)}}>
                    {
                      !pause 
                      ? <Pause />
                      : <PlayArrow/>
                    }
                  </Icon>
                </span>
                <span title="退出" ><Icon className="operator-item"><Close onClick={quitCanvas}/></Icon></span>
            </div>
            <span className="title">其他</span>
        </div>
    );
};

export default OtherOperator;
