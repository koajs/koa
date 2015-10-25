
'use strict';

const request = require('supertest');
const should = require('should');
const Koa = require('../..');

describe('app.use(fn)', function(){
  it('should compose middleware', function(done){
    const app = new Koa();
    const calls = [];

    app.use(function *(ctx, next){
      calls.push(1);
      yield next();
      calls.push(6);
    });

    app.use(function *(ctx, next){
      calls.push(2);
      yield next();
      calls.push(5);
    });

    app.use(function *(ctx, next){
      calls.push(3);
      yield next();
      calls.push(4);
    });

    const server = app.listen();

    request(server)
    .get('/')
    .expect(404)
    .end(function(err){
      if (err) return done(err);
      calls.should.eql([1, 2, 3, 4, 5, 6]);
      done();
    });
  });

  // https://github.com/koajs/koa/pull/530#issuecomment-148138051
  it('should catch thrown errors in non-async functions', function(done){
    const app = new Koa();

    app.use(ctx => {
      ctx.throw('Not Found', 404);
    });

    request(app.listen())
    .get('/')
    .expect(404)
    .end(done);
  });

  it('should throw error for non function', function(done){
    const app = new Koa();

    should(function(){ app.use('not a function'); }).throw('middleware must be a function!');
    done();
  });
});
