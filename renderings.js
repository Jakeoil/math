import { p, ang } from "./point.js";
import { Bounds } from "./bounds.js";
import { penrose } from "./penrose.js";
import { quadrille, mosaic } from "./shape-modes.js";

import { globals } from "./controls.js";
import { iface, PenroseScreen, USE_FUNCTION_LIST } from "./penrose-screen.js";
import { CanvasRenderer } from "./renderers.js";

/******************************************************************************
 * Screen Drawing Routines
 *****************************************************************************/

/***
 * Draws a little canvas with a shape.
 * Shape depends on passed in ID.
 */
export function makeCanvas(canvasId) {
    const { shapeMode } = globals;
    const canvas = document.getElementById(canvasId);
    if (!canvas) {
        console.log("ID not found");
        return;
    }

    const scene = new PenroseScreen(shapeMode.shapeMode);
    const penta = scene.penta.bind(scene);

    // Set up the parameters
    let gen = 0;
    let loc = p(0, 0);
    let [type, angle] =
        canvasId == "p5"
            ? [penrose.Pe5, ang(0, true)]
            : canvasId == "p3"
            ? [penrose.Pe3, ang(0, false)]
            : canvasId == "p1"
            ? [penrose.Pe1, ang(0, false)]
            : canvasId == "s5"
            ? [penrose.St5, ang(0, false)]
            : canvasId == "s3"
            ? [penrose.St3, ang(1, true)]
            : canvasId == "s1"
            ? [penrose.St1, ang(1, false)]
            : [];

    const layer = "rhomb"; // for second call

    function measure() {
        const bounds = new Bounds();
        bounds.expand(
            penta({
                type,
                angle,
                loc,
                gen,
            })
        );
        bounds.expand(
            penta({
                type,
                angle,
                loc,
                layer,
                gen,
            })
        );
        bounds.pad(0.1);
        bounds.round();
        return bounds;
    }

    // todo suppress bounds.renderList
    scene.setToMeasure();
    let bounds = measure();
    // Adjust the location and relist
    loc = loc.tr(bounds.minPoint.neg);
    scene.setToRender();
    bounds = measure();

    // Now render the commands stored in bounds
    let scale = 10;
    canvas.width = (bounds.width - 1) * scale;
    canvas.height = (bounds.height - 1) * scale;

    let g = canvas.getContext("2d");
    g.fillStyle = "transparent"; //"#ffffff";
    g.fillRect(0, 0, canvas.width, canvas.height);

    const renderer = new CanvasRenderer(g, scale);
    renderer.render(bounds.renderList);
}

/**
 * Called at end of draw cycle.  Redraws under the following conditions
 *   The size of the canvas is greater than the bounds
 *   (future) add a max bounds.
 *   Fix: canvas apparently stores an integer. Is it a floor round or ceiling.
 * @param {*} bounds
 * @param {*} canvas
 * @param {*} drawFunction
 */
function redraw(bounds, canvas, drawFunction, scale) {
    if (bounds.isEmpty) {
        console.log(`isEmpty`);
        return;
    }
    const computedWidth = bounds.maxPoint.x * scale + scale;
    const computedHeight = bounds.maxPoint.y * scale + scale;
    if (
        canvas.width != Math.floor(computedWidth) ||
        canvas.height != Math.floor(computedHeight)
    ) {
        canvas.width = computedWidth;
        canvas.height = computedHeight;
        setTimeout(drawFunction());
    }
}

/**
 * The first expansion draws penta(1) and star(1) variants
 * Sets the globals g and scale
 */
