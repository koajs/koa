
'use strict';

const context = require('../helpers/context');
const request = require('supertest');
const Koa = require('../..');

describe('ctx.attachment([filename])', () => {
  describe('when given a filename', () => {
    it('should set the filename param', () => {
      const ctx = context();
      ctx.attachment('path/to/tobi.png');
      const str = 'attachment; filename="tobi.png"';
      ctx.response.header['content-disposition'].should.equal(str);
    });
  });

  describe('when omitting filename', () => {
    it('should not set filename param', () => {
      const ctx = context();
      ctx.attachment();
      ctx.response.header['content-disposition'].should.equal('attachment');
    });
  });

  describe('when given a no-ascii filename', () => {
    it('should set the encodeURI filename param', () => {
      const ctx = context();
      ctx.attachment('path/to/include-no-ascii-char-中文名-ok.png');
      const str = 'attachment; filename="include-no-ascii-char-???-ok.png"; filename*=UTF-8\'\'include-no-ascii-char-%E4%B8%AD%E6%96%87%E5%90%8D-ok.png';
      ctx.response.header['content-disposition'].should.equal(str);
    });

    it('should work with http client', done => {
      const app = new Koa();

      app.use((ctx, next) => {
        ctx.attachment('path/to/include-no-ascii-char-中文名-ok.json');
        ctx.body = {foo: 'bar'};
      });

      request(app.listen())
        .get('/')
        .expect('content-disposition', 'attachment; filename="include-no-ascii-char-???-ok.json"; filename*=UTF-8\'\'include-no-ascii-char-%E4%B8%AD%E6%96%87%E5%90%8D-ok.json')
        .expect({foo: 'bar'})
        .expect(200, done);
    });
  });
});
