import React from "react";
import {ToolType} from "../../../util/toolType";
import {ToolTypeContext} from "../../../context";
import "./index.scss";
import { CreateTwoTone } from "@mui/icons-material";
import { FormatColorFillTwoTone } from "@mui/icons-material";
import { ColorizeTwoTone } from "@mui/icons-material";
import eraserIconSvg from '../../../icon/eraser_icon.svg'

const selectedToolClass = "selected-tool";
export interface ToolPanelProps {
    className?: string;
    setFold: (v:boolean)=>{}
}

const ToolPanel: React.FC<ToolPanelProps> = (props) => {
    const {className} = props;
    return (
        <div className={className ? `toolpanel ${className}` : "toolpanel"}>
            <ToolTypeContext.Consumer>
                {
                    ({type, setType}) => (
                        <>
                            <div className="top">
                                <span title="铅笔">
                                    <CreateTwoTone className={type === ToolType.PEN ? `tool-item ${selectedToolClass}` : "tool-item"} onClick={() => {setType(ToolType.PEN)}} />
                                </span>
                                <span title="橡皮擦">
                                    <img src={eraserIconSvg} className={type === ToolType.ERASER ? `tool-item ${selectedToolClass}` : "tool-item"} onClick={() => {setType(ToolType.ERASER)}} />
                                </span>
                                <span title="填充">
                                    <FormatColorFillTwoTone className={type === ToolType.COLOR_FILL ? `tool-item ${selectedToolClass}` : "tool-item"} onClick={() => {setType(ToolType.COLOR_FILL)}} />
                                </span>
                            </div>
                            <div className="down">
                                <span title="颜色选取器">
                                    <ColorizeTwoTone className={type === ToolType.COLOR_EXTRACT ? `tool-item ${selectedToolClass}` : "tool-item"} onClick={() => {setType(ToolType.COLOR_EXTRACT)}} />
                                </span>
                            </div>
                        </>
                    )
                }
            </ToolTypeContext.Consumer>
            <div className="title">工具</div>
        </div>
    );
};

export default ToolPanel;
