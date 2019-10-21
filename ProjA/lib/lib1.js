/*
The 'lib1.js' library helps us temporarily set aside the unfamiliar
intricacies of WebGL while we explore basic concepts of geometric drawing
using vertices.

To use this 'lib1.js' library,
  --Say 'thank you!" to NU undergrad student Vincent Bommier,
    (who wrote it over summer 2018 as a CS399 project). Keep this comment!
  --read what you find below -- you'll figure it out!

CHALLENGE:  can you re-write 'lib1.js' to use glMatrix.js and not cuon-matrix?
*/

var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
  'attribute vec4 a_Color;\n' +
  // 'attribute float a_PointSize;\n' +
  'uniform mat4 u_ModelMatrix;\n' +
  'varying vec4 v_Color;\n' +
  'void main() {\n' +
  '  gl_Position = u_ModelMatrix * a_Position;\n' +
  '  v_Color = a_Color;\n' +
  // '  gl_PointSize = a_PointSize;\n' +
  '}\n';

// Fragment shader program
var FSHADER_SOURCE =
  '#ifdef GL_ES\n' +
  'precision mediump float;\n' +
  '#endif\n' +
  'varying vec4 v_Color;\n' +
  'void main() {\n' +
  '  gl_FragColor = v_Color;\n' +
  '}\n';

//global variables
var gl;
var numVertices = 1024;
var positionDimensions = 4;
var colorDimensions = 4;
var pointSizeDimensions = 1;
var positions = new Float32Array(numVertices*positionDimensions);
var colors = new Float32Array(numVertices*colorDimensions);
var pointSizes = new Float32Array(numVertices*pointSizeDimensions);
for(var i = 0; i < numVertices; i++) pointSizes[i] = 10.0; //default point-size is 10
var FSIZE = positions.BYTES_PER_ELEMENT;
var ipos = icolors = ipointSizes = 0;
var modelMatrix = new Matrix4();
var u_ModelMatrix;

function init(){
  // Retrieve <canvas> element
  var canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  gl = getWebGLContext(canvas);
  if (!gl) {
    console.log("lib1.js: init() failed to get WebGL rendering context 'gl'\n");
    console.log("from the HTML-5 Canvas object named 'canvas'!\n\n");
    return;
  }

  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('lib1.js: init() failed to intialize shaders.');
    return;
  }

  bufferSetup(gl);

  // Set the background-clearing color and enable the depth test
  gl.clearColor(0.0, 0.0, 0.0, 1.0);  // black!
  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.CULL_FACE);   // draw the back side of triangles
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  // Clear the color buffer and the depth buffer

  // Get the storage location for the u_ModelMatrix uniform:
  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if (!u_ModelMatrix) {
    console.log('lib1.js: init failed to get the storage location of u_ModelMatrix');
    return;
  }
  return gl;
}

function bufferSetup(gl) {
// Create
  var vertexBuffer = gl.createBuffer();
  if (!vertexBuffer) {
    console.log('Failed to create the buffer object');
    return -1;
  }

  // Bind the buffer object to target
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  // Write date into the buffer object
  var VBO = CreateVBO();
  gl.bufferData(gl.ARRAY_BUFFER, VBO, gl.STATIC_DRAW);

  // Assign the buffer object to a_Position variable
  var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if(a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return -1;
  }

  // Assign the buffer object to a_Color variable
  var a_Color = gl.getAttribLocation(gl.program, 'a_Color');
  if(a_Color < 0) {
    console.log('Failed to get the storage location of a_Color');
    return -1;
  }

  // Assign the buffer object to a_PointSize variable
  // var a_PointSize = gl.getAttribLocation(gl.program, 'a_PointSize');
  // if(a_PointSize < 0) {
  //   console.log('Failed to get the storage location of a_PointSize');
  //   return -1;
  // }

  //The VBO is setup so that it looks like:
  //[x1,y1,z1,w1,...,x1024,y1024,z1024,w1024,
  // r1,g1,b1,a1,...,r1024,g1024,b1024,a1024,
  // sz1,sz2,...,sz1024]
  var offset = 0;

  gl.vertexAttribPointer(a_Position, positionDimensions, gl.FLOAT, false, FSIZE*positionDimensions, offset);//Specify the stride & offset
  gl.enableVertexAttribArray(a_Position); // Enable the assignment of the buffer object
  offset += FSIZE*numVertices*positionDimensions; //increase the offset so that it starts at the end of the position array

  gl.vertexAttribPointer(a_Color, colorDimensions, gl.FLOAT, false, FSIZE*colorDimensions,offset);
  gl.enableVertexAttribArray(a_Color);  // Enable the assignment of the buffer object
  offset += FSIZE*numVertices*colorDimensions;

  // gl.vertexAttribPointer(a_PointSize, pointSizeDimensions, gl.FLOAT, false, FSIZE*pointSizeDimensions,offset);
  // gl.enableVertexAttribArray(a_PointSize);  // Enable the assignment of the buffer object
}

function appendPositions(arr){
  positions = Float32Edit(positions,arr,ipos);
  ipos += arr.length;
  if(ipos > numVertices*positionDimensions){
    console.log('Warning! Appending more than ' + numVertices + ' positions to the VBO will overwrite existing data');
    console.log('Hint: look at changing numVertices in lib.js');
  }
  bufferSetup(gl);
}

function appendColors(arr){
  colors = Float32Edit(colors,arr,icolors);
  icolors += arr.length;
  if(icolors > numVertices*colorDimensions){
    console.log('Warning! Appending more than ' + numVertices + ' colors to the VBO will overwrite existing data');
    console.log('Hint: look at changing numVertices in lib.js');
  }
  bufferSetup(gl);
}

function appendPointSizes(arr){
  pointSizes = Float32Edit(pointSizes,arr,ipointSizes);
  ipointSizes += arr.length;
  if(ipointSizes > numVertices*pointSizeDimensions){
    console.log('Warning! Appending more than ' + numVertices + ' point-sizes to the VBO will overwrite existing data');
    console.log('Hint: look at changing numVertices in lib.js');
  }
  bufferSetup(gl);
}

//concatenate two Float32Arrays
function Float32Concat(first, second)
{
  var firstLength = first.length,
  result = new Float32Array(firstLength + second.length);

  result.set(first);
  result.set(second, firstLength);

  return result;
}

//overwrite the base float32Array with a smaller 'edit' float32array starting at some index
function Float32Edit(base,edit,startIdx){
  for(var i = 0; i < edit.length;i++){
    base[i+startIdx] = edit[i];
  }
  return base;
}

function updateModelMatrix(matrix){
  gl.uniformMatrix4fv(u_ModelMatrix, false, matrix.elements);
}

//Concatenate all attributes into a single array
function CreateVBO(){
  return Float32Concat(positions,Float32Concat(colors,pointSizes));
}

//Reset all attributes
function WipeVertices(){
  positions = new Float32Array(numVertices*positionDimensions);
  colors = new Float32Array(numVertices*colorDimensions);
  pointSizes = new Float32Array(numVertices*pointSizeDimensions);
  ipos = icolors = ipointSizes = 0;
  bufferSetup(gl);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
}
