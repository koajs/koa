
'use strict';

const context = require('../helpers/context');
const assert = require('assert');

describe('ctx.is(type)', () => {
  it('should ignore params', () => {
    const ctx = context();
    ctx.header['content-type'] = 'text/html; charset=utf-8';
    ctx.header['transfer-encoding'] = 'chunked';

    assert.equal(ctx.is('text/*'), 'text/html');
  });

  describe('when no body is given', () => {
    it('should return null', () => {
      const ctx = context();

      assert.equal(ctx.is(), null);
      assert.equal(ctx.is('image/*'), null);
      assert.equal(ctx.is('image/*', 'text/*'), null);
    });
  });

  describe('when no content type is given', () => {
    it('should return false', () => {
      const ctx = context();
      ctx.header['transfer-encoding'] = 'chunked';

      assert.equal(ctx.is(), false);
      assert.equal(ctx.is('image/*'), false);
      assert.equal(ctx.is('text/*', 'image/*'), false);
    });
  });

  describe('give no types', () => {
    it('should return the mime type', () => {
      const ctx = context();
      ctx.header['content-type'] = 'image/png';
      ctx.header['transfer-encoding'] = 'chunked';

      assert.equal(ctx.is(), 'image/png');
    });
  });

  describe('given one type', () => {
    it('should return the type or false', () => {
      const ctx = context();
      ctx.header['content-type'] = 'image/png';
      ctx.header['transfer-encoding'] = 'chunked';

      assert.equal(ctx.is('png'), 'png');
      assert.equal(ctx.is('.png'), '.png');
      assert.equal(ctx.is('image/png'), 'image/png');
      assert.equal(ctx.is('image/*'), 'image/png');
      assert.equal(ctx.is('*/png'), 'image/png');

      assert.equal(ctx.is('jpeg'), false);
      assert.equal(ctx.is('.jpeg'), false);
      assert.equal(ctx.is('image/jpeg'), false);
      assert.equal(ctx.is('text/*'), false);
      assert.equal(ctx.is('*/jpeg'), false);
    });
  });

  describe('given multiple types', () => {
    it('should return the first match or false', () => {
      const ctx = context();
      ctx.header['content-type'] = 'image/png';
      ctx.header['transfer-encoding'] = 'chunked';

      assert.equal(ctx.is('png'), 'png');
      assert.equal(ctx.is('.png'), '.png');
      assert.equal(ctx.is('text/*', 'image/*'), 'image/png');
      assert.equal(ctx.is('image/*', 'text/*'), 'image/png');
      assert.equal(ctx.is('image/*', 'image/png'), 'image/png');
      assert.equal(ctx.is('image/png', 'image/*'), 'image/png');

      assert.equal(ctx.is(['text/*', 'image/*']), 'image/png');
      assert.equal(ctx.is(['image/*', 'text/*']), 'image/png');
      assert.equal(ctx.is(['image/*', 'image/png']), 'image/png');
      assert.equal(ctx.is(['image/png', 'image/*']), 'image/png');

      assert.equal(ctx.is('jpeg'), false);
      assert.equal(ctx.is('.jpeg'), false);
      assert.equal(ctx.is('text/*', 'application/*'), false);
      assert.equal(ctx.is('text/html', 'text/plain', 'application/json; charset=utf-8'), false);
    });
  });

  describe('when Content-Type: application/x-www-form-urlencoded', () => {
    it('should match "urlencoded"', () => {
      const ctx = context();
      ctx.header['content-type'] = 'application/x-www-form-urlencoded';
      ctx.header['transfer-encoding'] = 'chunked';

      assert.equal(ctx.is('urlencoded'), 'urlencoded');
      assert.equal(ctx.is('json', 'urlencoded'), 'urlencoded');
      assert.equal(ctx.is('urlencoded', 'json'), 'urlencoded');
    });
  });
});
