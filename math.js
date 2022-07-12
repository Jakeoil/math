"use strict";

/**
 * Penrose Mozaic Webapp version 1.
 * Jeff Coyles Penrose type one pattern made out of square tiles of
 * three colors.
 * Requires penrose.js
 */

/**
 * Globals
 */
const controls = new Controls(0, 0, false);
// Can this be made into a function?
const eleFifths = document.querySelector("#fifths");
const eleType = document.querySelector("#type");
const eleIsDown = document.querySelector("#isDown");
eleFifths.innerHTML = `fifths: ${controls.fifths}`;
eleType.innerHTML = controls.typeName;
eleIsDown.innerHTML = controls.direction;

// Graphics globals for whole canvas
let g;
let scale;
let stroke; // New

/**
 * Events for the three buttons
 */
const clickFifths = function () {
    console.log("clickFifths");
    controls.bumpFifths();
    eleFifths.innerHTML = `fifths: ${controls.fifths}`;
    penroseApp();
};

const clickType = function () {
    controls.bumpType();
    eleType.innerHTML = controls.typeName;
    penroseApp();
};

const clickIsDown = function () {
    controls.toggleDirection();
    eleIsDown.innerHTML = controls.direction;
    penroseApp();
};

/**
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
    // This is where I refactor _everything_
    drawGeneric123("g012");
    drawGeneric3("g3");
}

/*************************************************************************************
 * Draws a little canvas with a shape.
 * Shape depends on passed in ID.
 */
function makeCanvas(canvasId) {
    var canvas = document.getElementById(canvasId);
    g = canvas.getContext("2d");
    // for makeCanvas only
    const drawScreen = function () {
        // Initialize screen.
        g.fillStyle = "#ffffff";
        g.fillRect(0, 0, canvas.width, canvas.height);
        g.fillStyle = penrose.ORANGE; // This not needed
        g.strokeStyle = penrose.OUTLINE;
        g.lineWidth = 1;
        scale = 10;
        // this is a p0 down.
        const bounds = new Bounds();
        switch (canvasId) {
            case "p5":
                bounds.expand(penta(0, penrose.Pe5, true, new P(3, 3), 0));
                break;
            case "p3":
                bounds.expand(penta(0, penrose.Pe3, false, new P(3, 3), 0));
                break;
            case "p1":
                bounds.expand(penta(0, penrose.Pe1, false, new P(3, 3), 0));
                break;
            case "s5":
                bounds.expand(star(0, penrose.St5, false, new P(4, 4), 0));
                break;
            case "s3":
                bounds.expand(star(0, penrose.St3, false, new P(4, 4), 0));
                break;
            case "s1":
                bounds.expand(star(2, penrose.St1, false, new P(1, 2), 0));
                break;
        }

        // Make adjustments based on the bounds of the drawing.
        redraw(bounds, canvas, drawScreen);
    };

    drawScreen();
}

/**
 * Called at end of draw cycle.  Redraws under the following conditions
 *   The size of the canvas is greater than the bounds
 *   (future) add a max bounds.
 * @param {*} bounds
 * @param {*} canvas
 * @param {*} drawFunction
 */
function redraw(bounds, canvas, drawFunction) {
    const computedWidth = bounds.maxPoint.x * scale + scale;
    const computedHeight = bounds.maxPoint.y * scale + scale;
    if (canvas.width != computedWidth || canvas.height != computedHeight) {
        canvas.width = computedWidth;
        canvas.height = computedHeight;
        setTimeout(drawFunction());
    }
}

