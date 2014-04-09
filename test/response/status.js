
var response = require('../context').response;
var request = require('supertest');
var assert = require('assert');
var koa = require('../..');

describe('res.status=', function(){
  describe('when a status string', function(){
    describe('and valid', function(){
      it('should set the status', function(){
        var res = response();
        res.status = 'forbidden';
        res.status.should.equal(403);
      })

      it('should be case-insensitive', function(){
        var res = response();
        res.status = 'ForBidden';
        res.status.should.equal(403);
      })
    })

    describe('and invalid', function(){
      it('should throw', function(){
        var res = response();
        var err;

        try {
          res.status = 'maru';
        } catch (e) {
          err = e;
        }

        assert(err);
      })
    })
  })

  function strip(status) {
    it('should strip content related header fields', function(done){
      var app = koa();

      app.use(function *(){
        this.body = { foo: 'bar' };
        this.set('Content-Type', 'application/json');
        this.set('Content-Length', '15');
        this.set('Transfer-Encoding', 'chunked');
        this.status = status;
      });

      request(app.listen())
        .get('/')
        .expect(status)
        .end(function(err, res) {
          res.should.not.have.header('content-type');
          res.should.not.have.header('content-length');
          res.should.not.have.header('content-encoding');
          done(err);
        });
    })

    it('should strip content releated header fields after status set', function(done) {
      var app = koa();

      app.use(function *(){
        this.status = status;
        this.body = { foo: 'bar' };
        this.set('Content-Type', 'application/json');
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
          done(err);
        });
    })
  }

  describe('when 204', function(){
    strip(204);
  })

  describe('when 205', function() {
    strip(205);
  })

  describe('when 304', function(){
    strip(304);
  })
})
