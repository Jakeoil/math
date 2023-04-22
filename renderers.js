import { Bounds } from "./bounds.js";
import { globals } from "./controls.js";
import { measureTaskGlobals } from "./controls.js";
import { penrose } from "./penrose.js";
import { p } from "./point.js";
import * as THREE from "three";
import { USE_FUNCTION_LIST } from "./penrose-screen.js";
import { lerp } from "./penrose-screen.js";
import { Color, ShapeGeometry } from "three";

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
        g.save();
        g.fillStyle = fill; //e.g penrose.ORANGE;
        g.strokeStyle = penrose.OUTLINE;

        //const bounds = new Bounds();
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
        }
        g.restore();
    }

    /***
     * Used for quadrille
     *
     */
    outline(fill, offset, shape) {
        const { pentaStyle } = globals;
        const { g, scale } = this;
        g.save();

        if (!pentaStyle || pentaStyle.stroke == pentaStyle.SOLID) {
            g.strokeStyle = "#000000";
            g.lineWidth = 1;
        }

        if (!pentaStyle || pentaStyle.fill == pentaStyle.SOLID) {
            g.fillStyle = fill;
        } else if (pentaStyle && pentaStyle.fill == pentaStyle.TRANSPARENT) {
            g.fillStyle = fill + "80";
        }

        let start = true;
        for (const point of shape) {
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
        }
        g.closePath();

        // fill by default
        if (!pentaStyle || pentaStyle.fill != pentaStyle.NONE) {
            g.fill();
        }
        if (!pentaStyle || pentaStyle.stroke != pentaStyle.NONE) {
            g.stroke();
        }
        g.restore();
    }

    /**
     * Draw a 2 size x 2 size grid matching the scale
     * @param {point} offset - Point indicating center of grid
     * @param {*} size
     */
    grid(offset, size) {
        const { g, scale } = this;
        g.save();
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

        g.restore();
    }

    line(loc, end, strokeStyle) {
        const { g, scale } = this;
        const currentWidth = g.lineWidth;
        const currentStrokeStyle = g.strokeStyle;
        g.strokeStyle = strokeStyle ? strokeStyle : "black";
        g.lineWidth = 1;
        g.beginPath();
        g.moveTo(loc.x * scale, loc.y * scale);
        g.lineTo(end.x * scale, end.y * scale);
        g.stroke();

        g.lineWidth = currentWidth;
        g.strokeStyle = currentStrokeStyle;
    }

    getGradient(fill, offset, shape, isHeads) {
        const { g, scale } = this;

        const point0 = shape[0].tr(offset).mult(scale);
        const point1 = shape[2].tr(offset).mult(scale);
        const canvasGradient = g.createLinearGradient(
            point0.x,
            point0.y,
            point1.x,
            point1.y
        );
        if (isHeads) {
            canvasGradient.addColorStop(0, "#fff");
            canvasGradient.addColorStop(2 / 3, fill);
            // color stop 1 has to be 1/3 of the way to "#000"
            const endColor = lerp(fill, "#000", 1 / 3);
            canvasGradient.addColorStop(1, endColor);
        } else {
            canvasGradient.addColorStop(0, "#000");
            canvasGradient.addColorStop(2 / 3, fill);
            const endColor = lerp(fill, "#fff", 1 / 3);
            canvasGradient.addColorStop(1, endColor);
        }
        return canvasGradient;
    }

    rhombus(fill, offset, shape, strokeStyle, isHeads) {
        const { g, scale } = this;
        const { rhombStyle } = { ...globals, ...measureTaskGlobals };
        g.save();
        let gradient = rhombStyle.fill == rhombStyle.GRADIENT;
        g.strokeStyle = strokeStyle ? strokeStyle : "black";
        switch (rhombStyle.fill) {
            case rhombStyle.GRADIENT:
                g.fillStyle = this.getGradient(fill, offset, shape, isHeads);
                break;
            case rhombStyle.TRANSPARENT:
                g.fillStyle = fill + "40"; //
                break;
            default:
                g.fillStyle = fill;
        }
        g.lineWidth = scale < 5 ? 1 : 2;
        let start = true;
        for (const point of shape) {
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
        }

        g.closePath();
        if (rhombStyle.fill != rhombStyle.NONE) {
            g.fill();
        }
        if (rhombStyle.stroke != rhombStyle.NONE) {
            g.stroke();
        }
        g.restore();
    }

    render(renderList) {
        if (USE_FUNCTION_LIST) {
            for (const item of renderList) {
                item(this);
            }
        } else {
            this.render2(renderList);
        }
    }
    render2(renderList) {
        for (const item of renderList) {
            switch (item.command) {
                case "outline":
                    this.outline(item.fill, item.loc, item.shape);
                    break;
                case "figure":
                    this.figure(item.fill, item.loc, item.shape);
                    break;
                case "grid":
                    this.grid(item.offset, item.size);
                    break;
                case "line":
                    this.line(item.loc, item.end, item.strokeStyle);
                    break;
                case "rhombus":
                    this.rhombus(
                        item.fill,
                        item.offset,
                        item.shape,
                        item.strokeStyle,
                        item.isHeads
                    );
                    break;
            }
        }
    }
}

