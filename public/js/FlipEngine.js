import Rectangle from './Rectangle.js';
import initShaderProgram from './initShaderProgram.js';

export const vs = `
  attribute vec4 vertexPosition;
  attribute vec2 textureCoord;

  varying highp vec2 vTextureCoord;

  void main(void) {
    gl_Position = vertexPosition * vec4(1.0, -1.0, 1.0, 1.0);
    vTextureCoord = textureCoord;
  }
`;

export const fs = `
  precision highp float;

  varying highp vec2 vTextureCoord;

  uniform sampler2D sourceSampler;

  void main(void) {
    gl_FragColor = texture2D(sourceSampler, vTextureCoord);
  }
`;

export default class FlipEngine{
  constructor(gl){
    this.gl = gl;
    this.shader = initShaderProgram(gl, vs, fs);
    this.buffers = new Rectangle(gl);
  }

  render(source){
    this.buffers.bind(
      this.shader.attributes.vertexPosition,
      this.shader.attributes.textureCoord
    );

    this.shader.bind();

    this.shader.uniforms.sourceSampler = source.sampler2D(0);


    this.buffers.draw();
  }
}