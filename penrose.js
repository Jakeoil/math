"use strict";
//import { g } from "./math.js";
export const stringify = JSON.stringify;

/**
 * Orthoganal Penrose program version one.
 * These routines process a scaled grid. They do not control rendering.
 */
class P {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    // translate
    tr(v) {
        return new P(this.x + v.x, this.y + v.y);
    }
    // Vertical and Horizontal reflection
    get vr() {
        return new P(this.x, -this.y);
    }
    get hr() {
        return new P(-this.x, this.y);
    }
    get neg() {
        return new P(-this.x, -this.y);
    }
    // When reversing mosaics, the reflection is offset by 1
    // This is due to the rect bases not being in the upper left corner
    //
    get vrm() {
        return new P(this.x, -1 - this.y);
    }
    get hrm() {
        return new P(-1 - this.x, this.y);
    }
    get negm() {
        return new P(-1 - this.x, -1 - this.y);
    }
    get copy() {
        return new P(this.x, this.y);
    }
    // If used, strictly for offsets
    div(d) {
        return new P(this.x / d, this.y / d);
    }
    mult(m) {
        return new P(this.x * m, this.y * m);
    }
    // Not used?
    get toLoc() {
        return [this.x, this.y];
    }
    toString() {
        return stringify(this);
    }
    equals(b) {
        return this.x == b.x && this.y == b.y;
    }
    get isZero() {
        return this.x * this.x + this.y * this.y < 1e-8;
    }
}

/**
 * Convenience functions
 * Mostly due to the fact that I chose and object format
 * rather than an ordered pair
 */
const toP = (loc) => new P(loc[0], loc[1]);
//const p = (x, y) => new P(x, y);
export function p(x, y) {
    return new P(x, y);
}
/**
 * Mutable class
 * This measures and adjusts the bounding rectangle.
 * Only the element drawing function (figure) creates a new bounds and returns
 * either a Bounds with the max min or null max min if nothing got drawn.
 */
export class Bounds {
    constructor() {
        this.maxPoint = null;
        this.minPoint = null;
    }

    /**
     * Called from within figure
     * @param {*} offset
     * @param {*} point
     */
    addPoint(offset, point) {
        const logicalPoint = offset.tr(point);
        if (!this.maxPoint || !this.minPoint) {
            this.minPoint = logicalPoint.copy;
            this.maxPoint = logicalPoint.copy;
            return;
        }

        if (logicalPoint.x < this.minPoint.x) {
            this.minPoint.x = logicalPoint.x;
        } else if (logicalPoint.x > this.maxPoint.x) {
            this.maxPoint.x = logicalPoint.x;
        }
        if (logicalPoint.y < this.minPoint.y) {
            this.minPoint.y = logicalPoint.y;
        } else if (logicalPoint.y > this.maxPoint.y) {
            this.maxPoint.y = logicalPoint.y;
        }
    }

    /**
     * Wrapper function for figure. figure returns a bounds object. This
     * object is integrated (added, mutates) this.
     * @param {} bounds
     * @returns
     */
    expand(bounds) {
        if (!bounds) {
            // Figure returned null?
            console.log(TAG, "expand: Figure returned null?");
            return;
        }

        if (!bounds.maxPoint || !bounds.minPoint) {
            // figure didn't draw anything.
            return;
        }

        if (!this.maxPoint || !this.minPoint) {
            // This is the first expansion of this.
            this.minPoint = bounds.minPoint;
            this.maxPoint = bounds.maxPoint;
            return;
        }

        if (bounds.minPoint.x < this.minPoint.x) {
            this.minPoint.x = bounds.minPoint.x;
        }
        if (bounds.minPoint.y < this.minPoint.y) {
            this.minPoint.y = bounds.minPoint.y;
        }
        if (bounds.maxPoint.x > this.maxPoint.x) {
            this.maxPoint.x = bounds.maxPoint.x;
        }
        if (bounds.maxPoint.y > this.maxPoint.y) {
            this.maxPoint.y = bounds.maxPoint.y;
        }
    }

