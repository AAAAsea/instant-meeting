import Pen from "./pen";
import {ColorType} from "../toolType";
import Tool, { hexToRgb, Point, updateImageData } from "./tool";

class Eraser extends Pen {
    protected lineWidthBase = 3;
    protected drawColorType = ColorType.ERASER;
    protected operateStart(pos: Point) {
      if (!Tool.ctx) return;
      this.saveImageData = Tool.ctx.getImageData(0, 0, Tool.ctx.canvas.width, Tool.ctx.canvas.height);
      this.mouseDown = true;
      this.previousPos = pos;
    }
    protected operateMove(pos: Point) {
        if (this.mouseDown) {
            Tool.ctx.save();
            Tool.ctx.beginPath();
            Tool.ctx.arc(this.previousPos.x, this.previousPos.y,Tool.lineWidthFactor * this.lineWidthBase,0,Math.PI*2);
            const c = 0.5 * (this.previousPos.x + pos.x);
            const d = 0.5 * (this.previousPos.y + pos.y);
            Tool.ctx.arc(c, d,10,0,Math.PI*2);
            Tool.ctx.arc(pos.x,pos.y,10,0,Math.PI*2);
            Tool.ctx.clip();//剪切
            Tool.ctx.clearRect(0, 0, Tool.ctx.canvas.width, Tool.ctx.canvas.height);
            Tool.ctx.restore();//出栈
            this.previousPos = pos;
        }
    }
    protected operateEnd() {
        if (this.mouseDown) {
            Tool.ctx.closePath();
            this.mouseDown = false;

            let imageData = Tool.ctx.getImageData(0, 0, Tool.ctx.canvas.width, Tool.ctx.canvas.height);
            const colorRgb = hexToRgb(this.drawColorType === ColorType.MAIN ? Tool.mainColor : Tool.subColor);
            if (colorRgb && this.saveImageData) {
                imageData = updateImageData(this.saveImageData, imageData, [colorRgb.r, colorRgb.g, colorRgb.b, colorRgb.a]);

                Tool.ctx.putImageData(imageData, 0, 0);
            }
        }
    }
}

export default Eraser;
