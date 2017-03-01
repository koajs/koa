
'use strict';

const request = require('supertest');
const response = require('../helpers/context').response;
const Koa = require('../..');

describe('res.header', () => {
  it('should return the response header object', () => {
    const res = response();
    res.set('X-Foo', 'bar');
    res.header.should.eql({ 'x-foo': 'bar' });
  });

  it('should use res.getHeaders() accessor when available', () => {
    const res = response();
    res.res._headers = null;
    res.res.getHeaders = () => ({ 'x-foo': 'baz' });
    res.header.should.eql({ 'x-foo': 'baz' });
  });

  describe('when res._headers not present', () => {
    it('should return empty object', () => {
      const res = response();
      res.res._headers = null;
      res.header.should.eql({});
    });
  });
});
