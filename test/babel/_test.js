'use strict';

const AssertRequest = require('assert-request');
const Koa = require('../..');

describe('require("babel-core/register")', () => {
  describe('app.use(fn)', () => {
    it('should compose middleware w/ async functions', () => {
      const app = new Koa();
      const calls = [];

      app.use(async (ctx, next) => {
        calls.push(1);
        await next();
        calls.push(6);
      });

      app.use(async (ctx, next) => {
        calls.push(2);
        await next();
        calls.push(5);
      });

      app.use(async (ctx, next) => {
        calls.push(3);
        await next();
        calls.push(4);
      });

      const request = AssertRequest(app);

      return request('/')
        .status(404)
        .assert(() => calls.should.eql([1, 2, 3, 4, 5, 6]));
    });
  });
});
