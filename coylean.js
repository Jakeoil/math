let g;
const SIZE = 65;
const SCALE = 8;
let rightsPos=0;
let downsPos=0;
const eleLeft = document.querySelector('#rights-left');
const eleRight = document.querySelector('#rights-right');
const eleUp = document.querySelector('#downs-up');
const eleDown = document.querySelector('#rights-right');
const eleDownsPos = document.querySelector('#downs-pos');
const eleRightsPos = document.querySelector('#rights-pos');

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

function coyleanApp() {
    console.log('draw the map');
    exploreMap('explore-map');
}

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

/***
 * Purely logical result of inputs horizontal and vertical.
 * The direction should not matter so southeast is a bad name.
 * i and j is the logical, determining the outputs.
 */
            
function outputs(vertical, horizontal, i, j) {
    if (! horizontal && ! vertical) {
        return [false, false];
    }

    let downWins = pri(i) >= pri(j);
    if (horizontal && vertical) {
        if (downWins) return [true, false];
        else return [false, true];   
    }
    
    if (vertical) {
        if (downWins) return [true, true];
        else return [false, true];
    } else {
        if (downWins) return [false, true];
        else return [true, true];
    }
}

class Row extends Array {
    toString() {
        return this.reduce(
            (previousValue, currentValue) => previousValue + (currentValue ? "|" : "."),
            ""
        )
    }
}

class Col extends Array {
    toString() {
        return this.reduce(
            (previousValue, currentValue) => previousValue + (currentValue ? "-" : "."),
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
 * @param {Maintain} numRows 
 * @param {*} numColumns 
 */
function seLoop(numRows, numColumns) {
    const initCol = new Col(numRows).fill(true);
    const initRow = new Row(numColumns).fill(true);
    console.log(`initCol: ${initCol}`);
    console.log(`initRow: ${initRow}`);
    const downMatrix = new Array(numRows).fill(new Row());
    const rightMatrix = new Array(numColumns).fill(new Col());
    downMatrix[0] = initRow;
    rightMatrix[0] = initCol;
    console.log(`downMatrix:${downMatrix}`);
    console.log(`rightMatrix:${rightMatrix}`);
    for (let j = 0; j < numRows - 1; j++) {
        for (let i = 0; i < numColumns - 1; i++) {
            a = outputs(
                downMatrix[j][i], 
                rightMatrix[i][j],
                i + 0, j + 0);
            console.log(`a: ${a}, j: ${j},i: ${i}`);    
            //downMatrix[j + 1][i] = a[0];
            //rightMatrix[i + 1][j] = a[1];
            [ downMatrix[j + 1][i], rightMatrix[i + 1][j] ] = a;

                
            console.log(`downMatrix:${downMatrix}`);
            console.log(`rightMatrix:${rightMatrix}`);
        
        }
    }
    return [downMatrix, rightMatrix];
}

/*
let [d , r] = seLoop(4,4);
console.log(`downMatrix:${d}`);
console.log(`rightMatrix:${r}`);

for (let j = 0; j < r.length; j++) {
    for (let i = 0; i < d.length; i++){
        cell(d[j, i], r[i,j], i, j);
    }
}
*/
function cell(down, right, i, j) {
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
        if (rights) {
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
    const SIZE = 65;
    const SCALE = 8
    canvas = document.querySelector(`#explore-map > canvas`);
    
    g = canvas.getContext("2d");
    g.lineWidth = 1;
    canvas.width = SCALE * (SIZE + 1);
    canvas.height = SCALE * (SIZE + 1);

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
        let [d , r] = seLoop(SIZE, SIZE);
        console.log(`downMatrix:${d}`);
        console.log(`rightMatrix:${r}`);

        for (let j = 0; j < r.length; j++) {
            for (let i = 0; i < d.length; i++){
                cell(d[j, i], r[i,j], i, j);
            }
        }
    }
    drawScreen()
}
