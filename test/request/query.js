
'use strict';

const assert = require('assert');
const context = require('../helpers/context');

describe('ctx.query', () => {
  describe('when missing', () => {
    it('should return an empty object', () => {
      const ctx = context({ url: '/' });
      assert.deepEqual(ctx.query, {});
    });

    it('should return the same object each time it\'s accessed', () => {
      const ctx = context({ url: '/' });
      ctx.query.a = '2';
      assert.equal(ctx.query.a, '2');
    });
  });

  it('should return a parsed query string', () => {
    const ctx = context({ url: '/?page=2' });
    assert.equal(ctx.query.page, '2');
  });
});

describe('ctx.query=', () => {
  it('should stringify and replace the query string and search', () => {
    const ctx = context({ url: '/store/shoes' });
    ctx.query = { page: 2, color: 'blue' };
    assert.equal(ctx.url, '/store/shoes?page=2&color=blue');
    assert.equal(ctx.querystring, 'page=2&color=blue');
    assert.equal(ctx.search, '?page=2&color=blue');
  });

  it('should change .url but not .originalUrl', () => {
    const ctx = context({ url: '/store/shoes' });
    ctx.query = { page: 2 };
    assert.equal(ctx.url, '/store/shoes?page=2');
    assert.equal(ctx.originalUrl, '/store/shoes');
    assert.equal(ctx.request.originalUrl, '/store/shoes');
  });
});
