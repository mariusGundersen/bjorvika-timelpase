import Texture from './Texture.js';
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
  constructor(gl, width, height){
    this.gl = gl;
    this.width = width;
    this.height = height;
    this.shader = initShaderProgram(gl, vs, fs);
    this.buffers = new Rectangle(gl);
    this.texture = new Texture(gl);
  }

  render(kernel){
    this.gl.viewport(0, 0, this.width, this.height);
    this.gl.clearColor(0.0, 0.0, 0.0, 1.0);  // Clear to black, fully opaque
    this.gl.clearDepth(1.0);                 // Clear everything
    this.gl.enable(this.gl.DEPTH_TEST);      // Enable depth testing
    this.gl.depthFunc(this.gl.LEQUAL);       // Near things obscure far things

    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

    this.buffers.bind(
      this.shader.attributes.vertexPosition,
      this.shader.attributes.textureCoord
    );

    this.shader.bind();

    this.shader.uniforms.sourceSampler = this.texture.sampler2D(0);
    this.shader.uniforms.kernel = kernel;
    this.shader.uniforms.size = [this.width, this.height];

    this.buffers.draw();
  }

  async load(url){
    return await this.texture.load(url);
  }
}