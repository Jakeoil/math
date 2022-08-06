import { Bounds } from "./penrose.js";
import { penrose } from "./penrose.js";
import { shapeColors } from "./math.js";
const norm = (n) => ((n % 5) + 5) % 5;
function tenths(fifths, isDown) {
    return (fifths * 2 + (isDown ? 5 : 0)) % 10;
}
function pColor(type) {
    switch (type) {
        case penrose.Pe5:
            return shapeColors.idList["p5-color"].color;
        //return p5Blue;
        case penrose.Pe3:
            return shapeColors.idList["p3-color"].color;
        //return p3Yellow;
        case penrose.Pe1:
            return shapeColors.idList["p1-color"].color;
        //return p1Orange;
        case penrose.St5:
            return shapeColors.idList["star-color"].color;
        //return starBlue;
        case penrose.St3:
            return shapeColors.idList["boat-color"].color;
        //return boatBlue;
        case penrose.St1:
            return shapeColors.idList["diamond-color"].color;
        //return diamondBlue;
    }
    return null;
}

export class PenroseScreen {
    constructor(g, scale, mode) {
        this.g = g;
        this.scale = scale;
        this.mode = mode;
        console.log(`${this.scale}, ${this.mode}`);
    }

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
    penta(fifths, type, isDown, loc, exp) {
        const bounds = new Bounds();
        fifths = norm(fifths);
        if (exp == 0) {
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
            } else {
                bounds.addPoint(loc, loc);
            }

            return bounds; // call figure
        }

        const wheels = penrose[this.mode].wheels;
        const pWheel = wheels.p[exp].w;
        const sWheel = wheels.s[exp].w;
        // Draw the center. Always the BLUE p5
        bounds.expand(this.penta(0, penrose.Pe5, !isDown, loc, exp - 1));

        for (let i = 0; i < 5; i++) {
            const shift = norm(fifths + i);
            bounds.expand(
                this.penta(
                    norm(shift + type.twist[i]),
                    type.twist[i] == 0 ? penrose.Pe3 : penrose.Pe1,
                    isDown,
                    loc.tr(pWheel[tenths(shift, isDown)]),
                    exp - 1
                )
            );

            if (type.diamond.includes(i)) {
                bounds.expand(
                    this.star(
                        shift,
                        penrose.St1,
                        !isDown,
                        loc.tr(sWheel[tenths(shift, !isDown)]),
                        exp - 1
                    )
                );
            }
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
    star(fifths, type, isDown, loc, exp) {
        const bounds = new Bounds();
        const name = type.name;
        fifths = norm(fifths);
        if (exp == 0) {
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
            } else {
                bounds.addPoint(loc, loc);
            }

            return bounds;
        }

        const wheels = penrose[this.mode].wheels;

        bounds.expand(this.star(0, penrose.St5, !isDown, loc, exp - 1));

        for (let i = 0; i < 5; i++) {
            const shift = norm(fifths + i);
            const angle = tenths(shift, isDown);

            const tWheel = wheels.t[exp].w;
            const sWheel = wheels.s[exp].w;

            if (type.color[i] != null) {
                bounds.expand(
                    this.penta(
                        norm(shift),
                        penrose.Pe1,
                        !isDown,
                        loc.tr(sWheel[angle]),
                        exp - 1
                    )
                );

                bounds.expand(
                    this.star(
                        shift,
                        penrose.St3,
                        isDown,
                        loc.tr(tWheel[angle]),
                        exp - 1
                    )
                );
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
     *     x o  ,   o x
     *    * x   o  x   *
     *    .    +    .
     *      +--*--+
     */

    deca(fifths, isDown, loc, exp) {
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
        bounds.expand(this.penta(fifths, penrose.Pe3, isDown, base, exp - 1)); //

        // The two diamonds
        offs = isDown ? sDown[norm(1 + fifths)] : sUp[norm(1 + fifths)];
        bounds.expand(
            this.star(
                norm(fifths + 3),
                penrose.St1,
                isDown,
                base.tr(offs),
                exp - 1
            )
        ); // sd1

        offs = isDown ? sDown[norm(4 + fifths)] : sUp[norm(4 + fifths)];
        bounds.expand(
            this.star(
                norm(fifths + 2),
                penrose.St1,
                isDown,
                base.tr(offs),
                exp - 1
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
                exp - 1
            )
        );

        offs = isDown ? pUp[norm(2 + fifths)] : pDown[norm(2 + fifths)];
        bounds.expand(
            this.penta(
                norm(fifths + 3),
                penrose.Pe1,
                !isDown,
                base.tr(offs),
                exp - 1
            )
        );

        // And the boat
        offs = isDown
            ? pUp[norm(2 + fifths)].tr(sUp[norm(3 + fifths)])
            : pDown[norm(2 + fifths)].tr(sDown[norm(3 + fifths)]);
        bounds.expand(
            this.star(fifths + 0, penrose.St3, !isDown, base.tr(offs), exp - 1)
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
}
