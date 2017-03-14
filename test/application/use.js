
'use strict';

const eventToPromise = require('event-to-promise');
const request = require('../helpers/request');
const Koa = require('../..');

describe('app.use(fn)', () => {
  it('should compose middleware', async () => {
    const app = new Koa();
    const calls = [];

    app.use((ctx, next) => {
      calls.push(1);
      return next().then(() => {
        calls.push(6);
      });
    });

    app.use((ctx, next) => {
      calls.push(2);
      return next().then(() => {
        calls.push(5);
      });
    });

    app.use((ctx, next) => {
      calls.push(3);
      return next().then(() => {
        calls.push(4);
      });
    });

    const server = app.listen();

    const res = await request(server, '/');
    expect(res.status).toBe(404);
    expect(calls).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it('should compose mixed middleware', async () => {
    process.once('deprecation', () => {}); // silence deprecation message
    const app = new Koa();
    const calls = [];

    app.use((ctx, next) => {
      calls.push(1);
      return next().then(() => {
        calls.push(6);
      });
    });

    app.use(function * (next){
      calls.push(2);
      yield next;
      calls.push(5);
    });

    app.use((ctx, next) => {
      calls.push(3);
      return next().then(() => {
        calls.push(4);
      });
    });

    const server = app.listen();

    const res = await request(server, '/');
    expect(res.status).toBe(404);
    expect(calls).toEqual([1, 2, 3, 4, 5, 6]);
  });

  // https://github.com/koajs/koa/pull/530#issuecomment-148138051
  it('should catch thrown errors in non-async functions', async () => {
    const app = new Koa();

    app.use(ctx => ctx.throw('Not Found', 404));

    const res = await request(app, '/');
    expect(res.status).toBe(404);
  });

  it('should accept both generator and function middleware', async () => {
    process.once('deprecation', () => {}); // silence deprecation message
    const app = new Koa();

    app.use((ctx, next) => { return next(); });
    app.use(function * (next){ this.body = 'generator'; });

    const res = await request(app, '/');
    expect(res.status).toBe(200);
    expect(await res.text()).toBe('generator');
  });

  it('should throw error for non function', () => {
    const app = new Koa();

    [null, undefined, 0, false, 'not a function'].forEach(v => expect(() => app.use(v)).toThrow('middleware must be a function!'));
  });

  it('should output deprecation message for generator functions', () => {
    const warningPromise = eventToPromise(process, 'deprecation')
      .then(err => expect(err.message).toEqual(expect.stringContaining('generators will be removed')));
    const app = new Koa();
    app.use(function * (){});
    return warningPromise;
  });

  it('should throw error for non function', () => {
    const app = new Koa();

    expect(() => app.use('not a function')).toThrow('middleware must be a function!');
  });
});
