# The math site.
The center of this site is the blog. It contains a few javascript items: numbers, circles and a Coylean map example. From here, you can navigate to Penrose and Coylean. 

# Penrose Mozaic
The thing that makes the mozaic so fantastic is the fact that you can approximate a regular pentagon rather closely within a 6x6 square. By treating these as tiles you can see that the gaps between the corners is another shorter distance.  The sum of the side and this gap can added together to make a larger pentagon. 

The penrose tiles have the fibinacci series and the golden ratio written all over it.

# History
This site originally consisted of a large page with programmatic canvases of rendering the Six tiles. The first canvas, now called inflation 1 work area, renders compond versions of the six tile with rotations for the four tiles that don't have 5 fold symmetry.

An instance called penrose exposes a table of the six figures with each of the 10 rotations. A primitive function called figure() draws the specified tile in the specified place with the specified orientation. The original names of these figures were P0, P2, P4, star, boat and diamond. The current naming reflexts their symmetry better: 
- Pe5: Blue or Five white tiles around a center tile
- Pe3:  White or Three White tiles on top and two orange tiles on the bottom
- Pe1: Orange or One White tile on top with four orange tiles on the bottom.
- St5: A five pointed star. Basically 5 diamonds
- St3: A boat. A composite of 3 Diamonds upward.
- St1: A diamond. Pointing upward.

The first expansion is a composite of the primitive figures.
The plan was to code the first and second expansion and use the results to generalize the nth expansion. By looking at the offsets required, I could build tables with all the offets for each orientation.  I called these wheels.

## the wheels
Technically there are 10 orientatins
They are divided into Up and Down, each of these with 5 Fifths.
Fifths(0) Up is always a negative y coordinate. Minus is up. P0 Down is a positive version of up. It is not a reflection, but a rotation of 180 degrees.

Going clockwise:
 | rotation | down | fifths |
 | --------| ------ | ------ |
| 0 | false | 0 |
| 1 | true | 3 |
| 2 | false | 1 |
| 3 | true | 4 |
| 4 | false | 2 |
| 5 | true | 0 |
| 6 | false | 3 |
| 7 | true | 1 |
| 8 | false | 4 |
| 9 | true | 2 |

The wheels contain the x y offsets of the distances between the figures for each of these orientations.
We needed three wheels for each expansion.
- pWheel: Distance between pentagons
- sWheel: Distance between pentagon and diamond gap
- tWheel: Distance between boat and star

I then proceeded to code the second expansion using the manually produced wheels.

After lots of bugs, I sidetracked into some other tasks.

One was to keep track of the size of the figure.  I have a bounds class that returns the extremes of the figure.  Routines which call this figure 

# To do list

-   [ ] Decagon is working although I would like to center rotation. Code is just plain to complicated at the moment.
-   [ ] Add the vector paths for the shapes.
-   [ ] Improve the mini grid figure.
-   [ ] Play with writing text on the canvas.
-   [ ] Do a rewrite using module.
-   [ ] Make the penrose a module with classes.
<script type="module" src="app.mjs"></script>
-   [ ] Design a theme and sub-theme hierarchy for rendering.
        For example we have graphics. Had core. But can be printer or screen. Maybe some other characteristics.
        Then we have scale. Kind of in between.

Color scheme and color scheme rules. The actual colors and strokes and backgrounds. Related to rendering.

Then we have the theme, the actual algorithm for the ultimate figures. And whether we’re doing mosaic or vector or real is decided here.
