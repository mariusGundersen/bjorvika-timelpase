import Texture from './Texture.js';
import Mesh from './Mesh.js';
import initShaderProgram from './initShaderProgram.js';
export const vs = `
  attribute vec4 aVertexPosition;
  attribute vec2 aDistortVector;

  varying highp vec2 vDistortVector;

  void main(void) {
    gl_Position = aVertexPosition * vec4(1.0, -1.0, 1.0, 1.0);
    vDistortVector = aDistortVector;
  }
`;

export const fs = `
  precision highp float;

  varying highp vec2 vDistortVector;

  void main(void) {
    gl_FragColor = vec4(vDistortVector.xy, -vDistortVector.xy);
  }
`;

export default class DistortEngine{
  constructor(gl, width, height){
    this.gl = gl;
    this.width = width;
    this.height = height;
    this.shader = initShaderProgram(gl, vs, fs);
    this.buffers = new Mesh(gl, 36, 18);

    this.attribLocations = {
      vertexPosition: gl.getAttribLocation(this.shader, 'aVertexPosition'),
      textureCoord: gl.getAttribLocation(this.shader, 'aDistortVector'),
    };

    this.uniformLocations = {
    };
  }

  render(target){
    if(target) target.bindFramebuffer();
    this.gl.viewport(0, 0, this.width, this.height);
    this.gl.clearColor(0.0, 0.0, 0.0, 1.0);  // Clear to black, fully opaque
    this.gl.clearDepth(1.0);                 // Clear everything
    this.gl.enable(this.gl.DEPTH_TEST);      // Enable depth testing
    this.gl.depthFunc(this.gl.LEQUAL);       // Near things obscure far things

    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

    this.buffers.bind(this.attribLocations);

    this.gl.useProgram(this.shader);

    this.buffers.draw();
    if(target) target.unbindFramebuffer();
  }
}