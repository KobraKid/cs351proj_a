/**
 * Base logic for Project A.
 *
 * This file handles setting up, drawing, and animating dragonflies and
 * cattails in a 3D scene. It also handles user input events.
 *
 * @author Michael Huyler, Vittorio Iocco.
 */

/* Global Vars */
var gl;
var g_canvas;
var ModelMatrix;
var matricies = [];
var g_aspect = window.innerHeight / window.innerWidth;
var g_last = Date.now();
var g_angle = 0.0;
var dir = -1.0;
var g_angleRate = 45.0;
var tick = function() {
  draw();
  g_angle = animate(g_angle);
  requestAnimationFrame(tick, g_canvas);
};

/**
 * Main function.
 *
 * Initializes everything, then starts the main draw loop.
 */
function main() {
  /* Init vars */
  // Fix canvas size
  g_canvas = document.getElementById('webgl');
  g_canvas.width = window.innerWidth;
  g_canvas.height = window.innerHeight;
  gl = init();
  ModelMatrix = new Matrix4();
  updateModelMatrix(ModelMatrix);
  gl.clearColor(0, 0, 0, 1.0);

  /* Init VBO */
  initVBO();

  /* Init event listeners */
	window.addEventListener("keydown", myKeyDown, false);
  window.addEventListener("mousedown", myMouseDown);
  window.addEventListener("mousemove", myMouseMove);
	window.addEventListener("mouseup", myMouseUp);

  /* Start main draw loop */
  tick();
}

function initVBO() {
  // Triangle vertices
  appendPositions([0.0, 0.0, 1.0, 1.0,
                   1.0, 0.0, 0.0, 1.0,
                   0.0, 1.0, 1.0, 1.0,
                   1.0, 1.0, 0.0, 1.0,
                   0.0, 0.0, 0.0, 1.0,
                  ]);
  appendColors([1.0, 0.0, 0.0, 1.0,
                0.0, 1.0, 0.0, 1.0,
                0.0, 0.0, 1.0, 1.0,
                1.0, 0.0, 0.0, 1.0,
              ]);
}

function draw() {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // Guideline points
  ModelMatrix.setTranslate(0, 0, 0);
  ModelMatrix.setRotate(0, 1, 1, 1);
  ModelMatrix.setScale(g_aspect, 1, 1);
  updateModelMatrix(ModelMatrix);
  gl.drawArrays(gl.POINTS, 4, 1);

  ModelMatrix.setTranslate(0, 0, 0);
  ModelMatrix.setScale(g_aspect, 1, 1);
  ModelMatrix.setRotate(g_angle, 0, 0, 1);

  pushMatrix(ModelMatrix);

  // 'Leg'
  // ModelMatrix.rotate(g_angle, 0, 0, 1);
  ModelMatrix.scale(0.05, 0.25, 1);
  ModelMatrix.translate(-0.5, 0, 0);
  updateModelMatrix(ModelMatrix);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

  ModelMatrix = popMatrix();

  ModelMatrix.translate(0, 0.25, 0);
  pushMatrix(ModelMatrix);
  ModelMatrix.rotate(-g_angle/3, 0, 0, 1);
  ModelMatrix.scale(0.05 * 0.67, 0.25 * 0.5, 1);
  ModelMatrix.translate(-0.5, 0, 0);
  updateModelMatrix(ModelMatrix);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

  ModelMatrix = popMatrix();

  ModelMatrix.rotate(-g_angle/3, 0, 0, 1);
  ModelMatrix.translate(0, 0.125, 0);
  pushMatrix(ModelMatrix);
  ModelMatrix.rotate(-g_angle/3, 0, 0, 1);
  ModelMatrix.scale(0.05 * 0.67 * 0.67, 0.25 * 0.5 * 0.5, 1);
  ModelMatrix.translate(-0.5, 0, 0);
  updateModelMatrix(ModelMatrix);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

  ModelMatrix = popMatrix();

  ModelMatrix.rotate(-g_angle/3, 0, 0, 1);
  ModelMatrix.translate(0, 0.0625, 0);
  pushMatrix(ModelMatrix);
  ModelMatrix.rotate(-g_angle/3, 0, 0, 1);
  ModelMatrix.scale(0.05 * 0.67 * 0.67, 0.25 * 0.5 * 0.5, 1);
  ModelMatrix.translate(-0.5, 0, 0);
  updateModelMatrix(ModelMatrix);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

  ModelMatrix = popMatrix();

  ModelMatrix.rotate(-g_angle/3, 0, 0, 1);
  ModelMatrix.translate(0, 0.0625, 0);
  pushMatrix(ModelMatrix);
  ModelMatrix.rotate(-g_angle/3, 0, 0, 1);
  ModelMatrix.scale(0.05 * 0.67 * 0.67, 0.25 * 0.5 * 0.5, 1);
  ModelMatrix.translate(-0.5, 0, 0);
  updateModelMatrix(ModelMatrix);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

  ModelMatrix = popMatrix();

}

function animate(angle) {
  var now = Date.now();
  var elapsed = now - g_last;
  g_last = now;
  var newAngle = angle + (g_angleRate * elapsed * (dir * -1)) / 1000.0;
  // if(newAngle > 180.0) newAngle = newAngle - 360.0;
  // if(newAngle <-180.0) newAngle = newAngle + 360.0;
  if(newAngle > 120.0) {newAngle = 120.0; dir = -dir;}
  if(newAngle <-120.0) {newAngle =-120.0; dir = -dir;}
  return newAngle;
}

function myMouseDown(ev) {}

function myMouseMove(ev) {}

function myMouseUp(ev) {}

function myKeyDown(kev) {}
