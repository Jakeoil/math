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
        return p(this.minX, this.minY);
        // Oh shit. This is a dumb one.  Synonym for minPoint
    }
    set min(point) {
        this.minPoint = point;
    }
    get max() {
        return p(this.maxX, this.maxY);
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
