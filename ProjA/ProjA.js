/**
 * Base logic for Project A.
 *
 * This file handles setting up, drawing, and animating dragonflies and
 * cattails in a 3D scene. It also handles user input events.
 *
 * @author Michael Huyler, Vittorio Iocco.
 */

/* Global Vars */

// Context vars
var gl;

// Canvas vars
var g_canvas;
var g_aspect = window.innerHeight / window.innerWidth;

// Transformation vars
var ModelMatrix;
var g_step = 8.0; // [4, +inf]
var wing_start;

// Animation vars
var g_last = Date.now();
var g_angle = 0.0;
var g_angle_rate = 45.0;
// Cattails
var cattail_count = 8;
var g_cattails = [];
var g_cattail_max_sway = 7;
var g_cattail_rate = 4.8;
// Dragonflies
var dragonfly_count = 3;
var g_dragonflies = [];
var g_dragonfly_timeout = 40;
// Wings
var g_wing_angle = 0;
var g_wing_angle_last = Date.now();
var g_wing_angle_rate = 450;
var g_wing_dir = 1;
// Tick function
var tick = function() {
  if (tracker.animate_toggle) {
    draw();
    g_angle = animate(g_angle);
    g_wing_angle = animateWings(g_wing_angle);
    if (tracker.cattail_sway) {
      for (var i = 0; i < g_cattails.length; i++) {
        sway(i);
      }
    }
    requestAnimationFrame(tick, g_canvas);
  }
};

// Event handler vars
var g_isDrag = false;
var g_xMclik = 0.0;
var g_yMclik = 0.0;
var g_xMdragTot = 0.0;
var g_yMdragTot = 0.0;
var g_mouse_x = 1.0;
var g_mouse_y = 0.5;
var g_dragonfly_x = 0;
var g_dragonfly_y = 0;
var g_dragonfly_z = 0;

// GUI vars
var gui;
var gui_open = false;
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
  this.addDragonfly = function() {
    tracker.animate_toggle = false;
    setTimeout(function(){
      dragonfly_count++;
      addDragonfly();
      tracker.animate_toggle = true;
      g_last = Date.now();
      for (var i = 0; i < g_cattails.length; i++) {g_cattails[i][4] = Date.now();}
      tick();
    }, 10);
  };
  this.addCattail = function() {
    tracker.animate_toggle = false;
    setTimeout(function(){
      cattail_count++;
      addCattail();
      tracker.animate_toggle = true;
      g_last = Date.now();
      for (var i = 0; i < g_cattails.length; i++) {g_cattails[i][4] = Date.now();}
      tick();
    }, 10);
  };
  this.removeDragonfly = function() {
    tracker.animate_toggle = false;
    setTimeout(function(){
      dragonfly_count--;
      removeDragonfly();
      tracker.animate_toggle = true;
      g_last = Date.now();
      for (var i = 0; i < g_cattails.length; i++) {g_cattails[i][4] = Date.now();}
      tick();
    }, 10);
  };
  this.removeCattail = function() {
    tracker.animate_toggle = false;
    setTimeout(function(){
      cattail_count--;
      removeCattail();
      tracker.animate_toggle = true;
      g_last = Date.now();
      for (var i = 0; i < g_cattails.length; i++) {g_cattails[i][4] = Date.now();}
      tick();
    }, 10);
  };
  this.reset = function() {
    this.global_x_pos = this.global_y_pos = this.global_z_pos = 0;
    this.global_x_rot = this.global_y_rot = this.global_z_rot = 0;
    this.global_x_scale = this.global_y_scale = this.global_z_scale = 1;
    g_xMdragTot = 0.0;
    g_yMdragTot = 0.0;
    draw();
  };
}
var tracker = new GuiTracker();
var help_visible = false;

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
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  /* Init Functions */
  initGui();
  initVBO();

  /* Init event listeners */
	window.addEventListener("keydown", myKeyDown, false);
  window.addEventListener("mousedown", myMouseDown);
  window.addEventListener("mousemove", myMouseMove);
	window.addEventListener("mouseup", myMouseUp);
  (function() {
      document.onmousemove = handleMouseMove;
      function handleMouseMove(event) {
          var eventDoc, doc, body;
          // IE compat
          event=event||window.event;if(event.pageX==null&&event.clientX!=null){eventDoc=(event.target&&event.target.ownerDocument)||document;doc=eventDoc.documentElement;body=eventDoc.body;event.pageX=event.clientX+(doc&&doc.scrollLeft||body&&body.scrollLeft||0)-(doc&&doc.clientLeft||body&&body.clientLeft||0);event.pageY=event.clientY+(doc&&doc.scrollTop||body&&body.scrollTop||0)-(doc&&doc.clientTop||body&&body.clientTop||0);}
          g_mouse_x = event.pageX / (window.innerWidth * g_aspect);
          g_mouse_y = event.pageY / window.innerHeight;
          for (var i = 0; i < g_dragonflies.length; i++) {
            g_dragonflies[i][4] = Math.random() * 0.8 / g_aspect;
            g_dragonflies[i][5] = Math.random() * 0.8;
            g_dragonflies[i][6] = g_dragonfly_timeout;
          }
      }
  })(); // mousemove

  /* Randomize forest */
  for (var i = 0; i < cattail_count; i++) {
    addCattail();
  }
  /* Randomize Dragonflies */
  for (var i = 0; i < dragonfly_count; i++) {
    addDragonfly();
  }

  /* Start main draw loop */
  tick();
}

