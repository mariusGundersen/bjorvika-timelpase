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
    float samples[9];

    samples[0] = texture2D(sourceSampler, vTextureCoord + vec2(-1.0, -1.0)/size).r;
    samples[1] = texture2D(sourceSampler, vTextureCoord + vec2( 0.0, -1.0)/size).r;
    samples[2] = texture2D(sourceSampler, vTextureCoord + vec2(+1.0, -1.0)/size).r;
    samples[3] = texture2D(sourceSampler, vTextureCoord + vec2(-1.0,  0.0)/size).r;
    samples[4] = texture2D(sourceSampler, vTextureCoord + vec2( 0.0,  0.0)/size).r;
    samples[5] = texture2D(sourceSampler, vTextureCoord + vec2(+1.0,  0.0)/size).r;
    samples[6] = texture2D(sourceSampler, vTextureCoord + vec2(-1.0, +1.0)/size).r;
    samples[7] = texture2D(sourceSampler, vTextureCoord + vec2( 0.0, +1.0)/size).r;
    samples[8] = texture2D(sourceSampler, vTextureCoord + vec2(+1.0, +1.0)/size).r;


    float sumX = 0.0;
    sumX += samples[0]*1.0;
    sumX -= samples[2]*1.0;
    sumX += samples[3]*2.0;
    sumX -= samples[5]*2.0;
    sumX += samples[6]*1.0;
    sumX -= samples[8]*1.0;

    float sumY = 0.0;
    sumY += samples[0]*1.0;
    sumY += samples[1]*2.0;
    sumY += samples[2]*1.0;
    sumY -= samples[6]*1.0;
    sumY -= samples[7]*2.0;
    sumY -= samples[8]*1.0;

    float magnitude = length(vec2(sumX, sumY));
    float direction = segment((atan2(sumY, sumX)/PI + 1.0)/2.0)/3.0;

    gl_FragColor = vec4(magnitude, direction, 0.0, 1.0);
  }
`;

export default class EdgeDetectionEngine{
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