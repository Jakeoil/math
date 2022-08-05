"use strict";
/**
 * Penrose Mozaic Webapp version 1.
 * Jeff Coyles Penrose type one pattern made out of square tiles of
 * three colors.
 * Requires penrose.js
 *
 * Added Quadrille mode. Shows graph paper version.
 * Added Real mode.
 *
 * Added controls for colors.
 */

/**
 * Globals
 */
// Graphics globals for whole canvas
let g;

// These may be controllable
let scale;
let stroke; // New
/**
 * These global values shall be controllable
 * Set them to the defaults
 */

/**
 * Shape colors control.
 * Contains a mapping of id to entry,
 * entry: {ele, color, defaultColor}
 *
 */
class ShapeColors {
    constructor() {
        this.idList = {
            "p5-color": { defaultColor: penrose.Pe5.defaultColor },
            "p3-color": { defaultColor: penrose.Pe3.defaultColor },
            "p1-color": { defaultColor: penrose.Pe1.defaultColor },
            "star-color": { defaultColor: penrose.St5.defaultColor },
            "boat-color": { defaultColor: penrose.St3.defaultColor },
            "diamond-color": { defaultColor: penrose.St1.defaultColor },
        };
        const shapeColorEles = document.querySelectorAll(".shape-color");
        console.log(shapeColorEles.length);
        for (const ele of shapeColorEles) {
            console.log(`found id ${ele.id} in eles`);
            const entry = this.idList[ele.id];
            if (entry) {
                entry.ele = ele;
                entry.ele.addEventListener("input", onShapeColorsInput, false);
                entry.ele.addEventListener(
                    "change",
                    onShapeColorsChange,
                    false
                );
            } else {
                console.log(`Undefined id: ${ele.id} in html`);
            }
        }
        this.reset();
    }

    /**
     * Set the elements to the last value received
     */
    refresh() {
        for (const entry of Object.values(this.idList)) {
            if (entry.ele) entry.ele.value = entry.color;
        }
        console.log(`refresh: ${stringify(this.idList)}`);
    }

    /**
     * Set the elements to their defaults
     */
    reset() {
        for (const entry of Object.values(this.idList)) {
            entry.color = entry.defaultColor;
        }
    }
}
const shapeColors = new ShapeColors();

// Set colors to default
shapeColors.reset();

// Set element values to colors
shapeColors.refresh();

// The reset button was clicked.
function onColorReset() {
    shapeColors.reset();
    shapeColors.refresh();
    penroseApp();
}

function onShapeColorsInput(event) {
    console.log(`input: id: ${event.target.id}, color: ${event.target.value}`);
    shapeColors.idList[event.target.id].color = event.target.value;
    shapeColors.refresh();
    penroseApp();
}

function onShapeColorsChange(event) {
    console.log(`change: id: ${event.target.id}, color: ${event.target.value}`);
    shapeColors.idList[event.target.id].color = event.target.value;
    shapeColors.refresh();
    penroseApp();
}
function onShapeColorsClick(event) {
    console.log(`click: id: ${event.target.id}, color: ${event.target.value}`);
}

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
 */
const MODE_MOSAIC = "mosaic";
const MODE_QUADRILLE = "quadrille";
const MODE_REAL = "real";
const MODE_LIST = [MODE_MOSAIC, MODE_QUADRILLE, MODE_REAL];

let shapeMode = cookie.getShapeMode(MODE_MOSAIC); // send default
const eleMode = document.querySelector("#shape-mode");

/**
 * Changing the shape mode also changes the globals that penta, star and deca
 * use.
 * Todo: penta star and deca also have some crud, for example drawing the
 * figures.
 */
function refreshShapeMode() {
    if (eleMode) eleMode.innerHTML = shapeMode;
}

refreshShapeMode();