function addDragonfly() {
  g_dragonflies.push([
    Math.random()*2-1,              // x
    Math.random()*2-1,              // y
    Math.random()*0.5,              // offset x
    Math.random()*0.5,              // offset y
    Math.random() * 0.8 / g_aspect, // random point of interest x
    Math.random() * 0.8,            // random point of interest y
    0                               // timeout
  ]);
}

function removeDragonfly() {
  g_dragonflies.pop();
}

function addCattail() {
  g_cattails.push([
    Math.random()*2 - 1,                // x
    0,                                  // y
    Math.random() - 0.5,                // z
    Math.random() * g_cattail_max_sway, // starting angle
    Date.now(),                         // last tick
    Math.random() < 0.5 ? -1 : 1        // starting direction
  ]);
}

function removeCattail() {
  g_cattails.pop();
}

/*
 * Initializes the GUI at startup, registers variable state listeners.
 */
function initGui() {
  gui = new dat.GUI({name: 'My GUI'});
  var anim = gui.addFolder('Animations');
  var controller = anim.add(tracker, 'animate_toggle').listen();
  controller.onChange(function(value) {
    if (value) {
      g_last = Date.now();
      for (var i = 0; i < g_cattails.length; i++) {g_cattails[i][4] = Date.now();}
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
  var manage_objects = gui.addFolder('Manage Objects');
  manage_objects.add(tracker, 'addDragonfly');
  manage_objects.add(tracker, 'removeDragonfly');
  manage_objects.add(tracker, 'addCattail');
  manage_objects.add(tracker, 'removeCattail');
  manage_objects.open();
  gui.add(tracker, 'reset');
  gui.close();
}

/*
 * Fills VBO with all of the data we will need.
 *
 * This function runs once on startup, and loads all of the necessary vertices
 * into the VBO, as well as all of their color information.
 */
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
  colors.push(19.0/255.0, 120.0/255.0, 46.0/255.0, 1);
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
    colors.push(16.0/255.0, 163.0/255.0, 55.0/255.0, 1);
  }

  /* Order of push:
     1. Top right wing (front/z+): 0-46
     2. Bottom right wing (front/z+): 47-93
     3. Bottom right wing (back/z-): 94-140
     4. Top right wing (back/z-): 141-187
     5. Abdomen (circle of cylinder): 188-205
     6. Abdomen (tube of cylinder): 206-239
     7. Abdomen (tip of cone): 240-240
     8. Abdomen (circumference of cone): 241- 258 */

  // The top right wing
  wing_start = pos.length / 4;
  pos.push( -1.0, 0.0, 0.0, 1.0,   // vertex 1
            -0.97,-0.076,0.0, 1.0, // vertex 2
            -0.97, 0.05, 0.0, 1.0, // vertex 3
            -0.95,-0.10, 0.0, 1.0, // vertex 4
            -0.95, 0.07, 0.0, 1.0, // vertex 5
            -0.90,-0.12, 0.0, 1.0, // vertex 6
            -0.90, 0.09, 0.0, 1.0, // vertex 7
            -0.80,-0.17, 0.0, 1.0, // vertex 8
            -0.80, 0.12, 0.0, 1.0, // vertex 9
            -0.70,-0.20, 0.0, 1.0, // vertex 10
            -0.70, 0.15, 0.0, 1.0, // vertex 11
            -0.60,-0.21, 0.0, 1.0, // vertex 12
            -0.60, 0.16, 0.0, 1.0, // vertex 13
            -0.50,-0.22, 0.0, 1.0, // vertex 14
            -0.50, 0.16, 0.0, 1.0, // vertex 15
            -0.40,-0.24, 0.0, 1.0, // vertex 16
            -0.40, 0.16, 0.0, 1.0, // vertex 17
            -0.30,-0.27, 0.0, 1.0, // vertex 18
            -0.30, 0.15, 0.0, 1.0, // vertex 19
            -0.20,-0.29, 0.0, 1.0, // vertex 20
            -0.20, 0.15, 0.0, 1.0, // vertex 21
            -0.10,-0.30, 0.0, 1.0, // vertex 22
            -0.10, 0.16, 0.0, 1.0, // vertex 23
             0.00,-0.30, 0.0, 1.0, // vertex 24
             0.00, 0.17, 0.0, 1.0, // vertex 25
             0.10,-0.29, 0.0, 1.0, // vertex 26
             0.10, 0.18, 0.0, 1.0, // vertex 27
             0.20,-0.27, 0.0, 1.0, // vertex 28
             0.20, 0.19, 0.0, 1.0, // vertex 29
             0.30,-0.24, 0.0, 1.0, // vertex 30
             0.30, 0.20, 0.0, 1.0, // vertex 31
             0.40,-0.20, 0.0, 1.0, // vertex 32
             0.40, 0.21, 0.0, 1.0, // vertex 33
             0.50,-0.15, 0.0, 1.0, // vertex 34
             0.50, 0.23, 0.0, 1.0, // vertex 35
             0.60,-0.12, 0.0, 1.0, // vertex 36
             0.60, 0.24, 0.0, 1.0, // vertex 37
             0.70,-0.09, 0.0, 1.0, // vertex 38
             0.70, 0.22, 0.0, 1.0, // vertex 39
             0.75,-0.06, 0.0, 1.0, // vertex 40
             0.75, 0.20, 0.0, 1.0, // vertex 41
             0.80,-0.03, 0.0, 1.0, // vertex 42
             0.80, 0.17, 0.0, 1.0, // vertex 43
             0.85, 0.00, 0.0, 1.0, // vertex 44
             0.85, 0.12, 0.0, 1.0, // vertex 45
             0.86, 0.02, 0.0, 1.0, // vertex 46
             0.86, 0.06, 0.0, 1.0); // vertex 47

  // The bottom right wing
  pos.push( -1.0, 0.0, 0.0, 1.0,   // vertex 1
            -0.97,-0.03, 0.0, 1.0, // vertex 2
            -0.97, 0.05, 0.0, 1.0, // vertex 3
            -0.95,-0.20, 0.0, 1.0, // vertex 4
            -0.95, 0.07, 0.0, 1.0, // vertex 5
            -0.90,-0.22, 0.0, 1.0, // vertex 6
            -0.90, 0.09, 0.0, 1.0, // vertex 7
            -0.80,-0.24, 0.0, 1.0, // vertex 8
            -0.80, 0.12, 0.0, 1.0, // vertex 9
            -0.70,-0.26, 0.0, 1.0, // vertex 10
            -0.70, 0.15, 0.0, 1.0, // vertex 11
            -0.60,-0.28, 0.0, 1.0, // vertex 12
            -0.60, 0.16, 0.0, 1.0, // vertex 13
            -0.50,-0.30, 0.0, 1.0, // vertex 14
            -0.50, 0.16, 0.0, 1.0, // vertex 15
            -0.40,-0.32, 0.0, 1.0, // vertex 16
            -0.40, 0.16, 0.0, 1.0, // vertex 17
            -0.30,-0.34, 0.0, 1.0, // vertex 18
            -0.30, 0.15, 0.0, 1.0, // vertex 19
            -0.20,-0.34, 0.0, 1.0, // vertex 20
            -0.20, 0.15, 0.0, 1.0, // vertex 21
            -0.10,-0.34, 0.0, 1.0, // vertex 22
            -0.10, 0.16, 0.0, 1.0, // vertex 23
             0.00,-0.34, 0.0, 1.0, // vertex 24
             0.00, 0.17, 0.0, 1.0, // vertex 25
             0.10,-0.34, 0.0, 1.0, // vertex 26
             0.10, 0.18, 0.0, 1.0, // vertex 27
             0.20,-0.34, 0.0, 1.0, // vertex 28
             0.20, 0.19, 0.0, 1.0, // vertex 29
             0.30,-0.32, 0.0, 1.0, // vertex 30
             0.30, 0.20, 0.0, 1.0, // vertex 31
             0.40,-0.28, 0.0, 1.0, // vertex 32
             0.40, 0.21, 0.0, 1.0, // vertex 33
             0.50,-0.24, 0.0, 1.0, // vertex 34
             0.50, 0.23, 0.0, 1.0, // vertex 35
             0.60,-0.20, 0.0, 1.0, // vertex 36
             0.60, 0.24, 0.0, 1.0, // vertex 37
             0.70,-0.17, 0.0, 1.0, // vertex 38
             0.70, 0.22, 0.0, 1.0, // vertex 39
             0.75,-0.14, 0.0, 1.0, // vertex 40
             0.75, 0.20, 0.0, 1.0, // vertex 41
             0.80,-0.11, 0.0, 1.0, // vertex 42
             0.80, 0.17, 0.0, 1.0, // vertex 43
             0.85,-0.08, 0.0, 1.0, // vertex 44
             0.85, 0.12, 0.0, 1.0, // vertex 45
             0.86, 0.02, 0.0, 1.0, // vertex 46
             0.86, 0.06, 0.0, 1.0); // vertex 47

   var pos_length = pos.length;
   for (var c = pos_length - 1; c >= wing_start * 4; c -= 4) {
     pos.push(pos[c - 3], pos[c - 2], pos[c - 1], pos[c]);
   }

   var pos_length2 = pos.length;
   for (var c = pos_length - 1; c >= wing_start*4; c -= 32) {
    colors.push(.05, .10, .55, 1);
    colors.push(0.5, 0.7, 1, 0);
    colors.push(0.5, 0.7, 1, 0);
    colors.push(.05, .40, .55, 1);
    colors.push(.05, .40, .55, 1);
    colors.push(0.5, 0.7, 1, 0);
    colors.push(0.5, 0.7, 1, 0);
    colors.push(.05, .10, .55, 1);
    colors.push(.05, .10, .55, 1);
    colors.push(.05, .40, .55, 1);
    colors.push(0.5, 0.7, 1, 0)
    colors.push(0.5, 0.7, 1, 0)
    colors.push(.05, .40, .55, 1);
    colors.push(0.5, 0.7, 1, 0)
    colors.push(0.5, 0.7, 1, 0)
    colors.push(.05, .10, .55, 1);

  }

   /* ABDOMEN */

   // Circle: {start: 188, len: (g_step * 2) + 2}
   pos.push(0, 0, 0, 1);
   colors.push(.03, .13, .29, 1);
   for (var theta = 0.0; theta < (2.0 * Math.PI) + (Math.PI/g_step); theta += Math.PI/g_step) {
     pos.push(Math.cos(theta), 0, Math.sin(theta), 1);
     colors.push(.03, .25, .68, 1);
     //colors.push(.4, .5, .6, 1);
   }

  // Brown Tube: {start: 206, len: (g_step * 4) + 2}
   for (var theta = 0.0; theta < (2.0 * Math.PI) + (Math.PI/g_step); theta += Math.PI/g_step) {
     pos.push(Math.cos(theta), 0, Math.sin(theta), 1);
     pos.push(Math.cos(theta), 1, Math.sin(theta), 1);
 
   }

   for (var theta = 0.0; theta < (2.0 * Math.PI) + (Math.PI/g_step); theta += Math.PI/g_step*4) {
		colors.push(.03, .13, .29, 1);
		colors.push(.03, .13, .29, 1);
     	colors.push(.05, .40, .55, 1);
     	colors.push(.05, .40, .55, 1);
		colors.push(.05, .23, .23, 1);
		colors.push(.05, .23, .23, 1);
		colors.push(.05, .23, .23, 1);
		colors.push(.03, .13, .29, 1);

	}
   // Cone Tip: {start: (g_step * 6) + 4, len: 1}
   pos.push(0, 1, 0, 1);
   colors.push(.03, .13, .29, 1);

   // Cone Circumfrence: {start: (g_step * 6) + 5, len: (g_step * 2) + 2}
   for (var theta = 0.0; theta < (2.0 * Math.PI) + (Math.PI/g_step); theta += Math.PI/g_step) {
     pos.push(Math.cos(theta), 0, Math.sin(theta), 1);
     colors.push(.03, .13, .29, 1);
   }

   // Head cube: {start: (g_step * 8) + 7, len: 9}
   pos.push( 0, 1, 1, 1,
             0, 0, 1, 1,
             1, 1, 1, 1,
             1, 0, 1, 1,
             1, 1, 0, 1,
             1, 0, 0, 1,
             0, 1, 0, 1,
             0, 0, 0, 1,
             0, 1, 1, 1,
             0, 0, 1, 1,
             0, 1, 1, 1,
             1, 1, 1, 1,
             0, 1, 0, 1,
             1, 1, 0, 1,
             1, 0, 0, 1,
             1, 0, 1, 1,
             0, 0, 0, 1,
             0, 0, 1, 1);
  for (var i = 0; i < 9; i++) {
     colors.push(.03, .13, .29, 1);
     colors.push(.05, .40, .55, 1);

  }

  var sphereVerts = makeSphere2(12, 21);
  for (var i = 0; i < sphereVerts.length; i += 7) {
    pos.push(sphereVerts[i], sphereVerts[i+1], sphereVerts[i+2], sphereVerts[i+3]);
    colors.push(139.0/255.0, 69.0/255.0, 19.0/255.0, 1);
  }

  appendPositions(pos);
  appendColors(colors);
}

/*
 * Main draw handler, sets up global matrix and calls other draw functions.
 */
function draw() {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  ModelMatrix.setTranslate(0, 0, 0);
  ModelMatrix.setScale(g_aspect, 1, 1);
  ModelMatrix.translate(tracker.global_x_pos, tracker.global_y_pos, tracker.global_z_pos);
  ModelMatrix.rotate(tracker.global_x_rot, 1, 0, 0);
  ModelMatrix.rotate(tracker.global_y_rot, 0, 1, 0);
  ModelMatrix.rotate(tracker.global_z_rot, 0, 0, 1);
  ModelMatrix.scale(tracker.global_x_scale, tracker.global_y_scale, tracker.global_z_scale);

  for (var i = 0; i < dragonfly_count; i++) {
    drawDragonfly(i);
  }

  for (var i = 0; i < cattail_count; i++) {
    drawCattail(g_cattails[i][0], g_cattails[i][1], g_cattails[i][2], g_cattails[i][3]);
  }
}

/*
 * Draws a cattail at a given position.
 *
 * A cattail is located at an arbitrary point in space, and will sway depending
 * on the wind speed.
 *
 * @param c_x    x position of cattail.
 * @param c_y    y position of cattail.
 * @param c_z    z position of cattail.
 * @param c_sway current angle of sway.
 */
function drawCattail(c_x, c_y, c_z, c_sway) {
    /* Group: Cattail */
    pushMatrix(ModelMatrix);
    ModelMatrix.translate(c_x, c_y, c_z);

    drawCattailHead(c_sway);
    drawStalk(c_sway);

    /* End Group: Cattail */
    ModelMatrix = popMatrix();
}

function drawCattailHead(c_sway) {
  // Group: Head
  pushMatrix(ModelMatrix);
  ModelMatrix.translate(0, -1, 0);
  ModelMatrix.rotate(-c_sway, 0, 0, 1);
  ModelMatrix.translate(0, 1.01, 0);
  ModelMatrix.rotate(-c_sway, 0, 0, 1);

  // Group: Tip
  pushMatrix(ModelMatrix);

  // Object: Tip
  ModelMatrix.translate(0, 0.36, 0);
  ModelMatrix.rotate(270, 1, 0, 0);
  ModelMatrix.scale(0.01, 0.01, 0.25); // w, d, h
  updateModelMatrix(ModelMatrix);
  gl.drawArrays(gl.TRIANGLE_FAN, (g_step * 6) + 4, (g_step * 2) + 2);
  ModelMatrix.rotate(180, 1, 0, 0);
  updateModelMatrix(ModelMatrix);
  gl.drawArrays(gl.TRIANGLE_FAN, (g_step * 6) + 5, (g_step * 2) + 2);

  // End Group: Tip
  ModelMatrix = popMatrix();

  // Object: Head
  pushMatrix(ModelMatrix);
  ModelMatrix.rotate(270, 1, 0, 0);
  ModelMatrix.scale(0.05, 0.05, 0.3);
  ModelMatrix.translate(0, 0, 0.05);
  updateModelMatrix(ModelMatrix);
  gl.drawArrays(gl.TRIANGLE_STRIP, (g_step * 2) + 2, (g_step * 4) + 2);
  ModelMatrix = popMatrix();

  pushMatrix(ModelMatrix);
  ModelMatrix.translate(0, 0.025, 0);
  ModelMatrix.scale(0.05, 0.05, 0.05);
  updateModelMatrix(ModelMatrix);
  gl.drawArrays(gl.TRIANGLE_STRIP, 380, 502);
  ModelMatrix = popMatrix();

  pushMatrix(ModelMatrix);
  ModelMatrix.translate(0, 0.3125, 0);
  ModelMatrix.scale(0.05, 0.05, 0.05);
  updateModelMatrix(ModelMatrix);
  gl.drawArrays(gl.TRIANGLE_STRIP, 380, 502);
  ModelMatrix = popMatrix();

  // End Group: Head
  ModelMatrix = popMatrix();
}

function drawStalk(c_sway) {
  // Group: Stalk
  pushMatrix(ModelMatrix);

  // Object: Stem
  var stalk_divisions = 12.0;
  var stalk_height = 1.0;
  ModelMatrix.translate(0, -1, 0);

  for (var i = 0; i < stalk_divisions; i++) {
    pushMatrix(ModelMatrix);
    ModelMatrix.rotate(270, 1, 0, 0);
    ModelMatrix.rotate(c_sway / stalk_divisions * i, 0, 1, 0);
    ModelMatrix.translate(0, 0, 0.99/stalk_divisions * i);
    ModelMatrix.rotate(c_sway / stalk_divisions * i, 0, 1, 0);
    ModelMatrix.scale(0.02, 0.02, stalk_height/stalk_divisions);
    updateModelMatrix(ModelMatrix);
    gl.drawArrays(gl.TRIANGLE_STRIP, (g_step * 8) + 6, (g_step * 4) + 2);
    ModelMatrix = popMatrix();
  }

  // TODO Object: Leaf? If we have time.

  // End Group: Stalk
  ModelMatrix = popMatrix();
}

function drawDragonfly(d) {
  // Chase the mouse around
  var dragonfly_x_move = ((g_dragonflies[d][0] * 15 + ((g_dragonflies[d][6] == 0 ? g_dragonflies[d][4] : g_mouse_x) * 2) - 2) / 16) - g_dragonflies[d][0];
  var dragonfly_y_move = ((g_dragonflies[d][1] * 15 + ((g_dragonflies[d][6] == 0 ? -g_dragonflies[d][5] : -g_mouse_y) * 2) + 1) / 16) - g_dragonflies[d][1];

  // console.log(g_dragonflies[d][4] + ', ' + g_dragonflies[d][5]);
  if ((Math.abs(dragonfly_x_move) < 0.005 && Math.abs(dragonfly_y_move) < 0.005)
    || (g_dragonflies[d][6] > 0 && Math.abs(dragonfly_x_move) < 0.05 && Math.abs(dragonfly_y_move) < 0.05)) {
      if (g_dragonflies[d][6] > 0) {
        g_dragonflies[d][6] -= 1;
      } else {
        g_dragonflies[d][4] = Math.random() * 0.8 / g_aspect;
        g_dragonflies[d][5] = Math.random() * 0.8;
      }
  }

  g_dragonflies[d][0] += dragonfly_x_move;
  g_dragonflies[d][1] += dragonfly_y_move;

  /* Group: Dragonfly */
  pushMatrix(ModelMatrix);
  ModelMatrix.translate(
    (g_dragonflies[d][0] + g_dragonflies[d][2]) * Math.cos(tracker.global_y_rot * Math.PI / 180),
    (g_dragonflies[d][1] + g_dragonflies[d][3]),
    (g_dragonflies[d][0] + g_dragonflies[d][2]) * Math.sin(tracker.global_y_rot * Math.PI / 180));
  ModelMatrix.scale(.1,.1,.1);
  ModelMatrix.rotate(-tracker.global_y_rot, 0, 1, 0);
  ModelMatrix.rotate(-tracker.global_z_rot, 0, 0, 1);
  ModelMatrix.rotate(180 * dragonfly_x_move * 10, 0, 1, 0);
  ModelMatrix.rotate(180 * dragonfly_y_move * -10, 1, 0, 0);
  ModelMatrix.rotate(90, 1, 0, 0);
  updateModelMatrix(ModelMatrix);

  drawAbdomen();
  drawWings();
  drawTail();

  /* End Group: Dragonfly */
  ModelMatrix = popMatrix();
}

function drawAbdomen() {
  // Group: Abdomen

  // Object: Body
  pushMatrix(ModelMatrix);
  ModelMatrix.scale(0.15, 1.1, 0.15);
  ModelMatrix.translate(0, -.05, 0);
  ModelMatrix.scale(1, .6, -1);
  updateModelMatrix(ModelMatrix);
  gl.drawArrays(gl.TRIANGLE_STRIP, wing_start+206, 34);
  ModelMatrix = popMatrix();

  // Object: Cone (near head)
  pushMatrix(ModelMatrix);
  ModelMatrix.translate(0,.6,0);
  ModelMatrix.scale(0.15,.15,0.15);
  updateModelMatrix(ModelMatrix);
  gl.drawArrays(gl.TRIANGLE_FAN, wing_start+240, 18);
  ModelMatrix = popMatrix();

  // Group: Head

  // Object: Square
  pushMatrix(ModelMatrix);
  ModelMatrix.scale(.15, .2, -.15);
  ModelMatrix.translate(-.5, 3.5, -.5);
  updateModelMatrix(ModelMatrix);
  gl.drawArrays(gl.TRIANGLE_STRIP, wing_start+258, 18);
  ModelMatrix = popMatrix();

  // Object: Left eye
  pushMatrix(ModelMatrix);
  ModelMatrix.rotate(270, 1, 0, 0);
  ModelMatrix.translate(0.064, 0.05, 0.8);
  ModelMatrix.scale(-0.08, 0.08, 0.08);
  updateModelMatrix(ModelMatrix);
  gl.drawArrays(gl.TRIANGLE_STRIP, 380, 502);
  ModelMatrix = popMatrix();

  // Object: Right eye
  pushMatrix(ModelMatrix);
  ModelMatrix.rotate(270, 1, 0, 0);
  ModelMatrix.translate(-0.064, 0.05, 0.8);
  ModelMatrix.scale(-0.08, 0.08, 0.08);
  updateModelMatrix(ModelMatrix);
  gl.drawArrays(gl.TRIANGLE_STRIP, 380, 502);
  ModelMatrix = popMatrix();

  // End Group: Head

  // Object: Cone (near tail)
  pushMatrix(ModelMatrix);
  ModelMatrix.rotate(180,0,0,1);
  ModelMatrix.scale(0.15,.3,0.15);
  ModelMatrix.translate(0,.1,0);
  updateModelMatrix(ModelMatrix);
  gl.drawArrays(gl.TRIANGLE_FAN, wing_start+240, 18);
  ModelMatrix = popMatrix();

  // End Group: Abdomen
}

function drawTail() {
  // Group: Tail

  pushMatrix(ModelMatrix);
  ModelMatrix.scale(0.05,.1,0.05);
  ModelMatrix.translate(0,-3,0);
  ModelMatrix.scale(1,1,-1);
  updateModelMatrix(ModelMatrix);

  // First cylinder of tail
  gl.drawArrays(gl.TRIANGLE_STRIP, wing_start+206, 34);

  // Rest of the cylinders on the tail
  for (var i = 0; i < 12; i++) {
    ModelMatrix.translate(0,-1,0);
    updateModelMatrix(ModelMatrix);
    gl.drawArrays(gl.TRIANGLE_STRIP, wing_start+206, 34);
  }

  // Cone on the tip of the tail
  ModelMatrix.scale(1,-.4,1);
  updateModelMatrix(ModelMatrix);
  gl.drawArrays(gl.TRIANGLE_FAN, wing_start+240,18);
  ModelMatrix = popMatrix();

  // End Group: Tail
}

function drawWings() {
  // Group: Wings

  // Object: Front and back of lower right wing
  pushMatrix(ModelMatrix);
  ModelMatrix.translate(-1.0,0,0);
  ModelMatrix.rotate(g_wing_angle,0,1,0);
  ModelMatrix.translate(Math.cos(g_wing_angle*Math.PI/180),0,Math.sin(g_wing_angle*Math.PI/180));
  ModelMatrix.translate(1.1,0,0);
  updateModelMatrix(ModelMatrix);
  gl.drawArrays(gl.TRIANGLE_STRIP, wing_start+47,47);
  gl.drawArrays(gl.TRIANGLE_STRIP, wing_start+94,47);
  ModelMatrix = popMatrix();

  // Object: Front and back of lower left wing
  pushMatrix(ModelMatrix);
  ModelMatrix.translate(-1,0,0);
  ModelMatrix.rotate(-g_wing_angle,0,1,0);
  ModelMatrix.translate(Math.cos(-g_wing_angle*Math.PI/180),0,Math.sin(-g_wing_angle*Math.PI/180));
  ModelMatrix.translate(-1.1,0,0);
  ModelMatrix.scale(-1,1,1);
  updateModelMatrix(ModelMatrix);
  gl.drawArrays(gl.TRIANGLE_STRIP, wing_start+47,47);
  gl.drawArrays(gl.TRIANGLE_STRIP, wing_start+94,47);
  ModelMatrix = popMatrix();

  // Object: Front and back of upper left wing
  pushMatrix(ModelMatrix);
  ModelMatrix.translate(-1,0,0);
  ModelMatrix.rotate(-g_wing_angle,0,1,0);
  ModelMatrix.translate(Math.cos(-g_wing_angle*Math.PI/180),0,Math.sin(-g_wing_angle*Math.PI/180));
  ModelMatrix.translate(1,.55,0);
  ModelMatrix.rotate(14,0,0,1);
  updateModelMatrix(ModelMatrix);
  gl.drawArrays(gl.TRIANGLE_STRIP, wing_start,47);
  gl.drawArrays(gl.TRIANGLE_STRIP, wing_start+141,47)
  ModelMatrix = popMatrix();

  // Object: Front and back of upper right wing
  pushMatrix(ModelMatrix);
  ModelMatrix.translate(-1,0,0);
  ModelMatrix.rotate(g_wing_angle,0,1,0);
  ModelMatrix.translate(Math.cos(g_wing_angle*Math.PI/180),0,Math.sin(g_wing_angle*Math.PI/180));
  ModelMatrix.translate(-1,.55,0);
  ModelMatrix.rotate(-14,0,0,1);
  ModelMatrix.scale(-1,1,1);
  updateModelMatrix(ModelMatrix);
  gl.drawArrays(gl.TRIANGLE_STRIP, wing_start,47);
  gl.drawArrays(gl.TRIANGLE_STRIP, wing_start+141,47);
  ModelMatrix = popMatrix();

  // End Group: Wings
}

function animate(angle) {
  var now = Date.now();
  var elapsed = now - g_last;
  g_last = now;
  var newAngle = angle + (g_angle_rate * elapsed) / 1000.0;
  if(newAngle > 180.0) newAngle = newAngle - 360.0;
  if(newAngle <-180.0) newAngle = newAngle + 360.0;
  return newAngle;
}

function animateWings(angle) {
  var now = Date.now();
  var elapsed = now - g_wing_angle_last;
  g_wing_angle_last = now;
  var newAngle = angle + (g_wing_angle_rate * elapsed * g_wing_dir) / 1000.0;
  if(newAngle > 30.0) {
    newAngle = 30;
    g_wing_dir = -g_wing_dir;
  }
  if(newAngle <-30.0) {
    newAngle = -30;
    g_wing_dir = -g_wing_dir;
  }
  return newAngle;
}

function sway(cattail) {
  var angle = g_cattails[cattail][3];
  var now = Date.now();
  var elapsed = now - g_cattails[cattail][4];
  g_cattails[cattail][4] = now;
  var newAngle = angle + (g_cattail_rate * elapsed * g_cattails[cattail][5]) / 1000.0;
  if (newAngle > g_cattail_max_sway) {
    newAngle =  g_cattail_max_sway;
    g_cattails[cattail][5] = -g_cattails[cattail][5];
  }
  if (newAngle < -g_cattail_max_sway / 3) {
    newAngle = -g_cattail_max_sway / 3;
    g_cattails[cattail][5] = -g_cattails[cattail][5];
  }
  g_cattails[cattail][3] = newAngle;
}

function randomize_sway() {
  for (var i = 0; i < cattail_count; i++) {
    // g_cattails[i][3] = Math.random() * g_cattail_max_sway;
    g_cattails[i][4] = Date.now();
    g_cattails[i][5] = Math.random() < 0.5 ? -1 : 1;
  }
}

function toggle_help() {
  help_visible = !help_visible;
  document.getElementById("help-menu-expanded").style.visibility = help_visible ? "visible" : "hidden";
  document.getElementById("help-menu").innerHTML = help_visible ? "Hide Help" : "Show Help";
}

/* Event Handlers */

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
        g_last = Date.now();
        for (var i = 0; i < g_cattails.length; i++) {g_cattails[i][4] = Date.now();}
			  tick();
		  }
			break;
    case "Slash":
      toggle_help();
      break;
    case "Period":
      gui_open = !gui_open;
      if (gui_open) gui.open(); else gui.close();
      break;
		case "KeyW":
    case "ArrowUp":
      tracker.global_y_pos -= 0.01;
			break;
		case "KeyA":
    case "ArrowLeft":
      tracker.global_x_pos += 0.01;
			break;
		case "KeyS":
    case "ArrowDown":
      tracker.global_y_pos += 0.01;
			break;
    case "KeyD":
    case "ArrowRight":
      tracker.global_x_pos -= 0.01;
			break;
    case "KeyR":
      tracker.reset();
      break;
    case "Equal":
    case "NumpadAdd":
      tracker.global_x_scale = Math.min(tracker.global_x_scale + .05, 2.5);
      tracker.global_y_scale = Math.min(tracker.global_y_scale + .05, 2.5);
      tracker.global_z_scale = Math.min(tracker.global_z_scale + .05, 2.5);
      break;
    case "Minus":
    case "NumpadSubtract":
      tracker.global_x_scale = Math.max(tracker.global_x_scale - 0.05, 0.05);
      tracker.global_y_scale = Math.max(tracker.global_y_scale - 0.05, 0.05);
      tracker.global_z_scale = Math.max(tracker.global_z_scale - 0.05, 0.05);
      break;
    case "Digit1":
      g_cattail_max_sway = 2;
      g_cattail_rate = 0.8;
      randomize_sway();
      break;
    case "Digit2":
      g_cattail_max_sway = 3;
      g_cattail_rate = 1.6;
      randomize_sway();
      break;
    case "Digit3":
      g_cattail_max_sway = 4;
      g_cattail_rate = 2.4;
      randomize_sway();
      break;
    case "Digit4":
      g_cattail_max_sway = 5;
      g_cattail_rate = 3.2;
      randomize_sway();
      break;
    case "Digit5":
      g_cattail_max_sway = 6;
      g_cattail_rate = 4.0;
      randomize_sway();
      break;
    case "Digit6":
      g_cattail_max_sway = 7;
      g_cattail_rate = 4.8;
      randomize_sway();
      break;
    case "Digit7":
      g_cattail_max_sway = 8;
      g_cattail_rate = 5.6;
      randomize_sway();
      break;
    case "Digit8":
      g_cattail_max_sway = 9;
      g_cattail_rate = 6.4;
      randomize_sway();
      break;
    case "Digit9":
      g_cattail_max_sway = 10;
      g_cattail_rate = 7.2;
      randomize_sway();
      break;
    case "Digit0":
      g_cattail_max_sway = 11;
      g_cattail_rate = 8.0;
      randomize_sway();
      break;
    default:
      console.log("Unused key: " + kev.code);
      break;
	}
}
