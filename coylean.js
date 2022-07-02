'use strict'
let g;
const SCALE = 8;

/**
 * Controls (preferences)
 */
let rightsPos=1;
let downsPos=1;
const eleLeft = document.querySelector('#rights-left');
const eleRight = document.querySelector('#rights-right');
const eleUp = document.querySelector('#downs-up');
const eleDown = document.querySelector('#rights-right');
const eleDownsPos = document.querySelector('#downs-pos');
const eleRightsPos = document.querySelector('#rights-pos');
/**
 * These control the are the rights- and downs- Pos
 */
 eleRightsPos.innerHTML = rightsPos;
 const clickRight = function() {
    rightsPos++;
    eleRightsPos.innerHTML = rightsPos;
    coyleanApp();
}

const clickLeft = function() {
    rightsPos--;
    eleRightsPos.innerHTML = rightsPos;
    coyleanApp();
}
eleDownsPos.innerHTML = downsPos;
const clickUp = function() {
    downsPos--;
    eleDownsPos.innerHTML = downsPos;
    coyleanApp();
}

const clickDown = function() {
    downsPos++;
    eleDownsPos.innerHTML = downsPos;
    coyleanApp();
}

let feature_active=true;

const eleActive = document.querySelector('#feature-active');
eleActive.innerHTML = feature_active?"ACTIVE":"NOT ACTIVE";
const toggleActive = function() {
    feature_active = !feature_active;
    eleActive.innerHTML = feature_active?"ACTIVE":"NOT ACTIVE";
    coyleanApp();
}

let SIZE = 5;
const eleSizeDec = document.querySelector('#size-dec');
const eleSizeInc = document.querySelector('#size-inc');
const eleSizeToggle = document.querySelector('#size-toggle');
eleSizeToggle.innerHTML = SIZE;
const clickSizeInc = function() {
    SIZE++;
    eleSizeToggle.innerHTML = SIZE;
    coyleanApp();
}

const clickSizeDec = function() {
    if (SIZE > 1)
        SIZE--;
    eleSizeToggle.innerHTML = SIZE;
    coyleanApp();
}

const clickSizeToggle = function() {
    if (SIZE < 10) {
        SIZE = 65;
    } else {
        SIZE = 5;
    }
    eleSizeToggle.innerHTML = SIZE;
    coyleanApp();
}

function coyleanApp() {
    console.log('draw the map');
    exploreMap('explore-map');
}

/** Returns the evenness of a number
 * 1 is the least even (0)
 * 0 is the most 100. 2^100 is just as even 
 */
function pri(n) {
    let p = 0;
    if (n == 0)
        return 100;

    while (n % 2 == 0) {
        p++;
        n = Math.floor(n/2);
    }
    return p;
}


/**
 * These little wrappers allow nice string methods for logging.
 */
class Row extends Array {
    toString() {
        return this.reduce(
            (previousValue, currentValue) => previousValue + (currentValue ? "|" : "o"),
            ""
        )
    }
}

class Col extends Array {
    toString() {
        return this.reduce(
            (previousValue, currentValue) => previousValue + (currentValue ? "-" : "o"),
            ""
        )
    }
}

/**
 * The Southeast Loop
 * 
 * This computes the default sector of the Coylean Region
 * From the initial row and columns, all set, it builds two Matrices based 
 * on the horizontal and vertical size.
 * A loop on rows and columns.
 * Creates a matrix using a column with numRows rights.
 * And a row with numColumns downs
 *  
 */
function seLoop(numRows, numColumns) {
    const initRow = new Row(numColumns).fill(true);
    const downMatrix = [...Array(numRows + 1)].map(x =>new Row);
    const rightMatrix = [...Array(numColumns + 1)].map(x =>new Col());
    let j = 0;
    downMatrix[j] = initRow;  // Full of rights
    for (j = 0; j < numRows; j++) { 
        // right matrix column zero first element i=0 inited
        let i = 0;
        rightMatrix[i][j] = true;
        for (i = 0; i < numColumns ; i++) {
            console.log(`input: downMatrix row ${j}[${i}] ${downMatrix[j][i]?"|":"o"}\n` +
                        `      rightMatrix col ${i}[${j}] ${rightMatrix[i][j]?"-":"o"}`);
            const a = reaction(
                downMatrix[j][i],   // this is correct
                rightMatrix[i][j],
                i, j);  
            downMatrix[j+1][i] = a[0];
            rightMatrix[i+1][j]= a[1];
            console.log(`output: downMatrix row ${j+1}[${i}]: ${a[0]?"|":"o"}\n` +
                        `        rightMatrix col ${i+1}[${j}]: ${a[1]?"-":"o"}`);        
        }
        console.log(`row j:${j} complete: ${downMatrix[j]}`)
    }
    return [downMatrix, rightMatrix];
}

