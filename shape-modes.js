import { toP, p } from "./point.js";
import { shapeWheel, Wheels, shapeWheelMosaic } from "./wheels.js";
import { Bounds } from "./penrose.js";
import { penrose } from "./penrose.js";
/***
 * Used by Mosaic figure.
 * This is the routine that ultimately renders the 'tile'
 * @param {*} fill One of the colors
 * @param {*} offset Location in P format
 * @param {*} shape centered array of 'pixels' centered.
 * Prerequisites: Globals g and scale
 */
function figure(fill, offset, shape, g, scale) {
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
    return bounds;
}

/***
 * Used for quadrille
 *
 */
export function outline(fill, offset, shape, g, scale) {
    let start = true;
    const bounds = new Bounds();
    for (const point of shape) {
        g.strokeStyle = "#000000";
        g.fillStyle = fill;
        g.lineWidth = 1;
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
    g.stroke();
    if (fill) {
        g.fill();
    }

    return bounds;
}

/**
 * Adjusts the proportions of the object linearly and returns results
 * proportions: A table of lengths of a figure
 * inputKey: The item whose value you want to fix.
 * value: Default 1. Otherwise fixes the value to this value.
 * targetKey: Field to be returned. Otherwise returns new proportions object
 * with input fixed.
 */
function solve(proportions, inputKey, value, targetKey) {
    if (!proportions) {
        return null;
    }
    let oldValue = proportions[inputKey];
    // zero is not allowed for any value
    if (!oldValue) {
        return null;
    }

    let factor;
    if (value) {
        factor = (1 / oldValue) * value;
    } else {
        // set to 1 if none sent
        factor = 1 / oldValue;
    }
    let oldResult = proportions[targetKey];
    if (oldResult) {
        return oldResult * factor;
    } else {
        let newVariables = {};
        let keys = Object.keys(proportions);
        for (const key of keys) {
            newVariables[key] = proportions[key] * factor;
        }
        return newVariables;
    }
}

class Real {
    constructor() {
        /**
         * Unit pentagon coordinates
         * Values come from the only f*ing place on the internet that bothers:
         * https://mathworld.wolfram.com/RegularPentagon.html
         * https://mathworld.wolfram.com/Pentagram.html
         *
         * The coordinate system used in Penrose differs from the math standard.
         * First, As in virtually all graphics programs, the y axis is reversed.
         * Up is negative. Up is also the default 0 angle.
         * Second, angles are measured clockwise from y axis. Angles are
         * integers.  There are three angle coordinate system: up down and wheel.
         *
         * up refers to the vertices of a right side up pentagon, that is, a
         * pentagon  with a horizontal base and a apex on top. The top
         * coordinate, up[0] is P(0, <negative value>). The angles are mod 5
         * integers referred to as fifths. A fifth is actually n * 2*PI/5 or 72
         * degrees.
         *
         * A vertical reflection of the up system gives you the down system, based
         * on an 'upside down' pentagon. Thus the down[0] coordinate is
         * P(0, <positive value>).
         *
         * Both systems combined give the 10 angles of the mod 10 wheel system.
         * Elements 0 to 9 are clockwise: [ up0, down3, up1, down4, up2, down0,
         * up3, down1, up4, down2]]. The angle here is 36 degrees or a tenth of a
         *  circle: n * PI / 5
         *
         * Given the value of up0 (wheel0), down3 (wheel1) and up1 (wheel2), the
         * entire wheel can be constructed based on vertical and horizontal
         * reflections of those three.
         *
         * There is another coordinate system hiding away which is at a right angle
         * to the one described above. Fortunately we don't use that one.
         *
         *                            u0 [s0,-c0]
         *                               *
         *        [-s2,-c2] d2 *                   * d3 [s2,-c2]
         *
         *
         *
         *  [-s1,-c1] u4 *                               * u1 [s1, -c1]
         *
         *                               o
         *
         *            d1 *                               * d4 [s1, c1]
         *
         *
         *
         *          [-s2,c2] u3 *                   * u2 [s2, c2]
         *                               *
         *                            d0 [s0,c0]
         *
         */
        const SQRT5 = Math.sqrt(5); // 2.236
        const PHI = (SQRT5 + 1) / 2; // 1.618
        const sqrt = Math.sqrt;

        // const ct_0 = Math.cos(0);
        // const ct_1 = Math.cos((2 * Math.PI) / 5);
        // const ct_2 = Math.cos(Math.PI / 5);
        // const st_0 = Math.sin(1);
        // const st_1 = Math.sin((2 * Math.PI) / 5);
        // const st_2 = Math.sin((4 * Math.PI) / 5);

        const c_0 = 1; // 1.0
        const c_1 = (SQRT5 - 1) / 4; // .309
        const c_2 = (SQRT5 + 1) / 4; // .809
        const s_0 = 0; // 0.0
        const s_1 = sqrt(10 + 2 * SQRT5) / 4; // .951 sin 72 cos 18
        const s_2 = sqrt(10 - 2 * SQRT5) / 4; // .588 sin 36 cos 54
        /**
         * Unit pentagon
         */
        const unitUp = [
            [s_0, -c_0],
            [s_1, -c_1],
            [s_2, c_2],
            [-s_2, c_2],
            [-s_1, -c_1],
        ].map(toP);

        const unitDown = unitUp.map((it) => it.neg);

        // Relation between side and unit radius
        // 2 * s_2 is the length of a unit pentagons base, hence the side
        const uPgon = {
            a: 2 * s_2, // 1.176
            R: 1.0,
        };

        const R = solve(uPgon, "a", 4, "R");

        // The proportions of the relevent pgon parts.
        // Note that uPgon is now unnecessary since uPgon.a * pgon.R == 1
        const pgon = {
            a: 1.0,
            d: PHI,
            R: sqrt(50 + 10 * SQRT5) / 10, // .8507
            r: sqrt(25 + 10 * SQRT5) / 10, // .688
            x: sqrt(25 - 10 * SQRT5) / 10, // .162
        };

        // The pentagram proportions. Note that a, the side is common
        // between both pgon and pgram
        const pgram = {
            a: (3 - SQRT5) / 2, // .382
            b: SQRT5 - 2, // .236
            c: 1, // Missing from diagram, but by definition 2 * b + a
            R: sqrt((25 - 11 * SQRT5) / 10), // .2008
            r: sqrt((5 - 2 * SQRT5) / 5) / 2, // .162
            rho: sqrt((5 - SQRT5) / 10), // .525
            y: sqrt((25 - 11 * SQRT5) / 2) / 2,
            x: (SQRT5 - 1) / 4,
        };

        const newPgram = solve(pgram, "a", 4);
        const starTips = unitUp.map((it) => it.mult(newPgram.rho));
        const starDimples = unitDown.map((it) => it.mult(newPgram.R));

        const pentaUp = unitUp.map((item) => item.mult(R));

        const starUp = [
            starTips[0],
            starDimples[3],
            starTips[1],
            starDimples[4],
            starTips[2],
            starDimples[0],
            starTips[3],
            starDimples[1],
            starTips[4],
            starDimples[2],
        ];

        const diamondUp = [
            starTips[0],
            starDimples[3],
            starDimples[0],
            starDimples[2],
        ];

        const diamondToo = [
            starDimples[3],
            starTips[1],
            starDimples[4],
            starDimples[1],
        ];

        const diamondWon = [
            starDimples[3],
            starDimples[0],
            starTips[3],
            starDimples[1],
        ].map((it) => it.neg);

        const boatUp = [
            starTips[0],
            starDimples[3],
            starTips[1],
            starDimples[4],
            starDimples[1],
            starTips[4],
            starDimples[2],
        ];

        const boatWon = [
            starDimples[4],
            starTips[2],
            starDimples[0],
            starTips[3],
            starDimples[1],
            starTips[4],
            starDimples[2],
        ].map((it) => it.neg);

        const boatToo = [
            starTips[0],
            starDimples[3],
            starTips[1],
            starDimples[4],
            starTips[2],
            starDimples[0],
            starDimples[2],
        ];
        // pSeed is the distance between two pentagon centers.
        // It is basically 2 * pgon.r
        const pMag = solve(pgon, "a", 4, "r") * 2;
        const pSeed = makeSeed(pMag);

        // sSeed is the distance between a pentagon and the near diamond
        // This is pgon.R + pgram.r
        const sMag = solve(pgon, "a", 4, "R") + solve(pgram, "a", 4, "R");
        const sSeed = makeSeed(sMag);

        // tSeed distance is the centers of two stars with their feet touching
        // So simply (pgram.R + pgram.y) * 2;
        const tMag =
            (solve(pgram, "a", 4, "R") + solve(pgram, "a", 4, "y")) * 2;
        const tSeed = makeSeed(tMag);

        // dseed is simply pgon 2 * r + R with a set to 4.
        const dMag = solve(pgon, "a", 4, "r");
        const dSeed = makeSeed(dMag);

        function makeSeed(mag) {
            return [
                unitUp[0].mult(mag),
                unitDown[3].mult(mag),
                unitUp[1].mult(mag),
            ];
        }
        this.penta = shapeWheel(pentaUp);
        this.star = shapeWheel(starUp);
        this.boat = shapeWheel(boatUp, boatWon, boatToo);
        this.diamond = shapeWheel(diamondUp, diamondWon, diamondToo);

        this.wheels = new Wheels(pSeed, sSeed, tSeed, dSeed);

        this.key = "real";
        this.renderShape = outline;
    }
}
export const real = new Real();

/*******************************************************
 * This is the path model that would work on graph paper
 * I could say here: quadrille = new class() {...}
 */
class Quadrille {
    constructor() {
        const pentaUp = [
            [0, -3],
            [3, -1],
            [2, 3],
            [-2, 3],
            [-3, -1],
        ].map(toP);

        const starUp = [
            [0, -6],
            [1, -2],
            [5, -2],
            [2, 0],
            [3, 4],
            [0, 2],
            [-3, 4],
            [-2, 0],
            [-5, -2],
            [-1, -2],
        ].map(toP);

        const diamondUp = [
            [0, -6],
            [1, -2],
            [0, 2],
            [-1, -2],
        ].map(toP);

        const diamondWon = [
            [3, -4],
            [0, -2],
            [-1, 2],
            [2, 0],
        ].map(toP);

        const diamondToo = [
            [5, -2],
            [2, 0],
            [-2, 0],
            [1, -2],
        ].map(toP);

        const boatUp = [
            [0, -6],
            [1, -2],
            [5, -2],
            [2, 0],
            [-2, 0],
            [-5, -2],
            [-1, -2],
        ].map(toP);

        const boatWon = [
            [3, -4],
            [2, 0],
            [5, 2],
            [1, 2],
            [-2, 0],
            [-3, -4],
            [0, -2],
        ].map(toP);

        const boatToo = [
            [5, -2],
            [2, 0],
            [3, 4],
            [0, 2],
            [-1, -2],
            [0, -6],
            [1, -2],
        ].map(toP);
        this.penta = shapeWheel(pentaUp);
        this.star = shapeWheel(starUp);
        this.boat = shapeWheel(boatUp, boatWon, boatToo);
        this.diamond = shapeWheel(diamondUp, diamondWon, diamondToo);
        this.key = "quadrille";
        this.renderShape = outline;
        const pSeed = [p(0, -6), p(3, -4), p(5, -2)];
        const sSeed = [p(0, -5), p(3, -5), p(5, -1)];
        const tSeed = [p(0, -8), p(5, -8), p(8, -2)];
        const dSeed = [p(0, -3), p(2, -3), p(3, -1)];

        this.wheels = new Wheels(pSeed, sSeed, tSeed, dSeed);
    }
}
export const quadrille = new Quadrille();
/*******************************************************
 * This is the square tiles model, the Mosaic
 */

class Mosaic {
    constructor() {
        // prettier-ignore
        const penta_up = [[2, 0], [3, 0],
        [1, 1], [2, 1], [3, 1], [4, 1],
        [0, 2], [1, 2], [2, 2], [3, 2], [4, 2], [5, 2],
        [0, 3], [1, 3], [2, 3], [3, 3], [4, 3], [5, 3],
        [1, 4], [2, 4], [3, 4], [4, 4],
        [1, 5], [2, 5], [3, 5], [4, 5]].map(toP);

        // prettier-ignore
        const diamond_up = [[0, 0], [1, 0],
        [0, 1], [1, 1],
        [0, 2], [1, 2],
        [0, 3], [1, 3]].map(toP);

        // prettier-ignore
        const diamond_too = [[1, 0], [2, 0], [3, 0], [4, 0],
        [0, 1], [1, 1], [2, 1], [3, 1]].map(toP);

        // This one should have been called diamond nine.
        // prettier-ignore
        const diamond_for = [[0, 0],
        [0, 1], [1, 1],
        [1, 2], [2, 2],
        [1, 3], [2, 3],
        [2, 4], [3, 4],
        [3, 5]].map(toP);

        // prettier-ignore
        const star_up = [[3, 0], [4, 0],
        [3, 1], [4, 1],
        [0, 2], [1, 2], [2, 2], [3, 2], [4, 2], [5, 2], [6, 2], [7, 2],
        [1, 3], [2, 3], [3, 3], [4, 3], [5, 3], [6, 3],
        [2, 4], [3, 4], [4, 4], [5, 4],
        [2, 5], [3, 5], [4, 5], [5, 5],
        [1, 6], [2, 6], [5, 6], [6, 6],
        [1, 7], [6, 7]].map(toP);

        // prettier-ignore
        const boat_up = [[3, 0], [4, 0],
        [3, 1], [4, 1],
        [0, 2], [1, 2], [2, 2], [3, 2], [4, 2], [5, 2], [6, 2], [7, 2],
        [1, 3], [2, 3], [3, 3], [4, 3], [5, 3], [6, 3]].map(toP);

        // prettier-ignore
        const boat_too = [[0, 0], [1, 0],
        [0, 1], [1, 1],
        [0, 2], [1, 2], [2, 2], [3, 2], [4, 2],
        [0, 3], [1, 3], [2, 3], [3, 3],
        [1, 4], [2, 4],
        [1, 5], [2, 5],
        [2, 6], [3, 6],
        [3, 7]].map(toP);

        // prettier-ignore
        const boat_for = [[3, 0], [4, 0], [5, 0], [6, 0],
        [2, 1], [3, 1], [4, 1], [5, 1],
        [1, 2], [2, 2], [3, 2], [4, 2],
        [1, 3], [2, 3], [3, 3], [4, 3],
        [0, 4], [1, 4], [4, 4], [5, 4],
        [0, 5], [5, 5]].map(toP);

        const primitives = {
            penta_up: penta_up.map((pt) => pt.tr(p(-3, -3))),
            diamond_up: diamond_up.map((pt) => pt.tr(p(-1, -4))),
            diamond_won: diamond_for.map((pt) => pt.tr(p(-3, -4)).hrm),
            diamond_too: diamond_too.map((pt) => pt.tr(p(-1, -2))),
            boat_up: boat_up.map((pt) => pt.tr(p(-4, -4))),
            boat_won: boat_for.map((pt) => pt.tr(p(-3, -2)).vrm),
            boat_too: boat_too.map((pt) => pt.tr(p(-1, -4))),
            star_up: star_up.map((pt) => pt.tr(p(-4, -4))),
        };

        this.penta = shapeWheelMosaic(primitives.penta_up);
        this.diamond = shapeWheelMosaic(
            primitives.diamond_up,
            primitives.diamond_won,
            primitives.diamond_too
        );
        this.boat = shapeWheelMosaic(
            primitives.boat_up,
            primitives.boat_won,
            primitives.boat_too
        );
        this.star = shapeWheelMosaic(primitives.star_up);

        this.key = "mosaic";
        this.renderShape = figure;

        const pSeed = [p(0, -6), p(3, -4), p(5, -2)];
        const sSeed = [p(0, -5), p(3, -5), p(5, -1)];
        const tSeed = [p(0, -8), p(5, -8), p(8, -2)];
        const dSeed = [p(0, -3), p(2, -3), p(3, -1)];

        this.wheels = new Wheels(pSeed, sSeed, tSeed, dSeed);
    }
}

export const mosaic = new Mosaic();
