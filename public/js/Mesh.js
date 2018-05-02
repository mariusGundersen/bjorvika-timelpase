import Buffer from "./Buffer.js";
import Delaunator from './Delaunator.js';

export default class Mesh extends Buffer{
  constructor(gl, points=[]){
    super(gl, toVBO(points));
  }

  updatePoints(points){
    console.log(points);
    super.update(toVBO(points));
  }
}

function toVBO(points){
  points = [
    {x:-1, y:-1, dx:0, dy:0},
    {x:0,  y:-1, dx:0, dy:0},
    {x:1,  y:-1, dx:0, dy:0},
    {x:1,  y:0, dx:0, dy:0},
    {x:1,  y:1,  dx:0, dy:0},
    {x:0,  y:1,  dx:0, dy:0},
    {x:-1, y:1,  dx:0, dy:0},
    {x:-1, y:0,  dx:0, dy:0},
    {x:0,  y:0,  dx:0, dy:0},
    ...points
  ];
  const positions = points.map(p => [p.x, p.y, 1.0]).reduce(flatten);
  const textureCoordinates = points.map(p => [p.dx/256, p.dy/256]).reduce(flatten);
  const indices = Delaunator.from(points, p => p.x, p => p.y).triangles;
  return {
    positions,
    textureCoordinates,
    indices
  };
}

function flatten(list=[], value=[]){
  return list.concat(value);
}