/***
 * Purely logical result of inputs horizontal and vertical.
 * The direction should not matter so southeast is a bad name.
 * i and j is the logical, determining the outputs.
 */
            
 function reaction(vertical, horizontal, i, j) {
    console.log(` ${vertical?"|":"o"}  ${i + rightsPos}->${pri(i+rightsPos)} -- ${horizontal?"-":"o"} ${j + rightsPos}->${pri(j + rightsPos)},`)
    if (! horizontal && ! vertical) {
        return [false, false];
    }

    let downWins = pri(i + rightsPos) >= pri(j + downsPos);
    if (horizontal && vertical) {
        if (downWins) return [true, false];
        else return [false, true];   
    }
    
    if (vertical) {
        if (downWins) return [true, true];
        else return [true, false];
    } else {
        if (downWins) return [false, true];
        else return [false, true];
    }
}

function cell(down, right, i, j) {
    console.log(`cell: down: ${down}, right: ${right}`);
    let x = i * SCALE; 
    let xp = x + SCALE;
    let y = j * SCALE; 
    let yp = y + SCALE;
    if (down) {
        if (right) {
            // _|
            g.beginPath();
            g.moveTo( xp, y);
            g.lineTo( xp, yp);
            g.lineTo( x,  yp);
            g.stroke();
        } else {
            //   |
            g.beginPath();
            g.moveTo( xp, y);
            g.lineTo( xp, yp);
            g.stroke();
        }
    } else {
        if (right) {
            //   __
            g.beginPath();
            g.moveTo( xp, yp);
            g.lineTo( x,  yp);
            g.stroke();
        }
    }
}

function exploreMap(id) {
    // We should be using these to set the size of the canvas
    //const SIZE = 5;
    const SCALE = 8
    const canvas = document.querySelector(`#explore-map > canvas`);
    
    g = canvas.getContext("2d");
    g.lineWidth = 1;
    canvas.width = SCALE * (SIZE + 1);
    canvas.height = SCALE * (SIZE + 1);
    console.log(`canvas width ${canvas.width} height: ${canvas.height}`);

    const drawScreen = function() {
        const downs = [];
        const rights = [];
    
        for(let i = 0; i < SIZE; i++) {
            downs.push(false);
            rights.push(false);
        }
        downs[0] = true; // !!! set them all to true
        // !!start j at 1. add right base
        for(let j = 0; j < SIZE; j++) { // Y (rights)
            let y = j * SCALE; 
            let yp = y + SCALE;
            for(let i = 0; i < SIZE; i++) { // X (downs) 
                let x = i * SCALE; 
                let xp = x + SCALE;
                if (downs[i]) {
                    if (rights[j]) {
                        // _|
                        g.beginPath();
                        g.moveTo( xp, y);
                        g.lineTo( xp, yp);
                        g.lineTo( x,  yp);
                        g.stroke();
    
                        if (pri(i) >= pri(j)) {
                        
                            // _|
                            //  |
                            downs[i] = true;
                            rights[j] = false;
                        } else {
                            //  _|_
                            //
                            downs[i] = false;
                            rights[j] = true;
                        }
                    } else {
                        //   |_
                        //   |
                        g.beginPath();
                        g.moveTo( xp, y);
                        g.lineTo( xp, yp);
                        g.stroke();

                        if (pri(i) >= pri(j)) {
                            //   |_
                            //   |
                            downs[i] = true;
                            rights[j] = true;
                        } else {
                            //   |
                            //   |
                            downs[i] = true;
                            rights[j] =false;
                        }
                    }
                } else {
                    if (rights[j]) {
                        //   __
                        g.beginPath();
                        g.moveTo( xp, yp);
                        g.lineTo( x,  yp);
                        g.stroke();
    
                        if(pri(i) >= pri(j)) {
                            downs[i] = false;
                            rights[j] = true;
                        } else {
                            // ___
                            //  |
                            downs[i] =  true;
                            rights[j] = true;
                        }
                    } else {
                        downs[i] = false;
                            rights[j] = false;
                    }
                }
            }
        }
    }
    const drawScreen2 = function() {
        console.log(`seLoop SIZE ${SIZE}`)
        let [d , r] = seLoop(SIZE, SIZE);
        console.log(`downMatrix of rows:${d}`);
        console.log(`rightMatrix of columns:${r}`);
        

        for (let j = 0; j < SIZE; j++) {
            for (let i = 0; i < SIZE; i++){
                console.log(`j:${j}, i:${i}`);
                let vert = d[j][i];
                let hor = r[i][j];
                console.log(`${vert} ${hor}`)
                cell(d[j][i], r[i][j], i, j);
                console.log(`finished j:${j}, i:${i}`);

            }
        }
    }

    if(feature_active)
        drawScreen2();
    else
        drawScreen();
}