/**
 * This takes a canvas as input.
 * The canvas has a width and a height
 * This is basically the 3js scene.
 * It creates the renderer. Should it.
 */
export class ThreeJsContext {
    _fillStyle = "white";
    _fov = 45;
    constructor(canvas) {
        this.renderer = new THREE.WebGLRenderer({ canvas });
        this._fillRect = [0, 0, canvas.width, canvas.height];
        const fov = 45;
        const aspect = canvas.width / canvas.height; // the canvas default
        const near = 0.1;
        const far = 1000;
        this.camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
        //this.camera.position.set(0, 50, 0);
        //this.camera.up.set(0, 0, 1); // Set this much further
        //this.camera.lookAt(0, 0, 0); // Point at center of canvas.
        this.scene = new THREE.Scene();
    }
    fillRect(x, y, w, h) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
    }
    add(mesh) {
        this.scene.add(mesh);
    }
}
/**
 * Test code for threejs proposal
 *
 * g contains.
 */
export class ThreeJsRenderer {
    constructor(g, scale) {
        this.g = g;
        this.scale = scale;
    }
    /**
     * This is where the 3js scene stored in g gets drawn on the screen.
     * The commands and size of the scene are stored in bounds.
     * The camera is build here. It should be placed based on the scale.
     * @param {*} canvas
     * @param {*} bounds
     */
    finish(canvas, bounds) {
        // Compute the target from bounds.
        const FOV = 60;
        const aspect = canvas.width / canvas.height;
        const camera = new THREE.PerspectiveCamera(FOV, aspect, 1, 1000);
        camera.position.set(
            bounds.center.x,
            bounds.center.y,
            bounds.diagonal * 4
        );
        this.g.renderer.render(this.g.scene, camera);
    }

    render(renderList) {
        for (const item of renderList) {
            item(this);
        }
    }

    figure(fill, offset, shape) {
        const { g, scale } = this;
        g.fillStyle = fill;
    }
    outline(fill, offset, shape) {
        const { pentaStyle } = globals;
        const { g, scale } = this;

        // fill by default
        if (!pentaStyle || pentaStyle.fill != pentaStyle.NONE) {
            const figure = new THREE.Shape();
            //const bounds = new Bounds();
            let start = true;
            for (const point of shape) {
                if (start) {
                    figure.moveTo(
                        (point.x + offset.x) * scale,
                        (point.y + offset.y) * scale
                    );
                    start = false;
                } else {
                    figure.lineTo(
                        (point.x + offset.x) * scale,
                        (point.y + offset.y) * scale
                    );
                }
            }
            const geometry = new ShapeGeometry(figure);
            const mesh = new THREE.Mesh(
                geometry,
                new THREE.MeshBasicMaterial({
                    color: fill,
                    side: THREE.DoubleSide,
                })
            );
            g.add(mesh);
        }
        if (!pentaStyle || pentaStyle.stroke != pentaStyle.NONE) {
            const material = new THREE.LineBasicMaterial({
                color: "#000000",
            });
            const points = [];
            for (const point of shape) {
                points.push(
                    new THREE.Vector3(
                        (point.x + offset.x) * scale,
                        (point.y + offset.y) * scale,
                        0
                    )
                );
            }
            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            const line = new THREE.LineLoop(geometry, material);
            g.add(line);
        }
    }

    grid(offset, size) {}
    /**
     *
     * @param {*} loc
     * @param {*} end
     * @param {*} strokeStyle
     */
    line(loc, end, strokeStyle) {
        const material = new THREE.LineBasicMaterial({
            color: strokeStyle,
        });

        const points = [];
        const z = 0;
        points.push(new THREE.Vector3(...[...loc.toLoc, z]));
        points.push(new THREE.Vector3(...[...end.toLoc, z]));

        const geometry = new THREE.BufferGeometry().setFromPoints(points);

        const line = new THREE.Line(geometry, material);
        this.g.scene.add(line);
    }

    rhombus(fill, offset, shape, strokeStyle, isHeads) {}
}
