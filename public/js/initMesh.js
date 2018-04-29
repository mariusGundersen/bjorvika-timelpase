import initBuffers from "./initBuffers.js";

export default function initRectangle(gl){
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

  return initBuffers(gl, {
    positions,
    textureCoordinates,
    indices
  });
}