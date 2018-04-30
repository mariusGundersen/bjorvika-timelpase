import Buffer from "./Buffer.js";

export default class Rectangle extends Buffer{
  constructor(gl){
    const positions = [
      -1.0, -1.0,  1.0,
       1.0, -1.0,  1.0,
       1.0,  1.0,  1.0,
      -1.0,  1.0,  1.0
    ];

    const textureCoordinates = [
      0.0,  0.0,
      1.0,  0.0,
      1.0,  1.0,
      0.0,  1.0
    ];

    const indices = [
      0,  1,  2,
      0,  2,  3
    ];

    super(gl, {
      positions,
      textureCoordinates,
      indices
    });
  }
}