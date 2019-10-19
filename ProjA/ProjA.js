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
var g_cattail_last = Date.now();
var g_cattail_sway = 0.0;
var g_cattail_max_sway = 8.0;
var g_cattail_sway_dir = -1.0;
var g_cattail_rate = 8.0;
var dir = -1.0;
var g_angleRate = 45.0;
var tick = function() {
  draw();
  g_angle = animate(g_angle);
  g_cattail_sway = sway(g_cattail_sway);
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
  colors.push(139.0/255.0, 69.0/255.0, 19.0/255.0, 1);
  for (var theta = 0.0; theta < (2.0 * Math.PI) + (Math.PI/g_step); theta += Math.PI/g_step) {
    pos.push(Math.cos(theta), Math.sin(theta), 0, 1);
    colors.push(139.0/255.0, 69.0/255.0, 19.0/255.0, 1);
  }

  // Brown Tube: {start: (g_step * 2) + 2, len: (g_step * 4) + 2}
  for (var theta = 0.0; theta < (2.0 * Math.PI) + (Math.PI/g_step); theta += Math.PI/g_step) {
    pos.push(Math.cos(theta), Math.sin(theta), 0, 1);
    pos.push(Math.cos(theta), Math.sin(theta), 1, 1);
    colors.push(139.0/255.0, 69.0/255.0, 19.0/255.0, 1);
    colors.push(139.0/255.0, 69.0/255.0, 19.0/255.0, 1);
  }

  /* CONE */
  // Tip: {start: (g_step * 6) + 4, len: 1}
  pos.push(0, 0, 1, 1);
  colors.push(13.0/255.0, 173.0/255.0, 10.0/255.0, 1);
  // Circumfrence: {start: (g_step * 6) + 5, len: (g_step * 2) + 2}
  for (var theta = 0.0; theta < (2.0 * Math.PI) + (Math.PI/g_step); theta += Math.PI/g_step) {
    pos.push(Math.cos(theta), Math.sin(theta), 0, 1);
    colors.push(13.0/255.0, 173.0/255.0, 10.0/255.0, 1);
  }

  // Green Tube: {start: (g_step * 8) + 7, len: (g_step * 4) + 2}
  for (var theta = 0.0; theta < (2.0 * Math.PI) + (Math.PI/g_step); theta += Math.PI/g_step) {
    pos.push(Math.cos(theta), Math.sin(theta), 0, 1);
    pos.push(Math.cos(theta), Math.sin(theta), 1, 1);
    colors.push(13.0/255.0, 173.0/255.0, 10.0/255.0, 1);
    colors.push(13.0/255.0, 173.0/255.0, 10.0/255.0, 1);
  }

  appendPositions(pos);
  appendColors(colors);
}

function draw() {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  ModelMatrix.setTranslate(0, 0, 0);
  ModelMatrix.setScale(g_aspect, 1, 1);
  ModelMatrix.rotate(g_angle, 0, 1, 0);

  /* Group: Cattail */
  pushMatrix(ModelMatrix);

  // Group: Stalk
  pushMatrix(ModelMatrix);

  // Object: Stem
  var stalk_divisions = 12.0;
  var stalk_height = 1.0;
  ModelMatrix.translate(0, -1, 0);

  for (var i = 0; i < stalk_divisions; i++) {
    pushMatrix(ModelMatrix);
    ModelMatrix.rotate(270, 1, 0, 0);
    ModelMatrix.rotate(g_cattail_sway / stalk_divisions * i, 0, 1, 0);
    ModelMatrix.translate(0, 0, 0.99/stalk_divisions * i);
    ModelMatrix.rotate(g_cattail_sway / stalk_divisions * i, 0, 1, 0);
    ModelMatrix.scale(0.02, 0.02, stalk_height/stalk_divisions);
    updateModelMatrix(ModelMatrix);
    gl.drawArrays(gl.TRIANGLE_STRIP, (g_step * 8) + 6, (g_step * 4) + 2);
    ModelMatrix = popMatrix();
  }

  // TODO: Object: Leaf
  // gl.drawArrays(...);

  // End Group: Stalk
  ModelMatrix = popMatrix();

  // Group: Head
  ModelMatrix.translate(0, -1, 0);
  ModelMatrix.rotate(-g_cattail_sway, 0, 0, 1);
  ModelMatrix.translate(0, 1, 0);
  ModelMatrix.rotate(-g_cattail_sway, 0, 0, 1);
  pushMatrix(ModelMatrix);

  // Object: Head
  ModelMatrix.rotate(270, 1, 0, 0);
  ModelMatrix.scale(0.05, 0.05, 0.3);
  ModelMatrix.translate(0, 0, 0.05);
  updateModelMatrix(ModelMatrix);
  gl.drawArrays(gl.TRIANGLE_STRIP, (g_step * 2) + 2, (g_step * 4) + 2);

  ModelMatrix = popMatrix();
  pushMatrix(ModelMatrix);
  ModelMatrix.scale(0.05, 0.05, 1);
  ModelMatrix.translate(0, 0.5, 0);
  updateModelMatrix(ModelMatrix);
  gl.drawArrays(gl.TRIANGLE_FAN, 0, (g_step * 2) + 2);

  ModelMatrix = popMatrix();
  pushMatrix(ModelMatrix);
  ModelMatrix.scale(0.05, 0.05, 1);
  ModelMatrix.translate(0, 6, 0);
  updateModelMatrix(ModelMatrix);
  gl.drawArrays(gl.TRIANGLE_FAN, 0, (g_step * 2) + 2);

  // End Group: Head
  ModelMatrix = popMatrix();

  // Group: Tip
  pushMatrix(ModelMatrix);

  // Object: Tip
  ModelMatrix.translate(0, 0.33, 0);
  ModelMatrix.rotate(270, 1, 0, 0);
  ModelMatrix.scale(0.01, 0.01, 0.25); // w, d, h
  updateModelMatrix(ModelMatrix);
  gl.drawArrays(gl.TRIANGLE_FAN, (g_step * 6) + 4, (g_step * 2) + 2);
  ModelMatrix.rotate(180, 1, 0, 0);
  updateModelMatrix(ModelMatrix);
  gl.drawArrays(gl.TRIANGLE_FAN, 0, (g_step * 2) + 2);

  // End Group: Tip
  ModelMatrix = popMatrix();

  /* End Group: Cattail */
  ModelMatrix = popMatrix();

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

function sway(angle) {
  var now = Date.now();
  var elapsed = now - g_cattail_last;
  g_cattail_last = now;
  var newAngle = angle + (g_cattail_rate * elapsed * g_cattail_sway_dir) / 1000.0;
  if (newAngle > g_cattail_max_sway) {
    newAngle =  g_cattail_max_sway;
    g_cattail_sway_dir = -g_cattail_sway_dir;
  }
  if (newAngle <-g_cattail_max_sway) {
    newAngle = -g_cattail_max_sway;
    g_cattail_sway_dir = -g_cattail_sway_dir;
  }
  return newAngle;
}

function myMouseDown(ev) {}

function myMouseMove(ev) {}

function myMouseUp(ev) {}

function myKeyDown(kev) {}
