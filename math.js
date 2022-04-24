/*
function onLoad()
{
  console.log("onLoad()");
  var canvas = document.getElementById("pentagons");
  penrose = Penrose(canvas.getContext("2d"));
}
*/

// Graphics globals
let g;
let scale;

const offset = (a, b) => [a[0] + b[0], a[1] + b[1]]

/**
 * 
 * @param {*} fill 
 * @param {*} offset 
 * @param {*} shape 
 * Prerequisites: Globals g and scale
 */
function figure(fill, offset, shape)
{
  g.fillStyle   = fill;//e.g penrose.ORANGE;
  g.strokeStyle = penrose.OUTLINE;
  for (var i = 0; i < shape.length; i++)
  {
    point = shape[i];
    g.fillRect(  offset.x * scale + point.x * scale, offset.y * scale + point.y * scale, scale, scale);
    g.strokeRect(offset.x * scale + point.x * scale, offset.y * scale + point.y * scale, scale, scale);
  }
}

/*future*/
function pushShape(fill, offset, shape)
{
  return({color:fill, shape:shape, offset:offset});
}

/**
 * Low level 
 * This one doesn't scale
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

/**
 * 
 * @param {*} n 
 * @param {*} m 
 * @returns 
 */
function p4Color(n,m)
{
  if ((n - m + 5) % 5 == 0)
    return penrose.YELLOW;
  else
    return penrose.ORANGE;
}

function pUp(loc)
{
  var offset = new P(loc[0],loc[1]);
  figure(penrose.BLUE,   offset, penrose.penta[penrose.down[0]]);
  
  for (var i = 0; i<5; i++)
    figure(penrose.YELLOW, offset.tr(penrose.p[penrose.up[i]]), penrose.penta[penrose.up[i]]);
}

function pDown(loc)
{
  var offset = new P(loc[0],loc[1]);
  figure(penrose.BLUE,   offset, penrose.penta[penrose.up[0]]);

  for (var i = 0; i<5; i++)
    figure(penrose.YELLOW, offset.tr(penrose.p[penrose.down[i]]), penrose.penta[penrose.down[i]]); // correct
}

function p2Up(n, loc)
{
  var offset = new P(loc[0],loc[1]);
  figure(penrose.BLUE, offset, penrose.penta[penrose.down[0]]);


  for (var i = 0; i<5; i++)
  {
    figure(p2Color(n,i), offset.tr(penrose.p[penrose.up[i]]), penrose.penta[penrose.up[i]]);
    if (i == n)
      figure(penrose.BLUE, offset.tr(penrose.s[penrose.down[i]]), penrose.diamond[penrose.up[i]]);
  }
}

function p2Down(n, loc)
{
  var offset = new P(loc[0],loc[1]);
  figure(penrose.BLUE,   offset, penrose.penta[penrose.up[0]]);
  
  for (var i = 0; i<5; i++)
  {
    figure(p2Color(n,i), offset.tr(penrose.p[penrose.down[i]]), penrose.penta[penrose.down[i]]);
    if (i == n)
      figure(penrose.BLUE, offset.tr(penrose.s[penrose.up[i]]), penrose.diamond[penrose.down[i]]);
  }
}

