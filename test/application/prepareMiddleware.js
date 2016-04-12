
'use strict';

const request = require('supertest');
const assert = require('assert');
const compose = require('koa-compose');
const Koa = require('../..');

describe('app.prepareMiddleware(mw, useContext, userName)', () => {
  it('should prepare and wrap the middleware', () => {
    const app = new Koa();
    let newUseContext;
    let before = false;
    let after = false;
    app.wrappers.push((fn, shouldBeUseContext) => {
      assert.equal(shouldBeUseContext.app, app);
      return (ctx, next) => {
        before = true;
        return Promise.resolve().then(() => fn(ctx, next)).then(() => after = true);
      };
    });
    let useContext = {
      app: app,
      useChain: [],
      currMiddleware: 'oldMiddleware'
    };
    let mw = ctx => ctx.body = 'body';
    mw.onUsed = ctx => newUseContext = ctx;
    let newMw = app.prepareMiddleware(mw, useContext);
    assert.equal(newUseContext.app, app);
    assert.equal(newUseContext.useChain[0], 'oldMiddleware');
    assert.equal(newUseContext.currMiddleware, mw);
    assert(newUseContext.prepareMiddleware);
    let ctx = {};
    let ret = newMw(ctx, () => {}).then(() => {
      assert.equal(ctx.body, 'body');
      assert(after);
    });
    assert(before);
    return ret;
  });

  it('should work in an actual server', done => {
    const app = new Koa();
    let useContext;

    let mw = ctx => ctx.body = 'body';
    mw.onUsed = context => useContext = context;

    app.use(mw);

    const server = app.listen();

    request(server)
      .get('/')
      .expect('body')
      .expect(200)
      .end(err => {
        if (err) return done(err);
        assert(useContext);
        assert.equal(useContext.app, app);
        assert.equal(useContext.useChain[0]._name, 'koa');
        done();
      });
  });

  it('should work support nested middleware', done => {
    const app = new Koa();
    let useContext;

    let mw = ctx => ctx.body = 'body';
    mw.onUsed = context => useContext = context;

    app.use(compose([mw]));

    const server = app.listen();

    request(server)
      .get('/')
      .expect('body')
      .expect(200)
      .end(err => {
        if (err) return done(err);
        assert(useContext);
        assert.equal(useContext.app, app);
        assert.equal(useContext.useChain[0]._name, 'koa');
        done();
      });
  });
});