    /**
     * Framing adjust the bounds. Positive values increases the bounds and
     * negative values decreases. The values are scaled.
     * It takes into account the tightness of the bounds
     * Missing parameters follow css rules.
     *
     * The new bounds is mutated, but returned for convenience.
     */
    pad(top, right, bottom, left) {
        if (!this.minPoint || !this.maxPoint) {
            this.minPoint = p(0, 0);
            this.minPoint = p(0, 0);
        }
        if (top) {
            this.minPoint.y -= top;
            if (right) {
                this.maxPoint.x += right;
                if (bottom) {
                    this.maxPoint.y += bottom;
                    if (left) {
                        this.minPoint.x -= left;
                    } else {
                        this.minPoint.x -= right;
                    }
                } else {
                    this.maxPoint.y += top;
                    this.minPoint.x -= right;
                }
            } else {
                this.maxPoint.x += top;
                this.minPoint.x -= top;
                this.maxPoint.y += top;
            }
        } else {
            console.log(`error: no parameters`);
        }
        // check if we shrank too much
        const rect = this.maxPoint.tr(this.minPoint.neg);
        if (rect.x < 0) {
            this.maxPoint.x = this.minPoint.x;
        }
        if (rect.y < 0) {
            this.maxPoint.y = this.minPoint.y;
        }
        //
        return this;
    }

    // doesn't check for null.
    get minX() {
        return this.minPoint && this.minPoint.x;
    }
    set minX(x) {
        this.minPoint.x = x;
    }

    get minY() {
        return this.minPoint && this.minPoint.y;
    }
    set minY(y) {
        this.minPoint.y = y;
    }
    get maxX() {
        return this.maxPoint && this.maxPoint.x;
    }
    get maxY() {
        return this.maxPoint && this.maxPoint.y;
    }

    get min() {
        return new P(this.minX, this.minY);
        // Oh shit. This is a dumb one.  Synonym for minPoint
    }
    set min(point) {
        this.minPoint = point;
    }
    get max() {
        return new P(this.maxX, this.maxY);
    }

    toString() {
        return `min: ${this.minPoint}, max: ${this.maxPoint}`;
    }
}

function testBounds() {
    let bounds = new Bounds();
    let offset = p(10, 10);
    bounds.addPoint(offset, p(-5, 6));
    bounds.addPoint(offset, p(0, 50));
    console.log(`${bounds}`);
    console.log(`${bounds.pad(1)}`);
    console.log(`${bounds.pad(1, 2, 3)}`);
    console.log(`${bounds.pad(1, 2, 3, 4)}`);
    console.log(`${bounds.pad(-10)}`);
    console.log(`${bounds.pad(-10)}`);
    console.log(`${bounds.pad(-10)}`);
}
//testBounds();

/***************************************************************  
 * Discussion of the second expansions penta points.
 * These are the x and y offset from a center rectangle to an inverted rectangle.
 * There are five of them. Let's call the x coordinate cos and the y
           0   36   72  108  144  180
 * sin =   0,   8,  13,  13,  8,    0   -8 -13 -13 -8  and repeat 0
 *         0,   3    5    5   3     0   -3  -5  -5 -3      
 * 
 * cos = -14, -12,  -4,   4,  12, 14, 12,  4  -4  -12
 *        -6   -4,  -2,   2,   4,  6   4   2  -2    4 
 * 
 * 
 *       0               *
 *       4                   *
 *       8                       *
 *       12                          *
 *       13                           *
 *       14                            *
 *       13                           *
 *       12                          *
 *       8                       *     
 *       4                   *    
 *       0               *    
 *      -4           *
 *      -8       *
 *     -12   *
 *     -13  *
 *     -14 *  
 *     -13  *
 *     -12   *
 *      -8       *
 *      -4           *
 *       0               *    
 *     
 * 
 * 
 * */

/**
 * Creates a 10 point wheel out of the first three coordinates (or Ps)
 * Input is up[0], down[3], up[1]
 */
