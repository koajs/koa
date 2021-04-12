const Koa = require('./lib/application')

const app = new Koa()

// response
app.use(ctx => {
  ctx.body = undefined;
});

app.listen(3000);