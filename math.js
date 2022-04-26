
// Graphics globals
let g;
let scale;

function draw() {
  console.log('make canvas')
  makeCanvas('p5');
  drawFirstExpansion('pentagons');
  drawSecondExpansion('expansion-2');
}
const offset = (a, b) => [a[0] + b[0], a[1] + b[1]]
const norm = (n) => (n % 5 + 5) % 5

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
  console.log(`figure(${penrose.BLUE},${JSON.stringify(new P(5,5))})`)
  figure(penrose.BLUE, new P(5,5), penrose.penta[penrose.down[0]]);

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


  y = 25;

  pUp(toP([10, y]));
  pDown(toP([50, y]));

  y += 20;
  p2Up(0, toP([10, y]));
  p2Up(1, toP([30, y]));
  p2Up(2, toP([50, y]));
  p2Up(3, toP([70, y]));
  p2Up(4, toP([90, y]));

  y += 20;
  p2Down(0, toP([10, y]));
  p2Down(1, toP([30, y]));
  p2Down(2, toP([50, y]));
  p2Down(3, toP([70, y]));
  p2Down(4, toP([90, y]));

  y += 20;
  p4Up(0, toP([10, y]));
  p4Up(1, toP([30, y]));
  p4Up(2, toP([50, y]));
  p4Up(3, toP([70, y]));
  p4Up(4, toP([90, y]));

  y += 20;
  p4Down(0, toP([10, y]));
  p4Down(1, toP([30, y]));
  p4Down(2, toP([50, y]));
  p4Down(3, toP([70, y]));
  p4Down(4, toP([90, y]));
  y += 25;

  starUp(toP([15, y]));
  starDown(toP([55, y]));

  y += 25;
  diamondUp(0, toP([10, y]));
  diamondUp(1, toP([35, y]));
  diamondUp(2, toP([55, y]));
  diamondUp(3, toP([75, y]));
  diamondUp(4, toP([100, y]));

  y += 25;
  diamondDown(0, toP([10, y]));
  diamondDown(1, toP([35, y]));
  diamondDown(2, toP([55, y]));
  diamondDown(3, toP([75, y]));
  diamondDown(4, toP([100, y]));

  y += 25;
  boatUp(0, toP([15, y]));
  boatUp(1, toP([40, y]));
  boatUp(2, toP([60, y]));
  boatUp(3, toP([85, y]));
  boatUp(4, toP([105, y]));

  y += 25;
  boatDown(0, toP([15, y]));
  boatDown(1, toP([40, y]));
  boatDown(2, toP([60, y]));
  boatDown(3, toP([85, y]));
  boatDown(4, toP([105, y]));

  //drawTest2("test-2");
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
  let y = 25;
  pentaUp(toP([25, y]));
  pentaDown(toP([75, y])); // 
  // 1 - 4 ()
  y += 50;
  penta2Up(0, toP([25, y]));
  penta2Up(1, toP([75, y]));
  penta2Up(2, toP([125, y]));
  penta2Up(3, toP([175, y]));
  penta2Up(4, toP([225, y]));
  y += 55;
  penta2Down(0, toP([25, y]));
  penta2Down(1, toP([75, y]));
  penta2Down(2, toP([125, y]));
  penta2Down(3, toP([175, y]));
  penta2Down(4, toP([225, y]));
  y += 50;
  penta4Up(0, toP([25, y]));
  penta4Up(1, toP([75, y]));
  penta4Up(2, toP([125, y]));
  penta4Up(3, toP([175, y]));
  penta4Up(4, toP([225, y]));
  y += 55;
  penta4Down(0, toP([25, y]));
  penta4Down(1, toP([75, y]));
  penta4Down(2, toP([125, y]));
  penta4Down(3, toP([175, y]));
  penta4Down(4, toP([225, y]));
  y += 60  // one thru four
  star0Up(toP([35,y]));
  star0Down(toP([90,y]));
  y += 60  // one thru four
  boat2Up(1, toP([35, y]));
  boat2Down(3, toP([90, y]));
  y += 60  // one thru four
  diamond4Up(2, toP([35, y]));
  diamond4Down(5, toP([90, y]));
}