export function drawFirstInflation(id) {
    const page = document.querySelector(`#${id}`);
    if (page.style.display == "none") return;
    const canvas = document.querySelector(`#${id} > canvas`);
    if (!canvas) {
        console.log("canvasId is null!");
        return;
    }
    const { shapeMode } = globals;
    const scene = new PenroseScreen(shapeMode.shapeMode);
    const penta = scene.penta.bind(scene);
    const star = scene.star.bind(scene);

    const drawScreen = function () {
        let x = 8;
        let y = 9;
        const UP = false;
        const DOWN = true;

        const bounds = new Bounds();
        let type = penrose.Pe5;
        let angle = ang(0, UP);
        let loc = p(x, y);
        const gen = 1;
        const layer = "rhomb";

        bounds.expand(scene.pentaRhomb(type, angle, loc, gen));
        type = penrose.Pe5;
        angle = ang(0, DOWN);
        loc = p(25, y);

        bounds.expand(scene.pentaRhomb(type, angle, loc, gen));
        y += 18;

        type = penrose.Pe3;
        for (let i = 0; i < 5; i++) {
            angle = ang(i, UP);
            loc = p(x + i * 20, y);
            bounds.expand(scene.pentaRhomb(type, angle, loc, gen));
        }

        //bounds.dumpNodes(bounds.nodeList);
        y += 20;

        for (let i = 0; i < 5; i++) {
            angle = ang(i, DOWN);
            loc = p(x + i * 20, y);
            bounds.expand(penta({ type, angle, loc, gen }));
            bounds.expand(penta({ type, angle, loc, gen, layer }));
        }
        y += 20;
        type = penrose.Pe1;
        for (let i = 0; i < 5; i++) {
            angle = ang(i, UP);
            loc = p(x + i * 20, y);
            bounds.expand(penta({ type, angle, loc, gen }));
            bounds.expand(penta({ type, angle, loc, gen, layer }));
        }
        y += 20;
        for (let i = 0; i < 5; i++) {
            angle = ang(i, DOWN);
            loc = p(x + i * 20, y);
            bounds.expand(penta({ type, angle, loc, gen }));
            bounds.expand(penta({ type, angle, loc, gen, layer }));
        }
        y += 25;
        type = penrose.St5;
        angle = ang(0, UP);
        loc = p(15, y);

        bounds.expand(star({ type, angle, loc, gen }));
        bounds.expand(star({ type, angle, loc, gen, layer }));

        angle = ang(0, DOWN);
        loc = p(45, y);
        bounds.expand(star({ type, angle, loc, gen }));
        bounds.expand(star({ type, angle, loc, gen, layer }));

        x = 10;
        y += 30;

        type = penrose.St1;
        for (let i = 0; i < 5; i++) {
            angle = ang(i, UP);
            loc = p(x + i * 20, y);
            bounds.expand(star({ type, angle, loc, gen }));
            bounds.expand(star({ type, angle, loc, gen, layer }));
        }
        y += 25;
        for (let i = 0; i < 5; i++) {
            angle = ang(i, DOWN);
            loc = p(x + i * 20, y);
            bounds.expand(star({ type, angle, loc, gen }));
            bounds.expand(star({ type, angle, loc, gen, layer }));
        }

        x = 15;
        y += 25;
        type = penrose.St3;
        for (let i = 0; i < 5; i++) {
            angle = ang(i, UP);
            loc = p(x + i * 25, y);
            bounds.expand(star({ type, angle, loc, gen }));
            bounds.expand(star({ type, angle, loc, gen, layer }));
        }
        y += 25;
        for (let i = 0; i < 5; i++) {
            angle = ang(i, DOWN);
            loc = p(x + i * 25, y);
            bounds.expand(star({ type, angle, loc, gen }));
            bounds.expand(star({ type, angle, loc, gen, layer }));
        }

        // The second time through we render.

        resizeAndRender(scene, bounds, canvas, 10);
    };

    //scene.setToMeasure();
    //drawScreen();
    //scene.setToRender();
    drawScreen();
}

