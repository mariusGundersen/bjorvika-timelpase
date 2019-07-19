export default class Viewport {
  constructor(gl, width, height){
    this.gl = gl;
    this.width = width;
    this.height = height;
  }

  using(engine){
    return (...params) => {
      this.gl.viewport(0, 0, this.width, this.height);
      this.gl.clearColor(0.0, 0.0, 0.0, 1.0);  // Clear to black, fully opaque
      this.gl.clearDepth(1.0);                 // Clear everything
      this.gl.enable(this.gl.DEPTH_TEST);      // Enable depth testing
      this.gl.depthFunc(this.gl.LEQUAL);       // Near things obscure far things

      this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
      engine.render(...params);
    }
  }
}