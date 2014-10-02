
var response = require('../context').response;
var request = require('supertest');
var assert = require('assert');
var koa = require('../..');

describe('res.status=', function(){
  describe('when a status code', function(){
    describe('and valid', function(){
      it('should set the status', function(){
        var res = response();
        res.status = 403;
        res.status.should.equal(403);
      })

      it('should not throw', function(){
        assert.doesNotThrow(function() { 
          response().status = 403;
        });
      })
    })

    describe('and invalid', function(){
      it('should throw', function(){
        assert.throws(function() { 
          response().status = 999;
        }, 'invalid status code: 999');
      })
    })
  })

  describe('when a status string', function(){
    it('should throw', function(){
      assert.throws(function() { 
        response().status = 'forbidden';
      }, 'status code must be a number');
    })
  })

  function strip(status) {
    it('should strip content related header fields', function(done){
      var app = koa();

      app.use(function *(){
        this.body = { foo: 'bar' };
        this.set('Content-Type', 'application/json; charset=utf-8');
        this.set('Content-Length', '15');
        this.set('Transfer-Encoding', 'chunked');
        this.status = status;
        assert(null == this.response.header['content-type']);
        assert(null == this.response.header['content-length']);
        assert(null == this.response.header['transfer-encoding']);
      });

      request(app.listen())
        .get('/')
        .expect(status)
        .end(function(err, res) {
          res.should.not.have.header('content-type');
          res.should.not.have.header('content-length');
          res.should.not.have.header('content-encoding');
          res.text.should.have.length(0);
          done(err);
        });
    })

    it('should strip content releated header fields after status set', function(done) {
      var app = koa();

      app.use(function *(){
        this.status = status;
        this.body = { foo: 'bar' };
        this.set('Content-Type', 'application/json; charset=utf-8');
        this.set('Content-Length', '15');
        this.set('Transfer-Encoding', 'chunked');
      });

      request(app.listen())
        .get('/')
        .expect(status)
        .end(function(err, res) {
          res.should.not.have.header('content-type');
          res.should.not.have.header('content-length');
          res.should.not.have.header('content-encoding');
          res.text.should.have.length(0);
          done(err);
        });
    })
  }

  function custom(code, msg) {
    var status = require('statuses');

    describe('call this.setStatus', function() {
      it('should get custom status with given message', function(done) {
        var app = koa();

        app.use(function *() {
          this.setStatus(code, msg);
        });
        request(app.listen())
          .get('/')
          .expect(code)
          .expect(msg)
          .end(function(err, res) {
            res.res.statusMessage.should.eql(msg);
            done(err);
          });
      });      
      it('should only get RFC status without message', function(done) {
        var app = koa();
        var expect = status[code] ? code : 500;

        app.use(function *() {
          this.setStatus(code);
        });
        request(app.listen())
          .get('/')
          .expect(expect, done);
      });
    });
  }

  describe('when 204', function(){
    strip(204);
  })

  describe('when 205', function(){
    strip(205);
  })

  describe('when 304', function(){
    strip(304);
  })

  describe('when 440', function() {
    custom(440, 'login expired');
  })

  describe('when 418', function() {
    custom(418, "I'm Java");
  })
})
