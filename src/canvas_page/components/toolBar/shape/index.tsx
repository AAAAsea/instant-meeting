import React from "react";
import {useContext} from "react";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import {PauseContext, ShapeOutlineContext, ShapeTypeContext, ToolTypeContext} from "../../../context";
import {ShapeOutlineType, ShapeToolType, ToolType} from "../../../util/toolType";
import "./index.scss";
import shapeLine from '../../../icon/shape_line.svg'
import shapeArrowDown from '../../../icon/shape_arrowdown.svg'
import shapeArrowLeft from '../../../icon/shape_arrowleft.svg'
import shapeArrowRight from '../../../icon/shape_arrowright.svg'
import shapeArrowTop from '../../../icon/shape_arrowtop.svg'
import shapeCircle from '../../../icon/shape_circle.svg'
import shapeFourStar from '../../../icon/shape_fourstar.svg'
import shapeRect from '../../../icon/shape_rect.svg'
import shapeSixAngle from '../../../icon/shape_sixangle.svg'
import shapeTriangle from '../../../icon/shape_triangle.svg'
import shapeShombs from '../../../icon/shape_rhombus.svg'
import shapePentagon from '../../../icon/shape_pentagon.svg'


const selectedShapeClass = "selected-shape";

const shapes = [
    {
        type: ShapeToolType.LINE,
        img: shapeLine,
        title: "直线"
    },
    {
        type: ShapeToolType.RECT,
        img: shapeRect,
        title: "矩形"
    },
    {
        type: ShapeToolType.CIRCLE,
        img: shapeCircle,
        title: "圆（椭圆）"
    },
    {
        type: ShapeToolType.RHOMBUS,
        img: shapeShombs,
        title: "菱形"
    },
    {
        type: ShapeToolType.TRIANGLE,
        img: shapeTriangle,
        title: "三角形"
    },
    {
        type: ShapeToolType.PENTAGON,
        img: shapePentagon,
        title: "五边形"
    },
    {
        type: ShapeToolType.SEXANGLE,
        img: shapeSixAngle,
        title: "六边形"
    },
    {
        type: ShapeToolType.ARROW_TOP,
        img: shapeArrowTop,
        title: "上箭头"
    },
    {
        type: ShapeToolType.ARROW_RIGHT,
        img: shapeArrowRight,
        title: "右箭头"
    },
    {
        type: ShapeToolType.ARROW_DOWN,
        img: shapeArrowDown,
        title: "下箭头"
    },
    {
        type: ShapeToolType.ARROW_LEFT,
        img: shapeArrowLeft,
        title: "左箭头"
    },
    {
        type: ShapeToolType.FOUR_STAR,
        img: shapeFourStar,
        title: "四角星"
    }
];

interface ShapePanelProps {
    className?: string;
}

const ShapePanel: React.FC<ShapePanelProps> = (props) => {
    const {className} = props;
    const toolTypeContex = useContext(ToolTypeContext);
    const shapeOutlineContext = useContext(ShapeOutlineContext);
    const {pause, setPause} = useContext(PauseContext);


    return (
        <div className={className ? `shapepanel ${className}` : "shapepanel"}>
            <div className="shape-container">
                <div className="shape-content">
                    <ShapeTypeContext.Consumer>
                        {
                            ({type, setType}) => shapes.map((shape) => (
                                <img
                                    src={shape.img}
                                    key={shape.img}
                                    title={shape.title}
                                    className={type === shape.type && toolTypeContex.type === ToolType.SHAPE ? `shape-item ${selectedShapeClass}` : "shape-item"}
                                    onClick={() => setType(shape.type)}
                                />
                            ))
                        }
                    </ShapeTypeContext.Consumer>
                </div>
                <div className="shape-style">
                    <FormControl variant="outlined" disabled={toolTypeContex.type === ToolType.SHAPE && !pause ? false : true}>
                        <InputLabel>轮廓</InputLabel>
                        <Select
                            value={shapeOutlineContext.type}
                            onChange={(event) => shapeOutlineContext.setType(event.target.value as ShapeOutlineType)}
                            label="轮廓"
                        >
                            <MenuItem value={ShapeOutlineType.SOLID}>实线</MenuItem>
                            <MenuItem value={ShapeOutlineType.DOTTED}>虚线</MenuItem>
                        </Select>
                    </FormControl>
                </div>
            </div>
            <div className="title">形状</div>
        </div>
    );
};

export default ShapePanel;
