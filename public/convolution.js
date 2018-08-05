import ConvolutionEngine from './js/ConvolutionEngine.js';
import ViewEngine from './js/ViewEngine.js';
import { toBlob, toImg, upload } from './js/utils.js';
import RenderTexture from './js/RenderTexture.js';

const canvas = document.querySelector('canvas');
const gl = canvas.getContext('webgl');
const blurEngine = new ConvolutionEngine(gl, 4096, 2048);
const edgeEngine = new ConvolutionEngine(gl, 4096, 2048);
const output = new RenderTexture(gl, 4096, 2048);
edgeEngine.texture = output;

async function run(){
  await blurEngine.load('/images/munch/munch-2018-04-27.jpg');
  output.using(gaussianBlur);
  edgeEngine.render([
    -1, -1, -1,
    -1,  8, -1,
    -1, -1, -1]);

}

async function gaussianBlur(){
  const s = 1/16;
  blurEngine.render([
    1*s, 2*s, 1*s,
    2*s, 4*s, 2*s,
    1*s, 2*s, 1*s]);
}

run();