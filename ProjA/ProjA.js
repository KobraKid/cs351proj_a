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
var g_last = Date.now();
var tick = function() {
  draw();
  requestAnimationFrame(tick, g_canvas);
};

/**
 * Main function.
 *
 * Initializes everything, then starts the main draw loop.
 */
function main() {
  /* Init vars */
  gl = init();
  g_canvas = document.getElementById('webgl');
  // Fix canvas size
  g_canvas.width = window.innerWidth;
  g_canvas.height = window.innerHeight;
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

function initVBO() {}

function draw() {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
}

function animate(angle) {
  var now = Date.now();
  var elapsed = now - g_last;
  g_last = now;
  var newAngle = angle + (g_angleRate * elapsed) / 1000.0;
  if(newAngle > 180.0) newAngle = newAngle - 360.0;
  if(newAngle <-180.0) newAngle = newAngle + 360.0;
  return newAngle;
}

function myMouseDown(ev) {}

function myMouseMove(ev) {}

function myMouseUp(ev) {}

function myKeyDown(kev) {}
