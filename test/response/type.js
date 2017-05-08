
'use strict';

const context = require('../helpers/context');
const assert = require('assert');

describe('ctx.type=', () => {
  describe('with a mime', () => {
    it('should set the Content-Type', () => {
      const ctx = context();
      ctx.type = 'text/plain';
      assert.equal(ctx.type, 'text/plain');
      assert.equal(ctx.response.header['content-type'], 'text/plain; charset=utf-8');
    });
  });

  describe('with an extension', () => {
    it('should lookup the mime', () => {
      const ctx = context();
      ctx.type = 'json';
      assert.equal(ctx.type, 'application/json');
      assert.equal(ctx.response.header['content-type'], 'application/json; charset=utf-8');
    });
  });

  describe('without a charset', () => {
    it('should default the charset', () => {
      const ctx = context();
      ctx.type = 'text/html';
      assert.equal(ctx.type, 'text/html');
      assert.equal(ctx.response.header['content-type'], 'text/html; charset=utf-8');
    });
  });

  describe('with a charset', () => {
    it('should not default the charset', () => {
      const ctx = context();
      ctx.type = 'text/html; charset=foo';
      assert.equal(ctx.type, 'text/html');
      assert.equal(ctx.response.header['content-type'], 'text/html; charset=foo');
    });
  });

  describe('with an unknown extension', () => {
    it('should not set a content-type', () => {
      const ctx = context();
      ctx.type = 'asdf';
      assert(!ctx.type);
      assert(!ctx.response.header['content-type']);
    });
  });
});

describe('ctx.type', () => {
  describe('with no Content-Type', () => {
    it('should return ""', () => {
      const ctx = context();
      assert(!ctx.type);
    });
  });

  describe('with a Content-Type', () => {
    it('should return the mime', () => {
      const ctx = context();
      ctx.type = 'json';
      assert.equal(ctx.type, 'application/json');
    });
  });
});