/***
 * penrose is a global constant (does it have to be a var?)
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
  if (scale < 5) {
    g.strokeStyle = penrose.OUTLINE;
  } else {
    g.stokeStyle = null;
  }

  const minPoint = new P(offset.x, offset.y);
  const maxPoint = new P(offset.x, offset.y);
  const bounds = { minPoint, maxPoint };
  for (const point of shape) {
    g.fillRect(  offset.x * scale + point.x * scale, offset.y * scale + point.y * scale, scale, scale);
    g.strokeRect(offset.x * scale + point.x * scale, offset.y * scale + point.y * scale, scale, scale);
    
    calculateBounds(bounds, offset, point);
  }

  return bounds;
}

function calculateBounds(bounds, offset, point) {
  const logicalPoint = (new P(offset.x + point.x, offset.y + point.y));
  if (logicalPoint.x < bounds.minPoint.x) {
    bounds.minPoint.x = logicalPoint.y;
  } else if (logicalPoint.x > bounds.maxPoint.x) {
    bounds.maxPoint.x = logicalPoint.x;
  }
  if (logicalPoint.y < bounds.minPoint.y) {
    bounds.minPoint.y = logicalPoint.y;
  } else if (logicalPoint.y > bounds.maxPoint.y) {
    bounds.maxPoint.y = logicalPoint.y;
  }
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
  figure(penrose.BLUE,   offset, penrose.penta[penrose.down[0]]);
  
  for (var i = 0; i<5; i++)
    figure(penrose.YELLOW, offset.tr(penrose.p[penrose.up[i]]), penrose.penta[penrose.up[i]]);
}

function pDown(offset)
{
  figure(penrose.BLUE,   offset, penrose.penta[penrose.up[0]]);

  for (var i = 0; i<5; i++)
    figure(penrose.YELLOW, offset.tr(penrose.p[penrose.down[i]]), penrose.penta[penrose.down[i]]); // correct
}

function p2Up(n, offset)
{
  figure(penrose.BLUE, offset, penrose.penta[penrose.down[0]]);


  for (var i = 0; i<5; i++)
  {
    figure(p2Color(n,i), offset.tr(penrose.p[penrose.up[i]]), penrose.penta[penrose.up[i]]);
    if (i == n)
      figure(penrose.BLUE, offset.tr(penrose.s[penrose.down[i]]), penrose.diamond[penrose.up[i]]);
  }
}

function p2Down(n, offset)
{
  figure(penrose.BLUE,   offset, penrose.penta[penrose.up[0]]);
  
  for (var i = 0; i<5; i++)
  {
    figure(p2Color(n,i), offset.tr(penrose.p[penrose.down[i]]), penrose.penta[penrose.down[i]]);
    if (i == n)
      figure(penrose.BLUE, offset.tr(penrose.s[penrose.up[i]]), penrose.diamond[penrose.down[i]]);
  }
}

function p4Up(n, offset)
{
  figure(penrose.BLUE,   offset, penrose.penta[penrose.down[0]]);

  for (var i = 0; i<5; i++)
  {
    figure(p4Color(n,i), offset.tr(penrose.p[penrose.up[i]]), penrose.penta[penrose.up[i]]);
    var prev = (n + 4) % 5;
    var next = (n + 1) % 5;
    if ((prev == i ) || (next == i))
    {
      figure(penrose.BLUE, offset.tr(penrose.s[penrose.down[i]]), penrose.diamond[penrose.up[i]]);
    }
  }
}

function p4Down(n, offset)
{
  figure(penrose.BLUE, offset, penrose.penta[penrose.up[0]]);
  var prev = (n + 4) % 5;
  var next = (n + 1) % 5;
  
  for (var i = 0; i<5; i++)
  {
    figure(p4Color(n,i), offset.tr(penrose.p[penrose.down[i]]), penrose.penta[penrose.down[i]]);
    if ((prev == i ) || (next == i))
    {
      figure(penrose.BLUE, offset.tr(penrose.s[penrose.up[i]]), penrose.diamond[penrose.down[i]]);
    }
  }
}

function starUp(offset)
{
  figure(penrose.BLUE,   offset, penrose.star[penrose.down[0]]);
  
  for (var i = 0; i<5; i++)
  {  
    figure(penrose.ORANGE, offset.tr(penrose.s[penrose.up[i]]), penrose.penta[penrose.down[i]]);
    figure(penrose.BLUE,   offset.tr(penrose.t[penrose.up[i]]), penrose.boat[penrose.up[i]]);
  }
}

function starDown(offset)
{
  figure(penrose.BLUE,   offset, penrose.star[penrose.up[0]]);
  for (var i = 0; i<5; i++)
  {  
    figure(penrose.ORANGE, offset.tr(penrose.s[penrose.down[i]]), penrose.penta[penrose.up[i]]);
    figure(penrose.BLUE,   offset.tr(penrose.t[penrose.down[i]]), penrose.boat[penrose.down[i]]);
  }
}

function diamondUp(n, offset)
{
  figure(penrose.BLUE,   offset, penrose.star[penrose.down[0]]);
  
  figure(penrose.ORANGE, offset.tr(penrose.s[penrose.up[n]]), penrose.penta[penrose.down[n]]);
  figure(penrose.BLUE,   offset.tr(penrose.t[penrose.up[n]]), penrose.boat[penrose.up[n]]);
}

function diamondDown(n, offset)
{
  figure(penrose.BLUE,   offset, penrose.star[penrose.up[0]]);

  figure(penrose.ORANGE, offset.tr(penrose.s[penrose.down[n]]), penrose.penta[penrose.up[n]]);
  figure(penrose.BLUE,   offset.tr(penrose.t[penrose.down[n]]), penrose.boat[penrose.down[n]]);
}

function boatUp(n, offset)
{
  figure(penrose.BLUE,   offset, penrose.star[penrose.down[0]]);
  
  var prev = (n + 4) % 5;
  var next = (n + 1) % 5;
  for (var i = 0; i<5; i++)
  {  
    if (prev == i || n == i || next == i)
    {
      figure(penrose.ORANGE, offset.tr(penrose.s[penrose.up[i]]), penrose.penta[penrose.down[i]]);
      figure(penrose.BLUE,   offset.tr(penrose.t[penrose.up[i]]), penrose.boat[penrose.up[i]]);
    }
  }  
}

function boatDown(n, offset)
{
  figure(penrose.BLUE,   offset, penrose.star[penrose.up[0]]);

  var prev = (n + 4) % 5;
  var next = (n + 1) % 5;
  for (var i = 0; i<5; i++)
  {  
    if (prev == i || n == i || next == i)
    {
      figure(penrose.ORANGE, offset.tr(penrose.s[penrose.down[i]]), penrose.penta[penrose.up[i]]);
      figure(penrose.BLUE,   offset.tr(penrose.t[penrose.down[i]]), penrose.boat[penrose.down[i]]);
    }
  }
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

const pWheel0 = new Wheel(toP([0, -6]), toP([3, -4]), toP([5, -2]));
const sWheel0 = new Wheel(toP([0, -5]), toP([3, -5]), toP([5, -1]));
const tWheel0 = new Wheel(toP([0, -8]), toP([5, -8]), toP([8, -2]));

const pWheel = new Wheel(toP([0, -14]), toP([8, -12]), toP([13, -4]));
const sWheel = new Wheel(toP([0, -15]), toP([8, -11]), toP([13, -5]));
const tWheel = new Wheel(toP([0, -24]), toP([13, -18]), toP([21, -8]));

pWheel.up.forEach(it => console.log(it));
pWheel.down.forEach(it => console.log(it));
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

  switch (angle) {
    case 0:
      p2Up(0, base.tr(toP([0, -14])));
      p2Up(1, base.tr(toP([13, -4])));
      p4Up(1, base.tr(toP([8, 12])));
      p4Up(4, base.tr(toP([-8, 12])));
      p2Up(4, base.tr(toP([-13, -4])));
      diamondDown(0, base.tr(toP([0, 15])))
      break;
    default:
    
      p2Up(norm(0 + angle), base.tr(pWheel.up[norm(0 + angle)]));
      p2Up(norm(1 + angle), base.tr(pWheel.up[norm(1 + angle)]));
      p4Up(norm(2 + angle - 1), base.tr(pWheel.up[norm(2 + angle)]));
      p4Up(norm(3 + angle + 1), base.tr(pWheel.up[norm(3 + angle)]));
      p2Up(norm(4 + angle), base.tr(pWheel.up[norm(4 + angle)]));

      diamondDown(angle, base.tr(sWheel.down[angle]));

  }
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