"use strict";
import { real, quadrille, mosaic } from "./shape-modes.js";
import { p, P } from "./point.js";

export const stringify = JSON.stringify;

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
