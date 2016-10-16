# d3-hexbin

Hexagonal binning is useful for aggregating “big” data into a coarse, “small” representation for display: rather than render a scatterplot of tens of thousands of points, bin the points into hexagons and show the distribution using color or area.

[<img alt="Hexbin Random Distributions" src="https://cloud.githubusercontent.com/assets/156229/18386150/d162fb32-7649-11e6-97e0-36c1b459c61e.png" width="420" />](http://bl.ocks.org/syntagmatic/748b02519c942c5291f302e060315ad6)

## Installing

If you use NPM, `npm install d3-hexbin`. Otherwise, download the [latest release](https://github.com/d3/d3-hexbin/releases/latest). You can also load directly from [d3js.org](https://d3js.org), either as a [standalone library](https://d3js.org/d3-hexbin.v0.2.min.js). AMD, CommonJS, and vanilla environments are supported. In vanilla, a `d3_hexbin` global is exported:

```html
<script src="https://d3js.org/d3-hexbin.v0.2.min.js"></script>
<script>

var hexbin = d3_hexbin.hexbin();

</script>
```

[Try d3-hexbin in your browser.](https://tonicdev.com/npm/d3-hexbin)

## API Reference

<a name="hexbin" href="#hexbin">#</a> d3.<b>hexbin</b>()

Constructs a new default hexbin generator.

<a name="_hexbin" href="#_hexbin">#</a> <b>hexbin</b>(<i>points</i>)

Bins the specified array of *points*, returning an array of hexagonal *bins*. For each point in the specified *points* array, the [*x*-](#hexbin_x) and [*y*-](#hexbin_y)accessors are invoked to compute the *x*- and *y*-coordinates of the point, which is then used to determine which hexagonal bin to add the point. If either the *x*- or *y*-coordinate is NaN, the point is ignored and will not be in any of the returned bins.

Each bin in the returned array is an array containing the bin’s points. Only non-empty bins are returned; empty bins without points are not included in the returned array. Each bin has these additional properties:

* `x` - the *x*-coordinate of the center of the associated bin’s hexagon
* `y` - the *y*-coordinate of the center of the associated bin’s hexagon

These *x*- and *y*-coordinates of the hexagon center can be used to render the hexagon at the appropriate location in conjunction with [*hexbin*.hexagon](#hexbin_hexagon). For example:

```js
svg.selectAll("path")
  .data(hexbin(points))
  .enter().append("path")
    .attr("d", function(d) { return "M" + d.x + "," + d.y + hexbin.hexagon(); });
```

Alternatively, using a transform:

```js
svg.selectAll("path")
  .data(hexbin(points))
  .enter().append("path")
    .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
    .attr("d", hexbin.hexagon());
```

This method ignores the hexbin’s [extent](#hexbin_extent); it may return bins outside the extent if necessary to contain the specified points.

<a href="hexagon" href="#hexagon">#</a> hexbin.<b>hexagon</b>([<i>radius</i>])

Returns the SVG path string for the hexagon centered at the origin ⟨0,0⟩. The path string is defined with relative coordinates such that you can easily translate the hexagon to the desired position. If *radius* is not specified, the hexbin’s [current radius](#hexbin_radius) is used. If *radius* is specified, a hexagon with the specified radius is returned; this is useful for area-encoded bivariate hexbins.

<a href="centers" href="#centers">#</a> hexbin.<b>centers</b>()

Returns an array of [*x*, *y*] points representing the centers of every hexagon in the [extent](#hexagon_extent).

<a href="mesh" href="#mesh">#</a> hexbin.<b>mesh</b>()

Returns an SVG path string representing the hexagonal mesh that covers the [extent](#hexagon_extent); the returned path is intended to be stroked. The mesh may extend slightly beyond the extent and may need to be clipped.

<a name="x" href="#x">#</a> hexbin.<b>x</b>([<i>x</i>])

If *x* is specified, sets the *x*-coordinate accessor to the specified function and returns this hexbin generator. If *x* is not specified, returns the current *x*-coordinate accessor, which defaults to:

```js
function x(d) {
  return d[0];
}
```

The *x*-coordinate accessor is used by [*hexbin*](#_hexbin) to compute the *x*-coordinate of each point. The default value assumes each point is specified as a two-element array of numbers [*x*, *y*].

<a name="y" href="#y">#</a> hexbin.<b>y</b>([<i>x</i>])

If *y* is specified, sets the *y*-coordinate accessor to the specified function and returns this hexbin generator. If *y* is not specified, returns the current *y*-coordinate accessor, which defaults to:

```js
function y(d) {
  return d[1];
}
```

The *y*-coordinate accessor is used by [*hexbin*](#_hexbin) to compute the *y*-coordinate of each point. The default value assumes each point is specified as a two-element array of numbers [*x*, *y*].

<a href="radius" href="#radius">#</a> hexbin.<b>radius</b>([<i>radius</i>])

If *radius* is specified, sets the radius of the hexagon to the specified number. If *radius* is not specified, returns the current radius, which defaults to 1. The hexagons are pointy-topped (rather than flat-topped); the width of each hexagon is *radius* × 2 × sin(π / 3) and the height of each hexagon is *radius* × 3 / 2.

<a href="extent" href="#extent">#</a> hexbin.<b>extent</b>([<i>extent</i>])

If *extent* is specified, sets the hexbin generator’s extent to the specified bounds [[*x0*, *y0*], [*x1*, *y1*]] and returns the hexbin generator. If *extent* is not specified, returns the generator’s current extent [[*x0*, *y0*], [*x1*, *y1*]], where *x0* and *y0* are the lower bounds and *x1* and *y1* are the upper bounds. The extent defaults to [[0, 0], [1, 1]].