export function drawDualDemo(id) {
    const { shapeMode, controls } = globals;

    const bounds = new Bounds();
    const bounds2 = new Bounds();
    const scene = new PenroseScreen(shapeMode.shapeMode);

    let x = 8;
    let y = 9;
    const UP = false;
    const DOWN = true;
    let type = penrose.Pe5;
    let angle = ang(0, UP);
    let loc = p(x, y);
    let gen = 1;
    let rhomb = true;
    //bounds.expand(scene.penta({ type, angle, loc, gen }));

    bounds.expand(
        scene.penta({
            type: penrose.Pe5,
            angle: ang(0, false),
            loc: p(25, 25),
            gen: 3,
            layer: "penta",
        })
    );
    bounds2.expand(
        scene.penta({
            type: penrose.St5,
            angle: ang(0, false),
            loc: p(25 * 1.618, 25 * 1.618),
            gen: 3,
            layer: "rhomb",
            PentaStyle: { fill: "none", stroke: "solid" },
        })
    );
    //console.log(bounds);
    //console.log(id);
    const page = document.querySelector(`#${id}`);
    if (page.style.display == "none") return;
    const canvas = document.querySelector(`#${id} > canvas`);

    //const canvas = document.createElement("canvas");
    let g = canvas.getContext("2d");
    g.fillStyle = "white";
    g.fillRect(0, 0, canvas.width, canvas.height);
    g.strokeStyle = penrose.OUTLINE;
    g.lineWidth = 1;

    let scale = 10;
    new CanvasRenderer(g, scale).render(bounds.renderList);
    new CanvasRenderer(g, scale * 0.618).render(bounds2.renderList);
}

/**
 * The second draw test is the expansion of the first draw test.
 * It draws the second expansion of each of the tiles.
 *
 */
export function drawSecondInflation(id) {
    const page = document.querySelector(`#${id}`);
    if (page.style.display == "none") return;
    const canvas = document.querySelector(`#${id} > canvas`);

    const { shapeMode } = globals;
    const scene = new PenroseScreen(shapeMode.shapeMode);
    const penta = scene.penta.bind(scene);
    const star = scene.star.bind(scene);
    //scene.setToMeasure();
    //drawScreen();
    scene.setToRender();
    drawScreen();
    /**
     *
     */
    function drawScreen() {
        const UP = false;
        const DOWN = true;

        //const { star: star, penta } = iface(shapeMode.shapeMode);
        const bounds = new Bounds();
        let x = 25;
        let y = 25;

        bounds.expand(scene.pentaRhomb(penrose.Pe5, ang(0, UP), p(x, y), 2));

        let type = penrose.Pe5;
        let angle = ang(0, DOWN);
        let loc = p(x + 50, y);
        let gen = 2;
        let rhomb = true;

        bounds.expand(scene.pentaRhomb(type, angle, loc, gen));
        y += 50;
        x = 25;
        type = penrose.Pe3;

        for (let i = 0; i < 5; i++) {
            angle = ang(i, UP);
            loc = p(x + i * 50, y);
            bounds.expand(scene.pentaRhomb(type, angle, loc, gen));
        }
        y += 55;

        for (let i = 0; i < 5; i++) {
            angle = ang(i, DOWN);
            loc = p(x + i * 50, y);
            bounds.expand(scene.pentaRhomb(type, angle, loc, gen));
        }
        y += 50;
        type = penrose.Pe1;
        for (let i = 0; i < 5; i++) {
            angle = ang(i, UP);
            loc = p(x + i * 50, y);
            bounds.expand(scene.pentaRhomb(type, angle, loc, gen));
        }
        y += 55;
        for (let i = 0; i < 5; i++) {
            angle = ang(i, DOWN);
            loc = p(x + i * 50, y);
            bounds.expand(scene.pentaRhomb(type, angle, loc, gen));
        }
        y += 60; // one thru four
        type = penrose.St5;
        angle = ang(0, UP);
        loc = p(35, y);
        bounds.expand(scene.pentaRhomb(type, angle, loc, gen));

        angle = ang(0, DOWN);
        loc = p(100, y);
        bounds.expand(scene.pentaRhomb(type, angle, loc, gen));
        y += 74; // one thru four
        x = 35;
        type = penrose.St3;

        for (let i = 0; i < 5; i++) {
            angle = ang(i, UP);
            loc = p(x + i * 67, y);
            bounds.expand(scene.pentaRhomb(type, angle, loc, gen));
        }
        y += 70; // one thru four
        for (let i = 0; i < 5; i++) {
            angle = ang(i, DOWN);
            loc = p(x + i * 67, y);
            bounds.expand(scene.pentaRhomb(type, angle, loc, gen));
        }
        type = penrose.St1;
        y += 75; // one thru four
        for (let i = 0; i < 5; i++) {
            angle = ang(i, UP);
            loc = p(x + i * 50, y);
            bounds.expand(scene.pentaRhomb(type, angle, loc, gen));
        }
        y += 60; // one thru four
        for (let i = 0; i < 5; i++) {
            angle = ang(i, DOWN);
            loc = p(x + i * 50, y);
            bounds.expand(scene.pentaRhomb(type, angle, loc, gen));
        }

        resizeAndRender(scene, bounds, canvas, 3);
    }
}

