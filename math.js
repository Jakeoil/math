"use strict";
import { p } from "./point.js";
import { Bounds } from "./bounds.js";
import { penrose } from "./penrose.js";
import { real, quadrille, mosaic } from "./shape-modes.js";

import { initControls, logRefresh } from "./controls.js";
import { globals } from "./controls.js";
import { iface } from "./penrose-screen.js";
import { Angle } from "./penrose-screen.js";

/**
 * Penrose Mosaic and More
 *
 * Jeff Coyle's Penrose page.
 * Explores Penrose Type 1.
 *
 * The modes.
 * Introduces the Mosaic. The penrose pattern based on square mosaic tiles.
 * Introduces the Quadrille. The vector based version of above.
 * Displays the 'Real' mode. The actual type 1 penrose tiling P1.
 * Overlay the Rhombs.
 */

/**
 * This was a real pain
 * Line up the clickers
 **/

/******************************************************************************
 * Called when the page loads.
 * Creates all canvases.
 * Creates listeners for control buttons
 */
export function penroseApp(source) {
    logRefresh(penroseApp, source);
    initControls(penroseApp);

    //let { pageNavigation } = globals;
    //const ap = pageNavigation.activePage;
    //const scr = new Scrolling(ap);
    //load the little canvases.
    makeCanvas("p5");
    makeCanvas("p3");
    makeCanvas("p1");
    makeCanvas("s5");
    makeCanvas("s3");
    makeCanvas("s1");
    drawFirstInflation("inf1");
    drawSecondInflation("inf2");
    drawGridWork("gwork");
    drawGeneric123("g012");
    drawGeneric3("g3");
}
window.addEventListener("load", penroseApp, false);

/******************************************************************************
 * Screen Drawing Routines
 *****************************************************************************/

/***
 * Draws a little canvas with a shape.
 * Shape depends on passed in ID.
 */
