
'use strict';

const request = require('../helpers/request.js');
const response = require('../helpers/context').response;
const Koa = require('../..');

describe('res.header', () => {
  it('should return the response header object', () => {
    const res = response();
    res.set('X-Foo', 'bar');
    expect(res.header).toEqual({ 'x-foo': 'bar' });
  });

  it('should use res.getHeaders() accessor when available', () => {
    const res = response();
    res.res._headers = null;
    res.res.getHeaders = () => ({ 'x-foo': 'baz' });
    expect(res.header).toEqual({ 'x-foo': 'baz' });
  });

  it('should return the response header object when no mocks are in use', async () => {
    const app = new Koa();
    let header;

    app.use(ctx => {
      ctx.set('x-foo', '42');
      header = Object.assign({}, ctx.response.header);
    });

    await request(app, '/');

    expect(header).toEqual({ 'x-foo': '42' });
  });

  describe('when res._headers not present', () => {
    it('should return empty object', () => {
      const res = response();
      res.res._headers = null;
      expect(res.header).toEqual({});
    });
  });
});