function resizeAndRender(scene, bounds, canvas, scale) {
    if (!scene.measure) {
        if (bounds.isEmpty) {
            console.log(`isEmpty`);
            return;
        }
        let g = canvas.getContext("2d");
        g.fillStyle = "white";
        g.fillRect(0, 0, canvas.width, canvas.height);

        // I believe canvas width and height can be put in directly
        const computedWidth = bounds.maxPoint.x * scale + scale;
        const computedHeight = bounds.maxPoint.y * scale + scale;
        if (
            canvas.width != Math.floor(computedWidth) ||
            canvas.height != Math.floor(computedHeight)
        ) {
            canvas.width = computedWidth;
            canvas.height = computedHeight;
        }
        new CanvasRenderer(g, scale).render(bounds.renderList);
    }
}
/***
 * A lot of cool stuff for computing sizes here
 */
export function drawGridWork(id) {
    const page = document.querySelector(`#${id}`);
    if (page.style.display == "none") return;
    const canvas = document.querySelector(`#${id} > canvas`);

    const { shapeMode, shapeColors } = globals;

    const { grid, figure, outline, deca, penta } = iface(shapeMode.shapeMode);

    drawBig();

    /**
     * Draws all of the penrose rotations
     * Draws a few decagons too.
     */
    function drawBig() {
        const g = canvas.getContext("2d");
        g.fillStyle = "white";
        g.fillRect(0, 0, canvas.width, canvas.height);
        let scale = 10;

        const bounds = new Bounds();
        let y = 5;
        const mosaicShapes = [
            mosaic.penta,
            mosaic.diamond,
            mosaic.star,
            mosaic.boat,
        ];

        const spacing = 12;
        for (const shape of mosaicShapes) {
            for (let i = 0; i < 10; i++) {
                let offset = p((i + 1) * spacing, y);
                bounds.expand(
                    figure(
                        shapeColors.shapeColors["pe1-color"],
                        offset,
                        shape[i]
                    )
                );
                bounds.expand(grid(p((i + 1) * spacing, y), 5));
            }
            y += spacing;
        }

        y = 5;
        const qShapes = [
            quadrille.penta,
            quadrille.diamond,
            quadrille.star,
            quadrille.boat,
        ];

        for (const shape of qShapes) {
            for (let i = 0; i < 10; i++) {
                let offset = p((i + 1) * spacing, y);

                bounds.expand(
                    outline(
                        shapeColors.shapeColors["pe1-color"] + "44",
                        offset,
                        shape[i]
                    )
                );
            }
            y += spacing;
        }

        let fifths;
        let isDown;
        let base;
        let exp;

        // Now some decagons

        fifths = 0;
        isDown = false;
        base = p(15, 75);
        exp = 1;
        bounds.expand(
            deca({ angle: ang(fifths, isDown), loc: base, gen: exp })
        );
        bounds.expand(grid(base, 10));

        bounds.expand(
            penta({
                type: penrose.Deca,
                angle: ang(fifths, isDown),
                loc: base,
                gen: exp,
                rhomb: true,
            })
        );

        fifths = 0;
        isDown = false;
        base = p(45, 75);
        exp = 2;
        bounds.expand(
            deca({ angle: ang(fifths, isDown), loc: base, gen: exp })
        );
        bounds.expand(grid(base, 18));
        bounds.expand(
            deca({
                angle: ang(fifths, isDown),
                loc: base,
                gen: exp,
                rhomb: true,
            })
        );

        fifths = 3;
        isDown = true;
        base = p(15, 115);
        exp = 1;
        bounds.expand(
            deca({
                angle: ang(fifths, isDown),
                loc: base,
                gen: exp,
            })
        );
        bounds.expand(grid(base, 10));
        bounds.expand(
            deca({
                angle: ang(fifths, isDown),
                loc: base,
                gen: exp,
                rhomb: true,
            })
        );

        fifths = 3;
        isDown = true;
        base = p(45, 115);
        exp = 2;
        bounds.expand(
            deca({
                angle: ang(fifths, isDown),
                loc: base,
                gen: exp,
            })
        );
        bounds.expand(grid(base, 18));
        bounds.expand(
            deca({
                angle: ang(fifths, isDown),
                loc: base,
                gen: exp,
                rhomb: true,
            })
        );

        fifths = 1;
        isDown = false;
        base = p(15, 155);
        exp = 1;
        bounds.expand(
            deca({
                angle: ang(fifths, isDown),
                loc: base,
                gen: exp,
            })
        );
        bounds.expand(grid(base, 10));
        bounds.expand(
            deca({
                angle: ang(fifths, isDown),
                loc: base,
                gen: exp,
                rhomb: true,
            })
        );

        fifths = 1;
        isDown = false;
        base = p(45, 155);
        exp = 2;
        bounds.expand(
            deca({
                angle: ang(fifths, isDown),
                loc: base,
                gen: exp,
            })
        );
        bounds.expand(grid(base, 18));
        bounds.expand(
            deca({
                angle: ang(fifths, isDown),
                loc: base,
                gen: exp,
                rhomb: true,
            })
        );

        new CanvasRenderer(g, scale).render(bounds.renderList);
    }
}

