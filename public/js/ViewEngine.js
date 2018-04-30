import Texture from './Texture.js';
import Rectangle from './Rectangle.js';
import initShaderProgram from './initShaderProgram.js';

export const vs = `
  attribute vec4 aVertexPosition;
  attribute vec2 aTextureCoord;

  varying highp vec2 vTextureCoord;

  void main(void) {
    gl_Position = aVertexPosition * vec4(1.0, -1.0, 1.0, 1.0);
    vTextureCoord = aTextureCoord;
  }
`;

export const fs = `
  precision highp float;

  varying highp vec2 vTextureCoord;

  uniform sampler2D uSourceSampler;
  uniform sampler2D uDistortSampler;
  uniform vec4 uRotate;

  const float PI = 3.141592653589793;
  const vec2 toRad = vec2(2.0 * PI, PI);
  const vec2 center = vec2(0.5, 0.5);

  vec3 PRotateX(vec3 p, float theta) {
    return vec3(
      p.x,
      p.y * cos(theta) + p.z * sin(theta),
      -p.y * sin(theta) + p.z * cos(theta)
    );
  }

  vec3 PRotateY(vec3 p, float theta) {
    return vec3(
      p.x * cos(theta) - p.z * sin(theta),
      p.y,
      p.x * sin(theta) + p.z * cos(theta)
    );
  }

  vec3 PRotateZ(vec3 p, float theta) {
    return vec3(
      p.x * cos(theta) + p.y * sin(theta),
      -p.x * sin(theta) + p.y * cos(theta),
      p.z
    );
  }

  float atan2(float y, float x) {
    if (x > 0.0) {
      return atan(y/x);
    } else if (x < 0.0 && y >= 0.0) {
      return atan(y/x) + PI;
    } else if (x < 0.0 && y < 0.0) {
      return atan(y/x) - PI;
    } else if (x == 0.0 && y > 0.0) {
      return PI/2.0;
    } else if (x == 0.0 && y < 0.0) {
      return -PI/2.0;
    }
  }

  void main(void) {
    vec2 latLong = (vTextureCoord - center) * toRad;

    vec3 ray = vec3(
      cos(latLong.y) * sin(latLong.x),
      sin(latLong.y),
      cos(latLong.y) * cos(latLong.x)
    );

    ray = PRotateX(ray, uRotate.x * 2.0*PI);
    ray = PRotateY(ray, uRotate.y * 2.0*PI);
    ray = PRotateZ(ray, uRotate.z * 2.0*PI);

    vec2 thetaPhi = vec2(
      atan2(ray.x, ray.z),
      asin(ray.y)
    );

    vec2 coord = thetaPhi/toRad + center;
    vec4 distort = texture2D(uDistortSampler, coord)/16.0;
    gl_FragColor = texture2D(uSourceSampler, coord + distort.rg - distort.ba);
  }
`;

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
      uSourceSampler: gl.getUniformLocation(this.shader, 'uSourceSampler'),
      uDistortSampler: gl.getUniformLocation(this.shader, 'uDistortSampler'),
      uRotate: gl.getUniformLocation(this.shader, 'uRotate')
    };
  }

  render(rotate, texture){
    this.gl.viewport(0, 0, this.width, this.height);
    this.gl.clearColor(0.0, 0.0, 0.0, 1.0);  // Clear to black, fully opaque
    this.gl.clearDepth(1.0);                 // Clear everything
    this.gl.enable(this.gl.DEPTH_TEST);      // Enable depth testing
    this.gl.depthFunc(this.gl.LEQUAL);       // Near things obscure far things

    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

    this.buffers.bind(this.attribLocations);

    this.gl.useProgram(this.shader);

    this.gl.uniform1i(this.uniformLocations.uSourceSampler, this.texture.sampler2D(0));
    this.gl.uniform1i(this.uniformLocations.uDistortSampler, texture.sampler2D(1));
    this.gl.uniform4f(this.uniformLocations.uRotate, rotate.y, rotate.x, rotate.rot, 0);

    this.buffers.draw();
  }

  async load(url){
    return await this.texture.load(url);
  }
}