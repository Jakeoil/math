import { norm } from "./point.js";
import { Bounds } from "./bounds.js";
import { penrose } from "./penrose.js";
import { globals } from "./controls.js";

/**
 * There are 5 angles measured in Fifths and their inverses.
 *
 *
 */
class Angle {
    slicee = [0, 1, 2, 3, 4, 0, 1, 2, 3];
    constructor(fifths, isDown) {
        this.fifths = fifths;
        this.down = isDown;
    }
    // The clockwise operation
    get cw() {
        return new Angle(fifths == 5 ? 0 : this.fifths + 1, this.isDown);
    }
    // The counter-clockwise operation
    get ccw() {
        return new Angle(fifths ? 5 : this.fifths - 1, this.isDown);
    }
    // Reverse the direction.
    inv(angle) {
        return new Angle(this.fifths, !this.isDown);
    }
    // Convert to tenths. Vectors (pstd) are stored in tenths
    tenths(angle) {
        return (this.fifths * 2 + (this.isDown ? 5 : 0)) % 10;
    }
}

/***
 * Some iterator thing that does not look useful at this moment
 */
function fList(fifth) {
    return slicee.slice(0, 5);
}

/**
 * Deprecated
 */
function tenths(fifths, isDown) {
    return (fifths * 2 + (isDown ? 5 : 0)) % 10;
}

/***
 * Thanks to:
 * https://css-tricks.com/converting-color-spaces-in-javascript/
 *
 * Converts #rgb and #rrggbb formats
 */
function hexToRGB(h) {
    let r = 0,
        g = 0,
        b = 0;

    // 3 digits
    if (h.length == 4) {
        r = "0x" + h[1] + h[1];
        g = "0x" + h[2] + h[2];
        b = "0x" + h[3] + h[3];

        // 6 digits
    } else if (h.length == 7) {
        r = "0x" + h[1] + h[2];
        g = "0x" + h[3] + h[4];
        b = "0x" + h[5] + h[6];
    }
    //const command = `rgb(${r},${g},${b})`;
    //console.log(`command: ${command}`);

    return [r, g, b];
}

/**
 * Create an rgb command merging the two colors
 *
 * @param {*} start
 * @param {*} end
 * @param {*} frac  Value from 0 to 1
 * @returns ccs command string
 *
 * todo!!! implement opacity. It is a fraction from 0 (transparent) to 1.
 */
function mix(start, end, frac, opacity) {
    if (frac < 0) frac = 0;
    if (frac > 1) frac = 1;
    const rgbStart = hexToRGB(start);
    const rgbEnd = hexToRGB(end);
    const [r, g, b] = rgbStart.map(
        (item, index) => item * (1 - frac) + rgbEnd[index] * frac
    );
    const command = `rgb(${r},${g},${b})`;
    return command;
}

function testMix() {
    mix("#000", "#ff6600", 0);
    mix("#000", "#ff6600", 0.1);
    mix("#000", "#ff6600", 0.25);
    mix("#000", "#ff6600", 0.5);
    mix("#000", "#ff6600", 0.75);
    mix("#000", "#ff6600", 1.0);
}

testMix();
/**
 * This is a wrapper around penroseScreen
 * Just creates the screen with some aliases.
 */
export function iface(g, scale, mode) {
    let screen = new PenroseScreen(g, scale, mode);
    const penta = screen.penta.bind(screen);
    const star = screen.star.bind(screen);
    const deca = screen.deca.bind(screen);
    const grid = screen.grid.bind(screen);
    const pentaRhomb = screen.pentaRhomb.bind(screen);
    const starRhomb = screen.starRhomb.bind(screen);
    const decaRhomb = screen.decaRhomb.bind(screen);
    return { penta, star, deca, grid, pentaRhomb, starRhomb, decaRhomb };
}

/**
 * This routine depends on an initialized shapeColors instance.
 *
 *
 * @param {*} type
 * @returns
 *
 * The initial test was done due to shapeColors missing
 */
