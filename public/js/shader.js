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
  varying highp vec2 vTextureCoord;

  uniform sampler2D uSampler;

  void main(void) {
    //gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
    gl_FragColor = texture2D(uSampler, vTextureCoord);
  }
`;
