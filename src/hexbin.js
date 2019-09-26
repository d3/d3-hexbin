var thirdPi = Math.PI / 3,
    angles = [0, thirdPi, 2 * thirdPi, 3 * thirdPi, 4 * thirdPi, 5 * thirdPi];

function pointX(d) {
  return d[0];
}

function pointY(d) {
  return d[1];
}

export default function() {
  var x0 = 0,
      y0 = 0,
      x1 = 1,
      y1 = 1,
      x = pointX,
      y = pointY,
      r,
      dx,
      dy,
      tx = 0,
      ty = 0,
      angle = 0,
      ca = 1,
      sa = 0,
      context = null,
      binsById = {},
      bins = [];

  // from pixels to grid
  function transform(x, y) {
    x -= tx;
    y -= ty;
    if (ca === 1) return [x, y];
    return [x * ca - y * sa, x * sa + y * ca];
  }

  // from grid to pixels
  function untransform(x, y) {
    if (ca === 1) return [x + tx, y + ty];
    return [x * ca + y * sa + tx, - x * sa + y * ca + ty];
  }

  function hexbin(points) {
    if (points) {
      binsById = {};
      bins.splice(0, bins.length);
      addAll(points);
    }
    return bins;
  }

  function getBin(px, py) {
    var u = transform(px, py);
    px = u[0];
    py = u[1];
    var pj = Math.round(py = py / dy),
        pi = Math.round(px = px / dx - (pj & 1) / 2),
        py1 = py - pj;

    if (Math.abs(py1) * 3 > 1) {
      var px1 = px - pi,
          pi2 = pi + (px < pi ? -1 : 1) / 2,
          pj2 = pj + (py < pj ? -1 : 1),
          px2 = px - pi2,
          py2 = py - pj2;
      if (px1 * px1 + py1 * py1 > px2 * px2 + py2 * py2) pi = pi2 + (pj & 1 ? 1 : -1) / 2, pj = pj2;
    }
    return [pi, pj];
  }

  function addOne(point, px, py) {
    var b = getBin(px, py), pi = b[0], pj = b[1], id = b[0] + "-" + b[1], bin = binsById[id];
    if (bin) bin.push(point);
    else {
      bins.push(bin = binsById[id] = [point]);
      var u = untransform((pi + (pj & 1) / 2) * dx, pj * dy);
      bin.x = u[0];
      bin.y = u[1];
    }
  }

  function addAll(points) {
    var i, point, px, py, n = points.length;

    for (i = 0; i < n; ++i) {
      if (isNaN(px = +x.call(null, point = points[i], i, points))
          || isNaN(py = +y.call(null, point, i, points))) continue;
      addOne(point, px, py);
    }
  }

  function removeFromBin(point, bin) {
    var i = bin.indexOf(point);
    if (i > -1) {
      bin.splice(i, 1);
    }
  }

  function remove(point) {
    var px, py;
    if (isNaN(px = +x.call(null, point))
        || isNaN(py = +y.call(null, point))) return;
    var b = getBin(px, py), id = b[0] + "-" + b[1], bin = binsById[id];
    if (bin) {
      removeFromBin(point, bin);
      if (bin.length == 0) {
        var i = bins.indexOf(bin);
        if (i > -1) {
          bins.splice(i, 1);
          delete binsById[id];
        }
      }
    }
  }

  function hexagon(radius) {
    return angles.map(function(a) {
      a -= angle / 180 * Math.PI;
      return [ Math.sin(a) * radius, -Math.cos(a) * radius ];
    });
  }
  
  function vectors(points) {
    for (var i = points.length - 1; i > 0; i--) {
      points[i][0] -= points[i-1][0];
      points[i][1] -= points[i-1][1];
    }
  }

  hexbin.hexagon = function(radius, translate) {
    if (typeof radius == "object") {
      var tmp = translate;
      translate = radius;
      radius = tmp;
    }
    var points = hexagon(radius == null ? r : +radius);
    if (!context) {
      vectors(points);
      return (translate ? "M" + translate : "") + "m" + points.join("l") + "z";
    }
    if (translate == null) translate = [0, 0];
    context.moveTo(translate[0] + points[0][0], translate[1] + points[0][1]);
    for (var i = 1; i < 6; i++)
      context.lineTo(translate[0] + points[i][0], translate[1] + points[i][1]);
  };

  hexbin.centers = function() {
    var u00 = transform(x0, y0), tx00 = u00[0], ty00 = u00[1],
        u10 = transform(x1, y0), tx10 = u10[0], ty10 = u10[1],
        u01 = transform(x0, y1), tx01 = u01[0], ty01 = u01[1],
        u11 = transform(x1, y1), tx11 = u11[0], ty11 = u11[1],
        tx0 = Math.min(tx00, tx01, tx10, tx11),
        ty0 = Math.min(ty00, ty01, ty10, ty11),
        tx1 = Math.max(tx00, tx01, tx10, tx11),
        ty1 = Math.max(ty00, ty01, ty10, ty11),
        centers = [],
        j = Math.floor(ty0 / dy),
        i = Math.floor(tx0 / dx);

    for (var y = j * dy; y < ty1 + r; y += dy, ++j) {
      for (var x = i * dx + (j & 1) * dx / 2; x < tx1 + dx / 2; x += dx) {
        var u = untransform(x, y), ux = u[0], uy = u[1];
        if (ux >= x0 - dx && ux <= x1 + dx && uy >= y0 - dy && uy <= y1 + dy)
          centers.push([ux, uy]);
      }
    }
    return centers;
  };

  hexbin.mesh = function() {
    var points = hexagon(r).slice(0, 4),
      centers = hexbin.centers();
    if (!context) {
      vectors(points);
      var fragment = points.join("l");
      return centers.map(function(p) { return "M" + p + "m" + fragment; }).join("");
    }
    for (var i = 0, l = centers.length; i < l; i++) {
      var x0 = centers[i][0], y0 = centers[i][1];
      context.moveTo(x0 + points[0][0], y0 + points[0][1]);
      for (var j = 1; j < 4; j++)
        context.lineTo(x0 + points[j][0], y0 + points[j][1]);
    }
  };

  hexbin.angle = function(_) {
    return arguments.length ? (angle = _, ca = Math.cos(angle * Math.PI/180), sa =  Math.sin(angle * Math.PI/180), hexbin) : angle;
  };

  hexbin.translate = function(_) {
    return arguments.length ? (tx = _[0], ty = _[1], hexbin) : [tx, ty];
  };

  hexbin.x = function(_) {
    return arguments.length ? (x = _, hexbin) : x;
  };

  hexbin.y = function(_) {
    return arguments.length ? (y = _, hexbin) : y;
  };

  hexbin.radius = function(_) {
    return arguments.length ? (r = +_, dx = r * 2 * Math.sin(thirdPi), dy = r * 1.5, hexbin) : r;
  };

  hexbin.size = function(_) {
    return arguments.length ? (x0 = y0 = 0, x1 = +_[0], y1 = +_[1], hexbin) : [x1 - x0, y1 - y0];
  };

  hexbin.extent = function(_) {
    return arguments.length ? (x0 = +_[0][0], y0 = +_[0][1], x1 = +_[1][0], y1 = +_[1][1], hexbin) : [[x0, y0], [x1, y1]];
  };

  hexbin.context = function(_) {
    return arguments.length ? (context = _, hexbin) : context;
  }

  hexbin.bin = function(point) {
    var px, py;
    if (isNaN(px = +x.call(null, point))
        || isNaN(py = +y.call(null, point))) return;
    var b = getBin(px, py), pi = b[0], pj = b[1], id = b[0] + "-" + b[1], bin = binsById[id];
    if (!bin) {
      bin = [];
      var u = untransform((pi + (pj & 1) / 2) * dx, pj * dy);
      bin.x = u[0];
      bin.y = u[1];
    }
    return bin;
  }

  hexbin.add = function(point) {
    var px, py;
    if (!isNaN(px = +x.call(null, point, 0, [point]))
    && !isNaN(py = +y.call(null, point, 0, [point])))
      addOne(point, px, py);
    return hexbin;
  }

  hexbin.addAll = function(points) {
    points.forEach(hexbin.add);
    return hexbin;
  }

  hexbin.remove = function(point) {
    remove(point);
    return hexbin;
  }

  hexbin.removeAll = function(points) {
    points.forEach(remove);
    return hexbin;
  }

  return hexbin.radius(1);
}
