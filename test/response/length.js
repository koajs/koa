
'use strict';

const response = require('../helpers/context').response;
const assert = require('assert');
const fs = require('fs');

describe('res.length', () => {
  describe('when Content-Length is defined', () => {
    it('should return a number', () => {
      const res = response();
      res.header['content-length'] = '120';
      assert.strictEqual(res.length, 120);
    });
  });
});

describe('res.length', () => {
  describe('when Content-Length is defined', () => {
    it('should return a number', () => {
      const res = response();
      res.set('Content-Length', '1024');
      assert.strictEqual(res.length, 1024);
    });
  });

  describe('when Content-Length is not defined', () => {
    describe('and a .body is set', () => {
      it('should return a number', () => {
        const res = response();

        res.body = 'foo';
        res.remove('Content-Length');
        assert.strictEqual(res.length, 3);

        res.body = 'foo';
        assert.strictEqual(res.length, 3);

        res.body = Buffer.from('foo bar');
        res.remove('Content-Length');
        assert.strictEqual(res.length, 7);

        res.body = Buffer.from('foo bar');
        assert.strictEqual(res.length, 7);

        res.body = { hello: 'world' };
        res.remove('Content-Length');
        assert.strictEqual(res.length, 17);

        res.body = { hello: 'world' };
        assert.strictEqual(res.length, 17);

        res.body = fs.createReadStream('package.json');
        assert.strictEqual(res.length, undefined);

        res.body = null;
        assert.strictEqual(res.length, undefined);
      });
    });

    describe('and .body is not', () => {
      it('should return undefined', () => {
        const res = response();
        assert.strictEqual(res.length, undefined);
      });
    });
  });
});
