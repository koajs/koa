
'use strict';

const response = require('../helpers/context').response;
const request = require('../helpers/request');
const statuses = require('statuses');
const Koa = require('../..');

describe('res.status=', () => {
  describe('when a status code', () => {
    describe('and valid', () => {
      it('should set the status', () => {
        const res = response();
        res.status = 403;
        expect(res.status).toBe(403);
      });

      it('should not throw', () => {
        response().status = 403;
      });
    });

    describe('and invalid', () => {
      it('should throw', () => {
        expect(() => {
          response().status = 999;
        }).toThrow('invalid status code: 999');
      });
    });

    describe('and custom status', () => {
      beforeAll(() => statuses['700'] = 'custom status');

      it('should set the status', () => {
        const res = response();
        res.status = 700;
        expect(res.status).toBe(700);
      });

      it('should not throw', () => {
        response().status = 700;
      });
    });
  });

  describe('when a status string', () => {
    it('should throw', () => {
      expect(() => response().status = 'forbidden').toThrow('status code must be a number');
    });
  });

  function strip(status){
    it('should strip content related header fields', async () => {
      const app = new Koa();

      app.use(ctx => {
        ctx.body = { foo: 'bar' };
        ctx.set('Content-Type', 'application/json; charset=utf-8');
        ctx.set('Content-Length', '15');
        ctx.set('Transfer-Encoding', 'chunked');
        ctx.status = status;
        expect(ctx.response.header['content-type']).toBe(undefined);
        expect(ctx.response.header['content-length']).toBe(undefined);
        expect(ctx.response.header['transfer-encoding']).toBe(undefined);
      });

      const res = await request(app, '/');
      expect(res.status).toBe(status);
      expect(res.headers.has('content-type')).toBe(false);
      expect(res.headers.has('content-length')).toBe(false);
      expect(res.headers.has('content-encoding')).toBe(false);
      expect(await res.text()).toBe('');
    });

    it('should strip content releated header fields after status set', async () => {
      const app = new Koa();

      app.use(ctx => {
        ctx.status = status;
        ctx.body = { foo: 'bar' };
        ctx.set('Content-Type', 'application/json; charset=utf-8');
        ctx.set('Content-Length', '15');
        ctx.set('Transfer-Encoding', 'chunked');
      });

      const res = await request(app, '/');
      expect(res.status).toBe(status);
      expect(res.headers.has('content-type')).toBe(false);
      expect(res.headers.has('content-length')).toBe(false);
      expect(res.headers.has('content-encoding')).toBe(false);
      expect(await res.text()).toBe('');
    });
  }

  describe('when 204', () => strip(204));

  describe('when 205', () => strip(205));

  describe('when 304', () => strip(304));
});
