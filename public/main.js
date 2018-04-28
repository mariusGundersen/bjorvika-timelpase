import initBuffers from './js/initBuffers.js';
import Texture from './js/Texture.js';
import initShaderProgram from './js/initShaderProgram.js';
import drawScene from './js/drawScene.js';
import { vs, fs } from './js/shader.js';

async function run(){
  const img = document.querySelector('img');
  const canvas = document.querySelector('canvas');
  const pre = document.querySelector('pre');
  const button = document.querySelector('button');

  const gl = canvas.getContext('webgl');

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
  const texture = new Texture(gl);

  let index = 0;
  const data = await fetch('/api/library.json').then(r => r.json());

  async function next(){
    if(index > 0){
      await fetch('/api/position', {
        method: 'POST',
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          index,
          image: data.files[index],
          transform
        })
      });
    }
    index++;
    if(index < data.files.length){
      img.src = data.files[index-1];
      await texture.load(data.files[index]);
      render();
    }
  }

  const transform = {
    x: 0,
    y: 0,
    rot: 0
  };


  next();
  render();

  // Draw the scene repeatedly
  function render(now) {
    const width = window.innerWidth;
    canvas.style.width = width+'px';
    canvas.style.height = width/2+'px';
    img.style.width = width+'px';
    img.style.height = width/2+'px';
    drawScene(gl, programInfo, buffers, texture, {x: transform.x/width, y: transform.y/width*2, rot: transform.rot/width*2});
    pre.textContent = JSON.stringify(transform, null, 2);
  }

  let mouse = {
    x:0,
    y:0,
    down:false
  };

  canvas.addEventListener('mousedown', e => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    mouse.down = true;
  }, false);

  canvas.addEventListener('mousemove', e => {
    if(mouse.down){
      const alt = e.altKey ? 1 : 10
      const shift = e.shiftKey;
      if(shift){
        transform.rot += (e.clientY - mouse.y)/alt;
      }else{
        transform.x += (e.clientX - mouse.x)/alt;
        transform.y -= (e.clientY - mouse.y)/alt;
      }
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      render();
    }
  }, false);

  canvas.addEventListener('mouseup', e => {
    mouse.down = false;
  }, false);

  button.addEventListener('click', e => next());
}

run();