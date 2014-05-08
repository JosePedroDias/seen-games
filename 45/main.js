var red   = seen.Colors.hsl(0,    0.5, 0.5, 1);
var green = seen.Colors.hsl(0.33, 0.5, 0.5, 1);
var blue  = seen.Colors.hsl(0.66, 0.5, 0.5, 1);

var model = seen.Models["default"]();
model.rotx(Math.PI * 0.25);

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

var genCube = function(scl, pos, clr) {
  var mdl0 = model.append();
  mdl0.translate.apply(mdl0, pos);
  mdl0.bake();
  var shp = seen.Shapes.cube().scale(scl);
  paint(shp, clr );
  var mdl = mdl0.append();
  return mdl.add(shp);
};

var l = 30;

var m1 = genCube(l, [-l, 0,     0], red);
var m2 = genCube(l, [ l, 0,     0], green);
var m3 = genCube(l, [ 0, 2 * l, 0], blue);

model.lights = [
  seen.Lights.directional({
    intensity: 0.003,
    normal:   seen.P(-1, 1, 0).normalize()
  }), seen.Lights.directional({
    intensity: 0.004,
    normal:    seen.P(-1, -1, 1).normalize()
  })
];

var cam = new seen.Camera({
  projection: seen.Projections.ortho()
});

var scene = new seen.Scene({
  model:    model,
  viewport: seen.Viewports.center(300, 300),
  camera:   cam
});

scene.shader = seen.Shaders.phong();
scene.fractionalPoints = true;

var ctx = seen.Context('c', scene);

if (0) {
  ctx.render();
} else {
  ctx.animate().onBefore(function(t, dt) {
    m1.reset();
    m1.scale(0.5 + 0.5 * Math.sin(t * 0.005));
    m2.reset();
    m2.roty(t * 0.005);
    m3.reset();
    return m3.translate(l * Math.sin(t * 0.01), 0, 0);
  }).start();
}
