'use strict';

const context = require('../helpers/context');

describe('ctx.query', () => {
  describe('when missing', () => {
    it('should return an empty object', () => {
      const ctx = context({ url: '/' });
      expect(ctx.query).toEqual({});
    });

    it('should return the same object each time it\'s accessed', done => {
      const ctx = context({ url: '/' });
      ctx.query.a = '2';
      expect(ctx.query.a).toBe('2');
      done();
    });
  });

  it('should return a parsed query-string', () => {
    const ctx = context({ url: '/?page=2' });
    expect(ctx.query.page).toBe('2');
  });
});

describe('ctx.query=', () => {
  it('should stringify and replace the querystring and search', () => {
    const ctx = context({ url: '/store/shoes' });
    ctx.query = { page: 2, color: 'blue' };
    expect(ctx.url).toBe('/store/shoes?page=2&color=blue');
    expect(ctx.querystring).toBe('page=2&color=blue');
    expect(ctx.search).toBe('?page=2&color=blue');
  });

  it('should change .url but not .originalUrl', () => {
    const ctx = context({ url: '/store/shoes' });
    ctx.query = { page: 2 };
    expect(ctx.url).toBe('/store/shoes?page=2');
    expect(ctx.originalUrl).toBe('/store/shoes');
    expect(ctx.request.originalUrl).toBe('/store/shoes');
  });
});
