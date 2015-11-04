'use strict';

const request = require('supertest');
const Koa = require('../..');

describe('require("babel-core/register")', () => {
  describe('app.use(fn)', () => {
    it('should compose middleware w/ async functions', done => {
      const app = new Koa();
      const calls = [];

      app.use(async function (ctx, next){
        calls.push(1);
        await next();
        calls.push(6);
      });

      app.use(async function (ctx, next){
        calls.push(2);
        await next();
        calls.push(5);
      });

      app.use(async function (ctx, next){
        calls.push(3);
        await next();
        calls.push(4);
      });

      const server = app.listen();

      request(server)
        .get('/')
        .expect(404)
        .end(err => {
          if (err) return done(err);
          calls.should.eql([1, 2, 3, 4, 5, 6]);
          done();
        });
    });
  });
});
