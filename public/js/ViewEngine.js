import Texture from './Texture.js';
import initRectangle from './initRectangle.js';
import initShaderProgram from './initShaderProgram.js';
import drawScene from './drawScene.js';
import { vs, fs } from './shader.js';

export default class ViewEngine{
  constructor(gl){
    this.gl = gl;
    const shaderProgram = initShaderProgram(gl, vs, fs);

    this.programInfo = {
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

    this.buffers = initRectangle(gl);
    this.texture = new Texture(gl);
  }

  render(transform){
    drawScene(this.gl, this.programInfo, this.buffers, this.texture, transform);
  }

  async load(url){
    return await this.texture.load(url);
  }
}