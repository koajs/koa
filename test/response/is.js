
'use strict';

const context = require('../helpers/context');
const assert = require('assert');

describe('response.is(type)', () => {
  it('should ignore params', () => {
    const res = context().response;
    res.type = 'text/html; charset=utf-8';

    assert.equal(res.is('text/*'), 'text/html');
  });

  describe('when no type is set', () => {
    it('should return false', () => {
      const res = context().response;

      assert.equal(res.is(), false);
      assert.equal(res.is('html'), false);
    });
  });

  describe('when given no types', () => {
    it('should return the type', () => {
      const res = context().response;
      res.type = 'text/html; charset=utf-8';

      assert.equal(res.is(), 'text/html');
    });
  });

  describe('given one type', () => {
    it('should return the type or false', () => {
      const res = context().response;
      res.type = 'image/png';

      assert.equal(res.is('png'), 'png');
      assert.equal(res.is('.png'), '.png');
      assert.equal(res.is('image/png'), 'image/png');
      assert.equal(res.is('image/*'), 'image/png');
      assert.equal(res.is('*/png'), 'image/png');

      assert.equal(res.is('jpeg'), false);
      assert.equal(res.is('.jpeg'), false);
      assert.equal(res.is('image/jpeg'), false);
      assert.equal(res.is('text/*'), false);
      assert.equal(res.is('*/jpeg'), false);
    });
  });

  describe('given multiple types', () => {
    it('should return the first match or false', () => {
      const res = context().response;
      res.type = 'image/png';

      assert.equal(res.is('png'), 'png');
      assert.equal(res.is('.png'), '.png');
      assert.equal(res.is('text/*', 'image/*'), 'image/png');
      assert.equal(res.is('image/*', 'text/*'), 'image/png');
      assert.equal(res.is('image/*', 'image/png'), 'image/png');
      assert.equal(res.is('image/png', 'image/*'), 'image/png');

      assert.equal(res.is(['text/*', 'image/*']), 'image/png');
      assert.equal(res.is(['image/*', 'text/*']), 'image/png');
      assert.equal(res.is(['image/*', 'image/png']), 'image/png');
      assert.equal(res.is(['image/png', 'image/*']), 'image/png');

      assert.equal(res.is('jpeg'), false);
      assert.equal(res.is('.jpeg'), false);
      assert.equal(res.is('text/*', 'application/*'), false);
      assert.equal(res.is('text/html', 'text/plain', 'application/json; charset=utf-8'), false);
    });
  });

  describe('when Content-Type: application/x-www-form-urlencoded', () => {
    it('should match "urlencoded"', () => {
      const res = context().response;
      res.type = 'application/x-www-form-urlencoded';

      assert.equal(res.is('urlencoded'), 'urlencoded');
      assert.equal(res.is('json', 'urlencoded'), 'urlencoded');
      assert.equal(res.is('urlencoded', 'json'), 'urlencoded');
    });
  });
});