class Wheel {
    constructor(p0, p1, p2) {
        this.list = [
            p0.copy,
            p1.copy,
            p2.copy,
            p2.vr,
            p1.vr,
            p0.vr,
            p1.neg,
            p2.neg,
            p2.hr,
            p1.hr,
        ];
    }
    get up() {
        return [
            this.list[0],
            this.list[2],
            this.list[4],
            this.list[6],
            this.list[8],
        ];
    }
    get down() {
        return [
            this.list[5],
            this.list[7],
            this.list[9],
            this.list[1],
            this.list[3],
        ];
    }
    get w() {
        return this.list;
    }
    get string() {
        return stringify(this.w.map((it) => [it.x, it.y]));
    }
    // get stringCoord(){ not needed?
}
class Wheels {
    constructor(pSeed, sSeed, tSeed, dSeed) {
        [this.p, this.s, this.t, this.d] = makeWheels(
            pSeed,
            sSeed,
            tSeed,
            dSeed
        );
    }
}

function makeWheels(pSeed, sSeed, tSeed, dSeed) {
    function pWheelNext(exp) {
        const p = pWheels[exp].w;
        return new Wheel(
            p[1].tr(p[0]).tr(p[9]),
            p[2].tr(p[1]).tr(p[0]),
            p[3].tr(p[2]).tr(p[1])
        );
    }

    // S is the offset
    function sWheelNext(exp) {
        const p = pWheels[exp].w;
        const s = sWheels[exp].w;
        return new Wheel(
            p[1].tr(p[0]).tr(s[9]),
            p[2].tr(p[1]).tr(s[0]),
            p[3].tr(p[2]).tr(s[1])
        );
    }

    function tWheelNext(exp) {
        const p = pWheels[exp].w;
        const s = sWheels[exp].w;
        return new Wheel(
            s[1].tr(p[9]).tr(p[0]).tr(p[1]).tr(s[9]),
            s[2].tr(p[0]).tr(p[1]).tr(p[2]).tr(s[0]),
            s[3].tr(p[1]).tr(p[2]).tr(p[3]).tr(s[1])
        );
    }

    function dWheelNext(exp) {
        const p = pWheels[exp].w;
        const d = dWheels[exp].w;
        //console.log(`(${d[0].tr(p[0])}, ${d[1].tr(p[1])}, ${d[2].tr(p[2])}`);
        return new Wheel(d[0].tr(p[0]), d[1].tr(p[1]), d[2].tr(p[2]));
    }

    // Wheel[0] is undefined
    const pWheels = [null];
    const sWheels = [null];
    const tWheels = [null];
    const dWheels = [null];

    const pWheel1 = new Wheel(...pSeed);
    const sWheel1 = new Wheel(...sSeed);
    const tWheel1 = new Wheel(...tSeed);
    const dWheel1 = new Wheel(...dSeed);
    // console.log(`real P1[1]: ${pWheel1.string}`);
    // console.log(`real S1[1]: ${sWheel1.string}`);
    // console.log(`real T1[1]: ${tWheel1.string}`);
    // console.log(`real D1[1]: ${dWheel1.string}`);

    // Wheel[1] = Wheel1
    pWheels.push(pWheel1);
    sWheels.push(sWheel1);
    tWheels.push(tWheel1);
    dWheels.push(dWheel1);

    const wheelMax = 10;
    for (let i = 1; i <= wheelMax; i++) {
        pWheels.push(pWheelNext(i));
        sWheels.push(sWheelNext(i));
        tWheels.push(tWheelNext(i));
        dWheels.push(dWheelNext(i));
    }

    return [pWheels, sWheels, tWheels, dWheels];
}

/**
 * Return a shape wheel based on a minimal set of
 * shapes. The shapes with five fold symmetry only need
 * up as input. All others require element 0, 1 and 2 positions.
 * aka up0, down3, up2
 */
