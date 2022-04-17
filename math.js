function onLoad()
{
  var canvas = document.getElementById("pentagons");
  penrose = Penrose(canvas.getContext("2d"));
}
var g;

function figure(fill, offset, scale, shape)
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

function pUp(loc, scale)
{
  var offset = new P(loc[0],loc[1]);
  figure(penrose.BLUE,   offset, scale, penrose.penta[penrose.down[0]]);
  
  for (var i = 0; i<5; i++)
    figure(penrose.YELLOW, offset.tr(penrose.p[penrose.up[i]]), scale, penrose.penta[penrose.up[i]]);
}

function pDown(loc, scale)
{
  var offset = new P(loc[0],loc[1]);
  figure(penrose.BLUE,   offset, scale, penrose.penta[penrose.up[0]]);

  for (var i = 0; i<5; i++)
    figure(penrose.YELLOW, offset.tr(penrose.p[penrose.down[i]]), scale, penrose.penta[penrose.down[i]]); // correct
}

function p2Up(n, loc, scale)
{
  var offset = new P(loc[0],loc[1]);
  figure(penrose.BLUE, offset, scale, penrose.penta[penrose.down[0]]);


  for (var i = 0; i<5; i++)
  {
    figure(p2Color(n,i), offset.tr(penrose.p[penrose.up[i]]), scale, penrose.penta[penrose.up[i]]);
    if (i == n)
      figure(penrose.BLUE, offset.tr(penrose.s[penrose.down[i]]), scale, penrose.diamond[penrose.up[i]]);
  }
}

function p2Down(n, loc, scale)
{
  var offset = new P(loc[0],loc[1]);
  figure(penrose.BLUE,   offset, scale, penrose.penta[penrose.up[0]]);
  
  for (var i = 0; i<5; i++)
  {
    figure(p2Color(n,i), offset.tr(penrose.p[penrose.down[i]]), scale, penrose.penta[penrose.down[i]]);
    if (i == n)
      figure(penrose.BLUE, offset.tr(penrose.s[penrose.up[i]]), scale, penrose.diamond[penrose.down[i]]);
  }
}

function p4Up(n, loc, scale)
{
  var offset = new P(loc[0],loc[1]);
  figure(penrose.BLUE,   offset, scale, penrose.penta[penrose.down[0]]);

  for (var i = 0; i<5; i++)
  {
    figure(p4Color(n,i), offset.tr(penrose.p[penrose.up[i]]), scale, penrose.penta[penrose.up[i]]);
    var prev = (n + 4) % 5;
    var next = (n + 1) % 5;
    if ((prev == i ) || (next == i))
    {
      figure(penrose.BLUE, offset.tr(penrose.s[penrose.down[i]]), scale, penrose.diamond[penrose.up[i]]);
    }
  }
}

function p4Down(n, loc, scale)
{
  var offset = new P(loc[0],loc[1]);
  figure(penrose.BLUE, offset, scale, penrose.penta[penrose.up[0]]);
  var prev = (n + 4) % 5;
  var next = (n + 1) % 5;
  
  for (var i = 0; i<5; i++)
  {
    figure(p4Color(n,i), offset.tr(penrose.p[penrose.down[i]]), scale, penrose.penta[penrose.down[i]]);
    if ((prev == i ) || (next == i))
    {
      figure(penrose.BLUE, offset.tr(penrose.s[penrose.up[i]]), scale, penrose.diamond[penrose.down[i]]);
    }
  }
}

function starUp(loc, scale)
{
  var offset = new P(loc[0],loc[1]);
  figure(penrose.BLUE,   offset, scale, penrose.star[penrose.down[0]]);
  
  for (var i = 0; i<5; i++)
  {  
    figure(penrose.ORANGE, offset.tr(penrose.s[penrose.up[i]]), scale, penrose.penta[penrose.down[i]]);
    figure(penrose.BLUE,   offset.tr(penrose.t[penrose.up[i]]), scale, penrose.boat[penrose.up[i]]);
  }
}

function starDown(loc, scale)
{
  var offset = new P(loc[0],loc[1]);
  figure(penrose.BLUE,   offset, scale, penrose.star[penrose.up[0]]);
  for (var i = 0; i<5; i++)
  {  
    figure(penrose.ORANGE, offset.tr(penrose.s[penrose.down[i]]), scale, penrose.penta[penrose.up[i]]);
    figure(penrose.BLUE,   offset.tr(penrose.t[penrose.down[i]]), scale, penrose.boat[penrose.down[i]]);
  }
}

