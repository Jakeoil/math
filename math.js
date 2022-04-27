
// Graphics globals
let g;
let scale;
let stroke; // New

const norm = (n) => (n % 5 + 5) % 5

function draw() {
  console.log('make canvas')
  makeCanvas('p5');
  drawFirstExpansion('pentagons');
  drawSecondExpansion('expansion-2');
  drawThirdExpansion('expansion-3'); // This is where I refactor _everything_

  function makeCanvas(canvasId) {
    var canvas = document.getElementById(canvasId);
    g = canvas.getContext("2d");
    g.fillStyle = penrose.ORANGE;
    g.strokeStyle = penrose.OUTLINE;
    g.lineWidth = 1;
    scale = 10;
    penrose.scale = scale;
    canvas.width = 10 * scale;
    canvas.heith = 10 * scale;
    console.log(`figure(${penrose.BLUE},${JSON.stringify(new P(5, 5))})`)
    const fBounds = figure(penrose.BLUE, new P(5, 5), penrose.penta[penrose.down[0]]);
    console.log(`bounds: ${JSON.stringify(fBounds)}`);
  }


  /**
   * Sets the globals g and scale
   */
  function drawFirstExpansion(canvasId) {
    console.log("draw")
    var canvas = document.getElementById(canvasId);
    g = canvas.getContext("2d");
    g.fillStyle = penrose.ORANGE;
    g.strokeStyle = penrose.OUTLINE;
    g.lineWidth = 1;

    scale = 10;
    penrose.scale = scale;

    x = 8;
    y = 9;

    pUp(p(x, y));
    let bounds = pDown(p(25, y));
    console.log(`penta5(1) ${p(25, y)} bounds: ${bounds}`)

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
      boatDown(i, p(x + i * 25, y));
    }
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
    g.fillStyle = penrose.ORANGE;
    g.strokeStyle = penrose.OUTLINE;
    g.lineWidth = 1;
    scale = 5;
    penrose.scale = scale; // Maybe does not use it.

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


const pWheel1 = new Wheel(p(0, -6), p(3, -4), p(5, -2));
const sWheel1 = new Wheel(p(0, -5), p(3, -5), p(5, -1));
const tWheel1 = new Wheel(p(0, -8), p(5, -8), p(8, -2));

// wheel. d2 + u0 + d3 = w9 + w0 + w1
const pWheel = new Wheel(p(0, -14), p(8, -12), p(13, -4));
const sWheel = new Wheel(p(0, -15), p(8, -11), p(13, -5));
const tWheel = new Wheel(p(0, -24), p(13, -18), p(21, -8));

// These must be adjusted.  They must switch to an algorithm too.
const pWheel3 = new Wheel(p(0, -28), p(16, -24), p(26, -8));
const sWheel3 = new Wheel(p(0, -30), p(16, -22), p(26, -10));
const tWheel3 = new Wheel(p(0, -48), p(26, -36), p(42, -16));

const pWheels = [null, pWheel1, pWheel, pWheel3];
const sWheels = [null, sWheel1, sWheel, sWheel3];
const tWheels = [null, tWheel1, tWheel, tWheel3];

/**
 * P: {"list":[{"x":0,"y":-6},{"x":3,"y":-4},{"x":5,"y":-2},{"x":5,"y":2},{"x":3,"y":4},{"x":0,"y":6},{"x":-3,"y":4},{"x":-5,"y":2},{"x":-5,"y":-2},{"x":-3,"y":-4}]}
 * S: {"list":[{"x":0,"y":-5},{"x":3,"y":-5},{"x":5,"y":-1},{"x":5,"y":1},{"x":3,"y":5},{"x":0,"y":5},{"x":-3,"y":5},{"x":-5,"y":1},{"x":-5,"y":-1},{"x":-3,"y":-5}]}
 * T: {"list":[{"x":0,"y":-8},{"x":5,"y":-8},{"x":8,"y":-2},{"x":8,"y":2},{"x":5,"y":8},{"x":0,"y":8},{"x":-5,"y":8},{"x":-8,"y":2},{"x":-8,"y":-2},{"x":-5,"y":-8}]}
 * P: {"list":[{"x":0,"y":-14},{"x":8,"y":-12},{"x":13,"y":-4},{"x":13,"y":4},{"x":8,"y":12},{"x":0,"y":14},{"x":-8,"y":12},{"x":-13,"y":4},{"x":-13,"y":-4},{"x":-8,"y":-12}]}
 * S: {"list":[{"x":0,"y":-15},{"x":8,"y":-11},{"x":13,"y":-5},{"x":13,"y":5},{"x":8,"y":11},{"x":0,"y":15},{"x":-8,"y":11},{"x":-13,"y":5},{"x":-13,"y":-5},{"x":-8,"y":-11}]}
 * T: {"list":[{"x":0,"y":-24},{"x":13,"y":-18},{"x":21,"y":-8},{"x":21,"y":8},{"x":13,"y":18},{"x":0,"y":24},{"x":-13,"y":18},{"x":-21,"y":8},{"x":-21,"y":-8},{"x":-13,"y":-18}]}
 * 
 */
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
//pWheel.up.forEach(it => console.log(it));
//pWheel.down.forEach(it => console.log(it));
function pentaUp(base) {

  pDown(base);
  p2Up(0, base.tr(pWheel.up[0]));
  p2Up(1, base.tr(pWheel.up[1]));
  p2Up(2, base.tr(pWheel.up[2]));
  p2Up(3, base.tr(pWheel.up[3]));
  p2Up(4, base.tr(pWheel.up[4]));
}

function pentaDown(base) {
  pUp(base);

  p2Down(0, base.tr(pWheel.down[0]));
  p2Down(1, base.tr(pWheel.down[1]));
  p2Down(2, base.tr(pWheel.down[2]));
  p2Down(3, base.tr(pWheel.down[3]));
  p2Down(4, base.tr(pWheel.down[4]));
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

  p2Up(norm(0 + angle), base.tr(pWheel.up[norm(0 + angle)]));
  p2Up(norm(1 + angle), base.tr(pWheel.up[norm(1 + angle)]));
  p4Up(norm(2 + angle - 1), base.tr(pWheel.up[norm(2 + angle)]));
  p4Up(norm(3 + angle + 1), base.tr(pWheel.up[norm(3 + angle)]));
  p2Up(norm(4 + angle), base.tr(pWheel.up[norm(4 + angle)]));

  diamondDown(angle, base.tr(sWheel.down[angle]));

}

function penta2Down(angle, base) {
  pUp(base);

  switch (angle) {
    case 0:
      p2Down(0, base.tr(toP([0, 14]))); 
      p2Down(1, base.tr(toP([-13, 4])));
      p4Down(2 - 1, base.tr(toP([-8, -12])));
      p4Down(3 + 1, base.tr(toP([8, -12])));
      p2Down(4, base.tr(toP([13, 4])));

      diamondUp(0, base.tr(toP([0, -15])));
      break;
    case 1:
      p2Down(1, base.tr(toP([-13, 4])));
      p2Down(2, base.tr(toP([-8, -12])));
      p4Down(3 - 1, base.tr(toP([8, -12])));
      p4Down(4 + 1, base.tr(toP([13, 4])));
      p2Down(0, base.tr(toP([0, 14])));      
      
      diamondUp(1, base.tr(toP([13, -5])));
      break;
    default:
      p2Down(norm(0 + angle), base.tr(pWheel.down[norm(0 + angle)]));
      p2Down(norm(1 + angle), base.tr(pWheel.down[norm(1 + angle)]));
      p4Down(norm(2 + angle - 1), base.tr(pWheel.down[norm(2 + angle)]));
      p4Down(norm(3 + angle + 1), base.tr(pWheel.down[norm(3 + angle)]));
      p2Down(norm(4 + angle),    base.tr(pWheel.down[norm(4 + angle)]));

      diamondUp(angle, base.tr(sWheel.up[angle]));

  }
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

  p2Up(norm(0 + angle), base.tr(pWheel.up[norm(0 + angle)]));
  p4Up(norm(1 + angle -1), base.tr(pWheel.up[norm(1 + angle)]));
  p4Up(norm(2 + angle + 1), base.tr(pWheel.up[norm(2 + angle)]));
  p4Up(norm(3 + angle - 1), base.tr(pWheel.up[norm(3 + angle)]));
  p4Up(norm(4 + angle +1), base.tr(pWheel.up[norm(4 + angle)]));

  diamondDown(norm(angle + 1), base.tr(sWheel.down[norm(angle + 1)]));
  diamondDown(norm(angle - 1), base.tr(sWheel.down[norm(angle - 1)]));
}

function penta4Down(angle, base) {
  pUp(base);

  p2Down(norm(0 + angle), base.tr(pWheel.down[norm(0 + angle)]));
  p4Down(norm(1 + angle - 1), base.tr(pWheel.down[norm(1 + angle)]));
  p4Down(norm(2 + angle + 1), base.tr(pWheel.down[norm(2 + angle)]));
  p4Down(norm(3 + angle - 1), base.tr(pWheel.down[norm(3 + angle)]));
  p4Down(norm(4 + angle + 1), base.tr(pWheel.down[norm(4 + angle)]));

  diamondUp(norm(angle + 1), base.tr(sWheel.up[norm(angle + 1)]));
  diamondUp(norm(angle - 1), base.tr(sWheel.up[norm(angle - 1)]));
}

function star0Up(base) {
  starDown(base);

  p4Down(0, base.tr(sWheel.up[0]));
  p4Down(1, base.tr(sWheel.up[1]));
  p4Down(2, base.tr(sWheel.up[2]));
  p4Down(3, base.tr(sWheel.up[3]));
  p4Down(4, base.tr(sWheel.up[4]));
  boatUp(0, base.tr(tWheel.up[0]));
  boatUp(1, base.tr(tWheel.up[1]));
  boatUp(2, base.tr(tWheel.up[2]));
  boatUp(3, base.tr(tWheel.up[3]));
  boatUp(4, base.tr(tWheel.up[4]));
}
function star0Down(base) {
  starUp(base);

  p4Up(0, base.tr(sWheel.down[0]));
  p4Up(1, base.tr(sWheel.down[1]));
  p4Up(2, base.tr(sWheel.down[2]));
  p4Up(3, base.tr(sWheel.down[3]));
  p4Up(4, base.tr(sWheel.down[4]));
  boatDown(0, base.tr(tWheel.down[0]));
  boatDown(1, base.tr(tWheel.down[1]));
  boatDown(2, base.tr(tWheel.down[2]));
  boatDown(3, base.tr(tWheel.down[3]));
  boatDown(4, base.tr(tWheel.down[4]));
}



function boat2Down(angle, base) {
  starUp(base);

  p4Up(norm(0 + angle), base.tr(sWheel.down[norm(0 + angle)]));
  p4Up(norm(1 + angle), base.tr(sWheel.down[norm(1 + angle)]));
  p4Up(norm(4 + angle), base.tr(sWheel.down[norm(4 + angle)]));

  boatDown(norm(0 + angle), base.tr(tWheel.down[norm(0 + angle)]));
  boatDown(norm(1 + angle), base.tr(tWheel.down[norm(1 + angle)]));
  boatDown(norm(4 + angle), base.tr(tWheel.down[norm(4 + angle)]));

}
function boat2Up(angle, base) {
  starDown(base);

  p4Down(norm(0 + angle), base.tr(sWheel.up[norm(0 + angle)]));
  p4Down(norm(1 + angle), base.tr(sWheel.up[norm(1 + angle)]));
  p4Down(norm(4 + angle), base.tr(sWheel.up[norm(4 + angle)]));

  boatUp(norm(0 + angle), base.tr(tWheel.up[norm(0 + angle)]));
  boatUp(norm(1 + angle), base.tr(tWheel.up[norm(1 + angle)]));
  boatUp(norm(4 + angle), base.tr(tWheel.up[norm(4 + angle)]));
}
function diamond4Down(angle, base) {
  starUp(base);
  p4Up(norm(0 + angle), base.tr(sWheel.down[norm(0 + angle)]));

  boatDown(norm(0 + angle), base.tr(tWheel.down[norm(0 + angle)]));
}
function diamond4Up(angle, base) {
  starDown(base);
  p4Down(norm(0 + angle), base.tr(sWheel.up[norm(0 + angle)]));
  boatUp(norm(0 + angle), base.tr(tWheel.up[norm(0 + angle)]));
}