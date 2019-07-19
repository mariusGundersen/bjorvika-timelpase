import Rectangle from './Rectangle.js';
import initShaderProgram from './initShaderProgram.js';

export const vs = `
  attribute vec4 vertexPosition;
  attribute vec2 textureCoord;

  varying highp vec2 vTextureCoord;

  void main(void) {
    gl_Position = vertexPosition;
    vTextureCoord = textureCoord;
  }
`;

export const fs = `
  precision highp float;

  varying highp vec2 vTextureCoord;

  uniform sampler2D sourceSampler;
  uniform float kernel[9];
  uniform vec2 size;

  void main(void) {

    vec4 sum = vec4(0.0);

    sum += kernel[0]*texture2D(sourceSampler, vTextureCoord + vec2(-1.0, -1.0)/size);
    sum += kernel[1]*texture2D(sourceSampler, vTextureCoord + vec2( 0.0, -1.0)/size);
    sum += kernel[2]*texture2D(sourceSampler, vTextureCoord + vec2(+1.0, -1.0)/size);
    sum += kernel[3]*texture2D(sourceSampler, vTextureCoord + vec2(-1.0,  0.0)/size);
    sum += kernel[4]*texture2D(sourceSampler, vTextureCoord + vec2( 0.0,  0.0)/size);
    sum += kernel[5]*texture2D(sourceSampler, vTextureCoord + vec2(+1.0,  0.0)/size);
    sum += kernel[6]*texture2D(sourceSampler, vTextureCoord + vec2(-1.0, +1.0)/size);
    sum += kernel[7]*texture2D(sourceSampler, vTextureCoord + vec2( 0.0, +1.0)/size);
    sum += kernel[8]*texture2D(sourceSampler, vTextureCoord + vec2(+1.0, +1.0)/size);

    gl_FragColor = vec4(sum.rgb, 1.0);
  }
`;

export default class ConvolutionEngine{
  constructor(gl){
    this.gl = gl;
    this.shader = initShaderProgram(gl, vs, fs);
    this.buffers = new Rectangle(gl);
  }

  render(source, kernel){
    this.buffers.bind(
      this.shader.attributes.vertexPosition,
      this.shader.attributes.textureCoord
    );

    this.shader.bind();

    this.shader.uniforms.sourceSampler = source.sampler2D(0);
    this.shader.uniforms.kernel = kernel;
    this.shader.uniforms.size = [source.width, source.height];

    this.buffers.draw();
  }
}