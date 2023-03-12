import React, { useEffect } from "react";

import "./index.scss";
import {useState} from "react";
import {LineWidthType} from "../../../util/toolType";
import {useContext} from "react";
import {LineWidthContext, PauseContext} from "../../../context";
import thickLine1Svg from '../../../icon/thickline1.svg'
import thickLine2Svg from '../../../icon/thickline2.svg'
import thickLine3Svg from '../../../icon/thickline3.svg'
import thickLine4Svg from '../../../icon/thickline4.svg'
import thicknessSvg from '../../../icon/thickness.svg'
import { Popover } from "@mui/material";


interface ThickSelectorProps {
    className?: string;
}

const thicks = [
    {
        type: LineWidthType.THIN,
        img: thickLine1Svg,
        title: "1px"
    },
    {
        type: LineWidthType.MIDDLE,
        img: thickLine2Svg,
        title: "2px"
    },
    {
        type: LineWidthType.BOLD,
        img: thickLine3Svg,
        title: "3px"
    },
    {
        type: LineWidthType.MAXBOLD,
        img: thickLine4Svg,
        title: "4px"
    }
];

const selectedClass = "selected-item";

const ThickSelector: React.FC<ThickSelectorProps> = (props) => {
    const {className} = props;
    const [open, setOpen] = useState<boolean>(false);
    const [anchorEle, setAnchorEle] = useState<HTMLImageElement>();
    const lineWidthContext = useContext(LineWidthContext);
    const {pause, setPause} = useContext(PauseContext);


    const onOpen: React.MouseEventHandler<HTMLImageElement> = (event) => {
        if(pause) return;
        setAnchorEle(event.currentTarget);
        setOpen(true);
    };

    const onClose = () => {
        setOpen(false);
    };

    return (
        <div className={className ? `thickselector ${className}` : "thickselector"}>
            <img className="thickline" src={thicknessSvg} onClick={onOpen} />
            <Popover
                open={open}
                onClose={onClose}
                anchorEl={anchorEle}
                anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "left",
                }}
            >
                {
                    thicks.map((thick) => (
                        <img
                            className={thick.type === lineWidthContext.type ? `thick-item ${selectedClass}` : "thick-item"}
                            src={thick.img}
                            key={thick.img}
                            title={thick.title}
                            onClick={() => {
                                lineWidthContext.setType(thick.type);
                                setOpen(false);
                            }}
                        />
                    ))
                }
            </Popover>
            <div className="title">粗细</div>
        </div>
    );
};

export default ThickSelector;
