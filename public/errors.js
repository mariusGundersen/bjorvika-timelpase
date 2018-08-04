import getGrayScale from './js/getGrayscale.js';

async function run(){
  const data = await fetch('/api/images/munch').then(r => r.json());

  //data.files.splice(10, data.files.length-10);

  const count = data.files.length;

  const canvas = document.querySelector('canvas');
  const context = canvas.getContext('2d');

  const average = new Float64Array(512*256);

  for (const file of data.files) {
    const src = file.image;
    const image = await loadImage(src);
    console.log('loaded', src);
    console.time('process '+src);
    canvas.width = 512;
    canvas.height = 256;
    context.drawImage(image, 0, 0, 512, 256);
    const data = context.getImageData(0, 0, canvas.width, canvas.height);
    const greyscaleImg = new Float64Array(512*256);
    for(let i=0; i<average.length; i++){
      const lum = getGrayScale(data.data, i);
      greyscaleImg[i] = lum;
      average[i] += lum/count;
    }

    file.greyscaleImg = greyscaleImg;
    console.timeEnd('process '+src);
  }

  console.log('rmse');

  for (const file of data.files) {
    let error = 0;
    for(let i=0; i<average.length; i++){
      error += (average[i] - file.greyscaleImg[i])**2;
    }
    file.rmse = Math.sqrt(error/average.length);
    console.log(file.image, file.rmse);
    await nextFrame();
  }

  canvas.width = 512;
  canvas.height = 256;
  const imgData = context.createImageData(canvas.width, canvas.height);
  for(let i=0; i<average.length; i++){
    imgData.data[i*4+0] = 255-Math.min(255, average[i]|0);
    imgData.data[i*4+1] = 0;//Math.min(255, average[i]|0);
    imgData.data[i*4+2] = 0;//Math.min(255, average[i]|0);
    imgData.data[i*4+3] = 255;
  }
  context.putImageData(imgData, 0, 0);
}

const loadImage = src => new Promise((res, rej) => {
  const img = new Image();
  img.onerror = rej;
  img.onload = () => res(img);
  img.src = src;
});

const nextFrame = () => new Promise(res => requestAnimationFrame(res));

run().catch(e => console.error(e));