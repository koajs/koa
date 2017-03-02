
'use strict';

const context = require('../helpers/context');

describe('ctx.append(name, val)', () => {
  it('should append multiple headers', () => {
    const ctx = context();
    ctx.append('x-foo', 'bar1');
    ctx.append('x-foo', 'bar2');
    expect(ctx.response.header['x-foo']).toEqual(['bar1', 'bar2']);
  });

  it('should accept array of values', () => {
    const ctx = context();

    ctx.append('Set-Cookie', ['foo=bar', 'fizz=buzz']);
    ctx.append('Set-Cookie', 'hi=again');
    expect(ctx.response.header['set-cookie']).toEqual(['foo=bar', 'fizz=buzz', 'hi=again']);
  });

  it('should get reset by res.set(field, val)', () => {
    const ctx = context();

    ctx.append('Link', '<http://localhost/>');
    ctx.append('Link', '<http://localhost:80/>');

    ctx.set('Link', '<http://127.0.0.1/>');

    expect(ctx.response.header.link).toBe('<http://127.0.0.1/>');
  });

  it('should work with res.set(field, val) first', () => {
    const ctx = context();

    ctx.set('Link', '<http://localhost/>');
    ctx.append('Link', '<http://localhost:80/>');

    expect(ctx.response.header.link).toEqual(['<http://localhost/>', '<http://localhost:80/>']);
  });
});
