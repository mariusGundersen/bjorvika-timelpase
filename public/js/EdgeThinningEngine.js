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

  const float PI = 3.141592653589793;

  varying highp vec2 vTextureCoord;

  uniform sampler2D sourceSampler;
  uniform vec2 size;

  float atan2(float y, float x) {
    if (x == 0.0 && y > 0.0) {
      return PI/2.0;
    } else if (x == 0.0 && y < 0.0) {
      return -PI/2.0;
    } else {
      return atan(y, x);
    }
  }

  float segment(float turn){
    float segment = floor(turn*8.0 + 0.5);
    if(segment >= 8.0){
      segment -= 8.0;
    }else if(segment >= 4.0){
      segment -= 4.0;
    }

    return segment;
  }

  void main(void) {

    vec4 center = texture2D(sourceSampler, vTextureCoord);
    float samples[4];

    if(center.g < 1.0/6.0) {
      samples[0] = texture2D(sourceSampler, vTextureCoord + vec2(-1.0, 0.0)/size).r;
      samples[1] = texture2D(sourceSampler, vTextureCoord + vec2( 1.0, 0.0)/size).r;
      samples[2] = texture2D(sourceSampler, vTextureCoord + vec2(0.0, -1.0)/size).r;
      samples[3] = texture2D(sourceSampler, vTextureCoord + vec2(0.0,  1.0)/size).r;
    } else if(center.g < 3.0/6.0) {
      samples[0] = texture2D(sourceSampler, vTextureCoord + vec2(-1.0, -1.0)/size).r;
      samples[1] = texture2D(sourceSampler, vTextureCoord + vec2( 1.0,  1.0)/size).r;
      samples[2] = texture2D(sourceSampler, vTextureCoord + vec2( 1.0, -1.0)/size).r;
      samples[3] = texture2D(sourceSampler, vTextureCoord + vec2(-1.0,  1.0)/size).r;
    } else if(center.g < 5.0/6.0) {
      samples[0] = texture2D(sourceSampler, vTextureCoord + vec2(0.0, -1.0)/size).r;
      samples[1] = texture2D(sourceSampler, vTextureCoord + vec2(0.0,  1.0)/size).r;
      samples[2] = texture2D(sourceSampler, vTextureCoord + vec2(-1.0, 0.0)/size).r;
      samples[3] = texture2D(sourceSampler, vTextureCoord + vec2( 1.0, 0.0)/size).r;
    } else {
      samples[0] = texture2D(sourceSampler, vTextureCoord + vec2( 1.0, -1.0)/size).r;
      samples[1] = texture2D(sourceSampler, vTextureCoord + vec2(-1.0,  1.0)/size).r;
      samples[2] = texture2D(sourceSampler, vTextureCoord + vec2(-1.0, -1.0)/size).r;
      samples[3] = texture2D(sourceSampler, vTextureCoord + vec2( 1.0,  1.0)/size).r;
    }

    if(center.r > 0.3
    && center.r > samples[0]
    && center.r > samples[1]) {
      gl_FragColor = center;
    } else {
      gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
    }
  }
`;

export default class EdgeThinningEngine{
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
    this.shader.uniforms.size = [source.width, source.height];

    this.buffers.draw();
  }
}