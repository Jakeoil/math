
// The load listener is on the outside of the app of course
addEventListener("load", eventWindowLoaded, false);
function eventWindowLoaded() {
  penroseApp();
}
// penrose globals referred to in parameterrs penta and star methods

//et fifths = 0;
//let type = 0;
//let isDown = false;
const controls = new Controls(0, 0, false);

// Graphics globals for whole canvas
let g;
let scale;
let stroke; // New

function penroseApp() {

  // Can this be made into a function?
  const eleFifths = document.getElementById("fifths");
  const eleType = document.getElementById("type");
  const eleIsDown = document.getElementById("isDown");
  
  eleFifths.innerHTML = `fifths: ${controls.fifths}`;
  eleType.innerHTML = controls.typeName;
  eleIsDown.innerHTML = controls.direction;

  const clickFifths = function () {
    controls.bumpFifths();
    eleFifths.innerHTML = `fifths: ${controls.fifths}`;
    drawThirdExpansion('expansion-3');
    drawFourthExpansion('expansion-4');
  };
  const clickType = function() {
    controls.bumpType();
    eleType.innerHTML = controls.typeName;
    drawThirdExpansion('expansion-3'); 
    drawFourthExpansion('expansion-4');
  }
  const clickIsDown = function() {
    controls.toggleDirection();
    eleIsDown.innerHTML = controls.direction;
    drawThirdExpansion('expansion-3'); 
    drawFourthExpansion('expansion-4');
  }

  eleFifths.addEventListener("click", clickFifths, false);
  eleType.addEventListener("click", clickType, false);
  eleIsDown.addEventListener('click', clickIsDown, false);
  
  // load the little canvases.
  makeCanvas('p5');
  makeCanvas('p3');
  makeCanvas('p1');
  makeCanvas('s5');
  makeCanvas('s3');
  makeCanvas('s1');
  drawFirstExpansion('pentagons');
  drawSecondExpansion('expansion-2');
  // This is where I refactor _everything_
  drawThirdExpansion('expansion-3');
  drawFourthExpansion('expansion-4');
  drawGridWork('grid-work');
  
  /**
   * Called at end of draw cycle.  Redraws under the following conditions
   *   The size of the canvas is greater than the fbounds
   *   (future) add a max bounds.
   * @param {*} fBounds 
   * @param {*} canvas 
   * @param {*} drawFunction 
   */
  function redraw(fBounds, canvas, drawFunction) {
    const computedWidth = fBounds.maxPoint.x * scale + scale;
    const computedHeight = fBounds.maxPoint.y * scale + scale;
    if (canvas.width != computedWidth || canvas.height != computedHeight) {
      canvas.width = computedWidth; canvas.height = computedHeight;
      setTimeout(drawFunction());
    }
  }

  /*************************************************************************************
   * Draws a little canvas with a shape.
   * Shape depends on passed in ID.
   */
  function makeCanvas(canvasId) {
    var canvas = document.getElementById(canvasId);
    g = canvas.getContext("2d");

    // for makeCanvas only
    const drawScreen = function() {
      // Initialize screen.
      g.fillStyle = "#ffffff";
      g.fillRect(0, 0, canvas.width, canvas.height);
      g.fillStyle = penrose.ORANGE;  // This not needed
      g.strokeStyle = penrose.OUTLINE;
      g.lineWidth = 1;
      scale = 10;
      // this is a p0 down.
      let fbounds;
      switch (canvasId) {
        case 'p5':
          fBounds = figure(penrose.BLUE, new P(3, 3), penrose.penta[penrose.down[0]]);
          break;
        case 'p3':
          fBounds = figure(penrose.YELLOW, new P(3, 3), penrose.penta[penrose.up[0]]);
          break;
        case 'p1':
          fBounds = figure(penrose.ORANGE, new P(3, 3), penrose.penta[penrose.up[0]]);
          break;
        case 's5':
          fBounds = figure(penrose.BLUE, new P(4, 4), penrose.star[penrose.up[0]]);
          break;
        case 's3':
          fBounds = figure(penrose.BLUE, new P(4, 4), penrose.boat[penrose.up[0]]);
          break;
        case 's1':
          fBounds = figure(penrose.BLUE, new P(1, 0), penrose.diamond[penrose.up[0]]);
          break;
      }
      
      // Make adjustments based on the bounds of the drawing.
      redraw(fBounds, canvas, drawScreen)
    }

    drawScreen();

  }

  /***************************************************************************************
   * The first expansion draws penta(1) and star(1) varients
   * Sets the globals g and scale
   */
  function drawFirstExpansion(canvasId) {
    //console.log("draw")
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
    }
    drawScreen();
  }
  /*************************************************************************************
   * The second draw test is the expansion of the first draw test.
   * It draws the second expansion of each of the tiles.
   * 
   */
  function drawSecondExpansion(canvasId) {
    const canvas = document.getElementById(canvasId);
    // g is global
    g = canvas.getContext("2d");
    drawScreen();
    /**
     * 
     */
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

  function drawGridWork(canvasId) {
    const canvas = document.getElementById(canvasId);
    g = canvas.getContext("2d");
    //drawScreen();
    drawBig();
    
    /**
     * Draws all of the penrose rotations
     */
    function drawBig() {
      g.fillStyle = "#ffffff";
      g.fillRect(0, 0, canvas.width, canvas.height);

      g.fillStyle = penrose.ORANGE;
      g.strokeStyle = penrose.OUTLINE;
      g.lineWidth = 1;
      scale = 10;
      penrose.scale = scale; // Maybe does not use it.

      y = 5;
      shapes = [penrose.penta, penrose.diamond_correct, penrose.star, penrose.boat];
      const spacing = 12;
      for (const shape of shapes) {
        for (let i = 0; i < 10; i++) {
          let offset = p((i + 1) * spacing, y);
          figure(penrose.ORANGE, offset, shape[i]);
          grid(p((i + 1) * spacing, y));
        }
        y += spacing;
      }

      y += 20;
      penta4Up(0, p(canvas.width / scale / 2, y));
      y += 65;
      boat2Up(0, p(canvas.width / scale / 2, y));


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
    //g.fillStyle = penrose.ORANGE;
    g.strokeStyle = penrose.OUTLINE;
    g.lineWidth = 1;
    scale = 10;
    penrose.scale = scale; // Maybe does not use it.

    function starType(type) {
      switch (controls.typeList[type]) {
        case penrose.Pe1: return penrose.St1;
        case penrose.Pe3: return penrose.St3;
        case penrose.Pe5: return penrose.St5;
        default: return controls.typeList[type];
      }
    }
    function pentaType(type) {

      switch (controls.typeList[type]) {
        case penrose.St1: return penrose.Pe1;
        case penrose.St3: return penrose.Pe3;
        case penrose.St5: return penrose.Pe5;
        default: return controls.typeList[type];
      }
    }

    const drawScreen = function() {
      console.log('--Pentagon')
      let x = 13; let y = 26;
      penta(controls.fifths, pentaType(controls.type), controls.isDown, p(x,y), 0);
      x += 21;
      penta(controls.fifths, pentaType(controls.type), controls.isDown, p(x,y), 1);
      x += 34;
      penta(controls.fifths, pentaType(controls.type), controls.isDown, p(x,y), 2);
      
      console.log('--Diamond up 4');
      x = 13; y += 55;
      star(controls.fifths, starType(controls.type), controls.isDown, p(x,y), 0);
      x += 21;
      star(controls.fifths, starType(controls.type), controls.isDown, p(x,y), 1);
      x += 54;
      star(controls.fifths, starType(controls.type), controls.isDown, p(x,y), 2);
    }

    drawScreen();
  }

  function drawFourthExpansion(canvasId) {
    const canvas = document.getElementById(canvasId);
    // g is global
    g = canvas.getContext("2d");
    g.fillStyle = "#ffffff";
    g.fillRect(0, 0, canvas.width, canvas.height);
    g.strokeStyle = penrose.OUTLINE;
    g.lineWidth = 1;
    scale = 5;
  }

}

/*************************************************************************
 * 
 * 
 * 
 * 
 * 
 * 
 * 
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
 * FIRST EXPANSION METHODS (These are now deprecated)
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

// P is the offset of blue -> blue, blue -> yellow or blue -> orange
function pWheelNext(exp) {
  const p = pWheels[exp].w;
  return new Wheel(
    p[1].tr(p[0]).tr(p[9]),
    p[2].tr(p[1]).tr(p[0]),
    p[3].tr(p[2]).tr(p[1]));
}

// S is the offset
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
console.log(`real P1[1]: ${pWheel1.string}`);
console.log(`real S1[1]: ${sWheel1.string}`);
console.log(`real T1[1]: ${tWheel1.string}`);

pWheels.push(pWheel1);
sWheels.push(sWheel1);
tWheels.push(tWheel1);

const pWheel2 = new Wheel(p(0, -14), p(8, -12), p(13, -4));
const sWheel2 = new Wheel(p(0, -15), p(8, -11), p(13, -5));
const tWheel2 = new Wheel(p(0, -24), p(13, -18), p(21, -8));

console.log(`real P1[2]: ${pWheel2.string}`);
console.log(`real S1[2]: ${sWheel2.string}`);
console.log(`real T1[2]: ${tWheel2.string}`);

pWheels.push(pWheel2);
sWheels.push(sWheel2);
tWheels.push(tWheel2);
console.log(`We have the wheel 1 and 2 pushed`)
// check code

pWheel2Guess = pWheelNext(1);
sWheel2Guess = sWheelNext(1);
tWheel2Guess = tWheelNext(1);

// Create xWheels[3]
pWheels.push(pWheelNext(2));
sWheels.push(sWheelNext(2));
tWheels.push(sWheelNext(2));
console.log(`real P1[3]: ${pWheels[3].string}`);
console.log(`real S1[3]: ${sWheels[3].string}`);
console.log(`real T1[3]: ${tWheels[3].string}`);


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
/**************************************************************************************************************
 * Generic expansion methods
 * 
 * 
 * 
 * 
 ***********************************************************/
const P0 = {
  name: 'P0',
  color: [
    penrose.YELLOW,
    penrose.YELLOW,
    penrose.YELLOW,
    penrose.YELLOW,
    penrose.YELLOW,  
  ], 
  twist: [ 0,0,0,0,0 ],
  shape: penrose.penta,
  typeColor: penrose.BLUE,
  diamond:[],
}
const P2 = {
  name: 'P2',
  color: [
    penrose.YELLOW,
    penrose.YELLOW,
    penrose.ORANGE,
    penrose.ORANGE,
    penrose.YELLOW,
  ],
  twist: [0, 0, -1, 1, 0],
  shape: penrose.penta,
  typeColor: penrose.YELLOW,
  diamond:[0],

}
const P4 = {
  name: 'P4',
  color: [
    penrose.YELLOW,
    penrose.ORANGE,
    penrose.ORANGE,
    penrose.ORANGE,
    penrose.ORANGE,
  ],
  twist: [0, -1, 1, -1, 1],
  shape: penrose.penta,
  typeColor: penrose.ORANGE,
  diamond:[1,4],
}
// for stars, the color indicates existence.
const S5 = {
  name: 'S5: star',
  color: [
    penrose.BLUE,
    penrose.BLUE,
    penrose.BLUE,
    penrose.BLUE,
    penrose.BLUE,
  ],
  shape: penrose.star,
  typeColor: penrose.BLUE,
}
const S3 = {
  name: 'S3: boat',
  color: [
    penrose.BLUE,
    penrose.BLUE,
    null,
    null,
    penrose.BLUE,
  ],
  shape: penrose.boat,
  typeColor: penrose.BLUE,
}
const S1 = {
  name: 'S1: diamond',
  color: [
    penrose.BLUE,
    null,
    null,
    null,
    null,
  ],
  shape: penrose.diamond_correct,
  typeColor: penrose.BLUE,
}
const DOWN = true;
const UP = false;

/**
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
  fifths = norm(fifths);
  //console.log(`${type.name}: ${fifths}, exp: ${exp} ${loc}`)
  if (exp == 0) {
    //console.log(`figure: ${type.name} color: ${type.typeColor}, loc: ${loc.toString()}`)
    figure(
      type.typeColor,
      loc,
      type.shape[tenths(fifths, isDown)]);
    return; // call figure
  }

  const pWheel = pWheels[exp].w;
  const sWheel = sWheels[exp].w;

  // Draw the center. Always the BLUE p5
  penta(
    0, 
    P0, 
    !isDown, 
    loc, 
    exp-1
  );
  
  for (let i = 0; i < 5; i++) {
    const shift = norm(fifths + i);

    penta(
      norm(shift + type.twist[i]), 
      (type.twist[i] == 0 ? P2 : P4), 
      isDown, 
      loc.tr(pWheel[tenths(shift, isDown)]), 
      exp - 1
    );

    if (type.diamond.includes(i)) {
      star(
        shift,
        S1,
        !isDown, 
        loc.tr(sWheel[tenths(shift, !isDown)]), 
        exp - 1
      );
    }
  }
}



/**
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
 * @param {*} fifths 0 to 5
 * @param {*} type  S5 S3 S1
 * @param {*} isDown
 * @param {*} loc 
 * @param {*} exp 
 * @returns 
 */
function star(fifths, type, isDown, loc, exp) {
  const name = type.name;
  fifths = norm(fifths);
  //console.log(`${type.name}: ${fifths}, exp: ${exp} ${loc}`)

  if (exp == 0) {
    // Draw the figure.  Finished
    //console.log(`typeColor: ${type.typeColor}`);
    figure(
      type.typeColor,
      loc,
      type.shape[tenths(fifths, isDown)]);
    return;
  }

  star(
    0, 
    S5, 
    !isDown, 
    loc, 
    exp - 1);

  for (let i = 0; i < 5; i++) {
    const shift = norm(fifths + i);
    const angleUp = tenths(shift, UP);
    const angleDown = tenths(shift, DOWN);
    const draw = type.color[shift] != null;
    //console.log(JSON.stringify({ shift, angleUp, angleDown, draw }));
  }
  
  for (let i = 0; i < 5; i ++) {
    const shift = norm(fifths + i);
    const angle = tenths(shift, isDown);
    //const pWheel = pWheels[exp].w;
    const sWheel = sWheels[exp].w;
    const tWheel = tWheels[exp].w;
    if (type.color[i] != null) {
      penta(
        norm(shift), 
        P4, 
        !isDown, 
        loc.tr(sWheel[angle]), 
        exp - 1);
      
      star(
        shift, 
        S3, 
        isDown, 
        loc.tr(tWheel[angle]), 
        exp - 1);
    }
  }
}
