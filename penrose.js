
/**
 * To do: Elaborate this
 */
class P {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
  // translate
  tr = v => new P(this.x + v.x, this.y + v.y)
  // Vertical and Horizontal reflection
  vr = () => new P(this.x, -this.y)
  hr = () => new P(-this.x, this.y)
  div = (d) => new P(this.x / d, this.y / d)
  copy = (d) => new P(this.x, this.y)
}

/**
 * Mutablee class
 */
class Bounds {
  constructor() {
    this.maxPoint = null;
    this.minPoint = null;
  }

  /**
   * Called from figure
   * @param {*} offset 
   * @param {*} point 
   */
  addPoint(offset, point) {
    const logicalPoint = (new P(offset.x + point.x, offset.y + point.y));
    if (!this.maxPoint || !this.minPoint) {
      this.minPoint = new P(p.x, p.y); // private copies, not references
      this.maxPoint = new P(p.x, p.y);
      return;
    }

    if(logicalPoint.x < this.minPoint.x) {
      this.minPoint.x = logicalPoint.x;
    } else if(logicalPoint.x > bounds.maxPoint.x) {
      this.maxPoint.x = logicalPoint.x;
    }
    if (logicalPoint.y < this.minPoint.y) {
      this.minPoint.y = logicalPoint.y;
    } else if (logicalPoint.y > this.maxPoint.y) {
      this.maxPoint.y = logicalPoint.y;
    }
  }

  expand(bounds) {
    if (!bounds) {
      return;
    }

    if (!this.maxPoint || !this.minPoint) {
      this.minPoint = bounds.minPoint;
      this.maxPoint = bounds.maxPoint;
      return;
    }

    if (bounds.minPoint.x < this.minPoint.x) {
      this.minPoint.x = bounds.minPoint.x;
    }
    if (bounds.minPoint.y < this.minPoint.y) {
      this.minPoint.y = bounds.minPoint.y;
    }
    if (bounds.maxPoint.x > this.maxPoint.x) {
      this.maxPoint.x = bounds.maxPoint.x;
    }
    if (bounds.maxPoint.y > this.maxPoint.y) {
      this.maxPoint.y = bounds.maxPoint.y;
    }
  }
}

/**
 * To do: convert to points
 */
class Wheel {
  constructor(p0, p1, p2) {
    this.list = [
      [p0[0], p0[1]],  // 0
      [p1[0], p1[1]],  // 1
      [p2[0], p2[1]],  // 2
      [p2[0], -p2[1]], // 2.y 3
      [p1[0], -p1[1]], // 1.y 4
      [p0[0], -p0[1]], // 0.y 5
      [-p1[0], -p1[1]], // 1.xy 6
      [-p2[0], -p2[1]], // 2.xy 7
      [-p2[0], p2[1]], //2.x
      [-p1[0], p1[1]],  // 1.x
    ];
  }
   
  get up() {
    return [this.list[0], this.list[2], this.list[4], this.list[6], this.list[8],];
  }
  get down() {
    return [this.list[5], this.list[7], this.list[9], this.list[1], this.list[3],];
  }
}

class Wheel2 {
  constructor(p0, p1, p2) {
    this.list = [
      p0.copy(), 
      p1.copy(),
      p2.copy(),
      p2.vr(),
      p1.vr(),
      p0.vr(),
      p1.vr().hr(),
      p2.vr().hr(),
      p2.hr(),
      p1.hr(),
    ]
  }
  get up() {
    return [this.list[0], this.list[2], this.list[4], this.list[6], this.list[8],];
  }
  get down() {
    return [this.list[5], this.list[7], this.list[9], this.list[1], this.list[3],];
  }
}
// API here.
//var penrose = {};

