
'use strict';

const response = require('../helpers/context').response;
const request = require('supertest');
const statuses = require('statuses');
const assert = require('assert');
const Koa = require('../..');

describe('res.status=', () => {
  describe('when a status code', () => {
    describe('and valid', () => {
      it('should set the status', () => {
        const res = response();
        res.status = 403;
        res.status.should.equal(403);
      });

      it('should not throw', () => {
        assert.doesNotThrow(() => {
          response().status = 403;
        });
      });
    });

    describe('and invalid', () => {
      it('should throw', () => {
        assert.throws(() => {
          response().status = 999;
        }, 'invalid status code: 999');
      });
    });

    describe('and custom status', () => {
      before(() => statuses['700'] = 'custom status');

      it('should set the status', () => {
        const res = response();
        res.status = 700;
        res.status.should.equal(700);
      });

      it('should not throw', () => {
        assert.doesNotThrow(() => response().status = 700);
      });
    });
  });

  describe('when a status string', () => {
    it('should throw', () => {
      assert.throws(() => response().status = 'forbidden', 'status code must be a number');
    });
  });

  function strip(status){
    it('should strip content related header fields', done => {
      const app = new Koa();

      app.use(ctx => {
        ctx.body = { foo: 'bar' };
        ctx.set('Content-Type', 'application/json; charset=utf-8');
        ctx.set('Content-Length', '15');
        ctx.set('Transfer-Encoding', 'chunked');
        ctx.status = status;
        assert(null == ctx.response.header['content-type']);
        assert(null == ctx.response.header['content-length']);
        assert(null == ctx.response.header['transfer-encoding']);
      });

      request(app.listen())
        .get('/')
        .expect(status)
        .end((err, res) => {
          res.should.not.have.header('content-type');
          res.should.not.have.header('content-length');
          res.should.not.have.header('content-encoding');
          res.text.should.have.length(0);
          done(err);
        });
    });

    it('should strip content releated header fields after status set', done => {
      const app = new Koa();

      app.use(ctx => {
        ctx.status = status;
        ctx.body = { foo: 'bar' };
        ctx.set('Content-Type', 'application/json; charset=utf-8');
        ctx.set('Content-Length', '15');
        ctx.set('Transfer-Encoding', 'chunked');
      });

      request(app.listen())
        .get('/')
        .expect(status)
        .end((err, res) => {
          res.should.not.have.header('content-type');
          res.should.not.have.header('content-length');
          res.should.not.have.header('content-encoding');
          res.text.should.have.length(0);
          done(err);
        });
    });
  }

  describe('when 204', () => strip(204));

  describe('when 205', () => strip(205));

  describe('when 304', () => strip(304));
});