const clickMode = function () {
    let new_idx = (MODE_LIST.indexOf(shapeMode) + 1) % MODE_LIST.length;
    shapeMode = MODE_LIST[new_idx];
    cookie.setShapeMode(shapeMode);
    refreshShapeMode();
    penroseApp();
};

/**
 * This is the default global for the shape and orientation controls
 */
// Note: cookies are a bitch here. (not so bad)
const controls = new Controls(0, 0, false);

// Can this be made into a function?

const eleFifths = document.querySelector("#fifths");
const eleType = document.querySelector("#type");
const eleIsDown = document.querySelector("#isDown");

/**
 * Initialization and
 * Events for the three buttons
 */
if (eleFifths) eleFifths.innerHTML = `fifths: ${controls.fifths}`;
const clickFifths = function () {
    controls.bumpFifths();
    eleFifths.innerHTML = `fifths: ${controls.fifths}`;
    penroseApp();
};

if (eleType) eleType.innerHTML = controls.typeName;
const clickType = function () {
    controls.bumpType();
    eleType.innerHTML = controls.typeName;
    penroseApp();
};

if (eleIsDown) eleIsDown.innerHTML = controls.direction;
const clickIsDown = function () {
    controls.toggleDirection();
    eleIsDown.innerHTML = controls.direction;
    penroseApp();
};

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