function shapeWheel(up, won, too) {
    if (up) {
        if (won) {
            return [
                up.map((item) => item.copy),
                won.map((item) => item.copy),
                too.map((item) => item.copy),
                too.map((item) => item.vr),
                won.map((item) => item.vr),
                up.map((item) => item.vr),
                won.map((item) => item.neg),
                too.map((item) => item.neg),
                too.map((item) => item.hr),
                won.map((item) => item.hr),
            ];
        }
        return [
            up.map((item) => item.copy),
            up.map((item) => item.vr),
            up.map((item) => item.copy),
            up.map((item) => item.vr),
            up.map((item) => item.copy),
            up.map((item) => item.vr),
            up.map((item) => item.copy),
            up.map((item) => item.vr),
            up.map((item) => item.copy),
            up.map((item) => item.vr),
        ];
    }
    return [];
}

/***
 * shapeWheel M is a little bit stupid.
 * The only difference is how reflections are done
 */
function shapeWheelMosaic(up, won, too) {
    if (up) {
        if (won) {
            return [
                up.map((item) => item.copy),
                won.map((item) => item.copy),
                too.map((item) => item.copy),
                too.map((item) => item.vrm),
                won.map((item) => item.vrm),
                up.map((item) => item.vrm),
                won.map((item) => item.negm),
                too.map((item) => item.negm),
                too.map((item) => item.hrm),
                won.map((item) => item.hrm),
            ];
        }
        return [
            up.map((item) => item.copy),
            up.map((item) => item.vrm),
            up.map((item) => item.copy),
            up.map((item) => item.vrm),
            up.map((item) => item.copy),
            up.map((item) => item.vrm),
            up.map((item) => item.copy),
            up.map((item) => item.vrm),
            up.map((item) => item.copy),
            up.map((item) => item.vrm),
        ];
    }
    return [];
}

/**
 * A clustered set of globals
 * Cannot say whether it was a good idea to cluster them
 * Added cookie handling
 */
export class Controls {
    constructor(fifths, typeIndex, isDown) {
        this.fifths = fifths;
        this.typeIndex = typeIndex;
        this.isDown = isDown;
        this.fifths = cookie.getFifths(fifths);
        this.typeIndex = cookie.getTypeIndex(typeIndex);
        this.isDown = cookie.getIsDown(isDown);
    }
    bumpFifths() {
        this.fifths = norm(this.fifths + 1);
        cookie.setFifths(this.fifths);
    }

    get typeName() {
        return this.typeList[this.typeIndex].name;
    }
    bumpType() {
        this.typeIndex = (this.typeIndex + 1) % this.typeList.length;
        cookie.setTypeIndex(this.typeIndex);
    }
    get direction() {
        return this.isDown ? "Down" : "Up";
    }
    toggleDirection() {
        this.isDown = !this.isDown;
        cookie.setIsDown(this.isDown);
    }

    // eww, should add the decagon?
    typeList = [
        penrose.Pe1,
        penrose.Pe3,
        penrose.Pe5,
        penrose.St1,
        penrose.St3,
        penrose.St5,
    ];
}

/**
 * cookie logic from  https://javascript.info/cookie
 * @param {*} name
 * @returns
 */
// returns the cookie with the given name,
// or undefined if not found
function getCookie(name) {
    let matches = document.cookie.match(
        new RegExp(
            "(?:^|; )" +
                name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, "\\$1") +
                "=([^;]*)"
        )
    );
    return matches ? decodeURIComponent(matches[1]) : undefined;
}

// Good option is {"max-age": 3600}  // one hour
function setCookie(name, value, options = {}) {
    options = {
        path: "/",
        SameSite: "strict",
        // add other defaults here if necessary
        ...options,
    };

    if (options.expires instanceof Date) {
        options.expires = options.expires.toUTCString();
    }

    let updatedCookie =
        encodeURIComponent(name) + "=" + encodeURIComponent(value);

    for (let optionKey in options) {
        updatedCookie += "; " + optionKey;
        let optionValue = options[optionKey];
        if (optionValue !== true) {
            updatedCookie += "=" + optionValue;
        }
    }

    document.cookie = updatedCookie;
}
function deleteCookie(name) {
    setCookie(name, "", {
        "max-age": -1,
    });
}

