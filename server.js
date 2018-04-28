const Koa = require('koa');
const serve = require('koa-static');
const Router = require('koa-router');
const fs = require('fs');

const router = new Router();

router.get('/api/library.json', async ctx => {
  fs.readdir('public/raw', (err, files) => {
    ctx.body = {
      files: files.map(f => `/raw/${f}`)
    };
  })
});

const app = new Koa();

app.use(serve('public'));
app.use(router.routes());

app.listen(8080);