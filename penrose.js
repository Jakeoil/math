"use strict";

console.log("penrose.js");
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
    tr = (v) => new P(this.x + v.x, this.y + v.y);
    // Vertical and Horizontal reflection
    vr = () => new P(this.x, -this.y);
    hr = () => new P(-this.x, this.y);
    // If used, strictly for offsets
    div = (d) => new P(this.x / d, this.y / d);
    mult = (m) => new P(this.x * m, this.y * m);
    // Sometimes you need to create new ones
    copy = (d) => new P(this.x, this.y);
    //
    toLoc = () => [this.x, this.y];
    toString() {
        return JSON.stringify(this);
    }
    equals = (b) => this.x == b.x && this.y == b.y;
}

/**
 * Convenience functions
 * Mostly due to the fact that I chose and object format
 * rather than an ordered pair
 */
const toP = (loc) => new P(loc[0], loc[1]);
const p = (x, y) => new P(x, y);
const norm = (n) => ((n % 5) + 5) % 5;
function tenths(fifths, isDown) {
    return (fifths * 2 + (isDown ? 5 : 0)) % 10;
}

/**
 * Mutable class
 * This measures and adjusts the bounding rectangle.
 * Only the element drawing function (figure) creates a new bounds and returns
 * either a Bounds with the max min or null max min if nothing got drawn.
 */
class Bounds {
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
            this.minPoint = logicalPoint.copy();
            this.maxPoint = logicalPoint.copy();
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
    toString() {
        return JSON.stringify(this);
    }
}

/**
 * Creates a 10 point wheel out of the first three coordinates (or Ps)
 * Input is up[0], down[3], up[1]
 */
class Wheel {
    constructor(p0, p1, p2) {
        this.list = [
            p0.copy(),
            p1.copy(),
            p2.copy(),
            p2.vr(),
            p1.vr(),
            p0.vr(),
            p1.vr().hr(),
            p2.vr().hr(),
            p2.hr(),
            p1.hr(),
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
        return JSON.stringify(this.w.map((it) => [it.x, it.y]));
    }
    // get stringCoord(){ not needed?
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
                up.map((item) => item.copy()),
                won.map((item) => item.copy()),
                too.map((item) => item.copy()),
                too.map((item) => item.vr()),
                won.map((item) => item.vr()),
                up.map((item) => item.vr()),
                won.map((item) => item.vr().hr()),
                too.map((item) => item.vr().hr()),
                too.map((item) => item.hr()),
                won.map((item) => item.hr()),
            ];
        }
        return [
            up.map((item) => item.copy()),
            up.map((item) => item.vr()),
            up.map((item) => item.copy()),
            up.map((item) => item.vr()),
            up.map((item) => item.copy()),
            up.map((item) => item.vr()),
            up.map((item) => item.copy()),
            up.map((item) => item.vr()),
            up.map((item) => item.copy()),
            up.map((item) => item.vr()),
        ];
    }
    return [];
}

/**
 * A clustered set of globals
 * Cannot say whether it was a good idea to cluster them
 * Added cookie handling
 */