function pColor(type) {
    const { shapeColors } = globals;
    if (shapeColors) {
        switch (type) {
            case penrose.Pe5:
                return shapeColors.shapeColors["pe5-color"];
            case penrose.Pe3:
                return shapeColors.shapeColors["pe3-color"];
            case penrose.Pe1:
                return shapeColors.shapeColors["pe1-color"];
            case penrose.St5:
                return shapeColors.shapeColors["star-color"];
            case penrose.St3:
                return shapeColors.shapeColors["boat-color"];
            case penrose.St1:
                return shapeColors.shapeColors["diamond-color"];
        }
        return null;
    } else return type.defaultColor;
}

/**
 * Represents a rendering screen
 *
 * @param {RenderingContext} g - canvas rendering context
 * @param {number} scale - multiplication factor for rendering points.
 * @param (Real|Quadrille|Mosaic|Typographic) - Rendering style of figures.
 *
 * Mosaic may be removed since it is unique to Quadrille
 *
 */
export class PenroseScreen {
    constructor(g, scale, mode) {
        this.g = g;
        this.scale = scale;
        this.mode = mode;
    }

    /**
     * Gets the figure for the type.
     *
     * @param {penrose.type} type
     * @param {Shapes} penta
     * @returns penta|star|boat|diamond Point array
     */
    pShape(type) {
        switch (type) {
            case penrose.Pe5:
            case penrose.Pe3:
            case penrose.Pe1:
                return penrose[this.mode].penta;
            case penrose.St5:
                return penrose[this.mode].star;
            case penrose.St3:
                return penrose[this.mode].boat;
            case penrose.St1:
                return penrose[this.mode].diamond;
        }
        return null;
    }

    /**************************************************************************
     * Recursive routine to draw pentagon type objects.
     * P5, P3 and P1  Up versions shown
     *
     *    p5  === blue === P0
     *
     *     o
     *  o     o
     *   o   o
     *
     *    p3  === yellow === P2
     *
     *     o         o         *         *         o
     *  o     o   *     o   *     o   o     *   o     *
     *   *   *     *   o     o   o     o   o     o   *
     *
     *    p1 === orange === P4
     *
     *     o         *         *         *         *
     *  *     *   *     o   *     *   *     *   o     *
     *   *   *     *   *     *   o     o   *     *   *
     *
     *
     * @param {*} fifths
     * @param {*} type
     *   This object contains the tables necessary for construction.
     * @param {*} isDown
     * @param {*} loc target of the center of the object on the canvas
     * @param {*} exp Recursive expansion. 0 the primitive.
     * @returns
     */
    penta(fifths, type, isDown, loc, exp, isHeads = true) {
        const { overlays } = globals;
        const bounds = new Bounds();

        fifths = norm(fifths);
        if (exp == 0) {
            if (!overlays || overlays.pentaSelected) {
                let shapes = this.pShape(type);
                if (shapes) {
                    bounds.expand(
                        penrose[this.mode].renderShape(
                            pColor(type),
                            loc,
                            shapes[tenths(fifths, isDown)],
                            this.g,
                            this.scale
                        )
                    );
                }
            }

            return bounds; // call figure
        }

        const wheels = penrose[this.mode].wheels;
        const pWheel = wheels.p[exp].w;
        const sWheel = wheels.s[exp].w;

        bounds.expand(
            this.penta(0, penrose.Pe5, !isDown, loc, exp - 1),
            isHeads
        );

        for (let i = 0; i < 5; i++) {
            const shift = norm(fifths + i);
            const angle = tenths(shift, isDown);
            const locPenta = loc.tr(pWheel[angle]);
            const locDiamond = loc.tr(sWheel[tenths(shift, !isDown)]);
            bounds.expand(
                this.penta(
                    norm(shift + type.twist[i]),
                    type.twist[i] == 0 ? penrose.Pe3 : penrose.Pe1,
                    isDown,
                    locPenta,
                    exp - 1,
                    !isHeads
                )
            );

            if (type.diamond.includes(i)) {
                bounds.expand(
                    this.star(
                        shift,
                        penrose.St1,
                        !isDown,
                        locDiamond,
                        exp - 1,
                        isHeads
                    )
                );
                if (overlays && overlays.treeSelected)
                    this.line(loc, locDiamond, "red");
            }
            if (overlays && overlays.treeSelected)
                this.line(loc, locPenta, "black");
        }
        return bounds;
    }

