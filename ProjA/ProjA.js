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
var cattail_count = 1;
var g_cattails = [];
var g_cattail_last = Date.now();
var g_cattail_sway = 0.0;
var g_cattail_max_sway = 8.0;
var g_cattail_sway_dir = -1.0;
var g_cattail_rate = 8.0;
var dir = -1.0;
var g_angleRate = 45.0;
var tick = function() {
  if (tracker.animate_toggle) {
    draw();
    g_angle = animate(g_angle);
    if (tracker.cattail_sway) { g_cattail_sway = sway(g_cattail_sway); }
    requestAnimationFrame(tick, g_canvas);
  }
};
var g_step = 8.0; // [4, +inf]

var g_isDrag=false;
var g_xMclik=0.0;
var g_yMclik=0.0;
var g_xMdragTot=0.0;
var g_yMdragTot=0.0;

var GuiTracker = function() {
  this.global_x_pos = 0;
  this.global_y_pos = 0;
  this.global_z_pos = 0;
  this.global_x_scale = 1;
  this.global_y_scale = 1;
  this.global_z_scale = 1;
  this.global_x_rot = 0;
  this.global_y_rot = 0;
  this.global_z_rot = 0;
  this.animate_toggle = true;
  this.cattail_sway = true;
  this.reset = function() {
      this.global_x_pos = this.global_y_pos = this.global_z_pos = 0;
      this.global_x_rot = this.global_y_rot = this.global_z_rot = 0;
      this.global_x_scale = this.global_y_scale = this.global_z_scale = 1;
      draw();
  };
}
var tracker = new GuiTracker();

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
  gl.clearColor(0.5, 0.7, 1, 1.0);

  /* Init Functions */
  initGui();
  initVBO();

  /* Init event listeners */
	window.addEventListener("keydown", myKeyDown, false);
  window.addEventListener("mousedown", myMouseDown);
  window.addEventListener("mousemove", myMouseMove);
	window.addEventListener("mouseup", myMouseUp);

  /* Randomize forest */
  for (var i = 0; i < cattail_count; i++) {
    g_cattails.push([Math.random() - 0.5, 0, Math.random() - 0.5]);
  }

  /* Start main draw loop */
  tick();
}

function initGui() {
  var gui = new dat.GUI({name: 'My GUI'});
  var anim = gui.addFolder('Animations');
  var controller = anim.add(tracker, 'animate_toggle').listen();
  controller.onChange(function(value) {
    if (value) {
      g_last = g_cattail_last = Date.now();
      tick();
    }
  });
  var controller2 = anim.add(tracker, 'cattail_sway');
  controller2.onChange(function(value) {
    if (value) {
      g_cattail_last = Date.now();
    }
  });
  anim.open();
  var position = gui.addFolder('Position');
  position.add(tracker, 'global_x_pos', -2, 2).listen();
  position.add(tracker, 'global_y_pos', -2, 2).listen();
  position.add(tracker, 'global_z_pos', -2, 2).listen();
  // position.open();
  var scale = gui.addFolder('Scale');
  scale.add(tracker, 'global_x_scale', 0.1, 4);
  scale.add(tracker, 'global_y_scale', 0.1, 4);
  scale.add(tracker, 'global_z_scale', 0.1, 4);
  // scale.open();
  var rotate = gui.addFolder('Rotation');
  rotate.add(tracker, 'global_x_rot', -360, 360).listen();
  rotate.add(tracker, 'global_y_rot', -360, 360).listen();
  rotate.add(tracker, 'global_z_rot', -360, 360).listen();
  // rotate.open();
  gui.add(tracker, 'reset');
  gui.close();
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
  ModelMatrix.translate(tracker.global_x_pos, tracker.global_y_pos, tracker.global_z_pos);
  ModelMatrix.rotate(tracker.global_x_rot, 1, 0, 0);
  ModelMatrix.rotate(tracker.global_y_rot, 0, 1, 0);
  ModelMatrix.rotate(tracker.global_z_rot, 0, 0, 1);
  ModelMatrix.scale(tracker.global_x_scale, tracker.global_y_scale, tracker.global_z_scale);

  for (var i = 0; i < cattail_count; i++) {
    drawCattail(g_cattails[i][0], g_cattails[i][1], g_cattails[i][2]);
  }
}

