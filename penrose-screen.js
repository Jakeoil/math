import { norm, p } from "./point.js";
import { Bounds } from "./bounds.js";
import { penrose } from "./penrose.js";
import { globals } from "./controls.js";
import { mosaic, quadrille } from "./shape-modes.js";
import { CanvasRenderer, isThree, threeRenderer } from "./renderers.js";

const SQRT5 = Math.sqrt(5); // 2.236
const PHI = (SQRT5 + 1) / 2; // 1.618

/**
 * Class wrapping fifths and isDown
 * Move to utilities
 */
export class Angle {
    slicee = [0, 1, 2, 3, 4, 0, 1, 2, 3];

    constructor(fifths, isDown) {
        this.fifths = fifths % 5;
        this.isDown = isDown;
    }
    // The clockwise operation.
    //   add a fifth
    get cw() {
        return new Angle(fifths == 4 ? 0 : this.fifths + 1, this.isDown);
    }
    // The counter-clockwise operation
    get ccw() {
        return new Angle(fifths ? this.fifths - 1 : 4, this.isDown);
    }
    // Add n fifths
    rot(n) {
        return new Angle(norm(this.fifths + n), this.isDown);
    }
    // Reverse the direction.
    get inv() {
        return new Angle(this.fifths, !this.isDown);
    }
    // Convert to tenths. Vectors (pstd) are stored in tenths
    get tenths() {
        return (this.fifths * 2 + (this.isDown ? 5 : 0)) % 10;
    }
    toString() {
        return JSON.stringify({ fifths: this.fifths, isDown: this.isDown });
    }
}

function angleTest() {
    console.log(`angle test`);
    let an = new Angle(0, true);
    let te = an.tenths;
    console.log(`an: ${an}, te: ${te}`);
    an = new Angle(1, true);
    te = an.tenths;
    console.log(`an: ${an}, te: ${te}`);
    an = new Angle(1, false);
    te = an.tenths;
    console.log(`an: ${an}, te: ${te}`);
}
//angleTest();

/***
 * Thanks to:
 * https://css-tricks.com/converting-color-spaces-in-javascript/
 *
 * Converts #rgb and #rrggbb formats
 *
 * Move to utilities
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
    const [r, g, b] = rgbStart.map((item, index) => item * (1 - frac) + rgbEnd[index] * frac);
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

//testMix();

/**
 * This is a wrapper around penroseScreen
 * Just creates the screen with some aliases.
 */
export function iface(g, scale, mode) {
    let screen = new PenroseScreen(g, scale, mode);
    const grid = screen.renderer.grid.bind(screen.renderer);
    const figure = screen.renderer.figure.bind(screen.renderer);
    const outline = screen.renderer.outline.bind(screen.renderer);
    const penta = screen.penta.bind(screen);
    const star = screen.star.bind(screen);
    const deca = screen.deca.bind(screen);
    return {
        grid,
        figure,
        outline,
        penta,
        star,
        deca,
    };
}

/**
 * This routine depends on an initialized shapeColors instance.
 * Instance must be star or penta, deca returns null
 * Returns color based on type
 *
 * @param {*} type
 * @returns assigned color
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
 * Typographic is in progress
 *
 */
export class PenroseScreen {
    constructor(g, scale, mode) {
        // console.log(g);
        // console.log(g.constructor.name);
        // console.log(g.name);
        this.mode = mode;
        if (g instanceof CanvasRenderingContext2D) {
            console.log(g.constructor.name);
            this.renderer = new CanvasRenderer(g, scale);
        } else if (isThree(g)) {
            console.log("isThree");
            this.renderer = new threeRenderer(g, scale);
        }
    }

    /**
     * Gets the figure for the type.
     * Depends on this.mode
     *
     * @param {penrose.type} type
     * @param {Shapes} penta
     * @returns penta|star|boat|diamond Point array
     *
     * Mode quadrille being phased out.
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

    /**
     * Gets the mosaic shape wheel.
     * For the mosaic overlay.
     *
     * @param {penrose.type} type
     * @returns the mosaic shape wheel
     */
    mShape(type) {
        if (this.mode != quadrille.key) {
            return null; // !! there may be some recourse for real.
        }
        switch (type) {
            case penrose.Pe5:
            case penrose.Pe3:
            case penrose.Pe1:
                return penrose[mosaic.key].penta;
            case penrose.St5:
                return penrose[mosaic.key].star;
            case penrose.St3:
                return penrose[mosaic.key].boat;
            case penrose.St1:
                return penrose[mosaic.key].diamond;
        }
        return null;
    }