// The cookie interface
export const cookie = (function () {
    const Cookie = {};

    Cookie.getShapeMode = function (sm) {
        const cookie = getCookie("shape-mode");
        if (cookie) {
            return cookie;
        }
        return sm;
    };
    Cookie.setShapeMode = function (sm) {
        setCookie("shape-mode", sm, { "max-age": 3600 });
    };

    Cookie.getActiveButtonIndex = function (index) {
        const cookie = getCookie("active-button-index");
        if (cookie) {
            return cookie;
        }
        return index;
    };
    Cookie.setActiveButtonIndex = function (index) {
        setCookie("active-button-index", index, { "max-age": 3600 });
    };

    Cookie.getFifths = function (fifths) {
        return fifths;
    };
    Cookie.getIsDown = function (isDown) {
        return isDown;
    };
    Cookie.getTypeIndex = function (index) {
        return index;
    };
    Cookie.setFifths = function (fifths) {};
    Cookie.setIsDown = function (isDown) {};
    Cookie.setTypeIndex = function (index) {};

    return Cookie;
})();

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

/**
 * This is stuff that is not specific to the mode or the default
 */
class Penrose {
    constructor() {
        // Default colors
        const ORANGE = "#e46c0a";
        const BLUE = "#0000ff";
        const YELLOW = "#ffff00";

        this.ORANGE_PENTA = "Pe1";
        this.BLUE_STAR = "St5";
        this.YELLOW_PENTA = "Pe3";
        this.BLUE_PENTA = "Pe5";
        this.BLUE_BOAT = "St3";
        this.BLUE_DIAMOND = "St1";

        this.OUTLINE = "#4a7eba";

        this.up = [0, 2, 4, 6, 8]; //
        this.down = [5, 7, 9, 1, 3];

        this.Pe5 = {
            name: "Pe5",
            color: [
                this.YELLOW_PENTA,
                this.YELLOW_PENTA,
                this.YELLOW_PENTA,
                this.YELLOW_PENTA,
                this.YELLOW_PENTA,
            ],
            twist: [0, 0, 0, 0, 0],
            defaultColor: BLUE,
            diamond: [],
        };
        this.Pe3 = {
            name: "Pe3",
            color: [
                this.YELLOW_PENTA,
                this.YELLOW_PENTA,
                this.ORANGE_PENTA,
                this.ORANGE_PENTA,
                this.YELLOW_PENTA,
            ],

            twist: [0, 0, -1, 1, 0],
            defaultColor: YELLOW,
            diamond: [0],
        };
        this.Pe1 = {
            name: "Pe1",
            color: [
                this.YELLOW_PENTA,
                this.ORANGE_PENTA,
                this.ORANGE_PENTA,
                this.ORANGE_PENTA,
                this.ORANGE_PENTA,
            ],
            twist: [0, -1, 1, -1, 1],
            defaultColor: ORANGE,
            diamond: [1, 4],
        };
        // for stars, the color indicates existence.
        this.St5 = {
            name: "St5: star",
            color: [
                this.BLUE_STAR,
                this.BLUE_STAR,
                this.BLUE_STAR,
                this.BLUE_STAR,
                this.BLUE_STAR,
            ],
            defaultColor: BLUE,
        };
        this.St3 = {
            name: "St3: boat",
            color: [this.BLUE_STAR, this.BLUE_STAR, null, null, this.BLUE_STAR],
            defaultColor: BLUE,
        };
        this.St1 = {
            name: "St1: diamond",
            color: [this.BLUE_STAR, null, null, null, null],
            defaultColor: BLUE,
        };
        this.mosaic = mosaic;
        this.quadrille = quadrille;
        this.real = real;
    }
}
export const penrose = new Penrose();