function drawCattail(c_x, c_y, c_z) {
    /* Group: Cattail */
    pushMatrix(ModelMatrix);
    ModelMatrix.translate(c_x, c_y, c_z);

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
    ModelMatrix.translate(0, 0.025, 0);
    ModelMatrix.rotate(-tracker.global_x_rot, 1, 0, 0);
    ModelMatrix.rotate(-tracker.global_y_rot, 0, 1, 0);
    ModelMatrix.rotate(-tracker.global_z_rot, 0, 0, 1);
    ModelMatrix.scale(0.05, 0.05, 1);
    updateModelMatrix(ModelMatrix);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, (g_step * 2) + 2); // TODO Draw sphere

    ModelMatrix = popMatrix();
    pushMatrix(ModelMatrix);
    ModelMatrix.translate(0, 0.3125, 0);
    ModelMatrix.rotate(-tracker.global_x_rot, 1, 0, 0);
    ModelMatrix.rotate(-tracker.global_y_rot, 0, 1, 0);
    ModelMatrix.rotate(-tracker.global_z_rot, 0, 0, 1);
    ModelMatrix.scale(0.05, 0.05, 1);
    updateModelMatrix(ModelMatrix);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, (g_step * 2) + 2); // TODO Draw sphere

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

function myMouseDown(ev) {
  if (!tracker.animate_toggle)
    return;
  var rect = ev.target.getBoundingClientRect();
  var xp = ev.clientX - rect.left;
  var yp = g_canvas.height - (ev.clientY - rect.top);

  var x = (xp - g_canvas.width/2)  / (g_canvas.width/2);
	var y = (yp - g_canvas.height/2) / (g_canvas.height/2);

	g_isDrag = true;
	g_xMclik = x;
	g_yMclik = y;
}

function myMouseMove(ev) {
  if (!tracker.animate_toggle)
    return;
	if (g_isDrag==false)
    return;

  var rect = ev.target.getBoundingClientRect();
  var xp = ev.clientX - rect.left;
	var yp = g_canvas.height - (ev.clientY - rect.top);

  var x = (xp - g_canvas.width/2)  / (g_canvas.width/2);
	var y = (yp - g_canvas.height/2) / (g_canvas.height/2);

	g_xMdragTot += (x - g_xMclik);
	g_yMdragTot += (y - g_yMclik);

	g_xMclik = x;
	g_yMclik = y;

  tracker.global_x_rot = (g_yMdragTot * 40) % 360;
  tracker.global_y_rot = (g_xMdragTot * -40) % 360;
}

function myMouseUp(ev) {
  if (!tracker.animate_toggle)
    return;
  var rect = ev.target.getBoundingClientRect();
  var xp = ev.clientX - rect.left;
	var yp = g_canvas.height - (ev.clientY - rect.top);

  var x = (xp - g_canvas.width/2)  / (g_canvas.width/2);
	var y = (yp - g_canvas.height/2) / (g_canvas.height/2);

	g_isDrag = false;
	g_xMdragTot += (x - g_xMclik);
	g_yMdragTot += (y - g_yMclik);
}

function myKeyDown(kev) {
  switch(kev.code) {
		case "KeyP":
			if (tracker.animate_toggle) {
			  tracker.animate_toggle = false;
		  }
			else {
			  tracker.animate_toggle = true;
        g_last = g_cattail_last = Date.now();
			  tick();
		  }
			break;
		case "KeyW":
    case "ArrowUp":
      tracker.global_y_pos += 0.01;
			break;
		case "KeyA":
    case "ArrowLeft":
      tracker.global_x_pos -= 0.01;
			break;
		case "KeyS":
    case "ArrowDown":
      tracker.global_y_pos -= 0.01;
			break;
    case "KeyD":
    case "ArrowRight":
      tracker.global_x_pos += 0.01;
			break;
    case "KeyR":
      tracker.reset();
      break;
    case "Equal":
    case "NumpadAdd":
      tracker.global_x_scale += .1;
      tracker.global_y_scale += .1;
      tracker.global_z_scale += .1;
      break;
    case "Minus":
    case "NumpadSubtract":
      tracker.global_x_scale -= .1;
      tracker.global_y_scale -= .1;
      tracker.global_z_scale -= .1;
      break;
    default:
      console.log("Unused key");
      break;
	}
}
