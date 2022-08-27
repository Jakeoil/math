import { cookie } from "../controls.js";
/**
 * Shape-Mode:
 *   "mosaic"
 *      Mosaic tiles
 *   "quadrille"
 *      Filled outlines like on graph paper
 *   "real"
 *      True five fold real symmetry todo
 */
const MODE_MOSAIC = "mosaic";
const MODE_QUADRILLE = "quadrille";
export const MODE_REAL = "real";
const MODE_LIST = [MODE_MOSAIC, MODE_QUADRILLE, MODE_REAL];

export class ShapeMode {
    constructor(app) {
        this.app = app;
        this.eleMode = document.querySelector("#shape-mode");
        this.reset();
        if (this.eleMode)
            this.eleMode.addEventListener(
                "click",
                this.clickMode.bind(this),
                false
            );
        this.refresh();
    }
    /**
     * Changing the shape mode also changes the globals that penta, star and
     * deca use.
     * Todo: penta star and deca also have some crud, for example drawing the
     * figures.
     */
    refresh() {
        if (this.eleMode) this.eleMode.innerHTML = this.shapeMode;
    }

    reset() {
        this.shapeMode = cookie.getShapeMode(MODE_REAL);
    }
    toString() {
        return JSON.stringify({
            shapeMode: this.shapeMode,
        });
    }
    clickMode() {
        let new_idx =
            (MODE_LIST.indexOf(this.shapeMode) + 1) % MODE_LIST.length;
        this.shapeMode = MODE_LIST[new_idx];
        cookie.setShapeMode(this.shapeMode);
        this.refresh();
        this.app(ShapeMode.name);
    }
}