    /*************************************************************************
     * S5, S3 and S1  Up versions shown
     *    s5   star
     *
     *     *
     *  *  .  *
     *   *   *
     *
     *    s3   boat
     *
     *     *         *                             *
     *  *  .  *      .  *      .  *   *  .      *  .
     *                 *     *   *     *   *     *
     *
     *    s5   diamond
     *
     *     *
     *     .         .  *      .         .      *  .
     *                           *     *
     *
     * @param {*} fifths 0 to 5. Angle from direction.
     * @param {*} type  S5 S3 S1
     * @param {*} isDown
     * @param {*} loc
     * @param {*} exp
     * @returns
     */
    star(fifths, type, isDown, loc, exp, isHeads = true) {
        const { overlays } = globals;
        const bounds = new Bounds();

        fifths = norm(fifths);
        if (exp == 0) {
            let shapes = this.pShape(type);
            if (shapes) {
                if (!overlays || overlays.pentaSelected)
                    bounds.expand(
                        penrose[this.mode].renderShape(
                            pColor(type),
                            loc,
                            shapes[tenths(fifths, isDown)],
                            this.g,
                            this.scale
                        )
                    );
            }
            return bounds;
        }

        const wheels = penrose[this.mode].wheels;
        const tWheel = wheels.t[exp].w;
        const sWheel = wheels.s[exp].w;

        bounds.expand(
            this.star(0, penrose.St5, !isDown, loc, exp - 1, isHeads)
        );

        for (let i = 0; i < 5; i++) {
            const shift = norm(fifths + i);
            const angle = tenths(shift, isDown);
            const locPenta = loc.tr(sWheel[angle]);
            const locBoat = loc.tr(tWheel[angle]);

            if (type.color[i] != null) {
                bounds.expand(
                    this.penta(
                        shift,
                        penrose.Pe1,
                        !isDown,
                        locPenta,
                        exp - 1,
                        isHeads
                    )
                );

                bounds.expand(
                    this.star(
                        shift,
                        penrose.St3,
                        isDown,
                        locBoat,
                        exp - 1,
                        isHeads
                    )
                );

                if (overlays && overlays.treeSelected) {
                    this.line(loc, locPenta, "red");
                    this.line(loc, locBoat, "blue");
                }
            }
        }
        return bounds;
    }

    drawPentaPattern() {}

