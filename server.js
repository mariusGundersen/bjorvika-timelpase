const Koa = require('koa');
const serve = require('koa-static');
const Router = require('koa-router');
const bodyparser = require('koa-bodyparser');
const fs = require('fs');

const router = new Router();

router.get('/api/library.json', async ctx => {
  const files = await new Promise((res, rej) => fs.readdir('public/images/library', (err, files) => err ? rej(err) : res(files)));

  ctx.body = {
    files: await Promise.all(files
      .filter(f => /\.jpg/.test(f))
      .map(async f => ({
        image: `/images/library/${f}`,
        transform: await readJson(`public/images/library/${f.replace('.jpg', '.json')}`)
          .then(d => d.transform)
          .catch(e => null)
      })))
  };
});

router.post('/api/position', async ctx => {
  const body = ctx.request.body;
  console.log(body);
  const file = body.image.replace('.jpg', '.json');
  await writeJson(`public/${file}`, body);
  ctx.status = 200;
})

const app = new Koa();
app.use(bodyparser());
app.use(serve('public'));
app.use(router.routes());

app.listen(8080);

function readJson(path){
  return new Promise((res, rej) => fs.readFile(path, 'utf8', (err, done) => err ? rej(err) : res(JSON.parse(done))));
}

function writeJson(path, content){
  return new Promise((res, rej) => fs.writeFile(path, JSON.stringify(content, null, 2), (err, done) => err ? rej(err) : res(done)));
}