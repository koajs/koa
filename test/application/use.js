
'use strict';

const request = require('supertest');
const wrap = require('co').wrap;
const Koa = require('../..');

describe('app.use(fn)', function(){
  it('should compose middleware', function(done){
    const app = new Koa();
    const calls = [];

    app.use(function (ctx, next){
      calls.push(1);
      return next().then(function () {
        calls.push(8);
      });
    });

    app.use(wrap(function *(ctx, next){
      calls.push(2);
      yield next();
      calls.push(7);
    }));

    app.use(function (ctx, next){
      calls.push(3);
      return next().then(function () {
        calls.push(6);
      });
    });

    app.use(wrap(function *(ctx, next){
      calls.push(4);
      yield next();
      calls.push(5);
    }));

    const server = app.listen();

    request(server)
    .get('/')
    .expect(404)
    .end(function(err){
      if (err) return done(err);
      calls.should.eql([1, 2, 3, 4, 5, 6, 7, 8]);
      done();
    });
  });

  it('should support legacy generator middleware', function(done){
    const app = new Koa();
    const calls = [];

    app.use(function (ctx, next){
      calls.push(1);
      return next().then(function () {
        calls.push(8);
      });
    });

    // back compatible
    app.use(function *(next){
      calls.push(2);
      yield next;
      calls.push(7);
    });

    app.use(wrap(function *(ctx, next){
      calls.push(3);
      yield next();
      calls.push(6);
    }));

    // back compatible
    app.use(function *(next){
      calls.push(4);
      yield *next;
      calls.push(5);
    });

    const server = app.listen();

    request(server)
    .get('/')
    .expect(404)
    .end(function(err){
      if (err) return done(err);
      calls.should.eql([1, 2, 3, 4, 5, 6, 7, 8]);
      done();
    });
  });
});