    /**&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&
     * This will revamp and combine penta and pentaRhomb
     * The inputs are streamlined
     *
     */
    pentaNew({ type, angle, isHeads = true, loc, exp, options }) {
        let { overlays } = globals;
        ({ overlays } = options); // some version of apply
        const bounds = new Bounds();

        fifths = norm(fifths);
        if (exp == 0) {
            if (!overlays || overlays.pentaSelected) {
                let shapes = this.pShape(type);
                if (shapes) {
                    bounds.expand(
                        penrose[this.mode].renderShape(
                            pColor(type),
                            loc,
                            shapes[tenths(fifths, isDown)],
                            this.g,
                            this.scale
                        )
                    );
                }
            }

            return bounds; // call figure
        }

        const wheels = penrose[this.mode].wheels;
        const pWheel = wheels.p[exp].w;
        const sWheel = wheels.s[exp].w;

        bounds.expand(
            this.penta(0, penrose.Pe5, !isDown, loc, exp - 1),
            isHeads
        );

        for (let i = 0; i < 5; i++) {
            const shift = norm(fifths + i);
            const angle = tenths(shift, isDown);
            const locPenta = loc.tr(pWheel[angle]);
            const locDiamond = loc.tr(sWheel[tenths(shift, !isDown)]);
            bounds.expand(
                this.penta(
                    norm(shift + type.twist[i]),
                    type.twist[i] == 0 ? penrose.Pe3 : penrose.Pe1,
                    isDown,
                    locPenta,
                    exp - 1,
                    !isHeads
                )
            );

            if (type.diamond.includes(i)) {
                bounds.expand(
                    this.star(
                        shift,
                        penrose.St1,
                        !isDown,
                        locDiamond,
                        exp - 1,
                        isHeads
                    )
                );
                if (overlays && overlays.treeSelected)
                    this.line(loc, locDiamond, "red");
            }
            if (overlays && overlays.treeSelected)
                this.line(loc, locPenta, "black");
        }
        return bounds;
    }

    /**&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&& */
    starNew({ angle, type, loc, exp, isHeads = true, options }) {
        const { overlays } = Object.assign(globals, options);
        const bounds = new Bounds();

        if (exp == 0) {
            let shapes = this.pShape(type);
            if (shapes) {
                if (!overlays || overlays.pentaSelected)
                    bounds.expand(
                        penrose[this.mode].renderShape(
                            pColor(type),
                            loc,
                            shapes[angle.tenths],
                            this.g,
                            this.scale
                        )
                    );
            }
            return bounds;
        }

        const wheels = penrose[this.mode].wheels;
        const tWheel = wheels.t[exp].w;
        const sWheel = wheels.s[exp].w;

        bounds.expand(
            this.star({
                angle: new Angle(0, !angle.isDown),
                type: penrose.St5,
                loc,
                exp: exp - 1,
                isHeads,
            })
        );

        for (shift of shifts(fifths)) {
            const ang = shift.tenths;
            if (type.color[i] != null) {
                bounds.expand(
                    this.pentaNew({
                        fifths: shift.inv,
                        loc: locPenta,
                        exp: exp - 1,
                        isHeads,
                    })
                );
                bounds.expand(thisStarNew({}));
            }
        }
        for (let i = 0; i < 5; i++) {
            const shift = norm(fifths + i);
            const angle = tenths(shift, isDown);
            const locPenta = loc.tr(sWheel[angle]);
            const locBoat = loc.tr(tWheel[angle]);

            if (type.color[i] != null) {
                bounds.expand(
                    this.penta(
                        shift,
                        penrose.Pe1,
                        !isDown,
                        locPenta,
                        exp - 1,
                        isHeads
                    )
                );

                bounds.expand(
                    this.star(
                        shift,
                        penrose.St3,
                        isDown,
                        locBoat,
                        exp - 1,
                        isHeads
                    )
                );

                if (overlays && overlays.treeSelected) {
                    this.line(loc, locPenta, "red");
                    this.line(loc, locBoat, "blue");
                }
            }
        }
        return bounds;
    }

    /**
     * Decagon is a type unto itself.
     *
     * @param {*} fifths
     * @param {*} isDown
     * @param {*} loc
     * @param {*} exp
     * @returns
     *
     * The up version.
     *
     *      + x    x +
     *     x o      o x
     *    *  x  o  x   *
     *     .    +    .
     *       +--*--+
     */

