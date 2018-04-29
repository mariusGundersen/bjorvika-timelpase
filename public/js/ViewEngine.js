import Texture from './Texture.js';
import Rectangle from './Rectangle.js';
import initShaderProgram from './initShaderProgram.js';
import { vs, fs } from './shader.js';

export default class ViewEngine{
  constructor(gl, width, height){
    this.gl = gl;
    this.width = width;
    this.height = height;
    this.shader = initShaderProgram(gl, vs, fs);
    this.buffers = new Rectangle(gl);
    this.texture = new Texture(gl);

    this.attribLocations = {
      vertexPosition: gl.getAttribLocation(this.shader, 'aVertexPosition'),
      textureCoord: gl.getAttribLocation(this.shader, 'aTextureCoord'),
    };

    this.uniformLocations = {
      uSampler: gl.getUniformLocation(this.shader, 'uSampler'),
      rotate: gl.getUniformLocation(this.shader, 'uRotate')

    };
  }

  render(rotate){
    this.gl.viewport(0, 0, this.width, this.height);
    this.gl.clearColor(0.0, 0.0, 0.0, 1.0);  // Clear to black, fully opaque
    this.gl.clearDepth(1.0);                 // Clear everything
    this.gl.enable(this.gl.DEPTH_TEST);      // Enable depth testing
    this.gl.depthFunc(this.gl.LEQUAL);       // Near things obscure far things

    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

    this.buffers.bind(this.attribLocations);

    this.gl.useProgram(this.shader);

    this.gl.uniform1i(this.uniformLocations.uSampler, this.texture.sampler2D(0));
    this.gl.uniform4f(this.uniformLocations.rotate, rotate.y, rotate.x, rotate.rot, 0);

    this.buffers.draw();
  }

  async load(url){
    return await this.texture.load(url);
  }
}