function diamondUp(n, loc, scale)
{
  var offset = new P(loc[0],loc[1]);
  figure(penrose.BLUE,   offset, scale, penrose.star[penrose.down[0]]);
  
  figure(penrose.ORANGE, offset.tr(penrose.s[penrose.up[n]]), scale, penrose.penta[penrose.down[n]]);
  figure(penrose.BLUE,   offset.tr(penrose.t[penrose.up[n]]), scale, penrose.boat[penrose.up[n]]);
}

function diamondDown(n, loc, scale)
{
  var offset = new P(loc[0],loc[1]);
  figure(penrose.BLUE,   offset, scale, penrose.star[penrose.up[0]]);

  figure(penrose.ORANGE, offset.tr(penrose.s[penrose.down[n]]), scale, penrose.penta[penrose.up[n]]);
  figure(penrose.BLUE,   offset.tr(penrose.t[penrose.down[n]]), scale, penrose.boat[penrose.down[n]]);
}

function boatUp(n, loc, scale)
{
  var offset = new P(loc[0],loc[1]);
  figure(penrose.BLUE,   offset, scale, penrose.star[penrose.down[0]]);
  
  var prev = (n + 4) % 5;
  var next = (n + 1) % 5;
  for (var i = 0; i<5; i++)
  {  
    if (prev == i || n == i || next == i)
    {
      figure(penrose.ORANGE, offset.tr(penrose.s[penrose.up[i]]), scale, penrose.penta[penrose.down[i]]);
      figure(penrose.BLUE,   offset.tr(penrose.t[penrose.up[i]]), scale, penrose.boat[penrose.up[i]]);
    }
  }  
}

function boatDown(n, loc, scale)
{
  var offset = new P(loc[0],loc[1]);
  figure(penrose.BLUE,   offset, scale, penrose.star[penrose.up[0]]);

  var prev = (n + 4) % 5;
  var next = (n + 1) % 5;
  for (var i = 0; i<5; i++)
  {  
    if (prev == i || n == i || next == i)
    {
      figure(penrose.ORANGE, offset.tr(penrose.s[penrose.down[i]]), scale, penrose.penta[penrose.up[i]]);
      figure(penrose.BLUE,   offset.tr(penrose.t[penrose.down[i]]), scale, penrose.boat[penrose.down[i]]);
    }
  }
}

// N = 1 to 5
function point(x,y)
{
  return new P(x,y);
}

function draw()
{
  var canvas = document.getElementById("pentagons");
  g = canvas.getContext("2d");
  g.fillStyle   = penrose.ORANGE;
  g.strokeStyle = penrose.OUTLINE;
  g.lineWidth = 1;

  var scale = 10;

  penrose.scale = 10;
  penrose.id =    "test-2"

  penrose.init(10, "test-2");
  
  var y = 15;
  
  pUp(      [10,  y], scale);
  pDown(    [30,  y], scale);

  y += 20;
  p2Up(  0, [10,  y], scale);
  p2Up(  1, [30,  y], scale);
  p2Up(  2, [50,  y], scale);
  p2Up(  3, [70,  y], scale);
  p2Up(  4, [90,  y], scale);
  
  y += 20;
  p2Down(0, [10, y], scale);
  p2Down(1, [30, y], scale);
  p2Down(2, [50, y], scale);
  p2Down(3, [70, y], scale);
  p2Down(4, [90, y], scale);

  y += 20;
  p4Up(  0, [10,  y], scale);
  p4Up(  1, [30,  y], scale);
  p4Up(  2, [50,  y], scale);
  p4Up(  3, [70,  y], scale);
  p4Up(  4, [90,  y], scale);
  
  y += 20;
  p4Down(  0, [10,  y], scale);
  p4Down(  1, [30,  y], scale);
  p4Down(  2, [50,  y], scale);
  p4Down(  3, [70,  y], scale);
  p4Down(  4, [90,  y], scale);
  y += 25;
  
  starUp(  [15,y], scale);
  starDown([55,y], scale);
  
  y += 25;
  diamondUp(0, [10, y], scale);
  diamondUp(1, [35, y], scale);
  diamondUp(2, [55, y], scale);
  diamondUp(3, [75, y], scale);
  diamondUp(4, [100, y], scale);

  y += 25;
  diamondDown(0, [10, y], scale);
  diamondDown(1, [35, y], scale);
  diamondDown(2, [55, y], scale);
  diamondDown(3, [75, y], scale);
  diamondDown(4, [100, y], scale);

  y += 25;
  boatUp(0, [15, y], scale);
  boatUp(1, [40, y], scale);
  boatUp(2, [60, y], scale);
  boatUp(3, [85, y], scale);
  boatUp(4, [105, y], scale);

  y += 25;
  boatDown(0, [15, y], scale);
  boatDown(1, [40, y], scale);
  boatDown(2, [60, y], scale);
  boatDown(3, [85, y], scale);
  boatDown(4, [105, y], scale);
  
  /*
  */
}

