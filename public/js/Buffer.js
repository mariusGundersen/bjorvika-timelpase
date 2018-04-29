export default class Buffer {
  constructor(gl, data) {
    this.gl = gl;
    this.position = gl.createBuffer();
    this.textureCoord = gl.createBuffer();
    this.indices = gl.createBuffer();

    this.update(data);
  }

  update({positions, textureCoordinates, indices}){
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.position);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(positions), this.gl.STATIC_DRAW);

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.textureCoord);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(textureCoordinates), this.gl.STATIC_DRAW);

    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indices);
    this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), this.gl.STATIC_DRAW);

    this.count = indices.length;
  }

  bind({vertexPosition, textureCoord}){
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.position);
    this.gl.vertexAttribPointer(vertexPosition, 3, this.gl.FLOAT, false, 0, 0);
    this.gl.enableVertexAttribArray(vertexPosition);

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.textureCoord);
    this.gl.vertexAttribPointer(textureCoord, 2, this.gl.FLOAT, false, 0, 0);
    this.gl.enableVertexAttribArray(textureCoord);

    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indices);
  }

  draw(){
    this.gl.drawElements(this.gl.TRIANGLES, this.count, this.gl.UNSIGNED_SHORT, 0);
  }
}