    /**
     * This will revamp and combine penta and pentaRhomb
     * The inputs are streamlined
     *
     */
    drawPentaPattern({ type, angle, isHeads, loc, gen, ...options }) {
        const { overlays } = globals; // don't forget the options
        const bounds = new Bounds();
        if (options.rhomb) {
            return bounds;
        }

        if (!overlays || overlays.pentaSelected) {
            let shapes = this.pShape(type);
            if (shapes) {
                bounds.expand(this.renderer.outline(pColor(type), loc, shapes[angle.tenths]));
            }
        }

        if (!overlays || overlays.mosaicSelected) {
            let shapes = this.mShape(type);
            if (shapes) {
                bounds.expand(this.renderer.figure(pColor(type), loc, shapes[angle.tenths]));
            }
        }
        return bounds; // call figure
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
     * @param {0|1|2|3|4} fifths - angle cw from upright
     * @param {penrose.type} type - only Pe<1|3|5> types considered
     * @param {boolean} isDown - inverted if true
     * @param {Point} loc - center of figure
     * @param {number} gen - generation number. Recursively decrements to 0 (or  value specified by control)
     * @param {boolean} heads - Computed aspect of group. Convex or concave
     * @returns {Bounds} - Rectangle describing space taken by shape
     */

    penta({ type, angle, isHeads = true, loc, gen, ...options }) {
        // console.log(
        //     `type: ${
        //         type.name
        //     }, angle: ${angle}, gen: ${gen}, options: ${JSON.stringify(
        //         options
        //     )}`
        // );
        switch (type) {
            case penrose.St5:
            case penrose.St3:
            case penrose.St1:
                return this.star({ type, angle, isHeads, loc, gen, ...options });
        }
        let { overlays } = globals;
        //({ overlays } = options); // some version of apply
        const bounds = new Bounds();

        if (gen == 0) {
            bounds.expand(
                this.drawPentaPattern({
                    type,
                    angle,
                    isHeads,
                    loc,
                    gen,
                    ...options,
                })
            );

            if (overlays && overlays.smallRhomb) {
                bounds.expand(
                    this.drawRhombusPattern({
                        type,
                        angle,
                        isHeads,
                        loc,
                        gen,
                        ...options,
                    })
                );
            }
            return bounds; // call figure
        }

        const wheels = penrose[this.mode].wheels;
        const pWheel = wheels.p[gen].w;
        const sWheel = wheels.s[gen].w;

        if (options.rhomb) {
            if (gen == 1 && !overlays.smallRhomb) {
                bounds.expand(
                    this.drawRhombusPattern({
                        type,
                        angle,
                        isHeads,
                        loc,
                        gen,
                        ...options,
                    })
                );
                return bounds;
            }
        }
        bounds.expand(
            this.penta({
                type: penrose.Pe5,
                angle: angle.inv,
                isHeads: !isHeads,
                loc,
                isHeads,
                gen: gen - 1,
                ...options,
            })
        );

        for (let i = 0; i < 5; i++) {
            const shift = angle.rot(i);
            const locPenta = loc.tr(pWheel[shift.tenths]);
            const locDiamond = loc.tr(sWheel[shift.inv.tenths]);
            bounds.expand(
                this.penta({
                    type: type.twist[i] == 0 ? penrose.Pe3 : penrose.Pe1,
                    angle: shift.rot(type.twist[i]),
                    isHeads: !isHeads,
                    loc: locPenta,
                    gen: gen - 1,
                    ...options,
                })
            );

            if (type.diamond.includes(i)) {
                bounds.expand(
                    this.star({
                        type: penrose.St1,
                        angle: shift.inv,
                        loc: locDiamond,
                        isHeads,
                        gen: gen - 1,
                        ...options,
                    })
                );
                if (overlays && overlays.treeSelected) this.renderer.line(loc, locDiamond, "red");
            }
            if (overlays && overlays.treeSelected) this.renderer.line(loc, locPenta, "black");
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
     * @param {0|1|2|3|4} fifths - angle cw from upright
     * @param {penrose.type} type - only St<1|3|5> types considered
     * @param {boolean} isDown - inverted if true
     * @param {Point} loc - center of figure
     * @param {number} gen - generation number. Recursively decrements to 0 (or  value specified by control)
     * @param {boolean} heads - Computed aspect of group. Convex or concave
     * @returns {Bounds} - Rectangle describing space taken by shape
     */
    star({ type, angle, isHeads = true, loc, gen, ...options }) {
        const { overlays } = Object.assign(globals, options);
        const bounds = new Bounds();
        // console.log(
        //     `type: ${
        //         type.name
        //     }, angle: ${angle}, gen: ${gen}, options: ${JSON.stringify(
        //         options
        //     )}`
        // );

        if (gen == 0) {
            bounds.expand(
                this.drawPentaPattern({
                    type,
                    angle,
                    isHeads,
                    loc,
                    gen,
                    ...options,
                })
            );
            if (overlays && overlays.smallRhomb) {
                bounds.expand(
                    this.drawRhombusPattern({
                        type,
                        angle,
                        isHeads,
                        loc,
                        gen,
                        ...options,
                    })
                );
            }

            return bounds; // call figure
        }

        if (options.rhomb) {
            if (gen == 1 && !overlays.smallRhomb) {
                this.drawRhombusPattern({
                    type,
                    angle,
                    isHeads,
                    loc,
                    gen,
                    ...options,
                });
                return bounds;
            }
        }
        const wheels = penrose[this.mode].wheels;
        const tWheel = wheels.t[gen].w;
        const sWheel = wheels.s[gen].w;

        bounds.expand(
            this.star({
                angle: angle.inv,
                type: penrose.St5,
                loc,
                gen: gen - 1,
                isHeads,
                ...options,
            })
        );

        for (let i = 0; i < 5; i++) {
            const shift = angle.rot(i);

            const locPenta = loc.tr(sWheel[shift.tenths]);
            const locBoat = loc.tr(tWheel[shift.tenths]);

            if (type.color[i] != null) {
                bounds.expand(
                    this.penta({
                        type: penrose.Pe1,
                        angle: shift.inv,
                        isHeads,
                        loc: locPenta,
                        gen: gen - 1,
                        ...options,
                    })
                );
                bounds.expand(
                    this.star({
                        type: penrose.St3,
                        angle: shift,
                        isHeads,
                        loc: locBoat,
                        gen: gen - 1,
                        ...options,
                    })
                );
                if (overlays && overlays.treeSelected) {
                    this.renderer.line(loc, locPenta, "red");
                    this.renderer.line(loc, locBoat, "blue");
                }
            }
        }

        return bounds;
    }

    /**
     * Decagon is a type unto itself.
     *      * The up version.
     *
     *       + x x +
     *     x o     o x
     *    *  x  o  x  *
     *     .    +    .
     *       +--*--+
     *
     * @param {0|1|2|3|4} fifths - angle cw from upright
     * @param {boolean} isDown - inverted if true
     * @param {Point} loc - center of figure
     * @param {number} gen - generation number. Recursively decrements to 0 (or  value specified by control)
     * @param {boolean} heads - Computed aspect of group. Convex or concave
     * @returns {Bounds} - Rectangle describing space taken by shape
     * *
     */
    deca({ angle, isHeads = true, loc, gen, ...options }) {
        // console.log(
        //     `type: deca, angle: ${angle}, loc: ${loc}, gen: ${gen}, options: ${JSON.stringify(
        //         options
        //     )}`
        // );

        const { overlays } = globals;
        const bounds = new Bounds();
        if (gen == 0) {
            return bounds;
        }

        const wheels = penrose[this.mode].wheels;

        // Move the center of the decagon to the real center.
        let dUp = wheels.d[gen].up;
        let dDown = wheels.d[gen].down;
        let dOff = angle.isDown ? dUp[angle.fifths] : dDown[angle.fifths];
        let base = loc.tr(dOff);

        let offs; // Work variable

        // The central yellow pentagon
        bounds.expand(
            this.penta({
                type: penrose.Pe3,
                angle: angle,
                gen: gen - 1,
                isHeads,
                loc: base,
                ...options,
            })
        );

        const sUp = wheels.s[gen].up;
        const sDown = wheels.s[gen].down;

        // The two diamonds
        offs = angle.isDown ? sDown[angle.rot(1).fifths] : sUp[angle.rot(1).fifths];
        bounds.expand(
            this.star({
                type: penrose.St1,
                angle: angle.rot(3),
                isHeads,
                loc: base.tr(offs),
                gen: gen - 1,
                ...options,
            })
        ); // sd1

        offs = angle.isDown ? sDown[angle.rot(4).fifths] : sUp[angle.rot(4).fifths];
        bounds.expand(
            this.star({
                type: penrose.St1,
                angle: angle.rot(2),
                isHeads,
                loc: base.tr(offs),
                gen: gen - 1,
                ...options,
            })
        ); // sd4

        const pUp = wheels.p[gen].up;
        const pDown = wheels.p[gen].down;

        // The two orange pentagons
        offs = angle.isDown ? pUp[angle.rot(3).fifths] : pDown[angle.rot(3).fifths];
        bounds.expand(
            this.penta({
                angle: angle.rot(2).inv,
                type: penrose.Pe1,
                loc: base.tr(offs),
                gen: gen - 1,
                isHeads: !isHeads,
                ...options,
            })
        );

        offs = angle.isDown ? pUp[angle.rot(2).fifths] : pDown[angle.rot(2).fifths];
        bounds.expand(
            this.penta({
                angle: angle.rot(3).inv,
                type: penrose.Pe1,
                loc: base.tr(offs),
                gen: gen - 1,
                isHeads: !isHeads,
                ...options,
            })
        );

        // And the boat
        offs = angle.isDown
            ? pUp[angle.rot(2).fifths].tr(sUp[angle.rot(3).fifths])
            : pDown[angle.rot(2).fifths].tr(sDown[angle.rot(3).fifths]);
        bounds.expand(
            this.star({
                angle: angle.inv,
                type: penrose.St3,
                loc: base.tr(offs),
                gen: gen - 1,
                isHeads: !isHeads,
                ...options,
            })
        );
        return bounds;
    }

    /***
     * Used by Mosaic figure.
     * This is the routine that ultimately renders the 'tile'
     * @param {*} fill One of the colors
     * @param {*} offset Location in P format
     * @param {*} shape centered array of 'pixels' centered.
     * Prerequisites: Globals g and scale
     */
    /*
    figure(fill, offset, shape) {
        const { pentaStyle } = globals;
        const { g, scale } = this;
        let currentStrokeStyle = g.strokeStyle;
        let currentLineWidth = g.lineWidth;
        let currentfillStyle = g.fillStyle;
        g.fillStyle = fill; //e.g penrose.ORANGE;
        g.strokeStyle = penrose.OUTLINE;

        const bounds = new Bounds();
        for (const point of shape) {
            g.fillRect(
                offset.x * scale + point.x * scale,
                offset.y * scale + point.y * scale,
                scale,
                scale
            );
            if (scale >= 5) {
                g.strokeRect(
                    offset.x * scale + point.x * scale,
                    offset.y * scale + point.y * scale,
                    scale,
                    scale
                );
            }
            bounds.addPoint(offset, point);
            bounds.addPoint(offset, point.tr(p(1, 1)));
        }

        g.strokeStyle = currentStrokeStyle;
        g.lineWidth = currentLineWidth;
        g.fillStyle = currentfillStyle;

        return bounds;
    }
*/
    /***
     * Used for quadrille
     *
     */
    /*
    outline(fill, offset, shape) {
        const { pentaStyle } = globals;
        const { g, scale } = this;
        let currentStrokeStyle = g.strokeStyle;
        let currentLineWidth = g.lineWidth;
        let currentfillStyle = g.fillStyle;

        let start = true;
        if (!pentaStyle || pentaStyle.stroke == pentaStyle.SOLID) {
            g.strokeStyle = "#000000";
            g.lineWidth = 1;
        }

        if (!pentaStyle || pentaStyle.fill == pentaStyle.SOLID) {
            g.fillStyle = fill;
        } else if (pentaStyle && pentaStyle.fill == pentaStyle.TRANSPARENT) {
            g.fillStyle = fill + "80";
        }

        const bounds = new Bounds();
        for (const point of shape) {
            if (start) {
                g.beginPath();
                g.moveTo(
                    (point.x + offset.x) * scale,
                    (point.y + offset.y) * scale
                );
                start = false;
            } else {
                g.lineTo(
                    (point.x + offset.x) * scale,
                    (point.y + offset.y) * scale
                );
            }

            bounds.addPoint(offset, point);
        }
        g.closePath();
        if (!pentaStyle || pentaStyle.stroke != pentaStyle.NONE) {
            g.stroke();
        }

        // fill by default
        if (!pentaStyle || pentaStyle.fill != pentaStyle.NONE) {
            g.fill();
        }
        g.strokeStyle = currentStrokeStyle;
        g.lineWidth = currentLineWidth;
        g.fillStyle = currentfillStyle;

        return bounds;
    }
*/
    /**
     * Draw a 2 size x 2 size grid matching the scale
     * @param {point} offset - Point indicating center of grid
     * @param {*} size
     */
    /*
    grid(offset, size) {
        const bounds = new Bounds();
        const { g, scale } = this;
        g.strokeStyle = penrose.OUTLINE;
        for (let y = -size; y < size; y++) {
            for (let x = -size; x < size; x++) {
                g.strokeRect(
                    offset.x * scale + x * scale,
                    offset.y * scale + y * scale,
                    scale,
                    scale
                );
            }
        }
        //
        g.strokeStyle = "#FF0000";
        g.beginPath();
        g.moveTo(offset.x * scale, (offset.y - size) * scale);
        g.lineTo(offset.x * scale, (offset.y + size) * scale);
        g.stroke();

        g.beginPath();
        g.moveTo((offset.x - size) * scale, offset.y * scale);
        g.lineTo((offset.x + size) * scale, offset.y * scale);
        g.stroke();

        bounds.addPoint(offset, p(-size, -size));
        bounds.addPoint(offset, p(size, size));
        return bounds;
    }
*/
    /*
    line(loc, end, strokeStyle) {
        const { g, scale } = this;

        const bounds = new Bounds();
        const currentWidth = g.lineWidth;
        const currentStrokeStyle = g.strokeStyle;
        g.strokeStyle = strokeStyle ? strokeStyle : "black";
        g.lineWidth = 1;
        g.beginPath();
        g.moveTo(loc.x * scale, loc.y * scale);
        g.lineTo(end.x * scale, end.y * scale);
        bounds.addPoint(loc, loc);
        bounds.addPoint(loc, end);
        g.stroke();

        g.lineWidth = currentWidth;
        g.strokeStyle = currentStrokeStyle;
        return bounds;
    }*/

    /**
     * Draw the ammann segments
     * They will be drawn naively for the quadrille case.
     *
     * @param {*} offset - absolute location
     * @param {*} shape - shape consisting of 4 points
     */
    ammannSegments(offset, shape, thick) {
        const bounds = new Bounds();
        const nl = [shape[0], shape[3]];
        const nr = [shape[0], shape[1]];
        const fl = [shape[3], shape[2]];
        const fr = [shape[1], shape[2]];
        const segmentPoints = [];
        if (thick) {
            segmentPoints.push(this.ammannTarget(fl, PHI - 1 / 4));
            segmentPoints.push(this.ammannTarget(fr, PHI / 2));
            segmentPoints.push(this.ammannTarget(nr, PHI - 1 / (2 * PHI)));
            segmentPoints.push(this.ammannTarget(nl, PHI - 1 / (2 * PHI)));
            segmentPoints.push(this.ammannTarget(fl, PHI / 2));
            segmentPoints.push(this.ammannTarget(fr, PHI - 1 / 4));
            // Six points, symmetric
            // if size of segment is phi.
            // on fl an drl
            // The further of:
            // (1/4)/phi : 1-((1/4)/Phi
            // next one goes through los
            // to 1/2 : 1/2
            // The third one is
            // the further of:
            //(1 / (2 * phi)) / phi and 1 - (1 / (2 * phi))
        } else {
            segmentPoints.push(this.ammannTarget(fl, 1 / 4));
            segmentPoints.push(this.ammannTarget(nl, PHI - 1 / (2 * PHI)));
            segmentPoints.push(this.ammannTarget(fl, PHI / 2));
            segmentPoints.push(this.ammannTarget(fr, PHI / 2));
            segmentPoints.push(this.ammannTarget(nr, PHI - 1 / (2 * PHI)));
            segmentPoints.push(this.ammannTarget(fr, 1 / 4));
            // also six points symmetric
            // on the closer side of the far.
            // (1/4)/phi : 1-((1/4)/Phi
            // on the further side of the near.
            //
            //(1 / (2 * phi)) / phi and 1 - (1 / (2 * phi))
            // across to
        }

        for (let i = 0; i < segmentPoints.length - 1; i++) {
            this.renderer.line(offset.tr(segmentPoints[i]), offset.tr(segmentPoints[i + 1]), "red");
        }

        return bounds;
    }

    /**
     *
     * @param {Point[2]} segment
     * @param {number between 0 and PHI} offset
     * @returns point along segment proportional to offset
     */
    ammannTarget(segment, offset) {
        const abs = segment[1].tr(segment[0].neg);
        return segment[0].tr(abs.mult(offset / PHI));
    }

    /**
     * The color of the rhomb is based on the type.
     * The string will be seached for the # character. Everything before
     * # is a modifier.
     *
     * @param {*} fifths
     * @param {*} type
     * @param {*} isDown
     * @param {*} loc
     * @param {*} gen
     * @param {*} isHeads
     * @returns
     */
    /**
     * The color of the rhomb is based on the type.
     * The string will be seached for the # character. Everything before
     * # is a modifier.
     *
     * @param {*} fifths
     * @param {*} type
     * @param {*} isDown
     * @param {*} loc
     * @param {*} gen
     * @param {*} isHeads
     * @returns
     */
    drawRhombusPattern({ type, angle, isHeads, loc, gen, ...options }) {
        const bounds = new Bounds();
        const { overlays } = globals;
        if (!options.rhomb) {
            return bounds;
        }
        const { ammannSelected, rhombSelected } = overlays;

        const thins = penrose[this.mode].thinRhomb[gen];
        const thicks = penrose[this.mode].thickRhomb[gen];
        const fill = pColor(type);
        const outline = null;
        for (let i = 0; i < 5; i++) {
            const shift = angle.rot(i);
            //const shift = norm(fifths + i);
            switch (type) {
                case penrose.Pe5:
                    const thick5 = thicks[shift.tenths];
                    if (rhombSelected) {
                        bounds.expand(this.renderer.rhombus(fill, loc, thick5, outline, isHeads));
                    }
                    if (ammannSelected) {
                        bounds.expand(this.ammannSegments(loc, thick5, true));
                    }
                    break;
                case penrose.Pe3:
                    switch (i) {
                        case 0:
                            const thin3 = thins[shift.tenths];
                            if (rhombSelected) {
                                bounds.expand(
                                    this.renderer.rhombus(fill, loc, thin3, outline, isHeads)
                                );
                            }
                            if (ammannSelected) {
                                bounds.expand(this.ammannSegments(loc, thin3, false));
                            }
                        // no break here
                        case 1:
                        case 4:
                            const thick3 = thicks[shift.tenths];
                            if (rhombSelected) {
                                bounds.expand(
                                    this.renderer.rhombus(fill, loc, thick3, outline, isHeads)
                                );
                            }
                            if (ammannSelected) {
                                bounds.expand(this.ammannSegments(loc, thick3, true));
                            }
                            break;
                        default:
                            break;
                    }
                    break;
                case penrose.Pe1:
                    switch (i) {
                        case 0:
                            const thick2 = thicks[shift.tenths];
                            if (rhombSelected) {
                                bounds.expand(
                                    this.renderer.rhombus(fill, loc, thick2, outline, isHeads)
                                );
                            }
                            if (ammannSelected) {
                                bounds.expand(this.ammannSegments(loc, thick2, true));
                            }

                            break;
                        case 4:
                        case 1:
                            const thinR2 = thins[shift.tenths];
                            if (rhombSelected) {
                                bounds.expand(
                                    this.renderer.rhombus(fill, loc, thinR2, outline, isHeads)
                                );
                            }
                            if (ammannSelected) {
                                bounds.expand(this.ammannSegments(loc, thinR2, false));
                            }
                            break;
                    }
            }
        }
        return bounds;
    }
}
