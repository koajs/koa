
'use strict';

const context = require('../helpers/context');

describe('ctx.search=', () => {
  it('should replace the search', () => {
    const ctx = context({ url: '/store/shoes' });
    ctx.search = '?page=2&color=blue';
    expect(ctx.url).toBe('/store/shoes?page=2&color=blue');
    expect(ctx.search).toBe('?page=2&color=blue');
  });

  it('should update ctx.querystring and ctx.query', () => {
    const ctx = context({ url: '/store/shoes' });
    ctx.search = '?page=2&color=blue';
    expect(ctx.url).toBe('/store/shoes?page=2&color=blue');
    expect(ctx.querystring).toBe('page=2&color=blue');
    expect(ctx.query).toEqual({ page: '2', color: 'blue' });
  });

  it('should change .url but not .originalUrl', () => {
    const ctx = context({ url: '/store/shoes' });
    ctx.search = '?page=2&color=blue';
    expect(ctx.url).toBe('/store/shoes?page=2&color=blue');
    expect(ctx.originalUrl).toBe('/store/shoes');
    expect(ctx.request.originalUrl).toBe('/store/shoes');
  });

  describe('when missing', () => {
    it('should return ""', () => {
      const ctx = context({ url: '/store/shoes' });
      expect(ctx.search).toBe('');
    });
  });
});