    deca(fifths, isDown, loc, exp, isHeads = true) {
        const { overlays } = globals;
        const bounds = new Bounds();
        if (exp == 0) {
            return bounds;
        }

        const wheels = penrose[this.mode].wheels;

        // Move the center of the decagon to the real center.
        let dUp = wheels.d[exp].up;
        let dDown = wheels.d[exp].down;
        let dOff = isDown ? dUp[fifths] : dDown[fifths];
        let base = loc.tr(dOff);
        let pUp = wheels.p[exp].up;
        let pDown = wheels.p[exp].down;
        let sUp = wheels.s[exp].up;
        let sDown = wheels.s[exp].down;
        let offs; // Work variable

        // The central yellow pentagon
        bounds.expand(
            this.penta(fifths, penrose.Pe3, isDown, base, exp - 1),
            isHeads
        ); //

        // The two diamonds
        offs = isDown ? sDown[norm(1 + fifths)] : sUp[norm(1 + fifths)];
        bounds.expand(
            this.star(
                norm(fifths + 3),
                penrose.St1,
                isDown,
                base.tr(offs),
                exp - 1,
                isHeads
            )
        ); // sd1

        offs = isDown ? sDown[norm(4 + fifths)] : sUp[norm(4 + fifths)];
        bounds.expand(
            this.star(
                norm(fifths + 2),
                penrose.St1,
                isDown,
                base.tr(offs),
                exp - 1,
                isHeads
            )
        ); // sd4

        // The two orange pentagons
        offs = isDown ? pUp[norm(3 + fifths)] : pDown[norm(3 + fifths)];
        bounds.expand(
            this.penta(
                norm(fifths + 2),
                penrose.Pe1,
                !isDown,
                base.tr(offs),
                exp - 1,
                !isHeads
            )
        );

        offs = isDown ? pUp[norm(2 + fifths)] : pDown[norm(2 + fifths)];
        bounds.expand(
            this.penta(
                norm(fifths + 3),
                penrose.Pe1,
                !isDown,
                base.tr(offs),
                exp - 1,
                !isHeads
            )
        );

        // And the boat
        offs = isDown
            ? pUp[norm(2 + fifths)].tr(sUp[norm(3 + fifths)])
            : pDown[norm(2 + fifths)].tr(sDown[norm(3 + fifths)]);
        bounds.expand(
            this.star(
                fifths + 0,
                penrose.St3,
                !isDown,
                base.tr(offs),
                exp - 1,
                !isHeads
            )
        );
        return bounds;
    }
    grid(offset, size) {
        this.g.strokeStyle = penrose.OUTLINE;
        for (let y = -size; y < size; y++) {
            for (let x = -size; x < size; x++) {
                this.g.strokeRect(
                    offset.x * this.scale + x * this.scale,
                    offset.y * this.scale + y * this.scale,
                    this.scale,
                    this.scale
                );
            }
        }
        //
        this.g.strokeStyle = "#FF0000";
        this.g.beginPath();
        this.g.moveTo(offset.x * this.scale, (offset.y - size) * this.scale);
        this.g.lineTo(offset.x * this.scale, (offset.y + size) * this.scale);
        this.g.stroke();

        this.g.beginPath();
        this.g.moveTo((offset.x - size) * this.scale, offset.y * this.scale);
        this.g.lineTo((offset.x + size) * this.scale, offset.y * this.scale);
        this.g.stroke();
    }

    line(loc, end, strokeStyle) {
        const currentWidth = this.g.lineWidth;
        const currentStrokeStyle = this.g.strokeStyle;
        this.g.strokeStyle = strokeStyle ? strokeStyle : "black";
        this.g.lineWidth = 1;
        this.g.beginPath();
        this.g.moveTo(loc.x * this.scale, loc.y * this.scale);
        this.g.lineTo(end.x * this.scale, end.y * this.scale);
        this.g.stroke();

        this.g.lineWidth = currentWidth;
        this.g.strokeStyle = currentStrokeStyle;
    }

