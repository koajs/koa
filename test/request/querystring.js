
'use strict';

const context = require('../helpers/context');
const parseurl = require('parseurl');

describe('ctx.querystring', () => {
  it('should return the querystring', () => {
    const ctx = context({ url: '/store/shoes?page=2&color=blue' });
    expect(ctx.querystring).toBe('page=2&color=blue');
  });

  describe('when ctx.req not present', () => {
    it('should return an empty string', () => {
      const ctx = context();
      ctx.request.req = null;
      expect(ctx.querystring).toBe('');
    });
  });
});

describe('ctx.querystring=', () => {
  it('should replace the querystring', () => {
    const ctx = context({ url: '/store/shoes' });
    ctx.querystring = 'page=2&color=blue';
    expect(ctx.url).toBe('/store/shoes?page=2&color=blue');
    expect(ctx.querystring).toBe('page=2&color=blue');
  });

  it('should update ctx.search and ctx.query', () => {
    const ctx = context({ url: '/store/shoes' });
    ctx.querystring = 'page=2&color=blue';
    expect(ctx.url).toBe('/store/shoes?page=2&color=blue');
    expect(ctx.search).toBe('?page=2&color=blue');
    expect(ctx.query).toEqual({ page: '2', color: 'blue' });
  });

  it('should change .url but not .originalUrl', () => {
    const ctx = context({ url: '/store/shoes' });
    ctx.querystring = 'page=2&color=blue';
    expect(ctx.url).toBe('/store/shoes?page=2&color=blue');
    expect(ctx.originalUrl).toBe('/store/shoes');
    expect(ctx.request.originalUrl).toBe('/store/shoes');
  });

  it('should not affect parseurl', () => {
    const ctx = context({ url: '/login?foo=bar' });
    ctx.querystring = 'foo=bar';
    const url = parseurl(ctx.req);
    expect(url.path).toBe('/login?foo=bar');
  });
});
