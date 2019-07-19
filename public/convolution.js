import ConvolutionEngine from './js/ConvolutionEngine.js';
import ViewEngine from './js/ViewEngine.js';
import { toBlob, toImg, upload } from './js/utils.js';
import RenderTexture from './js/RenderTexture.js';
import Texture from './js/Texture.js';
import Viewport from './js/Viewport.js';
import FlipEngine from './js/FlipEngine.js';
import GreyscaleEngine from './js/GreyscaleEngine.js';
import EdgeDetectionEngine from './js/EdgeDetectionEngine.js';
import EdgeThinningEngine from './js/EdgeThinningEngine.js';

const gaussianBlurKernel = [
  1/9, 1/9, 1/9,
  1/9, 1/9, 1/9,
  1/9, 1/9, 1/9
];

const edgeKernel = [
  -1, -1, -1,
  -1,  8, -1,
  -1, -1, -1
];

const thresholdKernel = [
  0, 1, 0,
  1, -1, 1,
  0, 1, 0
];

const canvas = document.querySelector('canvas');
const gl = canvas.getContext('webgl');
const source = new Texture(gl);
const greyscaleEngine = new GreyscaleEngine(gl);
const convolutionEngine = new ConvolutionEngine(gl);
const edgeDetectionEngine = new EdgeDetectionEngine(gl);
const edgeThinningEngine = new EdgeThinningEngine(gl);
const flipEngine = new FlipEngine(gl);

async function run(){
  await source.load('/images/munch/munch-2015-06-05.jpg');
  const temp1 = new RenderTexture(gl, source.width, source.height);
  const temp2 = new RenderTexture(gl, source.width, source.height);
  const viewport = new Viewport(gl, 4096, 1753);

  source
    .pipe(temp1.using(greyscaleEngine))
    .pipe(temp2.using(convolutionEngine), gaussianBlurKernel)
    .pipe(temp1.using(edgeDetectionEngine))
    .pipe(temp2.using(edgeThinningEngine))
    .pipe(viewport.using(flipEngine));
  //viewport.using(() => greyscaleEngine.render(source));
  //blured.using(() => gaussianBlur(greyscale));
  //viewport.using(() => edge(blured));
  //viewport.using(() => flipEngine.render(edges));
}

run();