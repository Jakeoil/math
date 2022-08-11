"use strict";
import { p } from "./point.js";
import { Bounds } from "./bounds.js";
import { PenroseScreen } from "./penrose-screen.js";
import { penrose } from "./penrose.js";
import { real, quadrille, mosaic } from "./shape-modes.js";

import { cookie, Controls, ShapeColors, ShapeMode } from "./controls.js";

/**
 * Penrose Mosaic
 *
 * Jeff Coyle's Penrose page.
 * Explores Penrose Type 1.
 *
 * The modes.
 * Introduces the Mosaic. The penrose pattern based on square mosaic tiles.
 * Introduces the Quadrille. The vector based version of above.
 * Displays the 'Real' mode. The actual type 1 penrose tiling.
 *
 */

/** Initialize from contols in penrose.html */
export const shapeColors = new ShapeColors(penroseApp);
shapeColors.reset();
shapeColors.refresh();

const controls = new Controls(penroseApp, 0, 0, false);
controls.reset();
controls.refresh();

/**
 * Shape-Mode:
 *   "mosaic"
 *      Mosaic tiles
 *   "quadrille"
 *      Filled outlines like on graph paper
 *   "real"
 *      True five fold real symmetry todo
 *
 * Should this be declared in penrose.js
 *
 * Or maybe these should be tied in with PenroseScreen (todo)
 */
// const MODE_MOSAIC = "mosaic";
// const MODE_QUADRILLE = "quadrille";
// export const MODE_REAL = "real";
// const MODE_LIST = [MODE_MOSAIC, MODE_QUADRILLE, MODE_REAL];

export const shapeMode = new ShapeMode(penroseApp); //cookie.getShapeMode(MODE_MOSAIC); // send default
//const eleMode = document.querySelector("#shape-mode");
/**
 * Changing the shape mode also changes the globals that penta, star and deca
 * use.
 * Todo: penta star and deca also have some crud, for example drawing the
 * figures.
 */
shapeMode.refresh();
// function refreshShapeMode() {
//     if (eleMode) eleMode.innerHTML = shapeMode;
// }

// refreshShapeMode();

// export const clickMode = function () {
//     let new_idx = (MODE_LIST.indexOf(shapeMode) + 1) % MODE_LIST.length;
//     shapeMode = MODE_LIST[new_idx];
//     cookie.setShapeMode(shapeMode);
//     refreshShapeMode();
//     penroseApp();
// };

/***
 *  Page Navigation defaults.
 */
let activeButtonIndex = cookie.getActiveButtonIndex(0);
let navButtons = document.querySelectorAll(".pageButton");
let pages = document.querySelectorAll(".page");

// loaded on self click
let activePage;

if (navButtons && navButtons[activeButtonIndex])
    navButtons[activeButtonIndex].click();

export function pageClicked(pageId, button) {
    for (let page of pages) {
        page.style.display = "none";
    }
    console.log(`pageId: ${pageId}, button: ${button.className}`);
    const active_page = document.querySelector(`#${pageId}`);
    active_page.style.display = "block";

    for (let index = 0; index < navButtons.length; index++) {
        let navButton = navButtons[index];
        if (navButton === button) {
            activeButtonIndex = index;
            cookie.setActiveButtonIndex(index);
            navButton.style.background = "white";
            navButton.style.color = "black";
        } else {
            navButton.style.background = "black";
            navButton.style.color = "white";
        }
    }
    activePage = active_page;
}

// Grab scroll code. todo todo
(function () {
    /***
     *
     * this is an implementation of Wes Bos click & drag scroll algorythm. In
     * his video, he shows how to do the horizontal scroll. I have implemented
     * the vertical scroll for those wondering how to make it as well.
     *  Wes Bos video:
     *  https://www.youtube.com/watch?v=C9EWifQ5xqA
     */

    let startY;
    let startX;
    let scrollLeft;
    let scrollTop;
    let isDown;

    function addListeners() {
        activePage.addEventListener("mousedown", (e) => mouseIsDown(e));
        activePage.addEventListener("mouseup", (e) => mouseUp(e));
        activePage.addEventListener("mouseleave", (e) => mouseLeave(e));
        activePage.addEventListener("mousemove", (e) => mouseMove(e));
    }

    function mouseIsDown(e) {
        isDown = true;
        startY = e.pageY - activePage.offsetTop;
        startX = e.pageX - activePage.offsetLeft;
        scrollLeft = activePage.scrollLeft;
        scrollTop = activePage.scrollTop;
        console.log(`mouseIsDown: ${activePage.id}`);
    }
    function mouseUp(e) {
        isDown = false;
        console.log(`mouseUp`);
    }
    function mouseLeave(e) {
        isDown = false;
        console.log(`mouseLeave`);
    }
    function mouseMove(e) {
        if (isDown) {
            e.preventDefault();
            //Move vertcally
            const y = e.pageY - activePage.offsetTop;
            const walkY = y - startY;
            activePage.scrollTop = scrollTop - walkY;

            //Move Horizontally
            const x = e.pageX - activePage.offsetLeft;
            const walkX = x - startX;
            activePage.scrollLeft = scrollLeft - walkX;
            console.log(`mouseMove`);
        }
    }
})();

