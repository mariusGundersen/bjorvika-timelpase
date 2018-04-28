import initBuffers from './js/initBuffers.js';
import loadTexture from './js/loadTexture.js';
import initShaderProgram from './js/initShaderProgram.js';
import drawScene from './js/drawScene.js';
import { vs, fs } from './js/shader.js';

const img = document.querySelector('img');
const canvas = document.querySelector('canvas');
const gl = canvas.getContext('webgl');

img.src='/raw/library-2015-04-02.jpg';

const shaderProgram = initShaderProgram(gl, vs, fs);

const programInfo = {
  program: shaderProgram,
  attribLocations: {
    vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
    textureCoord: gl.getAttribLocation(shaderProgram, 'aTextureCoord'),
  },
  uniformLocations: {
    uSampler: gl.getUniformLocation(shaderProgram, 'uSampler'),
  },
};

// Here's where we call the routine that builds all the
// objects we'll be drawing.
const buffers = initBuffers(gl);

const texture = loadTexture(gl, '/raw/library-2015-04-02.jpg');

var then = 0;

// Draw the scene repeatedly
function render(now) {
  now *= 0.001;  // convert to seconds
  const deltaTime = now - then;
  then = now;

  drawScene(gl, programInfo, buffers, texture, deltaTime);

  requestAnimationFrame(render);
}

render();