function makeCanvas(canvasId) {
    const { shapeMode } = globals;
    const canvas = document.getElementById(canvasId);
    let g = canvas.getContext("2d");

    const drawScreen = function () {
        g.fillStyle = "transparent"; //"#ffffff";
        g.fillRect(0, 0, canvas.width, canvas.height);
        g.strokeStyle = penrose.OUTLINE;
        g.lineWidth = 1;
        let scale = 10;
        const { penta, star, pentaRhomb, starRhomb, pentaNew, starNew } = iface(
            g,
            scale,
            shapeMode.shapeMode
        );

        let bounds;
        let width = 0;
        let height = 0;
        let base = p(0, 0);
        let ang = new Angle(0, true);
        console.log("ang: " + ang);
        let tries = 0;

        // Just for test.
        let gen = 1;
        do {
            canvas.width = width;
            canvas.height = height;
            bounds = new Bounds();
            console.log("penta");
            bounds.expand(
                canvasId == "p5"
                    ? pentaNew({
                          type: penrose.Pe5,
                          angle: new Angle(0, true),
                          isHeads: true,
                          loc: base,
                          gen,
                      })
                    : canvasId == "p3"
                    ? pentaNew({
                          type: penrose.Pe3,
                          angle: new Angle(0, false),
                          isHeads: true,
                          loc: base,
                          gen,
                      })
                    : canvasId == "p1"
                    ? pentaNew({
                          type: penrose.Pe1,
                          angle: new Angle(0, false),
                          isHeads: true,
                          loc: base,
                          gen,
                      })
                    : canvasId == "s5"
                    ? starNew({
                          type: penrose.St5,
                          angle: new Angle(0, false),
                          isHeads: true,
                          loc: base,
                          gen,
                      })
                    : canvasId == "s3"
                    ? starNew({
                          type: penrose.St3,
                          angle: new Angle(0, false),
                          isHeads: true,
                          loc: base,
                          gen,
                      })
                    : canvasId == "s1"
                    ? starNew({
                          type: penrose.St1,
                          angle: new Angle(0, false),
                          isHeads: true,
                          loc: base,
                          gen,
                      })
                    : null
            );
            console.log("deca");
            bounds.expand(
                canvasId == "p5"
                    ? pentaNew({
                          type: penrose.Pe5,
                          angle: new Angle(0, true),
                          isHeads: true,
                          loc: base,
                          gen,
                          rhomb: true,
                      })
                    : canvasId == "p3"
                    ? pentaNew({
                          type: penrose.Pe3,
                          angle: new Angle(0, false),
                          isHeads: true,
                          loc: base,
                          gen,
                          rhomb: true,
                      })
                    : canvasId == "p1"
                    ? pentaNew({
                          type: penrose.Pe1,
                          angle: new Angle(0, false),
                          isHeads: true,
                          loc: base,
                          gen,
                          rhomb: true,
                      })
                    : canvasId == "s5"
                    ? starNew({
                          type: penrose.St5,
                          angle: new Angle(0, false),
                          isHeads: true,
                          loc: base,
                          gen,
                          rhomb: true,
                      })
                    : canvasId == "s3"
                    ? starNew({
                          type: penrose.St3,
                          angle: new Angle(0, false),
                          isHeads: true,
                          loc: base,
                          gen,
                          rhomb: true,
                      })
                    : canvasId == "s1"
                    ? starNew({
                          type: penrose.St1,
                          angle: new Angle(0, false),
                          isHeads: true,
                          loc: base,
                          gen,
                          rhomb: true,
                      })
                    : null
            );
            bounds.pad(0.5);
            base = base.tr(bounds.minPoint.neg);
            width = (bounds.width - 1) * scale;
            height = (bounds.height - 1) * scale;
            tries += 1; // prevention of infinite loop
        } while (!bounds.minPoint.isZero && tries < 2);
    };

    drawScreen();
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
function drawFirstInflation(id) {
    const page = document.querySelector(`#${id}`);
    if (page.style.display == "none") return;
    const canvas = document.querySelector(`#${id} > canvas`);
    if (!canvas) {
        console.log("canvasId is null!");
        return;
    }
    const { shapeMode } = globals;
    let g = canvas.getContext("2d");

    const drawScreen = function () {
        g.fillStyle = "white";
        g.fillRect(0, 0, canvas.width, canvas.height);
        g.strokeStyle = penrose.OUTLINE;
        g.lineWidth = 1;
        let scale = 10;
        const { penta, star, pentaRhomb, starRhomb, pentaNew, starNew } = iface(
            g,
            scale,
            shapeMode.shapeMode
        );

        let x = 8;
        let y = 9;
        const UP = false;
        const DOWN = true;
        const bounds = new Bounds();
        let type = penrose.Pe5;
        let angle = new Angle(0, UP);
        let loc = p(x, y);
        let gen = 1;
        let deca = true;

        bounds.expand(pentaNew({ type, angle, loc, gen }));
        bounds.expand(pentaNew({ type, angle, loc, gen, deca }));
        type = penrose.Pe5;
        angle = new Angle(0, DOWN);
        loc = p(25, y);

        bounds.expand(pentaNew({ type, angle, loc, gen }));
        bounds.expand(pentaNew({ type, angle, loc, gen, deca }));

        y += 18;

        type = penrose.Pe3;
        for (let i = 0; i < 5; i++) {
            angle = new Angle(i, UP);
            loc = p(x + i * 20, y);
            bounds.expand(pentaNew({ type, angle, loc, gen }));
            bounds.expand(pentaNew({ type, angle, loc, gen, deca }));
        }
        y += 20;

        for (let i = 0; i < 5; i++) {
            angle = new Angle(i, DOWN);
            loc = p(x + i * 20, y);
            bounds.expand(pentaNew({ type, angle, loc, gen }));
            bounds.expand(pentaNew({ type, angle, loc, gen, deca }));
        }
        y += 20;
        type = penrose.Pe1;
        for (let i = 0; i < 5; i++) {
            angle = new Angle(i, UP);
            loc = p(x + i * 20, y);
            bounds.expand(pentaNew({ type, angle, loc, gen }));
            bounds.expand(pentaNew({ type, angle, loc, gen, deca }));
        }
        y += 20;
        for (let i = 0; i < 5; i++) {
            angle = new Angle(i, DOWN);
            loc = p(x + i * 20, y);
            bounds.expand(pentaNew({ type, angle, loc, gen }));
            bounds.expand(pentaNew({ type, angle, loc, gen, deca }));
        }
        y += 25;
        type = penrose.St5;
        angle = new Angle(0, UP);
        loc = p(15, y);

        starNew({ type, angle, loc, gen });
        starNew({ type, angle, loc, gen, deca });

        angle = new Angle(0, DOWN);
        loc = p(45, y);
        starNew({ type, angle, loc, gen });
        starNew({ type, angle, loc, gen, deca });

        x = 10;
        y += 30;

        type = penrose.St1;
        for (let i = 0; i < 5; i++) {
            angle = new Angle(i, UP);
            loc = p(x + i * 20, y);
            starNew({ type, angle, loc, gen });
            starNew({ type, angle, loc, gen, deca });
        }
        y += 25;
        for (let i = 0; i < 5; i++) {
            angle = new Angle(i, DOWN);
            loc = p(x + i * 20, y);
            starNew({ type, angle, loc, gen });
            starNew({ type, angle, loc, gen, deca });
        }

        x = 15;
        y += 25;
        type = penrose.St3;
        for (let i = 0; i < 5; i++) {
            angle = new Angle(i, UP);
            loc = p(x + i * 25, y);
            starNew({ type, angle, loc, gen });
            starNew({ type, angle, loc, gen, deca });
        }
        y += 25;
        for (let i = 0; i < 5; i++) {
            angle = new Angle(i, DOWN);
            loc = p(x + i * 25, y);
            bounds.expand(starNew({ type, angle, loc, gen }));
            bounds.expand(starNew({ type, angle, loc, gen, deca }));
        }
        // conditional redraw
        redraw(bounds, canvas, drawScreen, scale);
    };
    drawScreen();
}

/**
 * The second draw test is the expansion of the first draw test.
 * It draws the second expansion of each of the tiles.
 *
 */
function drawSecondInflation(id) {
    const page = document.querySelector(`#${id}`);
    if (page.style.display == "none") return;
    const canvas = document.querySelector(`#${id} > canvas`);
    // g is global
    let g = canvas.getContext("2d");
    const { shapeMode } = globals;

    drawScreen();
    /**
     *
     */
    function drawScreen() {
        console.log(`g-test`);
        let fill = "rgb(10, 10, 10)";
        g.fillStyle = fill;
        console.log(g.fillStyle);
        const UP = false;
        const DOWN = true;
        g.fillStyle = "#ffffff";
        g.fillRect(0, 0, canvas.width, canvas.height);

        g.fillStyle = penrose.ORANGE_PENTA;
        g.strokeStyle = penrose.OUTLINE;
        g.lineWidth = 1;
        let scale = 5;
        const { star, penta, pentaRhomb, starRhomb, starNew, pentaNew } = iface(
            g,
            scale,
            shapeMode.shapeMode
        );

        let x = 25;
        let y = 25;

        //penta(0, penrose.Pe5, UP, p(x, y), 2);
        pentaRhomb(0, penrose.Pe5, UP, p(x, y), 2);
        pentaNew({
            type: penrose.Pe5,
            angle: new Angle(0, UP),
            loc: p(x, y),
            gen: 2,
        });
        pentaNew({
            type: penrose.Pe5,
            angle: new Angle(0, UP),
            loc: p(x, y),
            gen: 2,
            rhomb: true,
        });

        let type = penrose.Pe5;
        let angle = new Angle(0, DOWN);
        let loc = p(x + 50, y);
        let gen = 2;
        let rhomb = true;

        pentaNew({ type, angle, loc, gen });
        y += 50;
        x = 25;
        type = penrose.Pe3;

        for (let i = 0; i < 5; i++) {
            angle = new Angle(i, UP);
            loc = p(x + i * 50, y);
            pentaNew({ type, angle, loc, gen });
        }
        y += 55;

        for (let i = 0; i < 5; i++) {
            angle = new Angle(i, DOWN);
            loc = p(x + i * 50, y);
            pentaNew({ type, angle, loc, gen });
            //            penta(i, penrose.Pe3, DOWN, p(x + i * 50, y), 2);
        }
        y += 50;
        type = penrose.Pe1;
        for (let i = 0; i < 5; i++) {
            angle = new Angle(i, UP);
            loc = p(x + i * 50, y);
            pentaNew({ type, angle, loc, gen });
            //penta(i, penrose.Pe1, UP, p(x + i * 50, y), 2);
        }
        y += 55;
        for (let i = 0; i < 5; i++) {
            angle = new Angle(i, DOWN);
            loc = p(x + i * 50, y);
            pentaNew({ type, angle, loc, gen });
            //          penta(i, penrose.Pe1, DOWN, p(x + i * 50, y), 2);
        }
        y += 60; // one thru four
        type = penrose.St5;
        angle = new Angle(0, UP);
        loc = p(35, y);
        starNew({ type, angle, loc, gen });
        starNew({ type, angle, loc, gen, rhomb });
        //star(0, penrose.St5, UP, p(35, y), 2);
        //starRhomb(0, penrose.St5, UP, p(35, y), 2);

        angle = new Angle(0, DOWN);
        loc = p(100, y);
        starNew({ type, angle, loc, gen });
        starNew({ type, angle, loc, gen, rhomb });
        y += 74; // one thru four
        x = 35;
        type = penrose.St3;

        for (let i = 0; i < 5; i++) {
            angle = new Angle(i, UP);
            loc = p(x + i * 67, y);
            starNew({ type, angle, loc, gen });
        }
        y += 70; // one thru four
        for (let i = 0; i < 5; i++) {
            angle = new Angle(i, DOWN);
            loc = p(x + i * 67, y);
            starNew({ type, angle, loc, gen });
        }
        type = penrose.St1;
        y += 75; // one thru four
        for (let i = 0; i < 5; i++) {
            angle = new Angle(i, UP);
            loc = p(x + i * 50, y);
            starNew({ type, angle, loc, gen });
        }
        y += 60; // one thru four
        for (let i = 0; i < 5; i++) {
            angle = new Angle(i, DOWN);
            loc = p(x + i * 50, y);
            starNew({ type, angle, loc, gen });
        }
    }
}

/***
 * A lot of cool stuff for computing sizes here
 */
function drawGridWork(id) {
    const page = document.querySelector(`#${id}`);
    if (page.style.display == "none") return;
    const canvas = document.querySelector(`#${id} > canvas`);

    let g = canvas.getContext("2d");
    const { shapeMode, shapeColors } = globals;

    drawBig();

    /**
     * Draws all of the penrose rotations
     * Draws a few decagons too.
     */
    function drawBig() {
        g.fillStyle = "white";
        g.fillRect(0, 0, canvas.width, canvas.height);

        //g.fillStyle = p1Orange;
        g.strokeStyle = penrose.OUTLINE;
        g.lineWidth = 1;
        let scale = 10;
        const { deca, decaRhomb, grid, figure, outline, decaNew } = iface(
            g,
            scale,
            shapeMode.shapeMode
        );

        let y = 5;
        const shapes = [mosaic.penta, mosaic.diamond, mosaic.star, mosaic.boat];

        const spacing = 12;
        for (const shape of shapes) {
            for (let i = 0; i < 10; i++) {
                let offset = p((i + 1) * spacing, y);
                figure(
                    shapeColors.shapeColors["pe1-color"],
                    offset,
                    shape[i],
                    g,
                    scale
                );
                grid(p((i + 1) * spacing, y), 5);
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

                outline(
                    shapeColors.shapeColors["pe1-color"] + "44",
                    offset,
                    shape[i],
                    g,
                    scale
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
        //deca(fifths, isDown, base, exp);
        decaNew({ angle: new Angle(fifths, isDown), loc: base, gen: exp });
        grid(base, 10);
        decaNew({
            angle: new Angle(fifths, isDown),
            loc: base,
            gen: exp,
            rhomb: true,
        });
        //decaRhomb(fifths, isDown, base, exp);

        fifths = 0;
        isDown = false;
        base = p(45, 75);
        exp = 2;
        decaNew({ angle: new Angle(fifths, isDown), loc: base, gen: exp });
        grid(base, 18);
        decaNew({
            angle: new Angle(fifths, isDown),
            loc: base,
            gen: exp,
            rhomb: true,
        });

        fifths = 3;
        isDown = true;
        base = p(15, 115);
        exp = 1;
        decaNew({
            angle: new Angle(fifths, isDown),
            loc: base,
            gen: exp,
        });
        grid(base, 10);
        decaNew({
            angle: new Angle(fifths, isDown),
            loc: base,
            gen: exp,
            rhomb: true,
        });

        fifths = 3;
        isDown = true;
        base = p(45, 115);
        exp = 2;
        decaNew({
            angle: new Angle(fifths, isDown),
            loc: base,
            gen: exp,
        });
        grid(base, 18);
        decaNew({
            angle: new Angle(fifths, isDown),
            loc: base,
            gen: exp,
            rhomb: true,
        });

        fifths = 1;
        isDown = false;
        base = p(15, 155);
        exp = 1;
        decaNew({
            angle: new Angle(fifths, isDown),
            loc: base,
            gen: exp,
        });
        grid(base, 10);
        decaNew({
            angle: new Angle(fifths, isDown),
            loc: base,
            gen: exp,
            rhomb: true,
        });

        fifths = 1;
        isDown = false;
        base = p(45, 155);
        exp = 2;
        decaNew({
            angle: new Angle(fifths, isDown),
            loc: base,
            gen: exp,
        });
        grid(base, 18);
        decaNew({
            angle: new Angle(fifths, isDown),
            loc: base,
            gen: exp,
            rhomb: true,
        });
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
function drawGeneric123(id) {
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
    const { penta, star, deca, pentaRhomb, starRhomb, decaRhomb } = iface(
        g,
        scale,
        shapeMode.shapeMode
    );

    const drawScreen = function () {
        let x = 13;
        let y = 26;
        const bounds = new Bounds();
        const type = controls.typeList[controls.typeIndex];
        switch (type) {
            case penrose.Pe1:
            case penrose.Pe3:
            case penrose.Pe5:
                bounds.expand(
                    penta(controls.fifths, type, controls.isDown, p(x, y), 0)
                );
                bounds.expand(
                    pentaRhomb(
                        controls.fifths,
                        type,
                        controls.isDown,
                        p(x, y),
                        0
                    )
                );
                x += 21;
                penta(controls.fifths, type, controls.isDown, p(x, y), 1);
                pentaRhomb(controls.fifths, type, controls.isDown, p(x, y), 1);
                x += 34;
                penta(controls.fifths, type, controls.isDown, p(x, y), 2);
                pentaRhomb(controls.fifths, type, controls.isDown, p(x, y), 2);
                x = 73;
                y += 100;
                penta(controls.fifths, type, controls.isDown, p(x, y), 3);
                pentaRhomb(controls.fifths, type, controls.isDown, p(x, y), 3);

                break;
            case penrose.St1:
            case penrose.St3:
            case penrose.St5:
                y += 10;
                star(controls.fifths, type, controls.isDown, p(x, y), 0);
                starRhomb(controls.fifths, type, controls.isDown, p(x, y), 0);
                x += 21;
                star(controls.fifths, type, controls.isDown, p(x, y), 1);
                starRhomb(controls.fifths, type, controls.isDown, p(x, y), 1);
                x += 54;
                star(controls.fifths, type, controls.isDown, p(x, y), 2);
                starRhomb(controls.fifths, type, controls.isDown, p(x, y), 2);
                x = 93;
                y += 130;
                star(controls.fifths, type, controls.isDown, p(x, y), 3);
                starRhomb(controls.fifths, type, controls.isDown, p(x, y), 3);

                break;
            case penrose.Deca:
                deca(controls.fifths, controls.isDown, p(x, y), 1);
                decaRhomb(controls.fifths, controls.isDown, p(x, y), 1);
                x += 31;
                deca(controls.fifths, controls.isDown, p(x, y), 2);
                decaRhomb(controls.fifths, controls.isDown, p(x, y), 2);
                x += 64;
                y += 30;
                deca(controls.fifths, controls.isDown, p(x, y), 3);
                decaRhomb(controls.fifths, controls.isDown, p(x, y), 3);
                y += 170;
                x += 30;
                deca(controls.fifths, controls.isDown, p(x, y), 4);
                decaRhomb(controls.fifths, controls.isDown, p(x, y), 4);
                break;
        }
    };

    drawScreen();
}

/***
 * This draws big decas.
 * Let's make it friendlier
 */
function drawGeneric3(id) {
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
    const { deca, decaRhomb } = iface(g, scale, shapeMode.shapeMode);
    const drawScreen = function () {
        let x = 100;
        let y = 250;

        let decagon = true;
        if (decagon) {
            deca(controls.fifths, controls.isDown, p(20, 20), 1);
            deca(controls.fifths, controls.isDown, p(50, 50), 2);
            deca(controls.fifths, controls.isDown, p(210, 80), 3);
            deca(controls.fifths, controls.isDown, p(x, y), 6);
            decaRhomb(controls.fifths, controls.isDown, p(x, y), 6);
        } else {
            console.log(`drawScreen ${controls.typeIndex}`);
            const type = controls.typeList[controls.typeIndex];
            switch (type) {
                case penrose.Pe1:
                case penrose.Pe3:
                case penrose.Pe5:
                    console.log("draw penta");
                    penta(controls.fifths, type, controls.isDown, p(x, y), 3);

                    break;
                case penrose.St1:
                case penrose.St3:
                case penrose.St5:
                    console.log("draw star");
                    star(controls.fifths, type, controls.isDown, p(x, y), 3);
                    break;
            }
        }
    };
    drawScreen();
}