function pageClicked(pageId, button) {
    for (let page of pages) {
        page.style.display = "none";
    }
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
function penroseApp() {
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

/***
 * Draws a little canvas with a shape.
 * Shape depends on passed in ID.
 */
function makeCanvas(canvasId) {
    var canvas = document.getElementById(canvasId);
    g = canvas.getContext("2d");

    const drawScreen = function () {
        g.fillStyle = "#ffffff";
        g.fillRect(0, 0, canvas.width, canvas.height);
        g.strokeStyle = penrose.OUTLINE;
        g.lineWidth = 1;
        scale = 10;
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
function redraw(bounds, canvas, drawFunction) {
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
    g = canvas.getContext("2d");

    const drawScreen = function () {
        g.fillStyle = "#ffffff";
        g.fillRect(0, 0, canvas.width, canvas.height);
        //g.fillStyle = p1Orange;
        g.strokeStyle = penrose.OUTLINE;
        g.lineWidth = 1;
        scale = 10;

        let x = 8;
        let y = 9;
        const UP = false;
        const DOWN = true;
        const bounds = new Bounds();
        bounds.expand(penta(0, penrose.Pe5, UP, p(x, y), 1));
        penta(0, penrose.Pe5, DOWN, p(25, y), 1);
        y += 18;
        for (let i = 0; i < 5; i++) {
            penta(i, penrose.Pe3, UP, p(x + i * 20, y), 1);
        }
        y += 20;
        for (let i = 0; i < 5; i++) {
            penta(i, penrose.Pe3, DOWN, p(x + i * 20, y), 1);
        }
        y += 20;
        for (let i = 0; i < 5; i++) {
            penta(i, penrose.Pe1, UP, p(x + i * 20, y), 1);
        }
        y += 20;
        for (let i = 0; i < 5; i++) {
            penta(i, penrose.Pe1, DOWN, p(x + i * 20, y), 1);
        }
        y += 25;
        star(0, penrose.St5, UP, p(15, y), 1);
        star(0, penrose.St5, DOWN, p(45, y), 1);
        x = 10;
        y += 30;
        for (let i = 0; i < 5; i++) {
            star(i, penrose.St1, UP, p(x + i * 20, y), 1);
        }
        y += 25;
        for (let i = 0; i < 5; i++) {
            star(i, penrose.St1, DOWN, p(x + i * 20, y), 1);
        }

        x = 15;
        y += 25;
        for (let i = 0; i < 5; i++) {
            star(i, penrose.St3, UP, p(x + i * 25, y), 1);
        }

        y += 25;
        for (let i = 0; i < 5; i++) {
            bounds.expand(star(i, penrose.St3, DOWN, p(x + i * 25, y), 1));
        }
        // conditional redraw
        redraw(bounds, canvas, drawScreen);
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
    g = canvas.getContext("2d");
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
        scale = 5;

        let x = 25;
        let y = 25;
        penta(0, penrose.Pe5, UP, p(x, y), 2);
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
        star(0, penrose.St5, DOWN, p(100, y), 2);
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

    g = canvas.getContext("2d");
    //drawScreen(); // We could use a control for this
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
        scale = 10;

        let y = 5;
        const shapes = [mosaic.penta, mosaic.diamond, mosaic.star, mosaic.boat];

        const spacing = 12;
        for (const shape of shapes) {
            for (let i = 0; i < 10; i++) {
                let offset = p((i + 1) * spacing, y);
                mosaic.renderShape(
                    shapeColors.idList["p1-color"],
                    offset,
                    shape[i]
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
                    shape[i]
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
    // g is global
    g = canvas.getContext("2d");
    g.fillStyle = "#ffffff";
    g.fillRect(0, 0, canvas.width, canvas.height);
    g.strokeStyle = penrose.OUTLINE;
    g.lineWidth = 1;
    scale = 10;
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
    g = canvas.getContext("2d");
    g.fillStyle = "#ffffff";
    g.fillRect(0, 0, canvas.width, canvas.height);
    g.strokeStyle = penrose.OUTLINE;
    g.lineWidth = 1;
    scale = 4;

    const drawScreen = function () {
        let x = 100;
        let y = 250;

        let decagon = true;
        if (decagon) {
            deca(controls.fifths, controls.isDown, p(20, 20), 1);
            deca(controls.fifths, controls.isDown, p(50, 50), 2);
            deca(controls.fifths, controls.isDown, p(210, 80), 3);
            deca(controls.fifths, controls.isDown, p(x, y), 6);
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
    g = canvas.getContext("2d");
    g.fillStyle = "#ffffff";
    g.fillRect(0, 0, canvas.width, canvas.height);
    g.strokeStyle = penrose.OUTLINE;
    g.lineWidth = 1;
    scale = 10;

    const drawScreen = function () {
        //const rShapes = [real.penta];
    };

    drawScreen();
}
/**********************************************************
 * Routines used by penta, star and deca.  Move these closer.
 */

/***
 * Draws a nice graph.
 */
function grid(offset, size) {
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
}

/**
 * Have no use for this yet.  Maybe delete
 * @param {*} offset
 * @param {*} shape
 * @returns
 */
function measure(offset, shape) {
    const bounds = new Bounds();
    for (const point of shape) {
        bounds.addPoint(offset, point);
    }
    return bounds;
}
/***************************************************************  
 * Discussion of the second expansions penta points.
 * These are the x and y offset from a center rectangle to an inverted rectangle.
 * There are five of them. Let's call the x coordinate cos and the y
           0   36   72  108  144  180
 * sin =   0,   8,  13,  13,  8,    0   -8 -13 -13 -8  and repeat 0
 *         0,   3    5    5   3     0   -3  -5  -5 -3      
 * 
 * cos = -14, -12,  -4,   4,  12, 14, 12,  4  -4  -12
 *        -6   -4,  -2,   2,   4,  6   4   2  -2    4 
 * 
 * 
 *       0               *
 *       4                   *
 *       8                       *
 *       12                          *
 *       13                           *
 *       14                            *
 *       13                           *
 *       12                          *
 *       8                       *     
 *       4                   *    
 *       0               *    
 *      -4           *
 *      -8       *
 *     -12   *
 *     -13  *
 *     -14 *  
 *     -13  *
 *     -12   *
 *      -8       *
 *      -4           *
 *       0               *    
 *     
 * 
 * 
 * */

function compare(a, b) {
    for (let i = 0; i < 10; i++) {
        const aEle = a.list[i];
        const bEle = b.list[i];
        if (!aEle.equals(bEle)) {
            console.log(`angle: ${i}, a: ${aEle}, b: ${bEle}`);
        }
    }
}

function pColor(type) {
    switch (type) {
        case penrose.Pe5:
            return shapeColors.idList["p5-color"].color;
        //return p5Blue;
        case penrose.Pe3:
            return shapeColors.idList["p3-color"].color;
        //return p3Yellow;
        case penrose.Pe1:
            return shapeColors.idList["p1-color"].color;
        //return p1Orange;
        case penrose.St5:
            return shapeColors.idList["star-color"].color;
        //return starBlue;
        case penrose.St3:
            return shapeColors.idList["boat-color"].color;
        //return boatBlue;
        case penrose.St1:
            return shapeColors.idList["diamond-color"].color;
        //return diamondBlue;
    }
    return null;
}

function pShape(type) {
    switch (type) {
        case penrose.Pe5:
        case penrose.Pe3:
        case penrose.Pe1:
            return penrose[shapeMode].penta;
        case penrose.St5:
            return penrose[shapeMode].star;
        case penrose.St3:
            return penrose[shapeMode].boat;
        case penrose.St1:
            return penrose[shapeMode].diamond;
    }

    return null;
}

/*******************************************************************************
 * Recursive routine to draw pentagon type objects.
 * P5, P3 and P1  Up versions shown
 *
 *    p5  === blue === P0
 *
 *     o
 *  o     o
 *   o   o
 *
 *    p3  === yellow === P2
 *
 *     o         o         *         *         o
 *  o     o   *     o   *     o   o     *   o     *
 *   *   *     *   o     o   o     o   o     o   *
 *
 *    p1 === orange === P4
 *
 *     o         *         *         *         *
 *  *     *   *     o   *     *   *     *   o     *
 *   *   *     *   *     *   o     o   *     *   *
 *
 *
 * @param {*} fifths
 * @param {*} type
 *   This object contains the tables necessary for construction.
 * @param {*} isDown
 * @param {*} loc target of the center of the object on the canvas
 * @param {*} exp Recursive expansion. 0 the primitive.
 * @returns
 */
function penta(fifths, type, isDown, loc, exp) {
    const bounds = new Bounds();
    fifths = norm(fifths);
    if (exp == 0) {
        let shapes = pShape(type);
        if (shapes) {
            bounds.expand(
                penrose[shapeMode].renderShape(
                    pColor(type),
                    loc,
                    shapes[tenths(fifths, isDown)]
                )
            );
        } else {
            bounds.addPoint(loc, loc);
        }

        return bounds; // call figure
    }

    const wheels = penrose[shapeMode].wheels;
    const pWheel = wheels.p[exp].w;
    const sWheel = wheels.s[exp].w;
    // Draw the center. Always the BLUE p5
    bounds.expand(penta(0, penrose.Pe5, !isDown, loc, exp - 1));

    for (let i = 0; i < 5; i++) {
        const shift = norm(fifths + i);
        bounds.expand(
            penta(
                norm(shift + type.twist[i]),
                type.twist[i] == 0 ? penrose.Pe3 : penrose.Pe1,
                isDown,
                loc.tr(pWheel[tenths(shift, isDown)]),
                exp - 1
            )
        );

        if (type.diamond.includes(i)) {
            bounds.expand(
                star(
                    shift,
                    penrose.St1,
                    !isDown,
                    loc.tr(sWheel[tenths(shift, !isDown)]),
                    exp - 1
                )
            );
        }
    }
    return bounds;
}

/******************************************************************************
 * S5, S3 and S1  Up versions shown
 *    s5   star
 *
 *     *
 *  *  .  *
 *   *   *
 *
 *    s3   boat
 *
 *     *         *                             *
 *  *  .  *      .  *      .  *   *  .      *  .
 *                 *     *   *     *   *     *
 *
 *    s5   diamond
 *
 *     *
 *     .         .  *      .         .      *  .
 *                           *     *
 *
 * @param {*} fifths 0 to 5. Angle from direction.
 * @param {*} type  S5 S3 S1
 * @param {*} isDown
 * @param {*} loc
 * @param {*} exp
 * @returns
 */
function star(fifths, type, isDown, loc, exp) {
    const bounds = new Bounds();
    const name = type.name;
    fifths = norm(fifths);
    if (exp == 0) {
        let shapes = pShape(type);
        if (shapes) {
            bounds.expand(
                penrose[shapeMode].renderShape(
                    pColor(type),
                    loc,
                    shapes[tenths(fifths, isDown)]
                )
            );
        } else {
            bounds.addPoint(loc, loc);
        }

        return bounds;
    }

    bounds.expand(star(0, penrose.St5, !isDown, loc, exp - 1));

    for (let i = 0; i < 5; i++) {
        const shift = norm(fifths + i);
        const angle = tenths(shift, isDown);
        const wheels = penrose[shapeMode].wheels;

        const tWheel = wheels.t[exp].w;
        const sWheel = wheels.s[exp].w;

        if (type.color[i] != null) {
            bounds.expand(
                penta(
                    norm(shift),
                    penrose.Pe1,
                    !isDown,
                    loc.tr(sWheel[angle]),
                    exp - 1
                )
            );

            bounds.expand(
                star(shift, penrose.St3, isDown, loc.tr(tWheel[angle]), exp - 1)
            );
        }
    }
    return bounds;
}

/**
 * Decagon is a type unto itself.
 *
 * @param {*} fifths
 * @param {*} isDown
 * @param {*} loc
 * @param {*} exp
 * @returns
 *
 * The up version.
 *
 *      + x    x +
 *     x o  ,   o x
 *    * x   o  x   *
 *    .    +    .
 *      +--*--+
 */

function deca(fifths, isDown, loc, exp) {
    const bounds = new Bounds();
    if (exp == 0) {
        return bounds;
    }

    const wheels = penrose[shapeMode].wheels;

    // Move the center of the decagon to the real center.
    let dUp = wheels.d[exp].up;
    let dDown = wheels.d[exp].down;
    let dOff = isDown ? dUp[fifths] : dDown[fifths];
    let base = loc.tr(dOff);
    let pUp = wheels.p[exp].up;
    let pDown = wheels.p[exp].down;
    let sUp = wheels.s[exp].up;
    let sDown = wheels.s[exp].down;
    let offs; // Work variable

    // The central yellow pentagon
    bounds.expand(penta(fifths, penrose.Pe3, isDown, base, exp - 1)); //

    // The two diamonds
    offs = isDown ? sDown[norm(1 + fifths)] : sUp[norm(1 + fifths)];
    bounds.expand(
        star(norm(fifths + 3), penrose.St1, isDown, base.tr(offs), exp - 1)
    ); // sd1

    offs = isDown ? sDown[norm(4 + fifths)] : sUp[norm(4 + fifths)];
    bounds.expand(
        star(norm(fifths + 2), penrose.St1, isDown, base.tr(offs), exp - 1)
    ); // sd4

    // The two orange pentagons
    offs = isDown ? pUp[norm(3 + fifths)] : pDown[norm(3 + fifths)];
    bounds.expand(
        penta(norm(fifths + 2), penrose.Pe1, !isDown, base.tr(offs), exp - 1)
    );

    offs = isDown ? pUp[norm(2 + fifths)] : pDown[norm(2 + fifths)];
    bounds.expand(
        penta(norm(fifths + 3), penrose.Pe1, !isDown, base.tr(offs), exp - 1)
    );

    // And the boat
    offs = isDown
        ? pUp[norm(2 + fifths)].tr(sUp[norm(3 + fifths)])
        : pDown[norm(2 + fifths)].tr(sDown[norm(3 + fifths)]);
    bounds.expand(
        star(fifths + 0, penrose.St3, !isDown, base.tr(offs), exp - 1)
    );
    return bounds;
}
