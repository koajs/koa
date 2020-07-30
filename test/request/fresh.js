
'use strict';

const assert = require('assert');
const context = require('../helpers/context');

describe('ctx.fresh', () => {
  describe('the request method is not GET and HEAD', () => {
    it('should return false', () => {
      const ctx = context();
      ctx.req.method = 'POST';
      assert.equal(ctx.fresh, false);
    });
  });

  describe('the response is non-2xx', () => {
    it('should return false', () => {
      const ctx = context();
      ctx.status = 404;
      ctx.req.method = 'GET';
      ctx.req.headers['if-none-match'] = '123';
      ctx.set('ETag', '123');
      assert.equal(ctx.fresh, false);
    });
  });

  describe('the response is 2xx', () => {
    describe('and etag matches', () => {
      it('should return true', () => {
        const ctx = context();
        ctx.status = 200;
        ctx.req.method = 'GET';
        ctx.req.headers['if-none-match'] = '123';
        ctx.set('ETag', '123');
        assert.equal(ctx.fresh, true);
      });
    });

    describe('and etag does not match', () => {
      it('should return false', () => {
        const ctx = context();
        ctx.status = 200;
        ctx.req.method = 'GET';
        ctx.req.headers['if-none-match'] = '123';
        ctx.set('ETag', 'hey');
        assert.equal(ctx.fresh, false);
      });
    });
  });
});
