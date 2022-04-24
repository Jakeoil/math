

// A Point object
function P(x,y)
{
  this.x = x || 0;
  this.y = y || 0;
};


P.prototype =
{
  x:  null,
  y:  null,
  // create a new object distance v
  tr: function(v)
  {
    return new P(this.x + v.x, this.y + v.y);
  },

  // make an upside down copy
  vr: function()
  {
    return new P(this.x, -this.y);
  },

  // make a mirror image copy
  hr: function()
  {
    return new P(-this.x, this.y);
  },
  
  // Make a shrunken copy?  d must be special
  div: function(d)
  {
    return new P(this.x / d, this.y / d);
  }
};

// API here.
//var penrose = {};

// Build the api
var penrose = (function()
{

  var id;  
  var scale;
  var offset = {};
  var g;

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

  //----------------------------trash
  var D_UP    = [P(0, -3), P( 3, -1), P( 2,  3), P(-2,  3), P(-3, -1)];
  var D_DN    = [P(0,  3), P(-3,  1), P(-2, -3), P( 2, -3), P( 3,  1)];
  
  var UP      = [P(0, -8), P( 8, -2), P( 5,  8), P(-5,  8), P(-8, -2)];
  var DN      = [P(0,  8), P(-8,  2), P(-5, -8), P( 5, -8), P( 8,  2)];

  // Path around a star
  // p2-p5-p4-p7-p6-p9-p8-p1-p0-p4
  // p8-p5-p6-p3-p4-p1-p2-p9-p0-p7
  var st = P2.tr(P5).tr(P4).tr(P7).tr(P6).tr(P9).tr(P8).tr(P1);
  console.log("st= " + st.x + "," + st.y + "--yes?");
  var st = P2.tr(P5).tr(P4).tr(P7).tr(P6).tr(P9).tr(P8).tr(P1).tr(P0).tr(P3);
  console.log("st= " + st.x + "," + st.y);
  console.log("p4: " + P4.x + "," + P4.y);
  var newp = P4.tr(P7).tr(P6).tr(P9).tr(P8).tr(P1).div(5);
  console.log("----: " + newp.x + "," + newp.y);
  var newp = P6.tr(P9).tr(P8).tr(P1).tr(P0).tr(P4).div(5);
  console.log("----: " + newp.x + "," + newp.y);
  //console.log(st.x + "," st.y);
  // P0' = p9-p0-p1 or p1-p0-p9
  // P2' = p1-p2-p3 or p3-p2-p1
  // P4' = p3-p4-p5 or p5-p4-p3
  // P6' = p5-p6-p7 or p7-p6-p5
  // P8' = p7-p8-p9 or p9-p8-p7
  //----------------------------trash
  

  // future-----------------------------------

  function figure(fill, offset, shape)
  {
    g.fillStyle   = fill;//penrose.ORANGE;
    g.strokeStyle = penrose.OUTLINE;
    for (var i = 0; i < shape.length; i++)
    {
      var point = shape[i];
      g.fillRect(  offset.x * scale + point.x * scale, offset.y * scale + point.y * scale, scale, scale);
      g.strokeRect(offset.x * scale + point.x * scale, offset.y * scale + point.y * scale, scale, scale);
    }
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

  return {
    ORANGE : "#e46c0a",
    BLUE   : "#0000ff",
    YELLOW : "#ffff00",
    OUTLINE :"#4a7eba",
    init : function(in_scale, in_id)
    {
      scale     = in_scale;
      id        = in_id;
      g         = document.getElementById(in_id).getContext("2d");
    },
    g : g,
    p : [ P0, P1, P2, P3, P4, P5, P6, P7, P8, P9],
    s : [ S0, S1, S2, S3, S4, S5, S6, S7, S8, S9],
    t : [ T0, T1, T2, T3, T4, T5, T6, T7, T8, T9],

    up   : [0,2,4,6,8],
    down : [5,7,9,1,3],
    penta : 
      [
        penta_up.map(function(item){ return new P( item.x - 3,   item.y - 3); }),
        penta_up.map(function(item){ return new P(-item.x + 2,  -item.y + 2); }),
        penta_up.map(function(item){ return new P( item.x - 3,   item.y - 3); }),
        penta_up.map(function(item){ return new P(-item.x + 2,  -item.y + 2); }),
        penta_up.map(function(item){ return new P( item.x - 3,   item.y - 3); }),
        penta_up.map(function(item){ return new P(-item.x + 2,  -item.y + 2); }),
        penta_up.map(function(item){ return new P( item.x - 3,   item.y - 3); }),
        penta_up.map(function(item){ return new P(-item.x + 2,  -item.y + 2); }),
        penta_up.map(function(item){ return new P( item.x - 3,   item.y - 3); }),
        penta_up.map(function(item){ return new P(-item.x + 2,  -item.y + 2); })
      ],
    //
    diamond :
      [
        diamond_up.map( function(item){ return new P( item.x - 1,  item.y - 0); }),
        diamond_for.map(function(item){ return new P( item.x - 3, -item.y + 3); }),
        diamond_too.map(function(item){ return new P( item.x - 4,  item.y - 0); }),
        diamond_too.map(function(item){ return new P( item.x - 4, -item.y - 1); }),
        diamond_for.map(function(item){ return new P( item.x - 3,  item.y - 4); }),
        diamond_up.map( function(item){ return new P( item.x - 1,  item.y - 4); }),
        diamond_for.map(function(item){ return new P(-item.x + 2,  item.y - 4); }),
        diamond_too.map(function(item){ return new P(-item.x + 3, -item.y - 1); }),
        diamond_too.map(function(item){ return new P(-item.x + 3,  item.y + 0); }),
        diamond_for.map(function(item){ return new P(-item.x + 2, -item.y + 3); })
      ],
    //
    boat :
      [
        boat_up.map( function(item){ return new P( item.x - 4,  item.y - 4); }),
        boat_for.map(function(item){ return new P( item.x - 3, -item.y + 1); }),
        boat_too.map(function(item){ return new P( item.x - 1,  item.y - 4); }),
        boat_too.map(function(item){ return new P( item.x - 1, -item.y + 3); }),
        boat_for.map(function(item){ return new P( item.x - 3,  item.y - 2); }),
        boat_up.map( function(item){ return new P( item.x - 4, -item.y + 3); }),
        boat_for.map(function(item){ return new P(-item.x + 2,  item.y - 2); }),
        boat_too.map(function(item){ return new P(-item.x + 0, -item.y + 3); }),
        boat_too.map(function(item){ return new P(-item.x + 0,  item.y - 4); }),
        boat_for.map(function(item){ return new P(-item.x + 2, -item.y + 1); })
      ],
      
    //--
    star : 
      [
        star_up.map(function(item){ return new P( item.x - 4,  item.y - 4); }),
        star_up.map(function(item){ return new P(-item.x + 3, -item.y + 3); }),
        star_up.map(function(item){ return new P( item.x - 4,  item.y - 4); }),
        star_up.map(function(item){ return new P(-item.x + 3, -item.y + 3); }),
        star_up.map(function(item){ return new P( item.x - 4,  item.y - 4); }),
        star_up.map(function(item){ return new P(-item.x + 3, -item.y + 3); }),
        star_up.map(function(item){ return new P( item.x - 4,  item.y - 4); }),
        star_up.map(function(item){ return new P(-item.x + 3, -item.y + 3); }),
        star_up.map(function(item){ return new P( item.x - 4,  item.y - 4); }),
        star_up.map(function(item){ return new P(-item.x + 3, -item.y + 3); })
      ]
  }
 
})()