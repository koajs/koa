
'use strict';

const assert = require('assert');
const context = require('../helpers/context');

describe('ctx.query', () => {
  describe('when missing', () => {
    it('should return an empty object', () => {
      const ctx = context({ url: '/' });
      assert.deepStrictEqual(ctx.query, Object.create(null));
    });

    it('should return the same object each time it\'s accessed', () => {
      const ctx = context({ url: '/' });
      ctx.query.a = '2';
      assert.strictEqual(ctx.query.a, '2');
    });
  });

  it('should return a parsed query-string', () => {
    const ctx = context({ url: '/?page=2' });
    assert.strictEqual(ctx.query.page, '2');
  });
});

describe('ctx.query=', () => {
  it('should stringify and replace the querystring and search', () => {
    const ctx = context({ url: '/store/shoes' });
    ctx.query = { page: 2, color: 'blue' };
    assert.strictEqual(ctx.url, '/store/shoes?page=2&color=blue');
    assert.strictEqual(ctx.querystring, 'page=2&color=blue');
    assert.strictEqual(ctx.search, '?page=2&color=blue');
  });

  it('should change .url but not .originalUrl', () => {
    const ctx = context({ url: '/store/shoes' });
    ctx.query = { page: 2 };
    assert.strictEqual(ctx.url, '/store/shoes?page=2');
    assert.strictEqual(ctx.originalUrl, '/store/shoes');
    assert.strictEqual(ctx.request.originalUrl, '/store/shoes');
  });
});
