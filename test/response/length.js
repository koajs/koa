
'use strict';

const response = require('../helpers/context').response;
const assert = require('assert');
const fs = require('fs');

describe('res.length', () => {
  describe('when Content-Length is defined', () => {
    it('should return a number', () => {
      const res = response();
      res.set('Content-Length', '1024');
      assert.equal(res.length, 1024);
    });

    describe('but not number', () => {
      it('should return 0', () => {
        const res = response();
        res.set('Content-Length', 'hey');
        assert.equal(res.length, 0);
      });
    });
  });

  describe('when Content-Length is not defined', () => {
    describe('and a .body is set', () => {
      it('should return a number', () => {
        const res = response();

        res.body = 'foo';
        res.remove('Content-Length');
        assert.equal(res.length, 3);

        res.body = 'foo';
        assert.equal(res.length, 3);

        res.body = Buffer.from('foo bar');
        res.remove('Content-Length');
        assert.equal(res.length, 7);

        res.body = Buffer.from('foo bar');
        assert.equal(res.length, 7);

        res.body = { hello: 'world' };
        res.remove('Content-Length');
        assert.equal(res.length, 17);

        res.body = { hello: 'world' };
        assert.equal(res.length, 17);

        res.body = fs.createReadStream('package.json');
        assert.equal(res.length, undefined);

        res.body = null;
        assert.equal(res.length, undefined);
      });
    });

    describe('and .body is not', () => {
      it('should return undefined', () => {
        const res = response();
        assert.equal(res.length, undefined);
      });
    });
  });
});
