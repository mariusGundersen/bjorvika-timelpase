import ViewEngine from './js/ViewEngine.js';
import DistortEngine from './js/DistortEngine.js';
import { toBlob, toImg, upload } from './js/utils.js';
import RenderTexture from './js/RenderTexture.js';

async function run(){
  const img = document.querySelector('img');
  const canvas = document.querySelector('canvas');
  const viewElm = document.querySelector('.view');
  const pointsElm = document.querySelector('.points');
  const pre = document.querySelector('pre');
  const nextButton = document.querySelector('.next');
  const prevButton = document.querySelector('.prev');
  const statusElm = document.querySelector('.status');
  const addPointButton = document.querySelector('.add-point');
  const visibility = document.querySelector('.visibility');

  const gl = canvas.getContext('webgl');
  const distortEngine = new DistortEngine(gl, 4096, 2048);
  const viewEngine = new ViewEngine(gl, 4096, 2048);

  img.src = '/images/munch/average_red.png';
  const data = await fetch('/api/images/munch').then(r => r.json());
  let index = 0;
  //img.src = data.files[index].image;

  function render() {
    renderUi();
    distortEngine.setPoints(state.points.map(toPoint));
    distortEngine.render();
    viewEngine.render(state.transform, distortEngine.texture);
  }

  function renderUi(){
    const width = window.innerWidth;
    const height = width/2;
    viewElm.style.width = width+'px';
    viewElm.style.height = height+'px';

    // Hurray for DOM thrashing!
    pointsElm.innerHTML = template`
      ${state.points.map(renderPoint(width, height))}
    `;

    statusElm.innerHTML = `${index}/${data.files.length}`;
  }

  function renderPoint(width, height){
    return point => template`<line x1="${point.x*width}" y1="${point.y*height}" x2="${(point.x+point.dx)*width}" y2="${(point.y+point.dy)*height}" stroke-width="2" stroke="red" />`
  }

  async function saveState(state, canvas, img){
    await fetch('/api/position', {
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify(state)
    });

    render();
    const blob = await toBlob(canvas);
    await upload(blob, state.image);
    //await toImg(blob, img);
  }

  async function loadState(data, index){
    const current = data.files[index];
    await viewEngine.load(current.image);
    state.index = index;
    state.image = current.image;
    if(current.transform){
      state.transform = current.transform;
    }
    if(current.points){
      state.points = current.points;
    }else{
      state.points = [];
    }
  }

  async function prev(){
    await saveState(state, canvas, img);
    index--;
    if(index >= 0){
      await loadState(data, index);
      render();
    }
  }
  async function next(){
    await saveState(state, canvas, img);
    index++;
    if(index < data.files.length){
      await loadState(data, index);
      render();
    }
  }

  const state = {
    transform: {
      x: 0,
      y: 0,
      rot: 0
    },
    points: []
  };


  await loadState(data, index);
  render();

  let uiState = 'ROTATE';
  let mouse = {
    x:0,
    y:0,
    down:false,
    selectedPoint:null
  };

  viewElm.addEventListener('mousedown', e => {
    mouse.x = e.offsetX;
    mouse.y = e.offsetY;
    mouse.down = true;
    if(uiState === 'ROTATE'){
    }else if(uiState === 'ADD-POINT'){
      const width = window.innerWidth;
      const height = width/2;
      const point = {
        x: mouse.x/width,
        y: mouse.y/height,
        dx: 0,
        dy: 0,
      };
      state.points.push(point);
      mouse.selectedPoint = point;
      render();
    }
  }, false);

  viewElm.addEventListener('mousemove', e => {
    if(mouse.down){
      if(uiState === 'ROTATE'){
        const alt = e.altKey ? 1 : 10
        const shift = e.shiftKey;
        const width = window.innerWidth;
        const height = width/2;
        if(shift){
          state.transform.rot += (e.offsetY - mouse.y)/alt/height;
        }else{
          state.transform.x += (e.offsetX - mouse.x)/alt/width;
          state.transform.y -= (e.offsetY - mouse.y)/alt/height;
        }
        mouse.x = e.offsetX;
        mouse.y = e.offsetY;
        render();
      }else if(uiState === 'ADD-POINT'){
        const width = window.innerWidth;
        const height = width/2;
        const point = mouse.selectedPoint;
        point.dx = e.offsetX/width - point.x;
        point.dy = e.offsetY/height - point.y;
        render();
      }
    }
  }, false);

  viewElm.addEventListener('mouseup', e => {
    mouse.down = false;
    if(uiState === 'ROTATE'){
    } else if(uiState === 'ADD-POINT'){
      swapUiState();
      mouse.selectedPoint = null;
      render();
    }
  }, false);

  function swapUiState(){
    if(uiState === 'ROTATE'){
      uiState = 'ADD-POINT';
      viewElm.dataset.state = 'ADD-POINT';
    }else{
      uiState = 'ROTATE';
      viewElm.dataset.state = 'ROTATE';
    }
  }

  nextButton.addEventListener('click', next);
  prevButton.addEventListener('click', prev);
  addPointButton.addEventListener('click', swapUiState);
  visibility.addEventListener('input', e => canvas.style.opacity = visibility.value/100);
}

run();

function toPoint(d){
  return {
    x: d.x,
    y: d.y,
    dx: d.dx,
    dy: d.dy
  };
}

const template = (strings, ...data) => String.raw(strings, ...data.map(d => Array.isArray(d) ? d.join('') : d));