/**
 * For the third expansion we want to use a different scheme.
 *
 * expansion
 * star or pentagon
 * 5 4 or 2
 * up or down
 *
 * @param {} canvasId
 */
export function drawGeneric123(id) {
    const page = document.querySelector(`#${id}`);
    if (page.style.display == "none") return;
    const canvas = document.querySelector(`#${id} > canvas`);
    const { shapeMode, controls } = globals;
    let g = canvas.getContext("2d");
    canvas.width = 2000;
    canvas.height = 2000;
    g.fillStyle = "#ffffff";
    g.fillRect(0, 0, canvas.width, canvas.height);
    g.strokeStyle = penrose.OUTLINE;
    g.lineWidth = 1;
    let scale = 10;
    const { penta, star, deca } = iface(shapeMode.shapeMode);

    const drawScreen = function () {
        let x = 13;
        let y = 26;
        const begin = performance.now();
        const bounds = new Bounds();
        const type = controls.typeList[controls.typeIndex];
        const angle = ang(controls.fifths, controls.isDown);
        switch (type) {
            case penrose.Pe1:
            case penrose.Pe3:
            case penrose.Pe5:
                bounds.expand(penta({ type, angle, loc: p(x, y), gen: 0 }));
                bounds.expand(
                    penta({ type, angle, loc: p(x, y), gen: 0, rhomb: true })
                );
                x += 21;
                bounds.expand(penta({ type, angle, loc: p(x, y), gen: 1 }));
                bounds.expand(
                    penta({ type, angle, loc: p(x, y), gen: 1, rhomb: true })
                );
                x += 34;
                bounds.expand(penta({ type, angle, loc: p(x, y), gen: 2 }));
                bounds.expand(
                    penta({ type, angle, loc: p(x, y), gen: 2, rhomb: true })
                );
                x = 73;
                y += 100;
                bounds.expand(penta({ type, angle, loc: p(x, y), gen: 3 }));
                bounds.expand(
                    penta({ type, angle, loc: p(x, y), gen: 3, rhomb: true })
                );

                break;
            case penrose.St1:
            case penrose.St3:
            case penrose.St5:
                y += 10;
                bounds.expand(star({ type, angle, loc: p(x, y), gen: 0 }));
                bounds.expand(
                    star({ type, angle, loc: p(x, y), gen: 0, rhomb: true })
                );
                x += 21;
                bounds.expand(star({ type, angle, loc: p(x, y), gen: 1 }));
                bounds.expand(
                    star({ type, angle, loc: p(x, y), gen: 1, rhomb: true })
                );
                x += 54;
                bounds.expand(star({ type, angle, loc: p(x, y), gen: 2 }));
                bounds.expand(
                    star({ type, angle, loc: p(x, y), gen: 2, rhomb: true })
                );
                x = 93;
                y += 130;
                bounds.expand(star({ type, angle, loc: p(x, y), gen: 3 }));
                bounds.expand(
                    star({ type, angle, loc: p(x, y), gen: 3, rhomb: true })
                );

                break;
            case penrose.Deca:
                bounds.expand(deca({ angle, loc: p(x, y), gen: 1 }));
                bounds.expand(
                    deca({ angle, loc: p(x, y), gen: 1, rhomb: true })
                );
                x += 31;
                bounds.expand(deca({ angle, loc: p(x, y), gen: 2 }));
                bounds.expand(
                    deca({ angle, loc: p(x, y), gen: 2, rhomb: true })
                );
                x += 64;
                y += 30;
                bounds.expand(deca({ angle, loc: p(x, y), gen: 3 }));
                bounds.expand(
                    deca({ angle, loc: p(x, y), gen: 3, rhomb: true })
                );
                y += 170;
                x += 30;
                bounds.expand(deca({ angle, loc: p(x, y), gen: 4 }));
                bounds.expand(
                    deca({ angle, loc: p(x, y), gen: 4, rhomb: true })
                );
                break;
        }
        const built = performance.now();
        const renderer = new CanvasRenderer(g, scale);
        console.log(`shapes built: ${built - begin} ms`);
        renderer.render(bounds.renderList);
        const rendered = performance.now();
        console.log(
            `shapes rendered: ${
                rendered - built
            } ms, function list: ${USE_FUNCTION_LIST}`
        );
    };

    drawScreen();
}

