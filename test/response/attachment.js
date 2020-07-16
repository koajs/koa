
'use strict';

const assert = require('assert');
const context = require('../helpers/context');
const request = require('supertest');
const Koa = require('../..');

describe('ctx.attachment([filename])', () => {
  describe('when given a filename', () => {
    it('should set the filename param', () => {
      const ctx = context();
      ctx.attachment('path/to/tobi.png');
      const str = 'attachment; filename="tobi.png"';
      assert.equal(ctx.response.header['content-disposition'], str);
    });
  });

  describe('when omitting filename', () => {
    it('should not set filename param', () => {
      const ctx = context();
      ctx.attachment();
      assert.equal(ctx.response.header['content-disposition'], 'attachment');
    });
  });

  describe('when given a non-ascii filename', () => {
    it('should set the encodeURI filename param', () => {
      const ctx = context();
      ctx.attachment('path/to/include-no-ascii-char-中文名-ok.png');
      const str = 'attachment; filename="include-no-ascii-char-???-ok.png"; filename*=UTF-8\'\'include-no-ascii-char-%E4%B8%AD%E6%96%87%E5%90%8D-ok.png';
      assert.equal(ctx.response.header['content-disposition'], str);
    });

    it('should work with http client', () => {
      const app = new Koa();

      app.use((ctx, next) => {
        ctx.attachment('path/to/include-no-ascii-char-中文名-ok.json');
        ctx.body = {foo: 'bar'};
      });

      return request(app.callback())
        .get('/')
        .expect('content-disposition', 'attachment; filename="include-no-ascii-char-???-ok.json"; filename*=UTF-8\'\'include-no-ascii-char-%E4%B8%AD%E6%96%87%E5%90%8D-ok.json')
        .expect({foo: 'bar'})
        .expect(200);
    });
  });
});

// reference test case of content-disposition module
describe('contentDisposition(filename, options)', () => {
  describe('with "fallback" option', () => {
    it('should require a string or Boolean', () => {
      const ctx = context();
      assert.throws(() => { ctx.attachment('plans.pdf', { fallback: 42 }); },
        /fallback.*string/);
    });

    it('should default to true', () => {
      const ctx = context();
      ctx.attachment('€ rates.pdf');
      assert.equal(ctx.response.header['content-disposition'],
        'attachment; filename="? rates.pdf"; filename*=UTF-8\'\'%E2%82%AC%20rates.pdf');
    });

    describe('when "false"', () => {
      it('should not generate ISO-8859-1 fallback', () => {
        const ctx = context();
        ctx.attachment('£ and € rates.pdf', { fallback: false });
        assert.equal(ctx.response.header['content-disposition'],
          'attachment; filename*=UTF-8\'\'%C2%A3%20and%20%E2%82%AC%20rates.pdf');
      });

      it('should keep ISO-8859-1 filename', () => {
        const ctx = context();
        ctx.attachment('£ rates.pdf', { fallback: false });
        assert.equal(ctx.response.header['content-disposition'],
          'attachment; filename="£ rates.pdf"');
      });
    });

    describe('when "true"', () => {
      it('should generate ISO-8859-1 fallback', () => {
        const ctx = context();
        ctx.attachment('£ and € rates.pdf', { fallback: true });
        assert.equal(ctx.response.header['content-disposition'],
          'attachment; filename="£ and ? rates.pdf"; filename*=UTF-8\'\'%C2%A3%20and%20%E2%82%AC%20rates.pdf');
      });

      it('should pass through ISO-8859-1 filename', () => {
        const ctx = context();
        ctx.attachment('£ rates.pdf', { fallback: true });
        assert.equal(ctx.response.header['content-disposition'],
          'attachment; filename="£ rates.pdf"');
      });
    });

    describe('when a string', () => {
      it('should require an ISO-8859-1 string', () => {
        const ctx = context();
        assert.throws(() => { ctx.attachment('€ rates.pdf', { fallback: '€ rates.pdf' }); },
          /fallback.*iso-8859-1/i);
      });

      it('should use as ISO-8859-1 fallback', () => {
        const ctx = context();
        ctx.attachment('£ and € rates.pdf', { fallback: '£ and EURO rates.pdf' });
        assert.equal(ctx.response.header['content-disposition'],
          'attachment; filename="£ and EURO rates.pdf"; filename*=UTF-8\'\'%C2%A3%20and%20%E2%82%AC%20rates.pdf');
      });

      it('should use as fallback even when filename is ISO-8859-1', () => {
        const ctx = context();
        ctx.attachment('"£ rates".pdf', { fallback: '£ rates.pdf' });
        assert.equal(ctx.response.header['content-disposition'],
          'attachment; filename="£ rates.pdf"; filename*=UTF-8\'\'%22%C2%A3%20rates%22.pdf');
      });

      it('should do nothing if equal to filename', () => {
        const ctx = context();
        ctx.attachment('plans.pdf', { fallback: 'plans.pdf' });
        assert.equal(ctx.response.header['content-disposition'],
          'attachment; filename="plans.pdf"');
      });

      it('should use the basename of the string', () => {
        const ctx = context();
        ctx.attachment('€ rates.pdf', { fallback: '/path/to/EURO rates.pdf' });
        assert.equal(ctx.response.header['content-disposition'],
          'attachment; filename="EURO rates.pdf"; filename*=UTF-8\'\'%E2%82%AC%20rates.pdf');
      });

      it('should do nothing without filename option', () => {
        const ctx = context();
        ctx.attachment(undefined, { fallback: 'plans.pdf' });
        assert.equal(ctx.response.header['content-disposition'],
          'attachment');
      });
    });
  });

  describe('with "type" option', () => {
    it('should default to attachment', () => {
      const ctx = context();
      ctx.attachment();
      assert.equal(ctx.response.header['content-disposition'],
        'attachment');
    });

    it('should require a string', () => {
      const ctx = context();
      assert.throws(() => { ctx.attachment(undefined, { type: 42 }); },
        /invalid type/);
    });

    it('should require a valid type', () => {
      const ctx = context();
      assert.throws(() => { ctx.attachment(undefined, { type: 'invlaid;type' }); },
        /invalid type/);
    });

    it('should create a header with inline type', () => {
      const ctx = context();
      ctx.attachment(undefined, { type: 'inline' });
      assert.equal(ctx.response.header['content-disposition'],
        'inline');
    });

    it('should create a header with inline type and filename', () => {
      const ctx = context();
      ctx.attachment('plans.pdf', { type: 'inline' });
      assert.equal(ctx.response.header['content-disposition'],
        'inline; filename="plans.pdf"');
    });

    it('should normalize type', () => {
      const ctx = context();
      ctx.attachment(undefined, { type: 'INLINE' });
      assert.equal(ctx.response.header['content-disposition'],
        'inline');
    });
  });
});
