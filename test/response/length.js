
'use strict';

const response = require('../helpers/context').response;
const should = require('should');
const assert = require('assert');
const fs = require('fs');

describe('res.length', () => {
  describe('when Content-Length is defined', () => {
    it('should return a number', () => {
      const res = response();
      res.header['content-length'] = '120';
      res.length.should.equal(120);
    });
  });
});

describe('res.length', () => {
  describe('when Content-Length is defined', () => {
    it('should return a number', () => {
      const res = response();
      res.set('Content-Length', '1024');
      res.length.should.equal(1024);
    });
  });

  describe('when Content-Length is not defined', () => {
    describe('and a .body is set', () => {
      it('should return a number', () => {
        const res = response();

        res.body = 'foo';
        res.remove('Content-Length');
        res.length.should.equal(3);

        res.body = 'foo';
        res.length.should.equal(3);

        res.body = Buffer.from('foo bar');
        res.remove('Content-Length');
        res.length.should.equal(7);

        res.body = Buffer.from('foo bar');
        res.length.should.equal(7);

        res.body = { hello: 'world' };
        res.remove('Content-Length');
        res.length.should.equal(17);

        res.body = { hello: 'world' };
        res.length.should.equal(17);

        res.body = fs.createReadStream('package.json');
        should.not.exist(res.length);

        res.body = null;
        should.not.exist(res.length);
      });
    });

    describe('and .body is not', () => {
      it('should return undefined', () => {
        const res = response();
        assert(null == res.length);
      });
    });
  });
});
