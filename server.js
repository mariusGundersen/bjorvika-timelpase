const Koa = require('koa');
const serve = require('koa-static');
const Router = require('koa-router');
const koaBody = require('koa-body');
const fs = require('fs');

const router = new Router();

router.get('/api/images/:name', async ctx => {
  const path = `images/${ctx.params.name}`;
  const files = await new Promise((res, rej) => fs.readdir(`public/${path}`, (err, files) => err ? rej(err) : res(files)));

  ctx.body = {
    files: await Promise.all(files
      .filter(f => /\.jpg/.test(f))
      .map(async f => ({
        ...await readJson(`public/${path}/${f.replace('.jpg', '.json')}`)
          .catch(e => {}),
        image: `/${path}/${f}`,
      })))
  };
});

router.post('/api/position', async ctx => {
  const body = ctx.request.body;
  console.log(body);
  const file = body.image.replace('.jpg', '.json');
  await writeJson(`public/${file}`, body);
  ctx.status = 200;
});

router.post('/api/upload', async ctx => {
  console.log(ctx.request.body);
  const file = ctx.request.body.files.file;
  const reader = fs.createReadStream(file.path);
  const stream = fs.createWriteStream(`.${file.name}`);
  reader.pipe(stream);
  console.log('uploading %s -> %s', file.name, stream.path);
  ctx.status = 200;
});

const app = new Koa();
app.use(koaBody({ multipart: true }));
app.use(serve('public'));
app.use(router.routes());

app.listen(8080);

function readJson(path){
  return new Promise((res, rej) => fs.readFile(path, 'utf8', (err, done) => err ? rej(err) : res(JSON.parse(done))));
}

function writeJson(path, content){
  return new Promise((res, rej) => fs.writeFile(path, JSON.stringify(content, null, 2), (err, done) => err ? rej(err) : res(done)));
}