/***
 * This draws big decas.
 * Let's make it friendlier
 */
export function drawGeneric3(id) {
    const page = document.querySelector(`#${id}`);
    if (page.style.display == "none") return;
    const canvas = document.querySelector(`#${id} > canvas`);

    const { shapeMode, controls } = globals;
    // g is global
    let g = canvas.getContext("2d");
    g.fillStyle = "#ffffff";
    g.fillRect(0, 0, canvas.width, canvas.height);
    g.strokeStyle = penrose.OUTLINE;
    g.lineWidth = 1;
    let scale = 4;
    const { deca } = iface(shapeMode.shapeMode);

    const drawScreen = function () {
        console.log(performance.now());

        let x = 100;
        let y = 250;
        let angle = ang(controls.fifths, controls.isDown);
        let decagon = true;
        const begin = performance.now();
        const bounds = new Bounds();
        if (decagon) {
            bounds.expand(deca({ angle, loc: p(x, y), gen: 6 }));
            bounds.expand(deca({ angle, loc: p(x, y), gen: 6, rhomb: true }));
        } else {
            console.log(`drawScreen ${controls.typeIndex}`);
            const type = controls.typeList[controls.typeIndex];
            switch (type) {
                case penrose.Pe1:
                case penrose.Pe3:
                case penrose.Pe5:
                    console.log("draw penta");
                    bounds.expand(
                        penta({
                            type,
                            angle: ang(controls.fifths, controls.isDown),
                            loc: p(x, y),
                            gen: 3,
                        })
                    );

                    break;
                case penrose.St1:
                case penrose.St3:
                case penrose.St5:
                    console.log("draw star");
                    bounds.expand(
                        star({
                            type,
                            angle: ang(controls.fifths, controls.isDown),
                            loc: p(x, y),
                            gen: 3,
                        })
                    );
                    break;
            }
        }
        const built = performance.now();
        console.log(`shapes built: ${built - begin} ms`);
        new CanvasRenderer(g, scale).render(bounds.renderList);
        const rendered = performance.now();
        console.log(
            `shapes rendered: ${
                rendered - built
            } ms, function list: ${USE_FUNCTION_LIST}`
        );
    };
    drawScreen();
}
