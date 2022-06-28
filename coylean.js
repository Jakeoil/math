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
    drawScreen()
}
