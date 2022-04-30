
addEventListener("load", eventWindowLoaded, false);
function eventWindowLoaded() {
  penroseApp();
}

// Graphics globals
let g;
let scale;
let stroke; // New

function penroseApp() {

  makeCanvas('p5');
  drawFirstExpansion('pentagons');
  drawSecondExpansion('expansion-2');
  drawThirdExpansion('expansion-3'); // This is where I refactor _everything_

  function redraw(fBounds, canvas, drawFunction) {
    const computedWidth = fBounds.maxPoint.x * scale + scale;
    const computedHeight = fBounds.maxPoint.y * scale + scale;
    if (canvas.width != computedWidth || canvas.height != computedHeight) {
      canvas.width = computedWidth; canvas.height = computedHeight;
      setTimeout(drawFunction());
    }
  }

  function makeCanvas(canvasId) {
    var canvas = document.getElementById(canvasId);
    g = canvas.getContext("2d");


    const drawScreen = function() {
      g.fillStyle = "#ffffff";
      g.fillRect(0, 0, canvas.width, canvas.height);
      g.fillStyle = penrose.ORANGE;
      g.strokeStyle = penrose.OUTLINE;
      g.lineWidth = 1;
      scale = 10;
      // this is a p0 down.  
      console.log(`figure(${penrose.BLUE},${JSON.stringify(new P(5, 5))})`)
      const fBounds = figure(penrose.BLUE, new P(5, 5), penrose.penta[penrose.down[0]]);
      console.log(`fBounds: ${JSON.stringify(fBounds)}`);
      redraw(fBounds, canvas, drawScreen)
    }

    drawScreen();

  }

  /**
   * Sets the globals g and scale
   */
  function drawFirstExpansion(canvasId) {
    console.log("draw")
    var canvas = document.getElementById(canvasId);
    if (!canvas) {
      console.log("canvasId is null!");
      return;
    }
    g = canvas.getContext("2d");

    const drawScreen = function() {
      g.fillStyle = "#ffffff";
      g.fillRect(0, 0, canvas.width, canvas.height);
      g.fillStyle = penrose.ORANGE;
      g.strokeStyle = penrose.OUTLINE;
      g.lineWidth = 1;

      scale = 10;
      penrose.scale = scale;

      

      x = 8;
      y = 9;

      const bounds = pUp(p(x, y));
      
      pDown(p(25, y));

      y += 18;

      for (let i = 0; i < 5; i++) {
        p2Up(i, p(x + i * 20, y));
      }

      y += 20;
      for (let i = 0; i < 5; i++) {
        p2Up(i, p(x + i * 20, y));
      }

      y += 20;
      for (let i = 0; i < 5; i++) {
        p4Up(i, p(x + i * 20, y));
      }

      y += 20;
      for (let i = 0; i < 5; i++) {
        p4Down(i, p(x + i * 20, y));
      }
      y += 25;

      starUp(p(15, y));
      starDown(p(45, y));

      x = 10;
      y += 30;
      for (let i = 0; i < 5; i++) {
        diamondUp(i, p(x + i * 20, y));
      }

      y += 25;
      for (let i = 0; i < 5; i++) {
        diamondDown(i, p(x + i * 20, y));
      }

      x = 15;
      y += 25;
      for (let i = 0; i < 5; i++) {
        boatUp(i, p(x + i * 25, y));
      }

      y += 25;
      for (let i = 0; i < 5; i++) {
        bounds.expand(boatDown(i, p(x + i * 25, y)));
      }

      redraw(bounds, canvas, drawScreen);
      /*
      computedHeight = y * scale + 50;
      computedWidth = 15 + 5 * 25 * 10;

      if (canvas.width != computedWidth || canvas.height != computedHeight) {
        canvas.width = computedWidth;
        canvas.height = computedHeight
        setTimeout(drawScreen(), 0);
      }
      */
    }
    drawScreen();
  }
  /**
   * The second draw test is the expansion of the first draw test.
   * It draws the second expansion of each of the tiles.
   * 
   */
  function drawSecondExpansion(canvalId) {
    const canvas = document.getElementById(canvalId);
    // g is global
    g = canvas.getContext("2d");
    //drawScreen();
    drawBig();
    
    function drawBig() {
      g.fillStyle = "#ffffff";
      g.fillRect(0, 0, canvas.width, canvas.height);

      g.fillStyle = penrose.ORANGE;
      g.strokeStyle = penrose.OUTLINE;
      g.lineWidth = 1;
      scale = 10;
      penrose.scale = scale; // Maybe does not use it.
      let y = canvas.width / scale / 2;
      let y2 = 3 * y
      penta4Up(0, p(canvas.width / scale / 2, y));
      boat2Up(0, p(canvas.width / scale / 2, 3 * y));

      y = 25;
      shapes = [penrose.penta, penrose.diamond, penrose.star, penrose.boat]
      for (const shape of shapes) {
        for (let i = 0; i < 10; i++) {
          let offset = p((i + 1) * 20, y);
          figure(penrose.YELLOW, offset, shape[i]);
          grid(p((i + 1) * 20, y));

        }
        y += 25;
      }

    }
    

    function drawScreen() {
      g.fillStyle = "#ffffff";
      g.fillRect(0, 0, canvas.width, canvas.height);

      g.fillStyle = penrose.ORANGE;
      g.strokeStyle = penrose.OUTLINE;
      g.lineWidth = 1;
      scale = 5;
      penrose.scale = scale; // Maybe does not use it.

      let x = 25;
      let y = 25;
      pentaUp(p(x, y));
      pentaDown(p(x + 50, y)); // 
      y += 50;
      x = 25;
      for (let i = 0; i < 5; i++) {
        penta2Up(i, p(x + i * 50, y));
      }
      y += 55;
      for (let i = 0; i < 5; i++) {
        penta2Down(i, p(x + i * 50, y));
      }
      y += 50;
      for (let i = 0; i < 5; i++) {
        penta4Up(i, p(x + i * 50, y));
      }
      y += 55;
      for (let i = 0; i < 5; i++) {
        penta4Down(i, p(x + i * 50, y));
      }
      y += 60  // one thru four
      star0Up(p(35, y));
      star0Down(p(100, y));
      y += 74  // one thru four
      x = 35;
      for (let i = 0; i < 5; i++) {
        boat2Up(i, p(x + i * 67, y));
      }
      y += 70  // one thru four
      for (let i = 0; i < 5; i++) {
        boat2Down(i, p(x + i * 67, y));
      }
      y += 75  // one thru four
      for (let i = 0; i < 5; i++) {
        diamond4Up(i, p(x + i * 50, y));

      }
      y += 60  // one thru four
      for (let i = 0; i < 5; i++) {
        diamond4Up(i, p(x + i * 50, y));
      }

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
  function drawThirdExpansion(canvasId) {
    const canvas = document.getElementById(canvasId);
    // g is global
    g = canvas.getContext("2d");
    g.fillStyle = "#ffffff";
    g.fillRect(0, 0, canvas.width, canvas.height);
    g.fillStyle = penrose.ORANGE;
    g.strokeStyle = penrose.OUTLINE;
    g.lineWidth = 1;
    scale = 10;
    penrose.scale = scale; // Maybe does not use it.

    drawScreen = function() {
      center = p(100, 100);
      penta(5, P4, UP, center, 0);
    }
  }


}

/**
 * For the third expansion we want to use a different scheme.
 * 
 * expansion
 * star or pentagon
 * "wwwww","wwoow","woooo"
 * p5, p3, p1
 **/
 


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
  g.fillStyle   = fill;  //e.g penrose.ORANGE;
  g.strokeStyle = penrose.OUTLINE;

  const bounds = new Bounds();
  for (const point of shape) {
    g.fillRect(  offset.x * scale + point.x * scale, offset.y * scale + point.y * scale, scale, scale);
    if (scale >= 5) {
      g.strokeRect(offset.x * scale + point.x * scale, offset.y * scale + point.y * scale, scale, scale);
    }
    bounds.addPoint(offset, point);
  }
  return bounds;
}

function grid(offset) {
  g.strokeStyle = penrose.OUTLINE;
  for (let y = -5; y < 5; y++) {
    for (let x = -5; x < 5; x++){
      g.strokeRect(offset.x * scale + x * scale, offset.y * scale + y * scale, scale, scale);
    }
  }
}

function measure(offset, shape) {
  const bounds = new Bounds();
  for (const point of shape) {
    bounds.addPoint(offset, point);
  }
  return bounds;
}
function lineFigure(fill, offset, shape) {

}
/**
 * FIRST EXPANSION METHODS
 */

/**
 * These are the twisty methods for the tiles with
 * Orange pentagons.
 * @param {*} n  
 * @param {*} m 
 * @returns 
 */
function p2Color(n,m)
{
  if ((n - m + 5) % 5 == 2 || (n - m + 5) % 5 == 3)
    return penrose.ORANGE;
  else
    return penrose.YELLOW;
}

function p4Color(n,m)
{
  if ((n - m + 5) % 5 == 0)
    return penrose.YELLOW;
  else
    return penrose.ORANGE;
}

/**
 * Pentagons, Stars, Diamonds(S4), and Boats (S2).
 * @param {*} offset 
 */
function pUp(offset)
{
  const bounds = new Bounds();
  let fBounds = figure(penrose.BLUE,   offset, penrose.penta[penrose.down[0]]);
  bounds.expand(fBounds);
  for (var i = 0; i<5; i++) {
    bounds.expand(
      figure(penrose.YELLOW, offset.tr(penrose.p[penrose.up[i]]), penrose.penta[penrose.up[i]])
    );
  }
  return bounds;
}

function pDown(offset)
{
  const bounds = new Bounds();
  bounds.expand(
    figure(penrose.BLUE, offset, penrose.penta[penrose.up[0]])
  );

  for (var i = 0; i<5; i++) {
    bounds.expand(figure(penrose.YELLOW, offset.tr(penrose.p[penrose.down[i]]), penrose.penta[penrose.down[i]]));
  }
    
  return bounds;
}

function p2Up(n, offset)
{
  const bounds = new Bounds();
  bounds.expand(
    figure(penrose.BLUE, offset, penrose.penta[penrose.down[0]]));

  for (var i = 0; i<5; i++) {
    bounds.expand(figure(p2Color(n,i), offset.tr(penrose.p[penrose.up[i]]), penrose.penta[penrose.up[i]]));
    if (i == n) {
      bounds.expand(figure(penrose.BLUE, offset.tr(penrose.s[penrose.down[i]]), penrose.diamond[penrose.up[i]]));
    }
  }
  return bounds;
}

function p2Down(n, offset)
{
  const bounds = new Bounds();
  bounds.expand(
    figure(penrose.BLUE,   offset, penrose.penta[penrose.up[0]]));
  
  for (var i = 0; i<5; i++) {
  
    bounds.expand(figure(p2Color(n,i), offset.tr(penrose.p[penrose.down[i]]), penrose.penta[penrose.down[i]]));
    if (i == n) {
      bounds.expand(figure(penrose.BLUE, offset.tr(penrose.s[penrose.up[i]]), penrose.diamond[penrose.down[i]]));
    }
  }
  return bounds;
}

function p4Up(n, offset)
{
  const bounds = new Bounds();
  bounds.expand(
    figure(penrose.BLUE,   offset, penrose.penta[penrose.down[0]]));

  for (var i = 0; i<5; i++)
  {
    bounds.expand(figure(p4Color(n,i), offset.tr(penrose.p[penrose.up[i]]), penrose.penta[penrose.up[i]]));
    var prev = (n + 4) % 5;
    var next = (n + 1) % 5;
    if ((prev == i ) || (next == i)) {
      bounds.expand(figure(penrose.BLUE, offset.tr(penrose.s[penrose.down[i]]), penrose.diamond[penrose.up[i]]));
    }
  }
  return bounds;
}

function p4Down(n, offset)
{
  const bounds = new Bounds();
  bounds.expand(
    figure(penrose.BLUE, offset, penrose.penta[penrose.up[0]]));
  var prev = (n + 4) % 5;
  var next = (n + 1) % 5;
  
  for (var i = 0; i<5; i++)
  {
    bounds.expand(
      figure(p4Color(n,i), offset.tr(penrose.p[penrose.down[i]]), penrose.penta[penrose.down[i]]));
    if ((prev == i ) || (next == i))
    {
      bounds.expand(
        figure(penrose.BLUE, offset.tr(penrose.s[penrose.up[i]]), penrose.diamond[penrose.down[i]]));
    }
  }
  return bounds;
}

function starUp(offset)
{
  const bounds = new Bounds();
  bounds.expand(
    figure(penrose.BLUE,   offset, penrose.star[penrose.down[0]]));
  
  for (var i = 0; i<5; i++)
  {  
    bounds.expand(
      figure(penrose.ORANGE, offset.tr(penrose.s[penrose.up[i]]), penrose.penta[penrose.down[i]]));
    bounds.expand(
      figure(penrose.BLUE,   offset.tr(penrose.t[penrose.up[i]]), penrose.boat[penrose.up[i]]));
  }
  return bounds;
}

function starDown(offset)
{
  const bounds = new Bounds();
  bounds.expand(figure(penrose.BLUE,   offset, penrose.star[penrose.up[0]]));
  for (var i = 0; i<5; i++)
  {  
    bounds.expand(figure(penrose.ORANGE, offset.tr(penrose.s[penrose.down[i]]), penrose.penta[penrose.up[i]]));
    bounds.expand(figure(penrose.BLUE,   offset.tr(penrose.t[penrose.down[i]]), penrose.boat[penrose.down[i]]));
  }
  return bounds;
}

function diamondUp(n, offset)
{
  const bounds = new Bounds();
  bounds.expand(figure(penrose.BLUE,   offset, penrose.star[penrose.down[0]]));
  
  bounds.expand(figure(penrose.ORANGE, offset.tr(penrose.s[penrose.up[n]]), penrose.penta[penrose.down[n]]));
  
  bounds.expand(figure(penrose.BLUE,   offset.tr(penrose.t[penrose.up[n]]), penrose.boat[penrose.up[n]]));
  return bounds;
}

function diamondDown(n, offset)
{
  const bounds = new Bounds();
  bounds.expand(
    figure(penrose.BLUE,   offset, penrose.star[penrose.up[0]]));

  bounds.expand(
    figure(penrose.ORANGE, offset.tr(penrose.s[penrose.down[n]]), penrose.penta[penrose.up[n]]));
  bounds.expand(
    figure(penrose.BLUE,   offset.tr(penrose.t[penrose.down[n]]), penrose.boat[penrose.down[n]]));
  return bounds;
}

function boatUp(n, offset)
{
  const bounds = new Bounds();
  bounds.expand(
  figure(penrose.BLUE,   offset, penrose.star[penrose.down[0]]));
  
  var prev = (n + 4) % 5;
  var next = (n + 1) % 5;
  for (var i = 0; i<5; i++)
  {  
    if (prev == i || n == i || next == i)
    {
      bounds.expand(
        figure(penrose.ORANGE, offset.tr(penrose.s[penrose.up[i]]), penrose.penta[penrose.down[i]]));
      bounds.expand(
        figure(penrose.BLUE,   offset.tr(penrose.t[penrose.up[i]]), penrose.boat[penrose.up[i]]));
    }
  }  
  return bounds;
}

function boatDown(n, offset)
{
  const bounds = new Bounds();
  bounds.expand(
    figure(penrose.BLUE,   offset, penrose.star[penrose.up[0]]));

  var prev = (n + 4) % 5;
  var next = (n + 1) % 5;
  for (var i = 0; i<5; i++)
  {  
    if (prev == i || n == i || next == i)
    {
      bounds.expand(figure(penrose.ORANGE, offset.tr(penrose.s[penrose.down[i]]), penrose.penta[penrose.up[i]]));
      bounds.expand(figure(penrose.BLUE,   offset.tr(penrose.t[penrose.down[i]]), penrose.boat[penrose.down[i]]));
    }
  }
  return bounds;
}

// N = 1 to 5 (garbage?)
function point(x,y)
{
  return new P(x,y);
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
 *       0              *
 *       4                  *
 *       8                      *
 *       12                         *
 *       13                          *
 *       14                           *
 *       13                          *
 *       12                         *
 *       8                      *     
 *       4                  *    
 *       0              *    
 *      -4          *
 *      -8      *
 *     -12  *
 *    -13  *
 *    -14 *  
 *    -13  *
 *     -12  *
 *      -8      *
 *      -4          *
 *       0              *    
 *     
 * 
 * 
 * */                

function pWheelNext(exp) {
  const p = pWheels[exp].w;
  return new Wheel(
    p[1].tr(p[0]).tr(p[9]),
    p[2].tr(p[1]).tr(p[0]),
    p[3].tr(p[2]).tr(p[1]));
}

function sWheelNext(exp) {
  const p = pWheels[exp].w;
  const s = sWheels[exp].w;
  return new Wheel(
    p[1].tr(p[0]).tr(s[9]),
    p[2].tr(p[1]).tr(s[0]),
    p[3].tr(p[2]).tr(s[1]));
}

function tWheelNext(exp) {
  const p = pWheels[exp].w;
  const s = sWheels[exp].w;
  return new Wheel(
    s[1].tr(p[9]).tr(p[0]).tr(p[1]).tr(s[9]),
    s[2].tr(p[0]).tr(p[1]).tr(p[2]).tr(s[0]),
    s[3].tr(p[1]).tr(p[2]).tr(p[3]).tr(s[1]),
  );
}

const pWheels = [null];
const sWheels = [null];
const tWheels = [null];

const pWheel1 = new Wheel(p(0, -6), p(3, -4), p(5, -2));
const sWheel1 = new Wheel(p(0, -5), p(3, -5), p(5, -1));
const tWheel1 = new Wheel(p(0, -8), p(5, -8), p(8, -2));
console.log(`real P1: ${pWheel1.string}`);
console.log(`real S1: ${sWheel1.string}`);
console.log(`real T1: ${tWheel1.string}`);

pWheels.push(pWheel1);
sWheels.push(sWheel1);
tWheels.push(tWheel1);

const pWheel2 = new Wheel(p(0, -14), p(8, -12), p(13, -4));
const sWheel2 = new Wheel(p(0, -15), p(8, -11), p(13, -5));
const tWheel2 = new Wheel(p(0, -24), p(13, -18), p(21, -8));

pWheels.push(pWheel2);
sWheels.push(sWheel2);
tWheels.push(tWheel2);
console.log(`We have the wheel 1 and 2 pushed`)
// check code

pWheel2Guess = pWheelNext(1);
sWheel2Guess = sWheelNext(1);
tWheel2Guess = tWheelNext(1);
console.log('calculate wheels 2 comparison');
console.log(`real P2: ${pWheel2.string}`);
console.log(`calc P2: ${pWheel2Guess.string}`);

console.log(`real S2: ${pWheel2.string}`);
console.log(`calc S2: ${sWheel2Guess.string}`);

console.log(`real T2: ${pWheel2.string}`);
console.log(`calc T2: ${sWheel2Guess.string}`);

// Create xWheels[3]
pWheels.push(pWheelNext(2));
sWheels.push(sWheelNext(2));
tWheels.push(sWheelNext(2));
console.log(`real P3: ${pWheels[3].string}`);
console.log(`real S3: ${sWheels[3].string}`);
console.log(`real T3: ${tWheels[3].string}`);


// now calulate wheel 3

/**
 * P: {"list":[{"x":0,"y":-6},{"x":3,"y":-4},{"x":5,"y":-2},{"x":5,"y":2},{"x":3,"y":4},{"x":0,"y":6},{"x":-3,"y":4},{"x":-5,"y":2},{"x":-5,"y":-2},{"x":-3,"y":-4}]}
 * S: {"list":[{"x":0,"y":-5},{"x":3,"y":-5},{"x":5,"y":-1},{"x":5,"y":1},{"x":3,"y":5},{"x":0,"y":5},{"x":-3,"y":5},{"x":-5,"y":1},{"x":-5,"y":-1},{"x":-3,"y":-5}]}
 * T: {"list":[{"x":0,"y":-8},{"x":5,"y":-8},{"x":8,"y":-2},{"x":8,"y":2},{"x":5,"y":8},{"x":0,"y":8},{"x":-5,"y":8},{"x":-8,"y":2},{"x":-8,"y":-2},{"x":-5,"y":-8}]}
 * P: {"list":[{"x":0,"y":-14},{"x":8,"y":-12},{"x":13,"y":-4},{"x":13,"y":4},{"x":8,"y":12},{"x":0,"y":14},{"x":-8,"y":12},{"x":-13,"y":4},{"x":-13,"y":-4},{"x":-8,"y":-12}]}
 * S: {"list":[{"x":0,"y":-15},{"x":8,"y":-11},{"x":13,"y":-5},{"x":13,"y":5},{"x":8,"y":11},{"x":0,"y":15},{"x":-8,"y":11},{"x":-13,"y":5},{"x":-13,"y":-5},{"x":-8,"y":-11}]}
 * T: {"list":[{"x":0,"y":-24},{"x":13,"y":-18},{"x":21,"y":-8},{"x":21,"y":8},{"x":13,"y":18},{"x":0,"y":24},{"x":-13,"y":18},{"x":-21,"y":8},{"x":-21,"y":-8},{"x":-13,"y":-18}]}
 * 
 */
/*
function dumpWheels() {
  console.log('dump wheels');
  for (let i = 1; i < 3; i++) {
    console.log(`wheel ${i}`);
    console.log(`P: ${JSON.stringify(pWheels[i].w.map(it => [it.x, it.y]))}`);
    console.log(`S: ${JSON.stringify(sWheels[i].w.map(it => [it.x, it.y]))}`);
    console.log(`T: ${JSON.stringify(tWheels[i].w.map(it => [it.x, it.y]))}`);
    let pw = pWheels[i].w;
    let sw = sWheels[i].w;
    
    for (let j = 0; j < 3; j++) {
      let p1 = pw[(1 + j) % 10];
      let p0 = pw[ j % 10];
      let p9 = pw[(j + 9) % 10];
      let s9 = sw[(j + 9) % 10];
      console.log(`p1: ${JSON.stringify(p1)} p0: ${JSON.stringify(p0)} p9: ${ JSON.stringify(p9) }`);
      console.log(`s9: ${JSON.stringify(s9)}`);
      console.log(`p1 + p0 + p9 = ${JSON.stringify(
        p1.tr(p0).tr(p9)
        )}`);
      console.log(`p1 + p0 + s9 = ${JSON.stringify(
        p1.tr(p0).tr(s9)
        )}`
      );
      
    }
  }
}
dumpWheels();
*/
function pentaUp(base) {

  pDown(base);
  p2Up(0, base.tr(pWheel2.up[0]));
  p2Up(1, base.tr(pWheel2.up[1]));
  p2Up(2, base.tr(pWheel2.up[2]));
  p2Up(3, base.tr(pWheel2.up[3]));
  p2Up(4, base.tr(pWheel2.up[4]));
}

function pentaDown(base) {
  pUp(base);

  p2Down(0, base.tr(pWheel2.down[0]));
  p2Down(1, base.tr(pWheel2.down[1]));
  p2Down(2, base.tr(pWheel2.down[2]));
  p2Down(3, base.tr(pWheel2.down[3]));
  p2Down(4, base.tr(pWheel2.down[4]));
}

function pentaDownX(base, expansion) {
  switch (expansion) {
    case 0:
      console.log("error");
      break;
    case 1:
      pDown(base);
      break;
    default: // 2, 3, 4
      pUpX(base, expansion);
  }
  p2Down(0, base.tr(pWheel2.down[0]));
  p2Down(1, base.tr(pWheel2.down[1]));
  p2Down(2, base.tr(pWheel2.down[2]));
  p2Down(3, base.tr(pWheel2.down[3]));
  p2Down(4, base.tr(pWheel2.down[4]));
}                


/**
 *  Here are the penta 2's
 * 
 * These are white, white, orange, orange, white. 
 * They have an angle as input.
 * outline:
 * function penta2(n, loc)
 **/
function penta2Up(angle, base) {

  pDown(base);

  p2Up(norm(0 + angle), base.tr(pWheel2.up[norm(0 + angle)]));
  p2Up(norm(1 + angle), base.tr(pWheel2.up[norm(1 + angle)]));
  p4Up(norm(2 + angle - 1), base.tr(pWheel2.up[norm(2 + angle)]));
  p4Up(norm(3 + angle + 1), base.tr(pWheel2.up[norm(3 + angle)]));
  p2Up(norm(4 + angle), base.tr(pWheel2.up[norm(4 + angle)]));

  diamondDown(angle, base.tr(sWheel2.down[angle]));

}

function penta2UpX(angle, base, expansion) {
  switch (expansion) {
    case 0:
      console.log("error");
      break;
    case 1:
      p2Up(angle, base);
      break;
    default: // 2, 3, 4
      pentaDownX(base, expansion - 1);

      penta2UpX(norm(0 + angle), base.tr(pWheels[expansion].up[norm(0 + angle)]), expansion - 1);
      penta2UpX(norm(1 + angle), base.tr(pWheels[expansion].up[norm(1 + angle)]), expansion - 1);
      penta4UpX(norm(2 + angle - 1), base.tr(pWheels[expansion].up[norm(2 + angle)]), expansion - 1);
      penta4UpX(norm(3 + angle + 1), base.tr(pWheels[expansion].up[norm(3 + angle)]), expansion - 1);
      penta2Upx(norm(4 + angle), base.tr(pWheels[expansion].up[norm(4 + angle)]), expansion - 1);

      diamondDownX(angle, base.tr(sWheels[expansion].down[angle]));
      
  }
}
function penta2Down(angle, base) {
  pUp(base);
  p2Down(norm(0 + angle), base.tr(pWheel2.down[norm(0 + angle)]));
  p2Down(norm(1 + angle), base.tr(pWheel2.down[norm(1 + angle)]));
  p4Down(norm(2 + angle - 1), base.tr(pWheel2.down[norm(2 + angle)]));
  p4Down(norm(3 + angle + 1), base.tr(pWheel2.down[norm(3 + angle)]));
  p2Down(norm(4 + angle), base.tr(pWheel2.down[norm(4 + angle)]));

  diamondUp(angle, base.tr(sWheel2.up[angle]));
}
/**
 *  Here are the penta 4's
 * 
 * These are white, orange, orange, orange, orange. 
 * They have an angle as input.
 * outline:
 * function penta2(n, loc)
 **/
function penta4Up(angle, base) {

  pDown(base);

  p2Up(norm(0 + angle), base.tr(pWheel2.up[norm(0 + angle)]));
  p4Up(norm(1 + angle -1), base.tr(pWheel2.up[norm(1 + angle)]));
  p4Up(norm(2 + angle + 1), base.tr(pWheel2.up[norm(2 + angle)]));
  p4Up(norm(3 + angle - 1), base.tr(pWheel2.up[norm(3 + angle)]));
  p4Up(norm(4 + angle +1), base.tr(pWheel2.up[norm(4 + angle)]));

  diamondDown(norm(angle + 1), base.tr(sWheel2.down[norm(angle + 1)]));
  diamondDown(norm(angle - 1), base.tr(sWheel2.down[norm(angle - 1)]));
}

function penta4Down(angle, base) {
  pUp(base);

  p2Down(norm(0 + angle), base.tr(pWheel2.down[norm(0 + angle)]));
  p4Down(norm(1 + angle - 1), base.tr(pWheel2.down[norm(1 + angle)]));
  p4Down(norm(2 + angle + 1), base.tr(pWheel2.down[norm(2 + angle)]));
  p4Down(norm(3 + angle - 1), base.tr(pWheel2.down[norm(3 + angle)]));
  p4Down(norm(4 + angle + 1), base.tr(pWheel2.down[norm(4 + angle)]));

  diamondUp(norm(angle + 1), base.tr(sWheel2.up[norm(angle + 1)]));
  diamondUp(norm(angle - 1), base.tr(sWheel2.up[norm(angle - 1)]));
}

function star0Up(base) {
  starDown(base);

  p4Down(0, base.tr(sWheel2.up[0]));
  p4Down(1, base.tr(sWheel2.up[1]));
  p4Down(2, base.tr(sWheel2.up[2]));
  p4Down(3, base.tr(sWheel2.up[3]));
  p4Down(4, base.tr(sWheel2.up[4]));
  boatUp(0, base.tr(tWheel2.up[0]));
  boatUp(1, base.tr(tWheel2.up[1]));
  boatUp(2, base.tr(tWheel2.up[2]));
  boatUp(3, base.tr(tWheel2.up[3]));
  boatUp(4, base.tr(tWheel2.up[4]));
}
function star0Down(base) {
  starUp(base);

  p4Up(0, base.tr(sWheel2.down[0]));
  p4Up(1, base.tr(sWheel2.down[1]));
  p4Up(2, base.tr(sWheel2.down[2]));
  p4Up(3, base.tr(sWheel2.down[3]));
  p4Up(4, base.tr(sWheel2.down[4]));
  boatDown(0, base.tr(tWheel2.down[0]));
  boatDown(1, base.tr(tWheel2.down[1]));
  boatDown(2, base.tr(tWheel2.down[2]));
  boatDown(3, base.tr(tWheel2.down[3]));
  boatDown(4, base.tr(tWheel2.down[4]));
}



function boat2Down(angle, base) {
  starUp(base);

  p4Up(norm(0 + angle), base.tr(sWheel2.down[norm(0 + angle)]));
  p4Up(norm(1 + angle), base.tr(sWheel2.down[norm(1 + angle)]));
  p4Up(norm(4 + angle), base.tr(sWheel2.down[norm(4 + angle)]));

  boatDown(norm(0 + angle), base.tr(tWheel2.down[norm(0 + angle)]));
  boatDown(norm(1 + angle), base.tr(tWheel2.down[norm(1 + angle)]));
  boatDown(norm(4 + angle), base.tr(tWheel2.down[norm(4 + angle)]));

}
function boat2Up(angle, base) {
  starDown(base);

  p4Down(norm(0 + angle), base.tr(sWheel2.up[norm(0 + angle)]));
  p4Down(norm(1 + angle), base.tr(sWheel2.up[norm(1 + angle)]));
  p4Down(norm(4 + angle), base.tr(sWheel2.up[norm(4 + angle)]));

  boatUp(norm(0 + angle), base.tr(tWheel2.up[norm(0 + angle)]));
  boatUp(norm(1 + angle), base.tr(tWheel2.up[norm(1 + angle)]));
  boatUp(norm(4 + angle), base.tr(tWheel2.up[norm(4 + angle)]));
}
function diamond4Down(angle, base) {
  starUp(base);
  p4Up(norm(0 + angle), base.tr(sWheel2.down[norm(0 + angle)]));

  boatDown(norm(0 + angle), base.tr(tWheel2.down[norm(0 + angle)]));
}
function diamond4Up(angle, base) {
  starDown(base);
  p4Down(norm(0 + angle), base.tr(sWheel2.up[norm(0 + angle)]));
  boatUp(norm(0 + angle), base.tr(tWheel2.up[norm(0 + angle)]));
}

/* Generic expansion methods */
const P0 = {
  color: [
    penrose.YELLOW,
    penrose.YELLOW,
    penrose.YELLOW,
    penrose.YELLOW,
    penrose.YELLOW,  
  ], 
  twist: [ 0,0,0,0,0 ],
  shape: penrose.penta,
  diamond:[],
}
const P2 = {
  color: [
    penrose.YELLOW,
    penrose.YELLOW,
    penrose.ORANGE,
    penrose.ORANGE,
    penrose.YELLOW,
  ],
  twist: [0, 0, -1, 1, 0],
  shape: penrose.penta,
  diamond:[0],

}
const P4 = {
  color: [
    penrose.YELLOW,
    penrose.ORANGE,
    penrose.ORANGE,
    penrose.ORANGE,
    penrose.ORANGE,
  ],
  twist: [0, -1, 1, -1, 1],
  shape: penrose.penta,
  diamond:[1,4],
}
// for stars, the color indicates existence.
const S5 = {
  color: [
    penrose.BLUE,
    penrose.BLUE,
    penrose.BLUE,
    penrose.BLUE,
    penrose.BLUE,
  ],
  shape: penrose.star,
}
const S3 = {
  color: [
    penrose.BLUE,
    penrose.BLUE,
    null,
    null,
    penrose.BLUE,
  ],
  shape: penrose.boat,
}
const S1 = {
  color: [
    penrose.BLUE,
    null,
    null,
    null,
    null,
  ],
  shape: penrose.diamond,
}
const DOWN = true;
const UP = false;

function penta(fifths, type, isDown, loc, exp) {
  fifths = norm(fifths);
  console.log(JSON.stringify({fifths,type,isDown,loc,exp}));
  if (exp = 0) {
    figure(
      type.color[fifths],
      loc,
      type.shape[tenths[fifths]]);
    return; // call figure
  }
  penta(0, P0, !isDown, loc, exp-1);

  for (let i = 0; i < 5; i++) {
    const basic = norm(fifths + i);
    const tenths = tenths(basic, isDown);
    penta(
      basic + type.twist, 
      P2, 
      down, 
      base.tr(pWheels[exp][tenths]), 
      exp -1);
    
    if (type.diamond.includes(basic)) {
      star(basic, log.tr(sWheels[tenths(basic, !isDown)]));
    }
  }
}

/**
 * @param {*} fifths 
 * @param {*} type 
 * @param {*} isDown 
 * @param {*} loc 
 * @param {*} exp 
 * @returns 
 */
function star(fifths, type, isDown, loc, exp) {
  fifths = norm(fifths);
  console.log(JSON.stringify({ fifths, type, isDown, loc, exp }));
  if (exp = 0) {
    // Draw the figure.  Finished
    return figure(
      type.color[fifths], 
      loc,
      type.shape[tenth(fifths)] 
    )
  }

  star(0, S5, !isDown, loc, exp - 1);

  for (let i = 0; i < 5; i ++) {
    const basic = norm(fifths + i);
    const tenths = tenths(basic, !isDown);
    if (type.color[basic] |= null) {
      penta(basic, P4, isDown, loc.tr(sWheels[tenths]), exp - 1);
      star(basic, S3, !down, loc.tr(tWheels[tenths]), exp-1);
    }
  }
}
