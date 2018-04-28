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
    rotate: gl.getUniformLocation(shaderProgram, 'uRotate')
  },
};

// Here's where we call the routine that builds all the
// objects we'll be drawing.
const buffers = initBuffers(gl);

const texture = loadTexture(gl, '/raw/library-2015-04-02.jpg');

let x = 0;
let y = 0;
let rot = 0;

// Draw the scene repeatedly
function render(now) {
  drawScene(gl, programInfo, buffers, texture, {x, y, rot});

  requestAnimationFrame(render);
}

render();