/***************************************************************************************
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
        g.fillStyle = penrose.ORANGE;
        g.strokeStyle = penrose.OUTLINE;
        g.lineWidth = 1;

        scale = 10;
        penrose.scale = scale;

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
/*************************************************************************************
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

        g.fillStyle = penrose.ORANGE;
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

function drawGridWork(id) {
    const UP = false;
    const DOWN = true;

    const canvas = document.querySelector(`#${id} > canvas`);

    g = canvas.getContext("2d");
    //drawScreen();
    drawBig();

    /**
     * Draws all of the penrose rotations
     * Draws a few decagons too.
     */
    function drawBig() {
        g.fillStyle = "#ffffff";
        g.fillRect(0, 0, canvas.width, canvas.height);

        g.fillStyle = penrose.ORANGE;
        g.strokeStyle = penrose.OUTLINE;
        g.lineWidth = 1;
        scale = 10;
        penrose.scale = scale; // Maybe does not use it.

        let y = 5;
        const shapes = [
            penrose.penta,
            penrose.diamond,
            penrose.star,
            penrose.boat,
        ];
        const spacing = 12;
        for (const shape of shapes) {
            for (let i = 0; i < 10; i++) {
                let offset = p((i + 1) * spacing, y);
                figure(penrose.ORANGE, offset, shape[i]);
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
                outline(penrose.ORANGE, offset, shape[i]);
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
    //g.fillStyle = penrose.ORANGE;
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
        console.log("--Pentagon");
        let x = 13;
        let y = 26;
        const bounds = penta(
            controls.fifths,
            pentaType(controls.type),
            controls.isDown,
            p(x, y),
            0
        );
        x += 21;
        penta(
            controls.fifths,
            pentaType(controls.type),
            controls.isDown,
            p(x, y),
            1
        );
        x += 34;
        penta(
            controls.fifths,
            pentaType(controls.type),
            controls.isDown,
            p(x, y),
            2
        );

        console.log("--Diamond up 4");
        x = 13;
        y += 55;
        star(
            controls.fifths,
            starType(controls.type),
            controls.isDown,
            p(x, y),
            0
        );
        x += 21;
        star(
            controls.fifths,
            starType(controls.type),
            controls.isDown,
            p(x, y),
            1
        );
        x += 54;
        star(
            controls.fifths,
            starType(controls.type),
            controls.isDown,
            p(x, y),
            2
        );
    };

    drawScreen();
}

function drawGeneric3(id) {
    console.log(`drawGeneric3`);
    const canvas = document.querySelector(`#${id} > canvas`);

    // g is global
    g = canvas.getContext("2d");
    g.fillStyle = "#ffffff";
    g.fillRect(0, 0, canvas.width, canvas.height);
    g.strokeStyle = penrose.OUTLINE;
    g.lineWidth = 1;
    scale = 5;

    const drawScreen = function () {
        let x = 100;
        let y = 250;

        let decagon = true;
        if (decagon) {
            deca(controls.fifths, controls.isDown, p(20, 20), 1);
            deca(controls.fifths, controls.isDown, p(50, 50), 2);
            deca(controls.fifths, controls.isDown, p(210, 80), 3);
            deca(controls.fifths, controls.isDown, p(x, y), 4);
        } else {
            console.log(`drawScreen ${controls.type}`);
            const type = controls.typeList[controls.type];
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

/***
 * penrose is a global constant (does it have to be a var?)
 * This is called only from expansion 1
 */
/**
 * This is the routine that ultimately renders the 'tile'
 * @param {*} fill One of the colors
 * @param {*} offset Location in P format
 * @param {*} shape centered array of 'pixels' centered.
 * Prerequisites: Globals g and scale
 */
function figure(fill, offset, shape) {
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
    }
    return bounds;
}

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

function measure(offset, shape) {
    const bounds = new Bounds();
    for (const point of shape) {
        bounds.addPoint(offset, point);
    }
    return bounds;
}
function outline(fill, offset, shape) {
    let start = true;
    for (const point of shape) {
        g.strokeStyle = "#000000";
        g.lineWidth = 2;
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
    g.stroke();
}

/***  
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

// P is the offset of blue -> blue, blue -> yellow or blue -> orange
function pWheelNext(exp) {
    const p = pWheels[exp].w;
    return new Wheel(
        p[1].tr(p[0]).tr(p[9]),
        p[2].tr(p[1]).tr(p[0]),
        p[3].tr(p[2]).tr(p[1])
    );
}

// S is the offset
function sWheelNext(exp) {
    const p = pWheels[exp].w;
    const s = sWheels[exp].w;
    return new Wheel(
        p[1].tr(p[0]).tr(s[9]),
        p[2].tr(p[1]).tr(s[0]),
        p[3].tr(p[2]).tr(s[1])
    );
}

function tWheelNext(exp) {
    const p = pWheels[exp].w;
    const s = sWheels[exp].w;
    return new Wheel(
        s[1].tr(p[9]).tr(p[0]).tr(p[1]).tr(s[9]),
        s[2].tr(p[0]).tr(p[1]).tr(p[2]).tr(s[0]),
        s[3].tr(p[1]).tr(p[2]).tr(p[3]).tr(s[1])
    );
}

function dWheelNext(exp) {
    const p = pWheels[exp].w;
    const d = dWheels[exp].w;
    console.log(`(${d[0].tr(p[0])}, ${d[1].tr(p[1])}, ${d[2].tr(p[2])}`);
    return new Wheel(d[0].tr(p[0]), d[1].tr(p[1]), d[2].tr(p[2]));
}

// Wheel[0] is undefined
const pWheels = [null];
const sWheels = [null];
const tWheels = [null];
const dWheels = [null];

// Wheel1 is the seed.
const pWheel1 = new Wheel(p(0, -6), p(3, -4), p(5, -2));
const sWheel1 = new Wheel(p(0, -5), p(3, -5), p(5, -1));
const tWheel1 = new Wheel(p(0, -8), p(5, -8), p(8, -2));
const dWheel1 = new Wheel(p(0, -3), p(2, -3), p(3, -1));

// dWheel2
const dWheel2 = new Wheel(p(0, -3 - 6), p(2 + 3, -3 - 4), p(8, -2 - 3));

console.log(`real P1[1]: ${pWheel1.string}`);
console.log(`real S1[1]: ${sWheel1.string}`);
console.log(`real T1[1]: ${tWheel1.string}`);
console.log(`real D1[1]: ${dWheel1.string}`);

// Wheel[1] = Wheel1
pWheels.push(pWheel1);
sWheels.push(sWheel1);
tWheels.push(tWheel1);
dWheels.push(dWheel1);

const wheelMax = 5;
for (let i = 1; i <= wheelMax; i++) {
    pWheels.push(pWheelNext(i));
    sWheels.push(sWheelNext(i));
    tWheels.push(tWheelNext(i));
    dWheels.push(dWheelNext(i));
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
        bounds.expand(
            figure(type.typeColor, loc, type.shape[tenths(fifths, isDown)])
        );
        return bounds; // call figure
    }

    const pWheel = pWheels[exp].w;
    const sWheel = sWheels[exp].w;

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

/******************************************************************************************
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
    //console.log(`${type.name}: ${fifths}, exp: ${exp} ${loc}`)

    if (exp == 0) {
        // Draw the figure.  Finished
        //console.log(`typeColor: ${type.typeColor}`);
        bounds.expand(
            figure(type.typeColor, loc, type.shape[tenths(fifths, isDown)])
        );
        return bounds;
    }

    bounds.expand(star(0, penrose.St5, !isDown, loc, exp - 1));

    for (let i = 0; i < 5; i++) {
        const shift = norm(fifths + i);
        const angle = tenths(shift, isDown);
        //const pWheel = pWheels[exp].w;
        const sWheel = sWheels[exp].w;
        const tWheel = tWheels[exp].w;
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

    // Move the center of the decagon to the real center.
    let dUp = dWheels[exp].up;
    let dDown = dWheels[exp].down;
    let dOff = isDown ? dUp[fifths] : dDown[fifths];
    let base = loc.tr(dOff);
    let pUp = pWheels[exp].up;
    let pDown = pWheels[exp].down;
    let sUp = sWheels[exp].up;
    let sDown = sWheels[exp].down;
    let offs; // Work variable

    // The central yellow pentagon
    penta(fifths, penrose.Pe3, isDown, base, exp - 1); //

    // The two diamonds
    offs = isDown ? sDown[norm(1 + fifths)] : sUp[norm(1 + fifths)];
    star(norm(fifths + 3), penrose.St1, isDown, base.tr(offs), exp - 1); // sd1

    offs = isDown ? sDown[norm(4 + fifths)] : sUp[norm(4 + fifths)];
    star(norm(fifths + 2), penrose.St1, isDown, base.tr(offs), exp - 1); // sd4

    // The two orange pentagons
    offs = isDown ? pUp[norm(3 + fifths)] : pDown[norm(3 + fifths)];
    penta(norm(fifths + 2), penrose.Pe1, !isDown, base.tr(offs), exp - 1);

    offs = isDown ? pUp[norm(2 + fifths)] : pDown[norm(2 + fifths)];
    penta(norm(fifths + 3), penrose.Pe1, !isDown, base.tr(offs), exp - 1);

    // And the boat
    offs = isDown
        ? pUp[norm(2 + fifths)].tr(sUp[norm(3 + fifths)])
        : pDown[norm(2 + fifths)].tr(sDown[norm(3 + fifths)]);
    star(fifths + 0, penrose.St3, !isDown, base.tr(offs), exp - 1);
}
