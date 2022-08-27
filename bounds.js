import { p } from "./point.js";
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
     */
    addPoint(offset, point) {
        const logicalPoint = offset.tr(point);
        if (this.isEmpty) {
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

    get isEmpty() {
        return !this.maxPoint || !this.minPoint;
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
            console.log("expand: Figure returned null?");
            return;
        }

        if (bounds.isEmpty) {
            // figure didn't draw anything.
            return;
        }

        if (this.isEmpty) {
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
        if (this.isEmpty) {
            this.minPoint = p(0, 0);
            this.maxPoint = p(0, 0);
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

    // compatibility with rect.
    get x() {
        return this.isEmpty ? 0 : this.minPoint.x;
    }

    get y() {
        return this.isEmpty ? 0 : this.minPoint.y;
    }

    get width() {
        return this.isEmpty ? 0 : this.maxPoint.x + 1 - this.minPoint.x;
    }
    get height() {
        return this.isEmpty ? 0 : this.maxPoint.y + 1 - this.minPoint.y;
    }

    toString() {
        return `min: ${this.minPoint}, max: ${this.maxPoint}`;
    }
}

function testBounds() {
    console.log(`testBounds`);
    let bounds = new Bounds();
    console.log(
        `${bounds}, width: ${bounds.width}, height: ${bounds.height}, isEmpty: ${bounds.isEmpty}`
    );
    let offset = p(10, 10);
    bounds.addPoint(offset, p(-5, 6));
    console.log(
        `${bounds}, width: ${bounds.width}, height: ${bounds.height}, isEmpty: ${bounds.isEmpty}`
    );
    bounds.addPoint(offset, p(0, 50));
    console.log(
        `${bounds}, width: ${bounds.width}, height: ${bounds.height}, isEmpty: ${bounds.isEmpty}`
    );
    console.log(`${bounds.pad(1)}`);
    console.log(`${bounds.pad(1, 2, 3)}`);
    console.log(`${bounds.pad(1, 2, 3, 4)}`);
    console.log(`${bounds.pad(-10)}`);
    console.log(`${bounds.pad(-10)}`);
    console.log(`${bounds.pad(-10)}`);
}
//testBounds();
