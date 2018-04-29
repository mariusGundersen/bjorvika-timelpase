export default function drawScene(gl, programInfo, buffers, texture, rotate) {
  gl.viewport(0, 0, 4096, 2048);
  gl.clearColor(0.0, 0.0, 0.0, 1.0);  // Clear to black, fully opaque
  gl.clearDepth(1.0);                 // Clear everything
  gl.enable(gl.DEPTH_TEST);           // Enable depth testing
  gl.depthFunc(gl.LEQUAL);            // Near things obscure far things

  // Clear the canvas before we start drawing on it.

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  buffers.bind(programInfo.attribLocations.vertexPosition, programInfo.attribLocations.textureCoord);

  gl.useProgram(programInfo.program);

  gl.uniform1i(programInfo.uniformLocations.uSampler, texture.sampler2D(0));
  gl.uniform4f(programInfo.uniformLocations.rotate, rotate.y, rotate.x, rotate.rot, 0);

  buffers.draw();
}