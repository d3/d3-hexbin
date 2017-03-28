var tape = require("tape"),
    d3 = require("../");

require("./pathEqual");

tape("d3.hexbin() has the expected defaults", function(test) {
  var b = d3.hexbin();
  test.deepEqual(b.extent(), [[0, 0], [1, 1]]);
  test.deepEqual(b.size(), [1, 1]);
  test.equal(b.x()([41, 42]), 41);
  test.equal(b.y()([41, 42]), 42);
  test.equal(b.radius(), 1);
  test.end();
});

tape("hexbin(points) bins the specified points into hexagonal bins", function(test) {
  var bins = d3.hexbin()([
    [0, 0], [0, 1], [0, 2],
    [1, 0], [1, 1], [1, 2],
    [2, 0], [2, 1], [2, 2]
  ]);
  test.deepEqual(noxy(bins), [
    [[0, 0]],
    [[0, 1], [0, 2], [1, 1], [1, 2]],
    [[1, 0], [2, 0]],
    [[2, 1], [2, 2]]
  ]);
  test.deepEqual(xy(bins), [
    {x: 0, y: 0},
    {x: 0.8660254037844386, y: 1.5},
    {x: 1.7320508075688772, y: 0},
    {x: 2.598076211353316, y: 1.5}
  ]);
  test.end();
});

tape("hexbin(points) observes the current x- and y-accessors", function(test) {
  var x = function(d) { return d.x; },
      y = function(d) { return d.y; },
      bins = d3.hexbin().x(x).y(y)([
    {x: 0, y: 0}, {x: 0, y: 1}, {x: 0, y: 2},
    {x: 1, y: 0}, {x: 1, y: 1}, {x: 1, y: 2},
    {x: 2, y: 0}, {x: 2, y: 1}, {x: 2, y: 2}
  ]);
  test.deepEqual(noxy(bins), [
    [{x: 0, y: 0}],
    [{x: 0, y: 1}, {x: 0, y: 2}, {x: 1, y: 1}, {x: 1, y: 2}],
    [{x: 1, y: 0}, {x: 2, y: 0}],
    [{x: 2, y: 1}, {x: 2, y: 2}]
  ]);
  test.deepEqual(xy(bins), [
    {x: 0, y: 0},
    {x: 0.8660254037844386, y: 1.5},
    {x: 1.7320508075688772, y: 0},
    {x: 2.598076211353316, y: 1.5}
  ]);
  test.end();
});

tape("hexbin(points) observes the current radius", function(test) {
  var bins = d3.hexbin().radius(2)([
    [0, 0], [0, 1], [0, 2],
    [1, 0], [1, 1], [1, 2],
    [2, 0], [2, 1], [2, 2]
  ]);
  test.deepEqual(noxy(bins), [
    [[0, 0], [0, 1], [1, 0], [1, 1]],
    [[0, 2], [1, 2], [2, 2]],
    [[2, 0], [2, 1]]
  ]);
  test.deepEqual(xy(bins), [
    {x: 0, y: 0},
    {x: 1.7320508075688772, y: 3},
    {x: 3.4641016151377544, y: 0}
  ]);
  test.end();
});

tape("hexbin.size() gets or sets the extent", function(test) {
  var b = d3.hexbin().size([2, 3]);
  test.deepEqual(b.extent(), [[0, 0], [2, 3]]);
  b.extent([[1, 2], [4, 8]]);
  test.deepEqual(b.size(), [3, 6]);
  test.end();
});

tape("hexbin.x(x) sets the x-coordinate accessor", function(test) {
  var x = function(d) { return d.x; },
      b = d3.hexbin().x(x),
      bins = b([{x: 1, 1: 2}]);
  test.equal(b.x(), x);
  test.equal(bins.length, 1);
  test.equal(bins[0].x, 0.8660254037844386);
  test.equal(bins[0].y, 1.5);
  test.equal(bins[0].length, 1);
  test.deepEqual(bins[0][0], {x: 1, 1: 2});
  test.end();
});

tape("hexbin.y(y) sets the y-coordinate accessor", function(test) {
  var y = function(d) { return d.y; },
      b = d3.hexbin().y(y),
      bins = b([{0: 1, y: 2}]);
  test.equal(b.y(), y);
  test.equal(bins.length, 1);
  test.equal(bins[0].x, 0.8660254037844386);
  test.equal(bins[0].y, 1.5);
  test.equal(bins[0].length, 1);
  test.deepEqual(bins[0][0], {0: 1, y: 2});
  test.end();
});

tape("hexbin.hexagon() returns the expected path", function(test) {
  test.pathEqual(d3.hexbin().hexagon(), "m0,-1l0.866025,0.500000l0,1l-0.866025,0.500000l-0.866025,-0.500000l0,-1z");
  test.end();
});

tape("hexbin.hexagon() observes the current bin radius", function(test) {
  test.pathEqual(d3.hexbin().radius(2).hexagon(), "m0,-2l1.732051,1l0,2l-1.732051,1l-1.732051,-1l0,-2z");
  test.pathEqual(d3.hexbin().radius(4).hexagon(), "m0,-4l3.464102,2l0,4l-3.464102,2l-3.464102,-2l0,-4z");
  test.end();
});

