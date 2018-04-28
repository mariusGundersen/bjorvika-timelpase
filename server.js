const Koa = require('koa');
const serve = require('koa-static');
const Router = require('koa-router');
const bodyparser = require('koa-bodyparser');
const fs = require('fs');

const router = new Router();

router.get('/api/library.json', async ctx => {
  const files = await new Promise((res, rej) => fs.readdir('public/images/library', (err, files) => err ? rej(err) : res(files)));

  ctx.body = {
    files: files
      .filter(f => /\.jpg/.test(f))
      .map(f => `/images/library/${f}`)
  };
});

router.post('/api/position', async ctx => {
  const body = ctx.request.body;
  console.log(body);
  const file = body.image.replace('.jpg', '.json');
  await new Promise((res, rej) => fs.writeFile(`public/${file}`, JSON.stringify(body), (err, done) => err ? rej(err) : res(done)));
  ctx.status = 200;
})

const app = new Koa();
app.use(bodyparser());
app.use(serve('public'));
app.use(router.routes());

app.listen(8080);