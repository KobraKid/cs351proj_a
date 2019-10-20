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
var g_angle = 0;
var g_angleRate = 45;
var ModelMatrix;
var g_last = Date.now();
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

  /*Order of push: 
    1. Top right wing (front/z+): 0-46
    2. Bottom right wing (front/z+): 47-93
    3. Bottom right wing (back/z-): 94-140
    4. Top right wing (back/z-): 141-187
    5. Abdomen (circle of cylinder): 188-205
    6. Abdomen (tube of cylinder): 206-239 
    7. Abdomen (tip of cone): 240-240
    8. Abdomen (circumference of cone): 241- 258 */

  //The top right wing
  var pos =  [-1.0, 0.0, 0.0, 1.0, // vertex 1
              -0.97,-0.076, 0.0, 1.0, // vertex 2
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
               0.75, -.06, 0.0, 1.0, // vertex 40
               0.75, 0.20, 0.0, 1.0, // vertex 41
               0.80,-0.03, 0.0, 1.0, // vertex 42
               0.80, 0.17, 0.0, 1.0, // vertex 43
               0.85, 0.00, 0.0, 1.0, // vertex 44 
               0.85, 0.12, 0.0, 1.0, // vertex 45
               0.86, 0.02, 0.0, 1.0, // vertex 46
               0.86, 0.06, 0.0, 1.0]; // vertex 47

  //The bottom right wing
  pos.push( -1.0, 0.0, 0.0, 1.0, // vertex 1
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

for (var c = pos_length-1; c >= 0; c -= 4) {
  pos.push(pos[c-3],pos[c-2],pos[c-1],pos[c]);
} 

var colors = [];
for (var i = 0; i < pos.length; i++) {
  colors.push((i%4==3)?1:Math.random());
}

/* ABDOMEN */
//Circle: {start: 188, len: (g_step * 2) + 2}
var g_step = 8;
pos.push(0, 0, 0, 1);
colors.push(139.0/255.0, 69.0/255.0, 19.0/255.0, 1);
for (var theta = 0.0; theta < (2.0 * Math.PI) + (Math.PI/g_step); theta += Math.PI/g_step) {
  pos.push(Math.cos(theta), 0, Math.sin(theta), 1);
  colors.push(139.0/255.0, 69.0/255.0, 19.0/255.0, 1);
}

// Brown Tube: {start: 206, len: (g_step * 4) + 2}
  for (var theta = 0.0; theta < (2.0 * Math.PI) + (Math.PI/g_step); theta += Math.PI/g_step) {
    pos.push(Math.cos(theta), 0, Math.sin(theta), 1);
    pos.push(Math.cos(theta), 1, Math.sin(theta), 1);
    colors.push(139.0/255.0, 69.0/255.0, 19.0/255.0, 1);
    colors.push(139.0/255.0, 69.0/255.0, 19.0/255.0, 1);
  }

// Cone Tip: {start: (g_step * 6) + 4, len: 1}
pos.push(0, 1, 0, 1);
colors.push(13.0/255.0, 173.0/255.0, 10.0/255.0, 1);

// Cone Circumfrence: {start: (g_step * 6) + 5, len: (g_step * 2) + 2}
for (var theta = 0.0; theta < (2.0 * Math.PI) + (Math.PI/g_step); theta += Math.PI/g_step) {
  pos.push(Math.cos(theta), 0, Math.sin(theta), 1);
  colors.push(13.0/255.0, 173.0/255.0, 10.0/255.0, 1);
}


appendPositions(pos);
appendColors(colors);

}

function draw() {  
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  //Set's all elements to their initial position
  ModelMatrix.setTranslate(0,0,0);
  ModelMatrix.rotate(g_angle,1,1,1); //this is for viewing purposes. Delete later.
  ModelMatrix.scale(.5,.5,.5); 
  updateModelMatrix(ModelMatrix);

  /*Draws Abdomen*/
  //Cylinder
  pushMatrix(ModelMatrix);
  ModelMatrix.scale(0.15,1.1,0.15);
  ModelMatrix.translate(0,-.05,0);
  ModelMatrix.scale(1,.6,-1);
  updateModelMatrix(ModelMatrix);
  gl.drawArrays(gl.TRIANGLE_STRIP,206, 34);
  ModelMatrix = popMatrix();

  //Cone (near head)
  pushMatrix(ModelMatrix);
  ModelMatrix.translate(0,.6,0);
  ModelMatrix.scale(0.15,.15,0.15);
  updateModelMatrix(ModelMatrix);
  gl.drawArrays(gl.TRIANGLE_FAN,240,19); //Cone (near head)
  ModelMatrix = popMatrix();

  //cone (near tail)
  pushMatrix(ModelMatrix);
  ModelMatrix.rotate(180,0,0,1);
  ModelMatrix.scale(0.15,.3,0.15);
  ModelMatrix.translate(0,.1,0);
  updateModelMatrix(ModelMatrix);
  gl.drawArrays(gl.TRIANGLE_FAN,240,19); //Cone (near tail)
  ModelMatrix = popMatrix();


  //bottom left and bottom right wings
  pushMatrix(ModelMatrix);
  //draw the front and back of lower right wings
  ModelMatrix.translate(1.1,0,0);
  updateModelMatrix(ModelMatrix);
  gl.drawArrays(gl.TRIANGLE_STRIP,47,47); 
  ModelMatrix.translate(-.2,0,0);
  updateModelMatrix(ModelMatrix);
  gl.drawArrays(gl.TRIANGLE_STRIP,94,47);

  //draw the front and back of lower left wing
  ModelMatrix.translate(-2,0,0);
  ModelMatrix.scale(-1,1,1);
  updateModelMatrix(ModelMatrix);
  gl.drawArrays(gl.TRIANGLE_STRIP,47,47); 
  gl.drawArrays(gl.TRIANGLE_STRIP,94,47);

  ModelMatrix = popMatrix();

  //top left adnd top right wings
  pushMatrix(ModelMatrix);

  //translates upper right wing and rotates so in correct position
  ModelMatrix.translate(1,.55,0);
  ModelMatrix.rotate(14,0,0,1);
  updateModelMatrix(ModelMatrix);

  //draw the front and back of upper right wing
  gl.drawArrays(gl.TRIANGLE_STRIP,0,47); 
  gl.drawArrays(gl.TRIANGLE_STRIP,141,47) 


  //draw the front and back of upper left wing
  ModelMatrix.rotate(-14,0,0,1);
  ModelMatrix.translate(-2,0,0);
  ModelMatrix.rotate(-14,0,0,1);
  ModelMatrix.scale(-1,1,1);
  updateModelMatrix(ModelMatrix);
  gl.drawArrays(gl.TRIANGLE_STRIP,0,47); 
  gl.drawArrays(gl.TRIANGLE_STRIP,141,47); 

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

function myMouseDown(ev) {}

function myMouseMove(ev) {}

function myMouseUp(ev) {}

function myKeyDown(kev) {}