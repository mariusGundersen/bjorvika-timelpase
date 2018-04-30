import Buffer from "./Buffer.js";

export default class Mesh extends Buffer{
  constructor(gl, cols, rows){
    const positions = [];
    const textureCoordinates = [];
    const indices = [];

    let p=0;
    let t=0;
    let i=0;
    let j=0;
    for(let y=0; y<rows; y++){
      for(let x=0; x<cols; x++){
        positions[p++] = x/(cols-1)*2-1;
        positions[p++] = y/(rows-1)*2-1;
        positions[p++] = 1.0;
        textureCoordinates[t++] = 0;
        textureCoordinates[t++] = 0;
        if(y !== rows-1){
          if(x === cols-1){
            j++;
          }else{
            indices[i++] = j+0;
            indices[i++] = j+1;
            indices[i++] = j+cols;
            indices[i++] = j+1;
            indices[i++] = j+1+cols;
            indices[i++] = j+cols;
            j++;
          }
        }
      }
    }

    super(gl, {
      positions,
      textureCoordinates,
      indices
    });
  }
}