import ViewEngine from './js/ViewEngine.js';
import { toBlob, toImg, upload } from './js/utils.js';

async function run(){
  const img = document.querySelector('img');
  const canvas = document.querySelector('canvas');
  const pointsElm = document.querySelector('.points');
  const pre = document.querySelector('pre');
  const nextButton = document.querySelector('.next');
  const prevButton = document.querySelector('.prev');
  const addPointButton = document.querySelector('.add-point');

  const gl = canvas.getContext('webgl');
  const viewEngine = new ViewEngine(gl, 4096, 2048);

  const data = await fetch('/api/images/munch').then(r => r.json());
  let index = data.files.length - 1;
  img.src = data.files[index].image;

  function render() {
    const width = window.innerWidth;
    canvas.style.width = width+'px';
    canvas.style.height = width/2+'px';
    img.style.width = width+'px';
    img.style.height = width/2+'px';
    viewEngine.render(state.transform);
    pre.textContent = JSON.stringify(state, null, 2);
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
    await toImg(blob, img);
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
    ponits: []
  };


  await loadState(data, index);
  render();

  let uiState = 'ROTATE';
  let mouse = {
    x:0,
    y:0,
    down:false
  };

  canvas.addEventListener('mousedown', e => {
    mouse.x = e.offsetX;
    mouse.y = e.offsetY;
    mouse.down = true;
    if(uiState === 'ROTATE'){
    }else if(uiState === 'ADD-POINT'){
      const point = document.createElement('div');
      point.className = 'point';
      point.style.transform = `translate(${mouse.x}px, ${mouse.y}px)`;
      pointsElm.appendChild(point);
    }
  }, false);

  canvas.addEventListener('mousemove', e => {
    if(mouse.down){
      if(uiState === 'ROTATE'){
        const alt = e.altKey ? 1 : 10
        const shift = e.shiftKey;
        const width = window.innerWidth;
        if(shift){
          state.transform.rot += (e.offsetY - mouse.y)/alt/width*2;
        }else{
          state.transform.x += (e.offsetX - mouse.x)/alt/width;
          state.transform.y -= (e.offsetY - mouse.y)/alt/width*2;
        }
        mouse.x = e.offsetX;
        mouse.y = e.offsetY;
        render();
      }
    }
  }, false);

  canvas.addEventListener('mouseup', e => {
    mouse.down = false;
    if(uiState === 'ROTATE'){
    } else if(uiState === 'ADD-POINT'){
      uiState = 'ROTATE';
    }
  }, false);

  function addPoint(){
    uiState = 'ADD-POINT';
  }

  nextButton.addEventListener('click', next);
  prevButton.addEventListener('click', prev);
  addPointButton.addEventListener('click', addPoint);
}

run();
