import { Bounds } from "./bounds.js";
import { globals } from "./controls.js";
import { penrose } from "./penrose.js";
import { p } from "./point.js";

import * as THREE from "./js/three.module.js";

export const isThree = (g) => g instanceof THREE.Scene;
export class CanvasRenderer {
    constructor(g, scale) {
        this.g = g;
        this.scale = scale;
    }
    /***
     * Used by Mosaic figure.
     * This is the routine that ultimately renders the 'tile'
     * @param {*} fill One of the colors
     * @param {*} offset Location in P format
     * @param {*} shape centered array of 'pixels' centered.
     * Prerequisites: Globals g and scale
     */
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

    /***
     * Used for quadrille
     *
     */
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
                g.moveTo((point.x + offset.x) * scale, (point.y + offset.y) * scale);
                start = false;
            } else {
                g.lineTo((point.x + offset.x) * scale, (point.y + offset.y) * scale);
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

    /**
     * Draw a 2 size x 2 size grid matching the scale
     * @param {point} offset - Point indicating center of grid
     * @param {*} size
     */
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
    }

    getGradient(fill, offset, shape, isHeads) {
        const { g, scale } = this;

        const point0 = shape[0].tr(offset).mult(scale);
        const point1 = shape[2].tr(offset).mult(scale);
        const canvasGradient = g.createLinearGradient(point0.x, point0.y, point1.x, point1.y);
        if (isHeads) {
            canvasGradient.addColorStop(0, "#fff");
            canvasGradient.addColorStop(2 / 3, fill);
            // color stop 1 has to be 1/3 of the way to "#000"
            const endColor = mix(fill, "#000", 1 / 3);
            canvasGradient.addColorStop(1, endColor);
        } else {
            canvasGradient.addColorStop(0, "#000");
            canvasGradient.addColorStop(2 / 3, fill);
            const endColor = mix(fill, "#fff", 1 / 3);
            canvasGradient.addColorStop(1, endColor);
        }
        return canvasGradient;
    }

    rhombus(fill, offset, shape, strokeStyle, isHeads) {
        const { g, scale } = this;
        const { rhombStyle } = globals;
        let currentStrokeStyle = g.strokeStyle;
        let currentLineWidth = g.lineWidth;
        let currentfillStyle = g.fillStyle;

        let gradient = rhombStyle.fill == rhombStyle.GRADIENT;
        let start = true;
        const bounds = new Bounds();
        g.strokeStyle = strokeStyle ? strokeStyle : "black";
        if (gradient) {
            g.fillStyle = this.getGradient(fill, offset, shape, isHeads);
        } else if (rhombStyle.fill == rhombStyle.TRANSPARENT) {
            g.fillStyle = fill + "40"; //
        } else {
            g.fillStyle = fill;
        }
        g.lineWidth = scale < 5 ? 1 : 2;
        for (const point of shape) {
            if (start) {
                g.beginPath();
                g.moveTo((point.x + offset.x) * scale, (point.y + offset.y) * scale);
                start = false;
            } else {
                g.lineTo((point.x + offset.x) * scale, (point.y + offset.y) * scale);
            }

            bounds.addPoint(offset, point);
        }

        g.closePath();
        if (rhombStyle.fill != rhombStyle.NONE) {
            g.fill();
        }
        if (rhombStyle.stroke != rhombStyle.NONE) {
            g.stroke();
        }

        g.strokeStyle = currentStrokeStyle;
        g.lineWidth = currentLineWidth;
        g.fillStyle = currentfillStyle;

        return bounds;
    }
}
export class threeRenderer {
    constructor(g, scale) {
        this.g = g;
        this.scale = scale;
    }

    figure(fill, offset, shape) {}
    outline(fill, offset, shape) {}
    grid(offset, size) {}
    line(loc, end, strokeStyle) {
        const material = new THREE.LineBasicMaterial({
            color: strokeStyle,
        });

        const points = [];
        const z = 0;
        points.push(new THREE.Vector3(...loc.toLoc(), z));
        points.push(new THREE.Vector3(...end.toLoc(), z));

        const geometry = new THREE.BufferGeometry().setFromPoints(points);

        const line = new THREE.Line(geometry, material);
        scene.add(line);
    }
    rhombus(fill, offset, shape, strokeStyle, isHeads) {}
}
