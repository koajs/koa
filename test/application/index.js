
'use strict';

const request = require('supertest');
const assert = require('assert');
const koa = require('../..');

describe('app', function(){
  it('should handle socket errors', function(done){
    const app = koa();

    app.use(function *(next){
      // triggers this.socket.writable == false
      this.socket.emit('error', new Error('boom'));
    });

    app.on('error', function(err){
      err.message.should.equal('boom');
      done();
    });

    request(app.listen())
    .get('/')
    .end(function(){});
  })

  it('should not .writeHead when !socket.writable', function(done){
    const app = koa();

    app.use(function *(next){
      // set .writable to false
      this.socket.writable = false;
      this.status = 204;
      // throw if .writeHead or .end is called
      this.res.writeHead =
      this.res.end = function(){
        throw new Error('response sent');
      };
    })

    // hackish, but the response should occur in a single tick
    setImmediate(done);

    request(app.listen())
    .get('/')
    .end(function(){});
  })

  it('should set development env when NODE_ENV missing', function(){
    const NODE_ENV = process.env.NODE_ENV;
    process.env.NODE_ENV = '';
    const app = koa();
    process.env.NODE_ENV = NODE_ENV;
    assert.equal(app.env, 'development');
  })
})
