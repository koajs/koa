
'use strict';

const context = require('../helpers/context');

describe('ctx.get(name)', () => {
  it('should return the field value', () => {
    const ctx = context();
    ctx.req.headers.host = 'http://google.com';
    ctx.req.headers.referer = 'http://google.com';
    expect(ctx.get('HOST')).toBe('http://google.com');
    expect(ctx.get('Host')).toBe('http://google.com');
    expect(ctx.get('host')).toBe('http://google.com');
    expect(ctx.get('referer')).toBe('http://google.com');
    expect(ctx.get('referrer')).toBe('http://google.com');
  });
});
