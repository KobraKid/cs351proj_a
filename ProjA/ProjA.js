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
var g_step = 8.0; // [4, +inf]

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
  pos = [];
  colors = [];

  /* CYLINDER */
  // Circle: {start: 0, len: (g_step * 2) + 2}
  pos.push(0, 0, 0, 1);
  for (var theta = 0.0; theta < (2.0 * Math.PI) + (Math.PI/g_step); theta += Math.PI/g_step) {
    pos.push(Math.cos(theta), Math.sin(theta), 0, 1);
  }
  for (var i = 0; i < (g_step * 2) + 2 + 1; i++) {
    colors.push(Math.random(), Math.random(), Math.random(), 1);
  }

  // Tube: {start: (g_step * 2) + 2, len: (g_step * 4) + 2}
  for (var theta = 0.0; theta < (2.0 * Math.PI) + (Math.PI/g_step); theta += Math.PI/g_step) {
    pos.push(Math.cos(theta), Math.sin(theta), 0, 1);
    pos.push(Math.cos(theta), Math.sin(theta), 1, 1);
  }
  for (var i = 0; i < (g_step * 4) + 2; i++) {
    colors.push(Math.random(), Math.random(), Math.random(), 1);
  }

  /* CONE */
  // Tip: {start: (g_step * 6) + 4, len: 1}
  pos.push(0, 0, 1, 1);
  colors.push(1, 1, 1, 1);
  // Circumfrence: {start: (g_step * 6) + 5, len: (g_step * 2) + 2}
  for (var theta = 0.0; theta < (2.0 * Math.PI) + (Math.PI/g_step); theta += Math.PI/g_step) {
    pos.push(Math.cos(theta), Math.sin(theta), 0, 1);
  }
  for (var i = 0; i < (g_step * 2) + 2 + 1; i++) {
    colors.push(Math.random(), Math.random(), Math.random(), 1);
  }

  console.log(pos);
  appendPositions(pos);
  appendColors(colors);
}

function draw() {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  ModelMatrix.setTranslate(0, 0, 0);
  ModelMatrix.setScale(g_aspect, 1, 1);
  ModelMatrix.translate(0.5, 0, 0);

  /* Draw Cylinder */
  ModelMatrix.scale(0.5, 0.5, 0.5);
  ModelMatrix.rotate(g_angle, 1, 1, 1);
  updateModelMatrix(ModelMatrix);
  gl.drawArrays(gl.TRIANGLE_FAN, 0, (g_step * 2) + 2);

  gl.drawArrays(gl.TRIANGLE_STRIP, (g_step * 2) + 2, (g_step * 4) + 2);

  ModelMatrix.translate(0, 0, 1);
  ModelMatrix.rotate(180, 1, 0, 0);
  updateModelMatrix(ModelMatrix);
  gl.drawArrays(gl.TRIANGLE_FAN, 0, (g_step * 2) + 2);

  ModelMatrix.setTranslate(0, 0, 0);
  ModelMatrix.setScale(g_aspect, 1, 1);
  ModelMatrix.translate(-0.5, 0, 0);

  /* Draw Cone */
  ModelMatrix.scale(0.5, 0.5, 0.5);
  ModelMatrix.rotate(g_angle, 1, 1, 1);
  updateModelMatrix(ModelMatrix);
  gl.drawArrays(gl.TRIANGLE_FAN, (g_step * 6) + 4, (g_step * 2) + 2);
  ModelMatrix.rotate(180, 1, 0, 0);
  updateModelMatrix(ModelMatrix);
  gl.drawArrays(gl.TRIANGLE_FAN, 0, (g_step * 2) + 2);

}

function animate(angle) {
  var now = Date.now();
  var elapsed = now - g_last;
  g_last = now;
  var newAngle = angle + (g_angleRate * elapsed * (dir * -1)) / 1000.0;
  if(newAngle > 180.0) newAngle = newAngle - 360.0;
  if(newAngle <-180.0) newAngle = newAngle + 360.0;
  return newAngle;
}

function myMouseDown(ev) {}

function myMouseMove(ev) {}

function myMouseUp(ev) {}

function myKeyDown(kev) {}
