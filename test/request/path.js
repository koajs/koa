'use strict';

const context = require('../helpers/context');
const parseurl = require('parseurl');

describe('ctx.path', () => {
  it('should return the pathname', () => {
    const ctx = context();
    ctx.url = '/login?next=/dashboard';
    expect(ctx.path).toBe('/login');
  });
});

describe('ctx.path=', () => {
  it('should set the pathname', () => {
    const ctx = context();
    ctx.url = '/login?next=/dashboard';

    ctx.path = '/logout';
    expect(ctx.path).toBe('/logout');
    expect(ctx.url).toBe('/logout?next=/dashboard');
  });

  it('should change .url but not .originalUrl', () => {
    const ctx = context({ url: '/login' });
    ctx.path = '/logout';
    expect(ctx.url).toBe('/logout');
    expect(ctx.originalUrl).toBe('/login');
    expect(ctx.request.originalUrl).toBe('/login');
  });

  it('should not affect parseurl', () => {
    const ctx = context({ url: '/login?foo=bar' });
    ctx.path = '/login';
    const url = parseurl(ctx.req);
    expect(url.path).toBe('/login?foo=bar');
  });
});
