import React from "react";
import Toolbar from "./components/toolBar";
import Canvas from "./components/canvas";
import {ToolTypeContext, ShapeTypeContext, ShapeOutlineContext, LineWidthContext, ColorContext, DispatcherContext,PauseContext} from "./context";
import {useState} from "react";
import {ColorType, LineWidthType, ShapeOutlineType, ShapeToolType, ToolType} from "./util/toolType";
import Dispatcher from "./util/dispatcher";
import './App.scss'

function App(): JSX.Element {
    const [toolType, setToolType] = useState<ToolType>(ToolType.PEN);
    const [shapeType, setShapeType] = useState<ShapeToolType>(ShapeToolType.LINE);
    const [shapeOutlineType, setShapeOutlineType] = useState<ShapeOutlineType>(ShapeOutlineType.SOLID);
    const [lineWidthType, setLineWidthType] = useState<LineWidthType>(LineWidthType.THIN);
    const [activeColorType, setActiveColorType] = useState<ColorType>(ColorType.MAIN);
    const [mainColor, setMainColor] = useState<string>("red");
    const [subColor, setSubColor] = useState<string>("white");
    const [eraserColor, setEraserColor] = useState<ColorType>(ColorType.ERASER);
    const [dispatcher] = useState(new Dispatcher());
    const [pause, setPause] = useState(false);

    const setColor = (value: string) => {
        if (activeColorType === ColorType.MAIN) {
            setMainColor(value);
        } else {
            setSubColor(value);
        }
    };

    return (
        <ToolTypeContext.Provider value={{type: toolType, setType: setToolType}}>
            <ShapeTypeContext.Provider value={{type: shapeType, setType: (type: ShapeToolType) => {setToolType(ToolType.SHAPE); setShapeType(type);}}}>
                <ShapeOutlineContext.Provider value={{type: shapeOutlineType, setType: setShapeOutlineType}}>
                    <LineWidthContext.Provider value={{type: lineWidthType, setType: setLineWidthType}}>
                        <DispatcherContext.Provider value={{dispatcher}}>
                            <ColorContext.Provider value={{
                                mainColor,
                                subColor,
                                activeColor: activeColorType,
                                setColor,
                                setActiveColor: setActiveColorType,
                                eraserColor, 
                                setEraserColor: setEraserColor
                            }}>
                              <PauseContext.Provider value={{pause, setPause }}>
                                <Toolbar />
                                <Canvas
                                    toolType={toolType}
                                    shapeType={shapeType}
                                    shapeOutlineType={shapeOutlineType}
                                    mainColor={mainColor}
                                    subColor={subColor}
                                    lineWidthType={lineWidthType}
                                    setColor={setColor}
                                    pause={pause}
                                />
                              </PauseContext.Provider>
                            </ColorContext.Provider>
                        </DispatcherContext.Provider>
                    </LineWidthContext.Provider>
                </ShapeOutlineContext.Provider>
            </ShapeTypeContext.Provider>
        </ToolTypeContext.Provider>
    );
}

export default App;
