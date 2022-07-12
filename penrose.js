"use strict";

console.log("penrose.js");
/**
 * Orthoganal Penrose program version one.
 * These routines process a grid. They do not control rendering.
 *
 *
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
    // Sometimes you need to create new ones
    copy = (d) => new P(this.x, this.y);
    //
    toLoc = () => [this.x, this.y];
    toString() {
        return JSON.stringify(this);
    }
    equals = (b) => this.x == b.x && this.y == b.y;
}

class Coord {
    constructor(x, y) {
        this.coord = [x, y];
    }

    tr = (offset) => [this.coord[0] + offset[0], this.coord[1] + offset[1]];
    vr = () => [this.coord[0], -this.coord[1]];
    hr = () => [-this.coord[0], this.coord[1]];
    copy = [this.coord[0], this.coord[1]];
    equals = (that) =>
        this.coord[0] == that.coord[0] && this.coord[1] == that.coord[1];
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
 */
class Bounds {
    constructor() {
        this.maxPoint = null;
        this.minPoint = null;
    }

    /**
     * Called from figure
     * @param {*} offset
     * @param {*} point
     */
    addPoint(offset, point) {
        const logicalPoint = new P(offset.x + point.x, offset.y + point.y);
        if (!this.maxPoint || !this.minPoint) {
            this.minPoint = logicalPoint.copy(); // private copies, not references
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

    expand(bounds) {
        if (!bounds) {
            return;
        }

        if (!this.maxPoint || !this.minPoint) {
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
}

class BoundsCoord {
    constructor() {
        this.maxPoint = null;
        this.minPoint = null;
    }

    /**
     * Called from figure
     * @param {*} offset
     * @param {*} point
     */
    addPoint(offset, point) {
        const logicalPoint = point.tr(offset);
        if (!this.maxPoint || !this.minPoint) {
            this.minPoint = logicalPoint.copy(); // private copies, not references
            this.maxPoint = logicalPoint.copy();
            return;
        }

        if (logicalPoint[0] < this.minPoint[0]) {
            this.minPoint[0] = logicalPoint[0];
        } else if (logicalPoint[0] > this.maxPoint[0]) {
            this.maxPoint[0] = logicalPoint[0];
        }
        if (logicalPoint[1] < this.minPoint[1]) {
            this.minPoint[1] = logicalPoint[1];
        } else if (logicalPoint[1] > this.maxPoint[1]) {
            this.maxPoint[1] = logicalPoint[1];
        }
    }

    expand(bounds) {
        if (!bounds) {
            return;
        }

        if (!this.maxPoint || !this.minPoint) {
            this.minPoint = bounds.minPoint;
            this.maxPoint = bounds.maxPoint;
            return;
        }

        if (bounds.minPoint[0] < this.minPoint[0]) {
            this.minPoint[0] = bounds.minPoint[0];
        }
        if (bounds.minPoint[1] < this.minPoint[1]) {
            this.minPoint[1] = bounds.minPoint[1];
        }
        if (bounds.maxPoint[0] > this.maxPoint[0]) {
            this.maxPoint[0] = bounds.maxPoint[0];
        }
        if (bounds.maxPoint[1] > this.maxPoint[1]) {
            this.maxPoint[1] = bounds.maxPoint[1];
        }
    }
}

/**
 * Creates a 10 point wheel out of the first three coordinates (or Ps)
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

class Controls {
    constructor(fifths, type, isDown) {
        this.fifths = fifths;
        this.type = type;
        this.isDown = isDown;
    }
    bumpFifths() {
        this.fifths = norm(this.fifths + 1);
    }

    get typeName() {
        return this.typeList[this.type].name;
    }
    bumpType() {
        this.type = (this.type + 1) % this.typeList.length;
    }
    get direction() {
        return this.isDown ? "Down" : "Up";
    }
    toggleDirection() {
        this.isDown = !this.isDown;
    }

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
 * This is the path model that would work on graph paper
 */
var quadrille = (function () {
    // prettier-ignore
    const pentaUp = [
        [0, -3], [3, -1], [2, 3], [-2, 3], [-3, -1]
    ].map(function (item) {
        return new P(item[0], item[1]);
    });

    // prettier-ignore
    const starUp = [
        [0, -6], [1, -2], [5, -2], [2, 0], [3, 4],
        [0, 2], [-3, 4], [-2, 0], [-5, -2], [-1, -2],
    ].map(function(item){return new P(item[0],item[1])});

    // prettier-ignore
    const diamondUp = [
        [0, -6], [1, -2], [0, 2], [-1, -2]
    ].map(function(item){return new P(item[0],item[1])});

    // prettier-ignore
    const diamondWon = [
        [3, -4], [0, -2], [-1, 2], [2, 0]
    ].map(function (item) { return new P(item[0], item[1])});

    // prettier-ignore
    const diamondToo = [
        [5, -2], [2, 0], [-2, 0], [1, -2]
    ].map(function (item) { return new P(item[0], item[1]) });

    // prettier-ignore
    const boatUp = [
        [0, -6], [1, -2], [5, -2], [2, 0], [-2, 0], [-5, -2], [-1, -2]
    ].map(function(item){return new P(item[0],item[1])});

    // prettier-ignore
    const boatWon = [
        [3, -4], [2 , 0], [ 5,  2], [1, 2], [-2,0], [-3,-4],[0, -2]
    ].map(function(item){return new P(item[0],item[1])});
    // prettier-ignore
    const boatToo = [
        [5, -2], [2, 0], [3, 4],
        [0, 2],[-1, -2], [0, -6], [1, -2]
    ].map(function (item) { return new P(item[0], item[1]) });

    const Quadrille = {};

    Quadrille.penta = wheel(pentaUp);
    Quadrille.star = wheel(starUp);
    Quadrille.boat = wheel(boatUp, boatWon, boatToo);
    Quadrille.diamond = wheel(diamondUp, diamondWon, diamondToo);

    /**
     * Return a shape wheel based on the shape
     * @param {} up
     * @param {*} won
     * @param {*} two
     * @returns
     */
    function wheel(up, won, too) {
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

    return Quadrille;
})();

// Build the api
var penrose = (function () {
    var id;
    var offset = {};

    // prettier-ignore
    var penta_up = [ [2,0],[3,0],
             [1,1],[2,1],[3,1],[4,1],
       [0,2],[1,2],[2,2],[3,2],[4,2],[5,2],
       [0,3],[1,3],[2,3],[3,3],[4,3],[5,3],
             [1,4],[2,4],[3,4],[4,4],
             [1,5],[2,5],[3,5],[4,5]]
    .map(function(item){return new P(item[0],item[1])});

    // prettier-ignore
    var diamond_up =[[0,0],[1,0],
                   [0,1],[1,1],
                   [0,2],[1,2],
                   [0,3],[1,3]]
    .map(function(item){return new P(item[0],item[1])});

    // prettier-ignore
    var diamond_too = [[1,0],[2,0],[3,0],[4,0],
               [0,1],[1,1],[2,1],[3,1]]
    .map(function(item){return new P(item[0],item[1])});

    // prettier-ignore
    var diamond_for = [[0,0],
                     [0,1],[1,1],
                           [1,2],[2,2],
                           [1,3],[2,3],
                                 [2,4],[3,4],
                                       [3,5]]
    .map(function(item){return new P(item[0],item[1])});

    // prettier-ignore
    var star_up =      [[3,0],[4,0],
                      [3,1],[4,1],
    [0,2],[1,2],[2,2],[3,2],[4,2],[5,2],[6,2],[7,2],
          [1,3],[2,3],[3,3],[4,3],[5,3],[6,3],
                [2,4],[3,4],[4,4],[5,4],
                [2,5],[3,5],[4,5],[5,5],
          [1,6],[2,6],            [5,6],[6,6],
          [1,7],                        [6,7]]
    .map(function(item){return new P(item[0],item[1])});

    // prettier-ignore
    var boat_up =      [[3,0],[4,0],
                      [3,1],[4,1],
    [0,2],[1,2],[2,2],[3,2],[4,2],[5,2],[6,2],[7,2],
          [1,3],[2,3],[3,3],[4,3],[5,3],[6,3]]
  .map(function(item){return new P(item[0],item[1])});

    // prettier-ignore
    var boat_too = [[0,0],[1,0],
                  [0,1],[1,1],
                  [0,2],[1,2],[2,2],[3,2],[4,2],
                  [0,3],[1,3],[2,3],[3,3],
                        [1,4],[2,4],
                        [1,5],[2,5],
                              [2,6],[3,6],
                                    [3,7]]
    .map(function(item){return new P(item[0],item[1])});

    // prettier-ignore
    var boat_for =       [[3,0],[4,0],[5,0],[6,0],
                  [2,1],[3,1],[4,1],[5,1],
            [1,2],[2,2],[3,2],[4,2],
            [1,3],[2,3],[3,3],[4,3],
      [0,4],[1,4],            [4,4],[5,4],
      [0,5],                        [5,5]]
  .map(function(item){return new P(item[0],item[1])});

    const ORANGE = "#e46c0a";
    const BLUE = "#0000ff";
    const YELLOW = "#ffff00";

    const shapes = {
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
    // This is the core penrose object.
    return {
        ORANGE: "#e46c0a",
        BLUE: "#0000ff",
        YELLOW: "#ffff00",
        OUTLINE: "#4a7eba",

        up: [0, 2, 4, 6, 8], //
        down: [5, 7, 9, 1, 3],
        // okay, 10 of each
        penta: shapes.penta,
        diamond: shapes.diamond,
        boat: shapes.boat,

        //--
        star: shapes.star,

        Pe5: {
            name: "Pe5",
            color: [YELLOW, YELLOW, YELLOW, YELLOW, YELLOW],
            twist: [0, 0, 0, 0, 0],
            shape: shapes.penta,
            typeColor: BLUE,
            diamond: [],
        },
        Pe3: {
            name: "Pe3",
            color: [YELLOW, YELLOW, ORANGE, ORANGE, YELLOW],
            twist: [0, 0, -1, 1, 0],
            shape: shapes.penta,
            typeColor: YELLOW,
            diamond: [0],
        },
        Pe1: {
            name: "Pe1",
            color: [YELLOW, ORANGE, ORANGE, ORANGE, ORANGE],
            twist: [0, -1, 1, -1, 1],
            shape: shapes.penta,
            typeColor: ORANGE,
            diamond: [1, 4],
        },
        // for stars, the color indicates existence.
        St5: {
            name: "St5: star",
            color: [BLUE, BLUE, BLUE, BLUE, BLUE],
            shape: shapes.star,
            typeColor: BLUE,
        },
        St3: {
            name: "St3: boat",
            color: [BLUE, BLUE, null, null, BLUE],
            shape: shapes.boat,
            typeColor: BLUE,
        },
        St1: {
            name: "St1: diamond",
            color: [BLUE, null, null, null, null],
            shape: shapes.diamond,
            typeColor: BLUE,
        },
    };
})();