    getGradient(fill, offset, shape, isHeads) {
        const point0 = shape[0].tr(offset).mult(this.scale);
        const point1 = shape[2].tr(offset).mult(this.scale);
        const canvasGradient = this.g.createLinearGradient(
            point0.x,
            point0.y,
            point1.x,
            point1.y
        );
        if (isHeads) {
            canvasGradient.addColorStop(0, "#fff");
            canvasGradient.addColorStop(2 / 3, fill);
            // color stop 1 has to be 1/3 of the way to "#000"
            const endColor = mix(fill, "#000", 1 / 3);
            canvasGradient.addColorStop(1, endColor);
        } else {
            canvasGradient.addColorStop(0, "#000");
            canvasGradient.addColorStop(2 / 3, fill);
            const endColor = mix(fill, "#fff", 1 / 3);
            canvasGradient.addColorStop(1, endColor);
        }
        return canvasGradient;
    }

    rhombus(fill, offset, shape, strokeStyle, isHeads) {
        const { rhombStyle } = globals;
        let currentStrokeStyle = this.g.strokeStyle;
        let currentLineWidth = this.g.lineWidth;
        let currentfillStyle = this.g.fillStyle;

        let gradient = rhombStyle.fill == rhombStyle.GRADIENT;
        let start = true;
        const bounds = new Bounds();
        this.g.strokeStyle = strokeStyle ? strokeStyle : "black";
        if (gradient) {
            this.g.fillStyle = this.getGradient(fill, offset, shape, isHeads);
        } else {
            this.g.fillStyle = fill;
        }
        this.g.lineWidth = this.scale < 5 ? 1 : 2;
        for (const point of shape) {
            if (start) {
                this.g.beginPath();
                this.g.moveTo(
                    (point.x + offset.x) * this.scale,
                    (point.y + offset.y) * this.scale
                );
                start = false;
            } else {
                this.g.lineTo(
                    (point.x + offset.x) * this.scale,
                    (point.y + offset.y) * this.scale
                );
            }

            bounds.addPoint(offset, point);
        }

        this.g.closePath();
        if (rhombStyle.fill != rhombStyle.NONE) {
            this.g.fill();
        }
        if (rhombStyle.stroke != rhombStyle.NONE) {
            this.g.stroke();
        }

        this.g.strokeStyle = currentStrokeStyle;
        this.g.lineWidth = currentLineWidth;
        this.g.fillStyle = currentfillStyle;

        return bounds;
    }
    rhombusOld(fill, offset, shape, strokeStyle) {
        let currentStrokeStyle = this.g.strokeStyle;
        let currentLineWidth = this.g.lineWidth;
        let start = true;
        const bounds = new Bounds();
        //this.g.strokeStyle = strokeStyle ? strokeStyle : "black";
        this.g.fillStyle = fill;
        this.g.lineWidth = this.scale < 5 ? 1 : 2;
        for (const point of shape) {
            if (start) {
                this.g.beginPath();
                this.g.moveTo(
                    (point.x + offset.x) * this.scale,
                    (point.y + offset.y) * this.scale
                );
                start = false;
            } else {
                this.g.lineTo(
                    (point.x + offset.x) * this.scale,
                    (point.y + offset.y) * this.scale
                );
            }

            bounds.addPoint(offset, point);
        }

        this.g.closePath();
        if (fill) {
            this.g.fill();
        }
        if (strokeStyle) {
            this.g.stroke();
        }

        this.g.strokeStyle = currentStrokeStyle;
        this.g.lineWidth = currentLineWidth;
        return bounds;
    }