class Controls {
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
var cookie = (function () {
    const Cookie = {};
    Cookie.getShapeMode = function (sm) {
        console.log(`getShapeMode: ${document.cookie}`);
        const cookie = getCookie("shape-mode");
        if (cookie) {
            console.log(`found: ${document.cookie}`);
            return cookie;
        }
        return sm;
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
    Cookie.setShapeMode = function (sm) {
        console.log(`setShapeMode(${sm}): ${document.cookie}`);
        setCookie("shape-mode", sm, { "max-age": 3600 });
        console.log(`cookie set: ${document.cookie}`);
    };
    Cookie.setFifths = function (fifths) {};
    Cookie.setIsDown = function (isDown) {};
    Cookie.setTypeIndex = function (index) {};

    return Cookie;
})();
/**
 * This should be easy, we just need drawing of the regular pentagon.
 */
var real = (function () {
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
     *                              u0
     *                               *
     *                     d2 *             * d3
     *
     *                   u4 *                 * u1
     *                               o
     *                   d1 *                 * d4
     *
     *                     u3 *            * u2
     *                               *
     *                              d0
     *
     */
    const SQRT5 = Math.sqrt(5); // 2.236
    const PHI = (SQRT5 + 1) / 2; // 1.618
    const sqrt = Math.sqrt;
    const stringify = JSON.stringify;
    console.log(`sqrt5: ${SQRT5}, PHI: ${PHI}`);

    // Here are the computed points of an up pentagon with bigR = 1

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

    console.log(`s1: ${s_1}, c1: ${c_1}`);
    console.log(`s2: ${s_2}, c2: ${c_2}`);

    /**
     * Adjusts the proportions of the object
     * @param {*} variables
     *
     * @param {*} input
     * @param {*} target
     */
    function solve(variables, inputKey, value, target) {
        if (!variables) {
            return null;
        }
        let oldValue = variables[inputKey];
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
        let oldResult = variables[target];
        if (oldResult) {
            return oldResult * factor;
        } else {
            let newVariables = {};
            let keys = Object.keys(variables);
            for (const key of keys) {
                newVariables[key] = variables[key] * factor;
            }
            return newVariables;
        }
    }

    // side of unit circle R_unitCircle
    const unitPentagonSide = 2 * s_2; // this is little_a_pent
    console.log(`Unit pentagon side: ${unitPentagonSide}`); // 1.177
    // Unit circle units to a = 4
    const a = 4; // desired length of side
    const norm4 = (it) => (it * a) / unitPentagonSide;
    // pgon.R = 1;
    const unitUp = [
        [s_0, -c_0],
        [s_1, -c_1],
        [s_2, c_2],
        [-s_2, c_2],
        [-s_1, -c_1],
    ].map(toP);

    const uPgon = {
        a: 2 * s_2,
        R: 1.0,
    };
    console.log(`uPgon: ${stringify(uPgon)}`);

    const R = solve(uPgon, "a", 4, "R");
    console.log(`R old: ${uPgon.R}, R: ${R}`);

    const vs = solve(uPgon, "a", 4);
    console.log(`old: ${stringify(uPgon.R)}, new : ${stringify(vs)}`);

    // The proportions of the relevent pgon parts.
    const pgon = {
        a: 1.0,
        R: sqrt(50 + 10 * SQRT5) / 10, // .8507
        r: sqrt(25 + 10 * SQRT5) / 10, // .688
        x: sqrt(25 - 10 * SQRT5) / 10, // .162
    };
    console.log(`pgon: ${stringify(pgon)}`);

    const pentaUp = unitUp.map((item) => item.mult(R));

    // okay, let's do the pentagram now.
    // In the pentagram diagram the center pentagon has side littleB.
    // The star arm has side littleA, this corresponds to unitPentagonSide
    // 2 * littleA * littleB = 1;
    // But first, our anchor: bigR. This _was_ 1 above, but now it's

    const pgram = {
        a: (3 - SQRT5) / 2, // .382
        b: SQRT5 - 2, // .236
        R: sqrt((25 - 11 * SQRT5) / 10), // .2008
        r: sqrt((5 - 2 * SQRT5) / 5) / 2, // .162
        rho: sqrt((5 - SQRT5) / 10), // .525
    };
    console.log(`pgram: ${stringify(pgram)}`);

    const newPgram = solve(pgram, "a", 4);
    console.log(`newPgram: ${stringify(newPgram)}`);
    // t table uses gramBigR + the BigR of the a pentagon. ahee!
    const starTips = unitUp.map((it) => it.mult(newPgram.rho));
    console.log(`startTips: ${stringify(starTips)}`);
    // a correspond
    // The pentagram tips
    const rho4 = (it) => (it / pgram.rho) * 4;
    const t0 = [s_0, -c_0].map(rho4);
    const t1 = [s_1, -c_1].map(rho4);
    const t2 = [s_2, c_2].map(rho4);
    const t3 = [-s_2, c_2].map(rho4);
    const t4 = [-s_1, -c_1].map(rho4);

    // The pentagram dimples
    const starDimples = unitUp.map((it) => it.mult(newPgram.R));
    console.log(`starDimples: ${stringify(starDimples)}`);
    const r4 = (it) => it * 4;
    const pc0 = [s_0, -c_0].map(r4);
    const pc1 = [s_1, -c_1].map(r4);
    const pc2 = [s_2, c_2].map(r4);
    const pc3 = [-s_2, c_2].map(r4);
    const pc4 = [-s_1, -c_1].map(r4);

    //const R = (Math.sqrt(50 + 10 * SQRT5) * a) / 10;

    //const r = (Math.sqrt(25 + 10 * SQRT5) * a) / 10;

    // the length of the side here is
    // side is greater than on. I we want to normalize to 4.

    //const pentaUp = [u0, u1, u2, u3, u4].map(toP);
    console.log(`pentaUp: ${pentaUp}`);
    const starUp = [
        starTips[0],
        starTips[2],
        starTips[4],
        starTips[1],
        starTips[3],
    ];
    //    const starUp = [t0, t2, t4, t1, t3].map(toP);
    console.log(`starUp:`);
    // !!! fake
    // prettier-ignore
    // const starUp = [
    //      [0, -6], [1, -2], [5, -2], [2, 0], [3, 4],
    //      [0, 2], [-3, 4], [-2, 0], [-5, -2], [-1, -2],
    //  ].map(toP);
    const diamondUp = [pc0, pc1, pc2, pc3, pc4].map(toP);
    // prettier-ignore
    //const diamondUp = [
    //    [0, -6], [1, -2], [0, 2], [-1, -2]
    //].map(toP);

    // prettier-ignore
    const diamondWon = [
        [3, -4], [0, -2], [-1, 2], [2, 0]
    ].map(toP);

    // prettier-ignore
    const diamondToo = [
        [5, -2], [2, 0], [-2, 0], [1, -2]
    ].map(toP);

    // prettier-ignore
    const boatUp = [
        [0, -6], [1, -2], [5, -2], [2, 0], [-2, 0], [-5, -2], [-1, -2]
    ].map(toP);

    // prettier-ignore
    const boatWon = [
        [3, -4], [2 , 0], [ 5,  2], [1, 2], [-2,0], [-3,-4],[0, -2]
    ].map(toP);
    // prettier-ignore
    const boatToo = [
        [5, -2], [2, 0], [3, 4],
        [0, 2],[-1, -2], [0, -6], [1, -2]
    ].map(toP);

    const Real = {};
    Real.penta = shapeWheel(pentaUp);
    Real.star = shapeWheel(starUp);
    Real.boat = shapeWheel(boatUp, boatWon, boatToo);
    Real.diamond = shapeWheel(diamondUp, diamondWon, diamondToo);

    return Real;
})();

//console.log(
//    `pentaUp: [${real.pentaUp[0]}],[${real.pentaUp[1]}],[${real.pentaUp[3]}],//[${real.pentaUp[3]}],[${real.pentaUp[4]}]`
//);
/**
 * This is the path model that would work on graph paper
 */
var quadrille = (function () {
    // prettier-ignore
    const pentaUp = [
        [0, -3], [3, -1], [2, 3], [-2, 3], [-3, -1]
    ].map(toP);

    // prettier-ignore
    const starUp = [
        [0, -6], [1, -2], [5, -2], [2, 0], [3, 4],
        [0, 2], [-3, 4], [-2, 0], [-5, -2], [-1, -2],
    ].map(toP);

    // prettier-ignore
    const diamondUp = [
        [0, -6], [1, -2], [0, 2], [-1, -2]
    ].map(toP);

    // prettier-ignore
    const diamondWon = [
        [3, -4], [0, -2], [-1, 2], [2, 0]
    ].map(toP);

    // prettier-ignore
    const diamondToo = [
        [5, -2], [2, 0], [-2, 0], [1, -2]
    ].map(toP);

    // prettier-ignore
    const boatUp = [
        [0, -6], [1, -2], [5, -2], [2, 0], [-2, 0], [-5, -2], [-1, -2]
    ].map(toP);

    // prettier-ignore
    const boatWon = [
        [3, -4], [2 , 0], [ 5,  2], [1, 2], [-2,0], [-3,-4],[0, -2]
    ].map(toP);
    // prettier-ignore
    const boatToo = [
        [5, -2], [2, 0], [3, 4],
        [0, 2],[-1, -2], [0, -6], [1, -2]
    ].map(toP);

    const Quadrille = {};

    Quadrille.penta = shapeWheel(pentaUp);
    Quadrille.star = shapeWheel(starUp);
    Quadrille.boat = shapeWheel(boatUp, boatWon, boatToo);
    Quadrille.diamond = shapeWheel(diamondUp, diamondWon, diamondToo);

    return Quadrille;
})();

var mosaic = (function () {
    // prettier-ignore
    var penta_up = [ [2,0],[3,0],
             [1,1],[2,1],[3,1],[4,1],
       [0,2],[1,2],[2,2],[3,2],[4,2],[5,2],
       [0,3],[1,3],[2,3],[3,3],[4,3],[5,3],
             [1,4],[2,4],[3,4],[4,4],
             [1,5],[2,5],[3,5],[4,5]]
    .map(toP);

    // prettier-ignore
    var diamond_up =[[0,0],[1,0],
                   [0,1],[1,1],
                   [0,2],[1,2],
                   [0,3],[1,3]]
    .map(toP);

    // prettier-ignore
    var diamond_too = [[1,0],[2,0],[3,0],[4,0],
               [0,1],[1,1],[2,1],[3,1]]
    .map(toP);

    // prettier-ignore
    var diamond_for = [[0,0],
                     [0,1],[1,1],
                           [1,2],[2,2],
                           [1,3],[2,3],
                                 [2,4],[3,4],
                                       [3,5]]
    .map(toP);

    // prettier-ignore
    var star_up =      [[3,0],[4,0],
                      [3,1],[4,1],
    [0,2],[1,2],[2,2],[3,2],[4,2],[5,2],[6,2],[7,2],
          [1,3],[2,3],[3,3],[4,3],[5,3],[6,3],
                [2,4],[3,4],[4,4],[5,4],
                [2,5],[3,5],[4,5],[5,5],
          [1,6],[2,6],            [5,6],[6,6],
          [1,7],                        [6,7]]
    .map(toP);

    // prettier-ignore
    var boat_up =      [[3,0],[4,0],
                      [3,1],[4,1],
    [0,2],[1,2],[2,2],[3,2],[4,2],[5,2],[6,2],[7,2],
          [1,3],[2,3],[3,3],[4,3],[5,3],[6,3]]
    .map(toP);

    // prettier-ignore
    var boat_too = [[0,0],[1,0],
                  [0,1],[1,1],
                  [0,2],[1,2],[2,2],[3,2],[4,2],
                  [0,3],[1,3],[2,3],[3,3],
                        [1,4],[2,4],
                        [1,5],[2,5],
                              [2,6],[3,6],
                                    [3,7]]
    .map(toP);

    // prettier-ignore
    var boat_for =       [[3,0],[4,0],[5,0],[6,0],
                  [2,1],[3,1],[4,1],[5,1],
            [1,2],[2,2],[3,2],[4,2],
            [1,3],[2,3],[3,3],[4,3],
      [0,4],[1,4],            [4,4],[5,4],
      [0,5],                        [5,5]]
      .map(toP);

    const Mosaic = {
        penta: [
            penta_up.map((item) => new P(item.x - 3, item.y - 3)),
            penta_up.map((item) => new P(-item.x + 2, -item.y + 2)),
            penta_up.map((item) => new P(item.x - 3, item.y - 3)),
            penta_up.map((item) => new P(-item.x + 2, -item.y + 2)),
            penta_up.map((item) => new P(item.x - 3, item.y - 3)),
            penta_up.map((item) => new P(-item.x + 2, -item.y + 2)),
            penta_up.map((item) => new P(item.x - 3, item.y - 3)),
            penta_up.map((item) => new P(-item.x + 2, -item.y + 2)),
            penta_up.map((item) => new P(item.x - 3, item.y - 3)),
            penta_up.map((item) => new P(-item.x + 2, -item.y + 2)),
        ],
        diamond: [
            diamond_up.map((item) => new P(item.x - 1, item.y - 4)),
            diamond_for.map((item) => new P(-item.x + 2, item.y - 4)),
            diamond_too.map((item) => new P(-item.x + 3, -item.y - 1)),
            diamond_too.map((item) => new P(-item.x + 3, item.y + 0)),
            diamond_for.map((item) => new P(-item.x + 2, -item.y + 3)),
            diamond_up.map((item) => new P(item.x - 1, item.y - 0)),
            diamond_for.map((item) => new P(item.x - 3, -item.y + 3)),
            diamond_too.map((item) => new P(item.x - 4, item.y - 0)),
            diamond_too.map((item) => new P(item.x - 4, -item.y - 1)),
            diamond_for.map((item) => new P(item.x - 3, item.y - 4)),
        ],
        //
        boat: [
            boat_up.map((item) => new P(item.x - 4, item.y - 4)),
            boat_for.map((item) => new P(item.x - 3, -item.y + 1)),
            boat_too.map((item) => new P(item.x - 1, item.y - 4)),
            boat_too.map((item) => new P(item.x - 1, -item.y + 3)),
            boat_for.map((item) => new P(item.x - 3, item.y - 2)),
            boat_up.map((item) => new P(item.x - 4, -item.y + 3)),
            boat_for.map((item) => new P(-item.x + 2, item.y - 2)),
            boat_too.map((item) => new P(-item.x + 0, -item.y + 3)),
            boat_too.map((item) => new P(-item.x + 0, item.y - 4)),
            boat_for.map((item) => new P(-item.x + 2, -item.y + 1)),
        ],

        //--
        star: [
            star_up.map((item) => new P(item.x - 4, item.y - 4)),
            star_up.map((item) => new P(-item.x + 3, -item.y + 3)),
            star_up.map((item) => new P(item.x - 4, item.y - 4)),
            star_up.map((item) => new P(-item.x + 3, -item.y + 3)),
            star_up.map((item) => new P(item.x - 4, item.y - 4)),
            star_up.map((item) => new P(-item.x + 3, -item.y + 3)),
            star_up.map((item) => new P(item.x - 4, item.y - 4)),
            star_up.map((item) => new P(-item.x + 3, -item.y + 3)),
            star_up.map((item) => new P(item.x - 4, item.y - 4)),
            star_up.map((item) => new P(-item.x + 3, -item.y + 3)),
        ],
    };

    // const Mosaic = {};

    //     Mosaic.penta = wheel(pentaUp);
    //     Mosaic.star = wheel(starUp);
    //     Mosaic.boat = wheel(boatUp, boatWon, boatToo);
    //     Mosaic.diamond = wheel(diamondUp, diamondWon, diamondToo);
    return Mosaic;
})();
// Build the api

var penrose = (function () {
    const ORANGE = "#e46c0a";
    const BLUE = "#0000ff";
    const YELLOW = "#ffff00";
    const BLUE_P = "#00f";

    const SHAPE_PENTA = "penta";
    const SHAPE_STAR = "star";
    const SHAPE_BOAT = "boat";
    const SHAPE_DIAMOND = "diamond";

    const pSeed = [p(0, -6), p(3, -4), p(5, -2)];
    const sSeed = [p(0, -5), p(3, -5), p(5, -1)];
    const tSeed = [p(0, -8), p(5, -8), p(8, -2)];
    const dSeed = [p(0, -3), p(2, -3), p(3, -1)];

    const Penrose = {};
    Penrose.ORANGE = ORANGE;

    // This is the core penrose object.
    return {
        // ORANGE: "#e46c0a",
        // BLUE: "#0000ff",
        // YELLOW: "#ffff00",
        // BLUE_P: "#00f", // Just making the string different
        ORANGE: ORANGE,
        BLUE: BLUE,
        YELLOW: YELLOW,
        BLUE_P: BLUE_P, // Just making the string different
        OUTLINE: "#4a7eba",

        up: [0, 2, 4, 6, 8], //
        down: [5, 7, 9, 1, 3],

        SHAPE_PENTA: SHAPE_PENTA,
        SHAPE_STAR: SHAPE_STAR,
        SHAPE_BOAT: SHAPE_BOAT,
        SHAPE_DIAMOND: SHAPE_DIAMOND,

        // Valid for QUADRILLE and MOSAIC.
        // Not for real,
        pSeed: pSeed,
        sSeed: sSeed,
        tSeed: tSeed,
        dSeed: dSeed,

        // Moved the shapes to mosaic

        Pe5: {
            name: "Pe5",
            color: [YELLOW, YELLOW, YELLOW, YELLOW, YELLOW],
            twist: [0, 0, 0, 0, 0],
            //shape: shapes.penta,
            shapeKey: SHAPE_PENTA,
            typeColor: BLUE_P,
            diamond: [],
        },
        Pe3: {
            name: "Pe3",
            color: [YELLOW, YELLOW, ORANGE, ORANGE, YELLOW],
            twist: [0, 0, -1, 1, 0],
            //            shape: shapes.penta,
            shapeKey: SHAPE_PENTA,
            typeColor: YELLOW,
            diamond: [0],
        },
        Pe1: {
            name: "Pe1",
            color: [YELLOW, ORANGE, ORANGE, ORANGE, ORANGE],
            twist: [0, -1, 1, -1, 1],
            //          shape: shapes.penta,
            shapeKey: SHAPE_PENTA,
            //            shapeKey: "penta",
            typeColor: ORANGE,
            diamond: [1, 4],
        },
        // for stars, the color indicates existence.
        St5: {
            name: "St5: star",
            color: [BLUE, BLUE, BLUE, BLUE, BLUE],
            //shape: shapes.star,
            shapeKey: SHAPE_STAR,
            typeColor: BLUE,
        },
        St3: {
            name: "St3: boat",
            color: [BLUE, BLUE, null, null, BLUE],
            //shape: shapes.boat,
            shapeKey: SHAPE_BOAT,
            typeColor: BLUE,
        },
        St1: {
            name: "St1: diamond",
            color: [BLUE, null, null, null, null],
            //shape: shapes.diamond,
            shapeKey: SHAPE_DIAMOND,
            typeColor: BLUE,
        },
    };
})();
