import React from "react";
import "./index.scss";
import {useContext} from "react";
import {DispatcherContext} from "../../../context";
import {CLEAR_EVENT, REDO_EVENT, UNDO_EVENT} from "../../../util/dispatcher/event";
import { ClearAll } from "@mui/icons-material";
import { Undo } from "@mui/icons-material";
import { Redo } from "@mui/icons-material";

const OtherOperator = () => {
    const dispatcherContext = useContext(DispatcherContext);

    const clearCanvas = () => {
        dispatcherContext.dispatcher.dispatch(CLEAR_EVENT);
    };
    const undo = () => {
        dispatcherContext.dispatcher.dispatch(UNDO_EVENT);
    };
    const redo = () => {
        dispatcherContext.dispatcher.dispatch(REDO_EVENT);
    };

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
            </div>
            <span className="title">其他</span>
        </div>
    );
};

export default OtherOperator;
