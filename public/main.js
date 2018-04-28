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
          image: data.files[index].image,
          transform
        })
      });

      render();
      await toImg(canvas, img);
    }else{
      img.src = data.files[0].image;
    }
    index++;
    if(index < data.files.length){
      const current = data.files[index];
      await texture.load(current.image);
      if(current.transform){
        transform.x = current.transform.x;
        transform.y = current.transform.y;
        transform.rot = current.transform.rot;
      }
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
  function render() {
    const width = window.innerWidth;
    canvas.style.width = width+'px';
    canvas.style.height = width/2+'px';
    img.style.width = width+'px';
    img.style.height = width/2+'px';
    drawScene(gl, programInfo, buffers, texture, {x: transform.x, y: transform.y, rot: transform.rot});
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
      const width = window.innerWidth;
      if(shift){
        transform.rot += (e.clientY - mouse.y)/alt/width*2;
      }else{
        transform.x += (e.clientX - mouse.x)/alt/width;
        transform.y -= (e.clientY - mouse.y)/alt/width*2;
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

function toImg(canvas, img) {
  return new Promise(res => canvas.toBlob(blob => {
    const url = URL.createObjectURL(blob);

    img.onload = function() {
      // no longer need to read the blob so it's revoked
      //URL.revokeObjectURL(url);
      res();
    };

    img.src = url;
  }));
}