tape("hexbin.hexagon(radius) observes the specified radius", function(test) {
  test.pathEqual(d3.hexbin().hexagon(2), "m0,-2l1.732051,1l0,2l-1.732051,1l-1.732051,-1l0,-2z");
  test.pathEqual(d3.hexbin().hexagon(4), "m0,-4l3.464102,2l0,4l-3.464102,2l-3.464102,-2l0,-4z");
  test.end();
});

tape("hexbin.hexagon(radius) uses the current bin radius if radius is null", function(test) {
  test.pathEqual(d3.hexbin().hexagon(null), "m0,-1l0.866025,0.500000l0,1l-0.866025,0.500000l-0.866025,-0.500000l0,-1z");
  test.pathEqual(d3.hexbin().hexagon(undefined), "m0,-1l0.866025,0.500000l0,1l-0.866025,0.500000l-0.866025,-0.500000l0,-1z");
  test.end();
});

tape("hexbin.centers() returns an array of bin centers", function(test) {
  test.deepEqual(d3.hexbin().centers(), [
    [0, 0],
    [1.7320508075688772, 0],
    [0.8660254037844386, 1.5]
  ]);
  test.end();
});

tape("hexbin.centers() observes the current bin radius", function(test) {
  test.deepEqual(d3.hexbin().radius(0.5).centers(), [
    [0, 0],
    [0.8660254037844386, 0],
    [0.4330127018922193, 0.75],
    [1.299038105676658, 0.75]
  ]);
  test.end();
});

tape("hexbin.centers() observes the current extent", function(test) {
  test.deepEqual(d3.hexbin().radius(0.5).extent([[-1.1, -1.1], [1.1, 1.1]]).centers(), [
    [-0.4330127018922193, -0.75],
    [0.4330127018922193, -0.75],
    [1.299038105676658, -0.75],
    [-0.8660254037844386, 0],
    [0, 0],
    [0.8660254037844386, 0],
    [-0.4330127018922193, 0.75],
    [0.4330127018922193, 0.75],
    [1.299038105676658, 0.75],
    [-0.8660254037844386, 1.5],
    [0, 1.5],
    [0.8660254037844386, 1.5]
  ]);
  test.end();
});

tape("hexbin.mesh() returns the expected path", function(test) {
  test.pathEqual(d3.hexbin().mesh(), "M0,0m0,-1l0.866025,0.500000l0,1l-0.866025,0.500000M1.732051,0m0,-1l0.866025,0.500000l0,1l-0.866025,0.500000M0.866025,1.500000m0,-1l0.866025,0.500000l0,1l-0.866025,0.500000");
  test.end();
});

tape("hexbin.mesh() observes the bin radius", function(test) {
  test.pathEqual(d3.hexbin().radius(0.5).mesh(), "M0,0m0,-0.500000l0.433013,0.250000l0,0.500000l-0.433013,0.250000M0.866025,0m0,-0.500000l0.433013,0.250000l0,0.500000l-0.433013,0.250000M0.433013,0.750000m0,-0.500000l0.433013,0.250000l0,0.500000l-0.433013,0.250000M1.299038,0.750000m0,-0.500000l0.433013,0.250000l0,0.500000l-0.433013,0.250000");
  test.end();
});

tape("hexbin.mesh() observes the extent", function(test) {
  test.pathEqual(d3.hexbin().radius(0.5).extent([[-1.1, -1.1], [1.1, 1.1]]).mesh(), "M-0.433013,-0.750000m0,-0.500000l0.433013,0.250000l0,0.500000l-0.433013,0.250000M0.433013,-0.750000m0,-0.500000l0.433013,0.250000l0,0.500000l-0.433013,0.250000M1.299038,-0.750000m0,-0.500000l0.433013,0.250000l0,0.500000l-0.433013,0.250000M-0.866025,0m0,-0.500000l0.433013,0.250000l0,0.500000l-0.433013,0.250000M0,0m0,-0.500000l0.433013,0.250000l0,0.500000l-0.433013,0.250000M0.866025,0m0,-0.500000l0.433013,0.250000l0,0.500000l-0.433013,0.250000M-0.433013,0.750000m0,-0.500000l0.433013,0.250000l0,0.500000l-0.433013,0.250000M0.433013,0.750000m0,-0.500000l0.433013,0.250000l0,0.500000l-0.433013,0.250000M1.299038,0.750000m0,-0.500000l0.433013,0.250000l0,0.500000l-0.433013,0.250000M-0.866025,1.500000m0,-0.500000l0.433013,0.250000l0,0.500000l-0.433013,0.250000M0,1.500000m0,-0.500000l0.433013,0.250000l0,0.500000l-0.433013,0.250000M0.866025,1.500000m0,-0.500000l0.433013,0.250000l0,0.500000l-0.433013,0.250000");
  test.end();
});

function noxy(bins) {
  return bins.map(function(bin) {
    return bin.slice();
  });
}

function xy(bins) {
  return bins.map(function(bin) {
    return {x: bin.x, y: bin.y};
  });
}
