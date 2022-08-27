/**
 * Point and Utilities for convenience
 */
export const norm = (n) => ((n % 5) + 5) % 5;

/**
 * Orthoganal Penrose program version one.
 * These routines process a scaled grid. They do not control rendering.
 */
class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    // translate
    tr(v) {
        return new Point(this.x + v.x, this.y + v.y);
    }
    // Vertical and Horizontal reflection
    get vr() {
        return new Point(this.x, -this.y);
    }
    get hr() {
        return new Point(-this.x, this.y);
    }
    get neg() {
        return new Point(-this.x, -this.y);
    }
    // When reversing mosaics, the reflection is offset by 1
    // This is due to the rect bases not being in the upper left corner
    //
    get vrm() {
        return new Point(this.x, -1 - this.y);
    }
    get hrm() {
        return new Point(-1 - this.x, this.y);
    }
    get negm() {
        return new Point(-1 - this.x, -1 - this.y);
    }
    get copy() {
        return new Point(this.x, this.y);
    }
    // If used, strictly for offsets
    div(d) {
        return new Point(this.x / d, this.y / d);
    }
    mult(m) {
        return new Point(this.x * m, this.y * m);
    }
    // Not used?
    get toLoc() {
        return [this.x, this.y];
    }
    toString() {
        return JSON.stringify(this);
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
 * Mostly due to the fact that I chose an object format
 * rather than an ordered pair
 */
export function toP(loc) {
    return new Point(loc[0], loc[1]);
}
//export const toP = (loc) => new P(loc[0], loc[1]);
//const p = (x, y) => new P(x, y);
export function p(x, y) {
    return new Point(x, y);
}