function p4Up(n, loc)
{
  var offset = new P(loc[0],loc[1]);
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

function p4Down(n, loc)
{
  var offset = new P(loc[0],loc[1]);
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

function starUp(loc)
{
  var offset = new P(loc[0],loc[1]);
  figure(penrose.BLUE,   offset, penrose.star[penrose.down[0]]);
  
  for (var i = 0; i<5; i++)
  {  
    figure(penrose.ORANGE, offset.tr(penrose.s[penrose.up[i]]), penrose.penta[penrose.down[i]]);
    figure(penrose.BLUE,   offset.tr(penrose.t[penrose.up[i]]), penrose.boat[penrose.up[i]]);
  }
}

function starDown(loc)
{
  var offset = new P(loc[0],loc[1]);
  figure(penrose.BLUE,   offset, penrose.star[penrose.up[0]]);
  for (var i = 0; i<5; i++)
  {  
    figure(penrose.ORANGE, offset.tr(penrose.s[penrose.down[i]]), penrose.penta[penrose.up[i]]);
    figure(penrose.BLUE,   offset.tr(penrose.t[penrose.down[i]]), penrose.boat[penrose.down[i]]);
  }
}

function diamondUp(n, loc)
{
  var offset = new P(loc[0],loc[1]);
  figure(penrose.BLUE,   offset, penrose.star[penrose.down[0]]);
  
  figure(penrose.ORANGE, offset.tr(penrose.s[penrose.up[n]]), penrose.penta[penrose.down[n]]);
  figure(penrose.BLUE,   offset.tr(penrose.t[penrose.up[n]]), penrose.boat[penrose.up[n]]);
}

function diamondDown(n, loc)
{
  var offset = new P(loc[0],loc[1]);
  figure(penrose.BLUE,   offset, penrose.star[penrose.up[0]]);

  figure(penrose.ORANGE, offset.tr(penrose.s[penrose.down[n]]), penrose.penta[penrose.up[n]]);
  figure(penrose.BLUE,   offset.tr(penrose.t[penrose.down[n]]), penrose.boat[penrose.down[n]]);
}

function boatUp(n, loc)
{
  var offset = new P(loc[0],loc[1]);
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

function boatDown(n, loc)
{
  var offset = new P(loc[0],loc[1]);
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

// N = 1 to 5
function point(x,y)
{
  return new P(x,y);
}

/**
 * Sets the globals g and scale
 */
function draw()
{
  console.log("draw")
  var canvas = document.getElementById("pentagons");
  g = canvas.getContext("2d");
  g.fillStyle   = penrose.ORANGE;
  g.strokeStyle = penrose.OUTLINE;
  g.lineWidth = 1;
  

  scale = 10;

  penrose.scale = scale;
  //penrose.id =    "test-2"

  //penrose.init(10, "test-2");
  
  let y = 15;
  
  pUp(      [10,  y]);
  pDown(    [50,  y]);

  y += 20;
  p2Up(  0, [10,  y]);
  p2Up(  1, [30,  y]);
  p2Up(  2, [50,  y]);
  p2Up(  3, [70,  y]);
  p2Up(  4, [90,  y]);
  
  y += 20;
  p2Down(0, [10, y]);
  p2Down(1, [30, y]);
  p2Down(2, [50, y]);
  p2Down(3, [70, y]);
  p2Down(4, [90, y]);

  y += 20;
  p4Up(  0, [10,  y]);
  p4Up(  1, [30,  y]);
  p4Up(  2, [50,  y]);
  p4Up(  3, [70,  y]);
  p4Up(  4, [90,  y]);
  
  y += 20;
  p4Down(  0, [10,  y]);
  p4Down(  1, [30,  y]);
  p4Down(  2, [50,  y]);
  p4Down(  3, [70,  y]);
  p4Down(  4, [90,  y]);
  y += 25;
  
  starUp(  [15,y]);
  starDown([55,y]);
  
  y += 25;
  diamondUp(0, [10, y]);
  diamondUp(1, [35, y]);
  diamondUp(2, [55, y]);
  diamondUp(3, [75, y]);
  diamondUp(4, [100, y]);

  y += 25;
  diamondDown(0, [10, y]);
  diamondDown(1, [35, y]);
  diamondDown(2, [55, y]);
  diamondDown(3, [75, y]);
  diamondDown(4, [100, y]);

  y += 25;
  boatUp(0, [15, y]);
  boatUp(1, [40, y]);
  boatUp(2, [60, y]);
  boatUp(3, [85, y]);
  boatUp(4, [105, y]);

  y += 25;
  boatDown(0, [15, y]);
  boatDown(1, [40, y]);
  boatDown(2, [60, y]);
  boatDown(3, [85, y]);
  boatDown(4, [105, y]);
  
  drawTest2("test-2");
}

/**
 * The second draw test is the expansion of the first draw test.
 * It draws the second expansion of each of the tiles.
 * 
 */
function drawTest2(id) {
  const canvas = document.getElementById(id);
  // g is global
  g = canvas.getContext("2d");
  g.fillStyle = penrose.ORANGE;
  g.strokeStyle = penrose.OUTLINE;
  g.lineWidth = 1;
  scale = 5;
  penrose.scale = scale; // Maybe does not use it.
  pentaUp([75, 25]);
  pentaDown([25, 25]); // 
  // 1 - 4 ()
  penta2Up(0, [25, 80]);
  // one thru four
  penta2Down(0, [25, 130]);
  // one t
}

/**
 * 
 * @param {Here is the up and } base 
 */
function pentaDown(base) {
  pUp(base) ;

  p2Down(0, offset(base, [0, 14]));
  p2Down(1, offset(base, [-13, 4]));
  p2Down(2, offset(base, [-8, -12]));
  p2Down(3, offset(base, [8, -12]));
  p2Down(4, offset(base, [13, 4]));
}

function pentaUp(base) {
  pDown(base);
  p2Up(0, offset(base, [0, -14]));
  p2Up(1, offset(base, [13, -4]));
  p2Up(2, offset(base, [8, 12]));
  p2Up(3, offset(base, [-8, 12]));
  p2Up(4, offset(base, [-13, -4]));
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
  pUp(base);

  switch (angle) {
    case 0:
      p2Down(0, offset(base, [0, 14]));
      p2Down(1, offset(base, [-13, 4]));
      p4Down(2 - 1, offset(base, [-8, -12]));
      p4Down(3 + 1, offset(base, [8, -12]));
      p2Down(4, offset(base, [13, 4]));
      diamondUp(0, offset(base, [0, -15]))
      break;
    default:

  }
}
function penta2Down(angle, base) {

  pDown(base);

  switch (angle) {
    case 0:
      p2Up(0, offset(base, [0, -14]));
      p2Up(1, offset(base, [13, -4]));
      p4Up(1, offset(base, [8, 12]));
      p4Up(4, offset(base, [-8, 12]));
      p2Up(4, offset(base, [-13, -4]));
      diamondDown(0, offset(base, [0, 15]))
    break;
      default:
  }

}