    /**
     * The color of the rhomb is based on the type.
     * The string will be seached for the # character. Everything before
     * # is a modifier.
     *
     */
    drawRhombusPattern(fifths, type, isDown, loc, exp, isHeads) {
        const bounds = new Bounds();
        let gradient = true;
        const thins = penrose[this.mode].thinRhomb[exp];
        const thicks = penrose[this.mode].thickRhomb[exp];
        const fill = pColor(type);
        const outline = null;
        for (let i = 0; i < 5; i++) {
            const shift = norm(fifths + i);
            switch (type) {
                case penrose.Pe5:
                    const thick5 = thicks[tenths(shift, isDown)];
                    bounds.expand(
                        this.rhombus(fill, loc, thick5, outline, isHeads)
                    );
                    break;
                case penrose.Pe3:
                    switch (i) {
                        case 0:
                            const thin3 = thins[tenths(shift, isDown)];
                            bounds.expand(
                                this.rhombus(fill, loc, thin3, outline, isHeads)
                            );
                        // no break here
                        case 1:
                        case 4:
                            const thick3 = thicks[tenths(shift, isDown)];
                            bounds.expand(
                                this.rhombus(
                                    fill,
                                    loc,
                                    thick3,
                                    outline,
                                    isHeads
                                )
                            );
                            break;
                        default:
                            break;
                    }
                    break;
                case penrose.Pe1:
                    switch (i) {
                        case 0:
                            const shape2 = thicks[tenths(shift, isDown)];
                            bounds.expand(
                                this.rhombus(
                                    fill,
                                    loc,
                                    shape2,
                                    outline,
                                    isHeads
                                )
                            );
                            break;
                        case 4:
                        case 1:
                            const thinR2 = thins[tenths(shift, isDown)];
                            bounds.expand(
                                this.rhombus(
                                    fill,
                                    loc,
                                    thinR2,
                                    outline,
                                    isHeads
                                )
                            );
                            break;
                    }
            }
        }
        return bounds;
    }

    drawAmmannPattern(fifths, type, isDown, loc, thicks, thins, isHeads) {
        const bounds = new Bounds();
        const shift = norm(fifths + i);
        switch (type) {
            case penrose.Pe5:
                break;
            case penrose.Pe3:
                break;
            case penrose.Pe1:
                break;
        }

        return bounds;
    }
    pentaRhomb(fifths, type, isDown, loc, exp, isHeads = true) {
        const { overlays } = globals;
        const bounds = new Bounds();
        if (!overlays.rhombSelected) {
            return bounds;
        }

        fifths = norm(fifths);

        if (exp == 0) {
            if (overlays.smallRhomb) {
                //const thins = penrose[this.mode].thinRhomb[exp];
                //const thicks = penrose[this.mode].thickRhomb[exp];
                bounds.expand(
                    this.drawRhombusPattern(
                        fifths,
                        type,
                        isDown,
                        loc,
                        exp,
                        isHeads
                    )
                );
            }

            return bounds;
        }

        if (exp == 1 && !overlays.smallRhomb) {
            const thins = penrose[this.mode].thinRhomb[exp];
            const thicks = penrose[this.mode].thickRhomb[exp];
            bounds.expand(
                this.drawRhombusPattern(fifths, type, isDown, loc, exp, isHeads)
            );
            return bounds;
        }
        const wheels = penrose[this.mode].wheels;
        const pWheel = wheels.p[exp].w;
        const sWheel = wheels.s[exp].w;

        bounds.expand(
            this.pentaRhomb(0, penrose.Pe5, !isDown, loc, exp - 1, isHeads)
        );

        for (let i = 0; i < 5; i++) {
            const shift = norm(fifths + i);
            const angle = tenths(shift, isDown);
            const locPenta = loc.tr(pWheel[angle]);
            const locDiamond = loc.tr(sWheel[tenths(shift, !isDown)]);
            bounds.expand(
                this.pentaRhomb(
                    norm(shift + type.twist[i]),
                    type.twist[i] == 0 ? penrose.Pe3 : penrose.Pe1,
                    isDown,
                    locPenta,
                    exp - 1,
                    !isHeads
                )
            );

            if (type.diamond.includes(i)) {
                bounds.expand(
                    this.starRhomb(
                        shift,
                        penrose.St1,
                        !isDown,
                        locDiamond,
                        exp - 1,
                        isHeads // !!! just a guess
                    )
                );
            }
        }
        return bounds;
    }