// Build the api
var penrose = (function()
{

  var id;  
  //var scale;
  var offset = {};
  //var g;

  var penta_up = [ [2,0],[3,0],
             [1,1],[2,1],[3,1],[4,1],
       [0,2],[1,2],[2,2],[3,2],[4,2],[5,2],
       [0,3],[1,3],[2,3],[3,3],[4,3],[5,3],
             [1,4],[2,4],[3,4],[4,4],
             [1,5],[2,5],[3,5],[4,5]]
    .map(function(item){return new P(item[0],item[1])});

  var diamond_up =[[0,0],[1,0],
                   [0,1],[1,1],
                   [0,2],[1,2],
                   [0,3],[1,3]]
    .map(function(item){return new P(item[0],item[1])});


  var diamond_too = [[1,0],[2,0],[3,0],[4,0],
               [0,1],[1,1],[2,1],[3,1]]
    .map(function(item){return new P(item[0],item[1])});

  var diamond_for = [[0,0],
                     [0,1],[1,1],
                           [1,2],[2,2],
                           [1,3],[2,3],
                                 [2,4],[3,4],
                                       [3,5]]
    .map(function(item){return new P(item[0],item[1])});

  var star_up =      [[3,0],[4,0],
                      [3,1],[4,1],
    [0,2],[1,2],[2,2],[3,2],[4,2],[5,2],[6,2],[7,2],
          [1,3],[2,3],[3,3],[4,3],[5,3],[6,3],
                [2,4],[3,4],[4,4],[5,4],
                [2,5],[3,5],[4,5],[5,5],
          [1,6],[2,6],            [5,6],[6,6],
          [1,7],                        [6,7]]
    .map(function(item){return new P(item[0],item[1])});

  var boat_up =      [[3,0],[4,0],
                      [3,1],[4,1],
    [0,2],[1,2],[2,2],[3,2],[4,2],[5,2],[6,2],[7,2],
          [1,3],[2,3],[3,3],[4,3],[5,3],[6,3]]
  .map(function(item){return new P(item[0],item[1])});

  var boat_too = [[0,0],[1,0],
                  [0,1],[1,1],
                  [0,2],[1,2],[2,2],[3,2],[4,2],
                  [0,3],[1,3],[2,3],[3,3],
                        [1,4],[2,4],
                        [1,5],[2,5],
                              [2,6],[3,6],
                                    [3,7]]
    .map(function(item){return new P(item[0],item[1])});

  var boat_for =       [[3,0],[4,0],[5,0],[6,0],
                  [2,1],[3,1],[4,1],[5,1],
            [1,2],[2,2],[3,2],[4,2],
            [1,3],[2,3],[3,3],[4,3],
      [0,4],[1,4],            [4,4],[5,4],
      [0,5],                        [5,5]]
  .map(function(item){return new P(item[0],item[1])});

  // Pentagon center to pentagon center
  var P0 = new P(0,-6);
  var P1 = new P(3,-4);
  var P2 = new P(5,-2);
  var P3 = P2.vr();
  var P4 = P1.vr();
  var P5 = P0.vr();
  var P6 = P4.hr();
  var P7 = P3.hr();
  var P8 = P2.hr();
  var P9 = P1.hr();
  
  // Pentagon center to near diamond
  var S0 = new P(0, -5);
  var S1 = new P(3, -5);
  var S2 = new P(5, -1);
  var S3 = S2.vr();
  var S4 = S1.vr();
  var S5 = S0.vr();
  var S6 = S4.hr();
  var S7 = S3.hr();
  var S8 = S2.hr();
  var S9 = S1.hr();

  // Star center to boat
  var T0 = new P(0, -8);
  var T1 = new P(5, -8);
  var T2 = new P(8, -2);
  var T3 = T2.vr();
  var T4 = T1.vr();
  var T5 = T0.vr();
  var T6 = T4.hr();
  var T7 = T3.hr();
  var T8 = T2.hr();
  var T9 = T1.hr();

  /**
   * These draw the symmetric pentagon.
   * 
   * @param {*} offset 
   * @param {*} scale 
   */
  function pUp(offset, scale)
  {
    figure(penrose.BLUE,   offset, scale, penrose.penta[penrose.down[0]]);
    
    for (var i = 0; i<5; i++)
      figure(penrose.YELLOW, offset.tr(penrose.p[penrose.up[i]]), scale, penrose.penta[penrose.up[i]]);
  }

  function pDown(offset, scale)
  {
    figure(penrose.BLUE,   offset, scale, penrose.penta[penrose.up[0]]);

    for (var i = 0; i<5; i++)
      figure(penrose.YELLOW, offset.tr(penrose.p[penrose.down[i]]), scale, penrose.penta[penrose.down[i]]); // correct
  }


  function translate(offset, angle)
  {
    return {x: offset.x + DECAGON[angle.x], y: offset.y + DECAGON[angle.y]};
  }
  
  function rotate(angle, amount)
  {
    var r = angle + amount;
    return r < 0 ?r + 10 : r % 10
  }
  /*
   * Main function to render a pentagon
   */
  function p0(order, angle, offset)
  {
    switch (order)
    {
    case 0:
      figure(penrose.BLUE, offset, penta[angle]);
      return [];
    case 1:
      return [
       penta0(0, offset, rotate(angle,5)),
       penta2(0, translate(offset, angle), rotate())
              ];
    }
  }

  // This is the core penrose object.
  return {
    ORANGE : "#e46c0a",
    BLUE   : "#0000ff",
    YELLOW : "#ffff00",
    OUTLINE :"#4a7eba",
    //init : function(in_scale, in_id)
    //{
    //  scale     = in_scale;
    //  id        = in_id;
    //  g         = document.getElementById(in_id).getContext("2d");
    //},
    //g : g,
    p : [ P0, P1, P2, P3, P4, P5, P6, P7, P8, P9],
    s : [ S0, S1, S2, S3, S4, S5, S6, S7, S8, S9],
    t : [ T0, T1, T2, T3, T4, T5, T6, T7, T8, T9],

    up   : [0,2,4,6,8],  //
    down : [5,7,9,1,3],
    // okay, 10 of each
    penta : 
      [
        penta_up.map((item) => new P( item.x - 3,   item.y - 3)),
        penta_up.map((item) => new P(-item.x + 2,  -item.y + 2)),
        penta_up.map((item) => new P( item.x - 3,   item.y - 3)),
        penta_up.map((item) => new P(-item.x + 2,  -item.y + 2)),
        penta_up.map((item) => new P( item.x - 3,   item.y - 3)),
        penta_up.map((item) => new P(-item.x + 2,  -item.y + 2)),
        penta_up.map((item) => new P( item.x - 3,   item.y - 3)),
        penta_up.map((item) => new P(-item.x + 2,  -item.y + 2)),
        penta_up.map((item) => new P( item.x - 3,   item.y - 3)),
        penta_up.map((item) => new P(-item.x + 2,  -item.y + 2)),
      ],
    //
    diamond :
      [
        diamond_up.map( (item) => new P( item.x - 1,  item.y - 0)),
        diamond_for.map((item) => new P( item.x - 3, -item.y + 3)),
        diamond_too.map((item) => new P( item.x - 4,  item.y - 0)),
        diamond_too.map((item) => new P( item.x - 4, -item.y - 1)),
        diamond_for.map((item) => new P( item.x - 3,  item.y - 4)),
        diamond_up.map((item) => new P( item.x - 1,  item.y - 4)),
        diamond_for.map((item) => new P(-item.x + 2,  item.y - 4)),
        diamond_too.map((item) => new P(-item.x + 3, -item.y - 1)),
        diamond_too.map((item) => new P(-item.x + 3,  item.y + 0)),
        diamond_for.map((item) => new P(-item.x + 2, -item.y + 3)),
      ],
    //
    boat :
      [
        boat_up.map( (item) => new P( item.x - 4,  item.y - 4)),
        boat_for.map((item) => new P( item.x - 3, -item.y + 1)),
        boat_too.map((item) => new P( item.x - 1,  item.y - 4)),
        boat_too.map((item) => new P( item.x - 1, -item.y + 3)),
        boat_for.map((item) => new P( item.x - 3,  item.y - 2)),
        boat_up.map((item) => new P( item.x - 4, -item.y + 3)),
        boat_for.map((item) => new P(-item.x + 2,  item.y - 2)),
        boat_too.map((item) => new P(-item.x + 0, -item.y + 3)),
        boat_too.map((item) => new P(-item.x + 0,  item.y - 4)),
        boat_for.map((item) => new P(-item.x + 2, -item.y + 1)),
      ],
      
    //--
    star : 
      [
        star_up.map((item) => new P( item.x - 4,  item.y - 4)),
        star_up.map((item) => new P(-item.x + 3, -item.y + 3)),
        star_up.map((item) => new P( item.x - 4,  item.y - 4)),
        star_up.map((item) => new P(-item.x + 3, -item.y + 3)),
        star_up.map((item) => new P( item.x - 4,  item.y - 4)),
        star_up.map((item) => new P(-item.x + 3, -item.y + 3)),
        star_up.map((item) => new P( item.x - 4,  item.y - 4)),
        star_up.map((item) => new P(-item.x + 3, -item.y + 3)),
        star_up.map((item) => new P( item.x - 4,  item.y - 4)),
        star_up.map((item) => new P(-item.x + 3, -item.y + 3)),
      ]
  }
 
})()