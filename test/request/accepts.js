
'use strict';

const assert = require('assert');
const context = require('../helpers/context');

describe('ctx.accepts(types)', () => {
  describe('with no arguments', () => {
    describe('when Accept is populated', () => {
      it('should return all accepted types', () => {
        const ctx = context();
        ctx.req.headers.accept = 'application/*;q=0.2, image/jpeg;q=0.8, text/html, text/plain';
        assert.deepEqual(ctx.accepts(), ['text/html', 'text/plain', 'image/jpeg', 'application/*']);
      });
    });
  });

  describe('with no valid types', () => {
    describe('when Accept is populated', () => {
      it('should return false', () => {
        const ctx = context();
        ctx.req.headers.accept = 'application/*;q=0.2, image/jpeg;q=0.8, text/html, text/plain';
        assert.equal(ctx.accepts('image/png', 'image/tiff'), false);
      });
    });

    describe('when Accept is not populated', () => {
      it('should return the first type', () => {
        const ctx = context();
        assert.equal(ctx.accepts('text/html', 'text/plain', 'image/jpeg', 'application/*'), 'text/html');
      });
    });
  });

  describe('when extensions are given', () => {
    it('should convert to mime types', () => {
      const ctx = context();
      ctx.req.headers.accept = 'text/plain, text/html';
      assert.equal(ctx.accepts('html'), 'html');
      assert.equal(ctx.accepts('.html'), '.html');
      assert.equal(ctx.accepts('txt'), 'txt');
      assert.equal(ctx.accepts('.txt'), '.txt');
      assert.equal(ctx.accepts('png'), false);
    });
  });

  describe('when an array is given', () => {
    it('should return the first match', () => {
      const ctx = context();
      ctx.req.headers.accept = 'text/plain, text/html';
      assert.equal(ctx.accepts(['png', 'text', 'html']), 'text');
      assert.equal(ctx.accepts(['png', 'html']), 'html');
    });
  });

  describe('when multiple arguments are given', () => {
    it('should return the first match', () => {
      const ctx = context();
      ctx.req.headers.accept = 'text/plain, text/html';
      assert.equal(ctx.accepts('png', 'text', 'html'), 'text');
      assert.equal(ctx.accepts('png', 'html'), 'html');
    });
  });

  describe('when value present in Accept is an exact match', () => {
    it('should return the type', () => {
      const ctx = context();
      ctx.req.headers.accept = 'text/plain, text/html';
      assert.equal(ctx.accepts('text/html'), 'text/html');
      assert.equal(ctx.accepts('text/plain'), 'text/plain');
    });
  });

  describe('when value present in Accept is a type match', () => {
    it('should return the type', () => {
      const ctx = context();
      ctx.req.headers.accept = 'application/json, */*';
      assert.equal(ctx.accepts('text/html'), 'text/html');
      assert.equal(ctx.accepts('text/plain'), 'text/plain');
      assert.equal(ctx.accepts('image/png'), 'image/png');
    });
  });

  describe('when value present in Accept is a subtype match', () => {
    it('should return the type', () => {
      const ctx = context();
      ctx.req.headers.accept = 'application/json, text/*';
      assert.equal(ctx.accepts('text/html'), 'text/html');
      assert.equal(ctx.accepts('text/plain'), 'text/plain');
      assert.equal(ctx.accepts('image/png'), false);
      assert.equal(ctx.accepts('png'), false);
    });
  });
});