    starRhomb(fifths, type, isDown, loc, exp, isHeads) {
        const { overlays } = globals;
        const bounds = new Bounds();
        if (!overlays.rhombSelected) {
            return bounds;
        }

        fifths = norm(fifths);
        if (exp == 0) {
            return bounds;
        }

        const wheels = penrose[this.mode].wheels;
        const tWheel = wheels.t[exp].w;
        const sWheel = wheels.s[exp].w;

        if (exp == 1 && !overlays.smallRhomb) {
            return bounds;
        }

        bounds.expand(
            this.starRhomb(0, penrose.St5, !isDown, loc, exp - 1, isHeads),
            isHeads
        );

        for (let i = 0; i < 5; i++) {
            const shift = norm(fifths + i);
            const angle = tenths(shift, isDown);
            const locPenta = loc.tr(sWheel[angle]);
            const locBoat = loc.tr(tWheel[angle]);

            if (type.color[i] != null) {
                bounds.expand(
                    this.pentaRhomb(
                        norm(shift),
                        penrose.Pe1,
                        !isDown,
                        locPenta,
                        exp - 1,
                        isHeads
                    )
                );

                bounds.expand(
                    this.starRhomb(
                        shift,
                        penrose.St3,
                        isDown,
                        locBoat,
                        exp - 1,
                        isHeads
                    )
                );
            }
        }
        return bounds;
    }
    decaRhomb(fifths, isDown, loc, exp, isHeads = true) {
        const { overlays } = globals;
        const bounds = new Bounds();
        if (!overlays.rhombSelected) {
            return bounds;
        }

        if (exp == 0) {
            return bounds;
        }

        const wheels = penrose[this.mode].wheels;

        // Move the center of the decagon to the real center.
        let dUp = wheels.d[exp].up;
        let dDown = wheels.d[exp].down;
        let dOff = isDown ? dUp[fifths] : dDown[fifths];
        let base = loc.tr(dOff);
        let pUp = wheels.p[exp].up;
        let pDown = wheels.p[exp].down;
        let sUp = wheels.s[exp].up;
        let sDown = wheels.s[exp].down;
        let offs; // Work variable

        // The central yellow pentagon
        bounds.expand(
            this.pentaRhomb(fifths, penrose.Pe3, isDown, base, exp - 1, isHeads)
        ); //

        // The two diamonds
        offs = isDown ? sDown[norm(1 + fifths)] : sUp[norm(1 + fifths)];
        bounds.expand(
            this.starRhomb(
                norm(fifths + 3),
                penrose.St1,
                isDown,
                base.tr(offs),
                exp - 1,
                isHeads // !!! this is just a guess
            )
        ); // sd1

        offs = isDown ? sDown[norm(4 + fifths)] : sUp[norm(4 + fifths)];
        bounds.expand(
            this.starRhomb(
                norm(fifths + 2),
                penrose.St1,
                isDown,
                base.tr(offs),
                exp - 1,
                isHeads // !!! just a guess
            )
        ); // sd4

        // The two orange pentagons
        offs = isDown ? pUp[norm(3 + fifths)] : pDown[norm(3 + fifths)];
        bounds.expand(
            this.pentaRhomb(
                norm(fifths + 2),
                penrose.Pe1,
                !isDown,
                base.tr(offs),
                exp - 1,
                !isHeads
            )
        );

        offs = isDown ? pUp[norm(2 + fifths)] : pDown[norm(2 + fifths)];
        bounds.expand(
            this.pentaRhomb(
                norm(fifths + 3),
                penrose.Pe1,
                !isDown,
                base.tr(offs),
                exp - 1,
                !isHeads
            )
        );

        // And the boat
        offs = isDown
            ? pUp[norm(2 + fifths)].tr(sUp[norm(3 + fifths)])
            : pDown[norm(2 + fifths)].tr(sDown[norm(3 + fifths)]);
        bounds.expand(
            this.starRhomb(
                fifths + 0,
                penrose.St3,
                !isDown,
                base.tr(offs),
                exp - 1,
                !isHeads
            )
        );
        return bounds;
    }
}