/******************************************************************************
 * Called when the page loads.
 * Creates all canvases.
 * Creates listeners for control buttons
 */
export function penroseApp() {
    console.log(`penroseApp`);

    // load the little canvases.
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
    drawRealWork("rwork"); // This should not be needed
}

/******************************************************************************
 * Screen Drawing Routines
 *****************************************************************************/

/**
 * This is a wrapper around penroseScreen
 * @returns
 */
export function iface(g, scale, mode) {
    let screen = new PenroseScreen(g, scale, mode);
    const penta = screen.penta.bind(screen);
    const star = screen.star.bind(screen);
    const deca = screen.deca.bind(screen);
    const grid = screen.grid.bind(screen);
    const pentaRhomb = screen.pentaRhomb.bind(screen);
    const starRhomb = screen.starRhomb.bind(screen);
    const decaRhomb = screen.decaRhomb.bind(screen);
    return { penta, star, deca, grid, pentaRhomb, starRhomb, decaRhomb };
}
/***
 * Draws a little canvas with a shape.
 * Shape depends on passed in ID.
 */
function makeCanvas(canvasId) {
    var canvas = document.getElementById(canvasId);
    let g = canvas.getContext("2d");

    const drawScreen = function () {
        g.fillStyle = "#ffffff";
        g.fillRect(0, 0, canvas.width, canvas.height);
        g.strokeStyle = penrose.OUTLINE;
        g.lineWidth = 1;
        let scale = 10;
        const { penta, star } = iface(g, scale, shapeMode.shapeMode);
        let bounds;
        let width = 0;
        let height = 0;
        let base = p(0, 0);
        do {
            canvas.width = width;
            canvas.height = height;
            bounds = new Bounds();
            bounds.expand(
                canvasId == "p5"
                    ? penta(0, penrose.Pe5, true, base, 0)
                    : canvasId == "p3"
                    ? penta(0, penrose.Pe3, false, base, 0)
                    : canvasId == "p1"
                    ? penta(0, penrose.Pe1, false, base, 0)
                    : canvasId == "s5"
                    ? star(0, penrose.St5, false, base, 0)
                    : canvasId == "s3"
                    ? star(0, penrose.St3, false, base, 0)
                    : canvasId == "s1"
                    ? star(0, penrose.St1, false, base, 0)
                    : null
            );
            bounds.pad(0.5);
            base = base.tr(bounds.min.neg);
            width = (bounds.maxPoint.x - bounds.minPoint.x) * scale + 1;
            height = (bounds.maxPoint.y - bounds.minPoint.y) * scale + 1;
        } while (!bounds.min.isZero);
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
 * The first expansion draws penta(1) and star(1) varients
 * Sets the globals g and scale
 */
function drawFirstInflation(id) {
    const canvas = document.querySelector(`#${id} > canvas`);
    if (!canvas) {
        console.log("canvasId is null!");
        return;
    }
    let g = canvas.getContext("2d");

    const drawScreen = function () {
        g.fillStyle = "#ffffff";
        g.fillRect(0, 0, canvas.width, canvas.height);
        //g.fillStyle = p1Orange;
        g.strokeStyle = penrose.OUTLINE;
        g.lineWidth = 1;
        let scale = 10;
        const { penta, star, pentaRhomb, starRhomb } = iface(
            g,
            scale,
            shapeMode.shapeMode
        );

        let x = 8;
        let y = 9;
        const UP = false;
        const DOWN = true;
        const bounds = new Bounds();
        bounds.expand(penta(0, penrose.Pe5, UP, p(x, y), 1));
        bounds.expand(pentaRhomb(0, penrose.Pe5, UP, p(x, y), 1));
        penta(0, penrose.Pe5, DOWN, p(25, y), 1);
        pentaRhomb(0, penrose.Pe5, DOWN, p(25, y), 1);
        y += 18;
        for (let i = 0; i < 5; i++) {
            penta(i, penrose.Pe3, UP, p(x + i * 20, y), 1);
            pentaRhomb(i, penrose.Pe3, UP, p(x + i * 20, y), 1);
        }
        y += 20;
        for (let i = 0; i < 5; i++) {
            penta(i, penrose.Pe3, DOWN, p(x + i * 20, y), 1);
            pentaRhomb(i, penrose.Pe3, DOWN, p(x + i * 20, y), 1);
        }
        y += 20;
        for (let i = 0; i < 5; i++) {
            penta(i, penrose.Pe1, UP, p(x + i * 20, y), 1);
            pentaRhomb(i, penrose.Pe1, UP, p(x + i * 20, y), 1);
        }
        y += 20;
        for (let i = 0; i < 5; i++) {
            penta(i, penrose.Pe1, DOWN, p(x + i * 20, y), 1);
            pentaRhomb(i, penrose.Pe1, DOWN, p(x + i * 20, y), 1);
        }
        y += 25;
        star(0, penrose.St5, UP, p(15, y), 1);
        starRhomb(0, penrose.St5, UP, p(15, y), 1);
        star(0, penrose.St5, DOWN, p(45, y), 1);
        starRhomb(0, penrose.St5, DOWN, p(45, y), 1);
        x = 10;
        y += 30;
        for (let i = 0; i < 5; i++) {
            star(i, penrose.St1, UP, p(x + i * 20, y), 1);
            starRhomb(i, penrose.St1, UP, p(x + i * 20, y), 1);
        }
        y += 25;
        for (let i = 0; i < 5; i++) {
            star(i, penrose.St1, DOWN, p(x + i * 20, y), 1);
            starRhomb(i, penrose.St1, DOWN, p(x + i * 20, y), 1);
        }

        x = 15;
        y += 25;
        for (let i = 0; i < 5; i++) {
            star(i, penrose.St3, UP, p(x + i * 25, y), 1);
            starRhomb(i, penrose.St3, UP, p(x + i * 25, y), 1);
        }

        y += 25;
        for (let i = 0; i < 5; i++) {
            bounds.expand(star(i, penrose.St3, DOWN, p(x + i * 25, y), 1));
            bounds.expand(starRhomb(i, penrose.St3, DOWN, p(x + i * 25, y), 1));
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
    const canvas = document.querySelector(`#${id} > canvas`);
    // g is global
    let g = canvas.getContext("2d");
    drawScreen();
    /**
     *
     */
    function drawScreen() {
        const UP = false;
        const DOWN = true;
        g.fillStyle = "#ffffff";
        g.fillRect(0, 0, canvas.width, canvas.height);

        g.fillStyle = penrose.ORANGE_PENTA;
        g.strokeStyle = penrose.OUTLINE;
        g.lineWidth = 1;
        let scale = 5;
        const { star, penta, pentaRhomb, starRhomb } = iface(
            g,
            scale,
            shapeMode.shapeMode
        );

        let x = 25;
        let y = 25;
        penta(0, penrose.Pe5, UP, p(x, y), 2);
        pentaRhomb(0, penrose.Pe5, UP, p(x, y), 2);

        penta(0, penrose.Pe5, DOWN, p(x + 50, y), 2); //
        y += 50;
        x = 25;
        for (let i = 0; i < 5; i++) {
            penta(i, penrose.Pe3, UP, p(x + i * 50, y), 2);
        }
        y += 55;
        for (let i = 0; i < 5; i++) {
            penta(i, penrose.Pe3, DOWN, p(x + i * 50, y), 2);
        }
        y += 50;
        for (let i = 0; i < 5; i++) {
            penta(i, penrose.Pe1, UP, p(x + i * 50, y), 2);
        }
        y += 55;
        for (let i = 0; i < 5; i++) {
            penta(i, penrose.Pe1, DOWN, p(x + i * 50, y), 2);
        }
        y += 60; // one thru four
        star(0, penrose.St5, UP, p(35, y), 2);
        starRhomb(0, penrose.St5, UP, p(35, y), 2);
        star(0, penrose.St5, DOWN, p(100, y), 2);
        starRhomb(0, penrose.St5, DOWN, p(100, y), 2);
        y += 74; // one thru four
        x = 35;
        for (let i = 0; i < 5; i++) {
            star(i, penrose.St3, UP, p(x + i * 67, y), 2);
        }
        y += 70; // one thru four
        for (let i = 0; i < 5; i++) {
            star(i, penrose.St3, DOWN, p(x + i * 67, y), 2);
        }
        y += 75; // one thru four
        for (let i = 0; i < 5; i++) {
            star(i, penrose.St1, UP, p(x + i * 50, y), 2);
        }
        y += 60; // one thru four
        for (let i = 0; i < 5; i++) {
            star(i, penrose.St1, DOWN, p(x + i * 50, y), 2);
        }
    }
}

/***
 * A lot of cool stuff for computing sizes here
 */
function drawGridWork(id) {
    const UP = false;
    const DOWN = true;

    const canvas = document.querySelector(`#${id} > canvas`);

    let g = canvas.getContext("2d");
    drawBig();

    /**
     * Draws all of the penrose rotations
     * Draws a few decagons too.
     */
    function drawBig() {
        g.fillStyle = "#ffffff";
        g.fillRect(0, 0, canvas.width, canvas.height);

        //g.fillStyle = p1Orange;
        g.strokeStyle = penrose.OUTLINE;
        g.lineWidth = 1;
        let scale = 10;
        const { deca, decaRhomb, grid } = iface(g, scale, shapeMode.shapeMode);

        let y = 5;
        const shapes = [mosaic.penta, mosaic.diamond, mosaic.star, mosaic.boat];

        const spacing = 12;
        for (const shape of shapes) {
            for (let i = 0; i < 10; i++) {
                let offset = p((i + 1) * spacing, y);
                mosaic.renderShape(
                    shapeColors.idList["p1-color"],
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

                quadrille.renderShape(
                    shapeColors.idList["p1-color"] + "44",
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
        deca(fifths, isDown, base, exp);
        grid(base, 10);

        fifths = 0;
        isDown = false;
        base = p(45, 75);
        exp = 2;
        deca(fifths, isDown, base, exp);
        grid(base, 18);

        fifths = 3;
        isDown = true;
        base = p(15, 115);
        exp = 1;
        deca(fifths, isDown, base, exp);
        grid(base, 10);

        fifths = 3;
        isDown = true;
        base = p(45, 115);
        exp = 2;
        deca(fifths, isDown, base, exp);
        grid(base, 18);

        fifths = 1;
        isDown = false;
        base = p(15, 155);
        exp = 1;
        deca(fifths, isDown, base, exp);
        grid(base, 10);

        fifths = 1;
        isDown = false;
        base = p(45, 155);
        exp = 2;
        deca(fifths, isDown, base, exp);
        decaRhomb(fifths, isDown, base, exp);
        grid(base, 18);
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
    const canvas = document.querySelector(`#${id} > canvas`);
    let g = canvas.getContext("2d");
    g.fillStyle = "#ffffff";
    g.fillRect(0, 0, canvas.width, canvas.height);
    g.strokeStyle = penrose.OUTLINE;
    g.lineWidth = 1;
    let scale = 10;
    const { penta, star, deca } = iface(g, scale, shapeMode.shapeMode);
    penrose.scale = scale; // Maybe does not use it.

    function starType(type) {
        switch (controls.typeList[type]) {
            case penrose.Pe1:
                return penrose.St1;
            case penrose.Pe3:
                return penrose.St3;
            case penrose.Pe5:
                return penrose.St5;
            default:
                return controls.typeList[type];
        }
    }

    function pentaType(type) {
        switch (controls.typeList[type]) {
            case penrose.St1:
                return penrose.Pe1;
            case penrose.St3:
                return penrose.Pe3;
            case penrose.St5:
                return penrose.Pe5;
            default:
                return controls.typeList[type];
        }
    }

    const drawScreen = function () {
        let x = 13;
        let y = 26;
        const bounds = penta(
            controls.fifths,
            pentaType(controls.typeIndex),
            controls.isDown,
            p(x, y),
            0
        );
        x += 21;
        penta(
            controls.fifths,
            pentaType(controls.typeIndex),
            controls.isDown,
            p(x, y),
            1
        );
        x += 34;
        penta(
            controls.fifths,
            pentaType(controls.typeIndex),
            controls.isDown,
            p(x, y),
            2
        );

        x = 13;
        y += 55;
        star(
            controls.fifths,
            starType(controls.typeIndex),
            controls.isDown,
            p(x, y),
            0
        );
        x += 21;
        star(
            controls.fifths,
            starType(controls.typeIndex),
            controls.isDown,
            p(x, y),
            1
        );
        x += 54;
        star(
            controls.fifths,
            starType(controls.typeIndex),
            controls.isDown,
            p(x, y),
            2
        );
    };

    drawScreen();
}

/***
 * This draws big decas.
 * Let's make it friendlier
 */
function drawGeneric3(id) {
    const canvas = document.querySelector(`#${id} > canvas`);

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

/**
 * This has been removed and replaced by an Iframe.
 * !!! But it apparently does some scaling used by the Ifram
 * @param {} id
 * @returns
 */
function drawRealWork(id) {
    const canvas = document.querySelector(`#${id} > canvas`);
    if (!canvas) {
        return;
    }

    // g is global
    let g = canvas.getContext("2d");
    g.fillStyle = "#ffffff";
    g.fillRect(0, 0, canvas.width, canvas.height);
    g.strokeStyle = penrose.OUTLINE;
    g.lineWidth = 1;
    let scale = 10;
    const { star, penta, deca } = iface(g, scale, shapeMode.shapeMode);

    const drawScreen = function () {
        //const rShapes = [real.penta];
    };

    drawScreen();
}

function compare(a, b) {
    for (let i = 0; i < 10; i++) {
        const aEle = a.list[i];
        const bEle = b.list[i];
        if (!aEle.equals(bEle)) {
            console.log(`angle: ${i}, a: ${aEle}, b: ${bEle}`);
        }
    }
}
