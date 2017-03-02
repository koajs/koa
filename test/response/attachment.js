'use strict';

const context = require('../helpers/context');
const request = require('../helpers/request');
const Koa = require('../..');

describe('ctx.attachment([filename])', () => {
  describe('when given a filename', () => {
    it('should set the filename param', () => {
      const ctx = context();
      ctx.attachment('path/to/tobi.png');
      const str = 'attachment; filename="tobi.png"';
      expect(ctx.response.header['content-disposition']).toBe(str);
    });
  });

  describe('when omitting filename', () => {
    it('should not set filename param', () => {
      const ctx = context();
      ctx.attachment();
      expect(ctx.response.header['content-disposition']).toBe('attachment');
    });
  });

  describe('when given a no-ascii filename', () => {
    it('should set the encodeURI filename param', () => {
      const ctx = context();
      ctx.attachment('path/to/include-no-ascii-char-中文名-ok.png');
      const str = 'attachment; filename="include-no-ascii-char-???-ok.png"; filename*=UTF-8\'\'include-no-ascii-char-%E4%B8%AD%E6%96%87%E5%90%8D-ok.png';
      expect(ctx.response.header['content-disposition']).toBe(str);
    });

    it('should work with http client', async () => {
      const app = new Koa();

      app.use((ctx, next) => {
        ctx.attachment('path/to/include-no-ascii-char-中文名-ok.json');
        ctx.body = {foo: 'bar'};
      });

      const res = await request(app, '/');
      expect(res.status).toBe(200);
      expect(res.headers.get('content-disposition')).toBe('attachment; filename="include-no-ascii-char-???-ok.json"; filename*=UTF-8\'\'include-no-ascii-char-%E4%B8%AD%E6%96%87%E5%90%8D-ok.json');
      expect(await res.json()).toEqual({foo: 'bar'});
    });
  });
});
