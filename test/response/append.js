
'use strict';

const context = require('../helpers/context');

describe('ctx.append(name, val)', () => {
  it('should append multiple headers', () => {
    const ctx = context();
    ctx.append('x-foo', 'bar1');
    ctx.append('x-foo', 'bar2');
    ctx.response.header['x-foo'].should.eql(['bar1', 'bar2']);
  });

  it('should accept array of values', () => {
    const ctx = context();

    ctx.append('Set-Cookie', ['foo=bar', 'fizz=buzz']);
    ctx.append('Set-Cookie', 'hi=again');
    ctx.response.header['set-cookie'].should.eql(['foo=bar', 'fizz=buzz', 'hi=again']);
  });

  it('should return * when already has a *', () => {
    const ctx = context();

    ctx.append('x-foo', '*');
    ctx.append('x-foo', 'bar');
    ctx.response.header['x-foo'].should.eql('*');
  });

  it('should ignore duplicate case values', () => {
    const ctx = context();

    ctx.append('x-foo', ['Foo']);
    ctx.append('x-foo', ['foo', 'bar']);
    ctx.response.header['x-foo'].should.eql(['foo', 'bar']);
  });

  it('should get reset by res.set(field, val)', () => {
    const ctx = context();

    ctx.append('Link', '<http://localhost/>');
    ctx.append('Link', '<http://localhost:80/>');

    ctx.set('Link', '<http://127.0.0.1/>');

    ctx.response.header.link.should.equal('<http://127.0.0.1/>');
  });

  it('should work with res.set(field, val) first', () => {
    const ctx = context();

    ctx.set('Link', '<http://localhost/>');
    ctx.append('Link', '<http://localhost:80/>');

    ctx.response.header.link.should.eql(['<http://localhost/>', '<http://localhost:80/>']);
  });
});
