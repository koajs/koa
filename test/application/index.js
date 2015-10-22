
'use strict';

const request = require('supertest');
const assert = require('assert');
const Koa = require('../..');

describe('app', function(){
  it('should handle socket errors', function(done){
    const app = new Koa();

    app.use(function *(ctx, next){
      // triggers ctx.socket.writable == false
      ctx.socket.emit('error', new Error('boom'));
    });

    app.on('error', function(err){
      err.message.should.equal('boom');
      done();
    });

    request(app.listen())
    .get('/')
    .end(function(){});
  });

  it('should not .writeHead when !socket.writable', function(done){
    const app = new Koa();

    app.use(function *(ctx, next){
      // set .writable to false
      ctx.socket.writable = false;
      ctx.status = 204;
      // throw if .writeHead or .end is called
      ctx.res.writeHead =
      ctx.res.end = function(){
        throw new Error('response sent');
      };
    });

    // hackish, but the response should occur in a single tick
    setImmediate(done);

    request(app.listen())
    .get('/')
    .end(function(){});
  });

  it('should set development env when NODE_ENV missing', function(){
    const NODE_ENV = process.env.NODE_ENV;
    process.env.NODE_ENV = '';
    const app = new Koa();
    process.env.NODE_ENV = NODE_ENV;
    assert.equal(app.env, 'development');
  });
});
