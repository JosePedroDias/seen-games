var updateScreenDims = function(cvsEl) {
  var d = [
    window.innerWidth,
    window.innerHeight
  ];
  if (cvsEl) {
    cvsEl.setAttribute('width',  d[0]);
    cvsEl.setAttribute('height', d[1]);
  }
  return d;
};


var avg = function(arr) {
  var v = 0;
  var n = arr.length;
  for (var i = 0; i < n; ++i) {
    v += arr[i];
  }
  return v / n;
};

var accum = function(v, arr, maxL) {
  arr.unshift(v);
  if (arr.length >= maxL) {
    arr.pop();
  }
};



var docEl = document.documentElement;
var canvasEl = document.querySelector('#c');
var screenDims = updateScreenDims(canvasEl);
var kbState;



var green = seen.Colors.hsl(0.33, 0.5, 0.5, 1);
var blue  = seen.Colors.hsl(0.66, 0.5, 0.5, 1);



// 45 degrees transform
var model = seen.Models["default"]();
model.rotx(Math.PI * 0.25);



// paints shape's surfaces with fill, optional stroke and stroke-width
var paint = function(shp, fill, stroke, width) {
  shp.surfaces.forEach(function(surf) {
    surf.fill = fill ? new seen.Material(fill) : null;
    if (stroke) {
      surf.stroke = new seen.Material(stroke);
    }
    if (width) {
      surf['stroke-width'] = width;
    }
  });
};



// generated a transformable cube shape with initial position and color
var genCube = function(scl, pos, clr) {
  var mdl0 = model.append();
  mdl0.translate.apply(mdl0, pos);
  mdl0.bake();
  var shp = seen.Shapes.cube().scale(scl);
  paint(shp, clr);
  var mdl = mdl0.append();
  return mdl.add(shp);
};

var genBox = function(X, Y, Z, pos, clr) {
  var mdl0 = model.append();
  mdl0.translate.apply(mdl0, pos);
  mdl0.bake();
  var shp = seen.Shapes.cube().scale(X, Y, Z);
  paint(shp, clr);
  var mdl = mdl0.append();
  return mdl.add(shp);
};



// shapes...
var zoom = 20;
var l = zoom;
var player = genBox(l, l*2, l, [0, l, 0], green);
var ball   = genCube(l*0.5, [0, 0, 3*l], blue);



// light rig
model.lights = [
  seen.Lights.directional({
    intensity: 0.003,
    normal:   seen.P(-1, 1, 0).normalize()
  }), seen.Lights.directional({
    intensity: 0.004,
    normal:    seen.P(-1, -1, 1).normalize()
  })
];



// camera, scene and context
var cam = new seen.Camera({
  projection: seen.Projections.ortho()
});

var scene = new seen.Scene({
  model:    model,
  viewport: seen.Viewports.center(screenDims[0], screenDims[1]),
  camera:   cam
});

scene.shader = seen.Shaders.phong();
scene.fractionalPoints = true;

var ctx = seen.Context(canvasEl, scene);



// run it...
if (0) {
  ctx.render();
} else {
  ctx.animate().onBefore(function(t, dt) {
    var st = kbState;
    var prwAccSz = 10;
    var spdAccSz =  5;
    var pwrFact  = 15 * dt;
    var spdFact  =  1 * dt;

    // accums
    accum(pwrFact * (st.spacePressed ? 1 : 0), st.powerAccum, prwAccSz);
    accum(spdFact * st.dir[0], st.dirAccum[0], spdAccSz);
    accum(spdFact * st.dir[1], st.dirAccum[1], spdAccSz);

    st.power    = avg(st.powerAccum);
    st.speed[0] = avg(st.dirAccum[0]);
    st.speed[1] = avg(st.dirAccum[1]);

    // player
    player.translate(
      st.speed[0],
      0,
      st.speed[1]
    );

    // ball...
    ball.reset();
    ball.translate(st.power, 0, 0);
  }).start();
}



// window resize handling
window.addEventListener('resize', function() {
  screenDims = updateScreenDims(canvasEl);
  scene.viewport = seen.Viewports.center(screenDims[0], screenDims[1]);
});




// keyboard handling, summarized to kbState
/*var p = spacePressed ? 1 : 0;
        power = 0.7 * power + 0.3 * p;
        dirInt[0] = 0.7 * dirInt[0] + 0.3 * dir[0];
        dirInt[1] = 0.7 * dirInt[1] + 0.3 * dir[1];*/
kbState = {
  spacePressed: false,
  power:        0,
  powerAccum:   [0],
  dir:          [0, 0],
  dirAccum:     [[0], [0]],
  speed:        [0, 0]
};
var onKey = function(ev) {
  var isDown = ev.type === 'keydown';
  var c = ev.keyCode;
  //console.log(c, isDown);
  if (c === 37 || c === 39) {
    kbState.dir[0] = (isDown ? (c === 37 ? -1 : 1) : 0);
  }
  else if (c === 38 || c === 40) {
    kbState.dir[1] = (isDown ? (c === 38 ? -1 : 1) : 0);
  }
  else if (c === 32) {
    kbState.spacePressed = isDown;
  }
  //console.log(kbState.dir, kbState.spacePressed);
};
docEl.addEventListener('keydown', onKey);
docEl.addEventListener('keyup',   onKey);
