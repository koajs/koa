
'use strict';

const response = require('../helpers/context').response;
const fs = require('fs');

describe('res.length', () => {
  describe('when Content-Length is defined', () => {
    it('should return a number', () => {
      const res = response();
      res.header['content-length'] = '120';
      expect(res.length).toBe(120);
    });
  });
});

describe('res.length', () => {
  describe('when Content-Length is defined', () => {
    it('should return a number', () => {
      const res = response();
      res.set('Content-Length', '1024');
      expect(res.length).toBe(1024);
    });
  });

  describe('when Content-Length is not defined', () => {
    describe('and a .body is set', () => {
      it('should return a number', () => {
        const res = response();

        res.body = 'foo';
        res.remove('Content-Length');
        expect(res.length).toBe(3);

        res.body = 'foo';
        expect(res.length).toBe(3);

        res.body = new Buffer('foo bar');
        res.remove('Content-Length');
        expect(res.length).toBe(7);

        res.body = new Buffer('foo bar');
        expect(res.length).toBe(7);

        res.body = { hello: 'world' };
        res.remove('Content-Length');
        expect(res.length).toBe(17);

        res.body = { hello: 'world' };
        expect(res.length).toBe(17);

        res.body = fs.createReadStream('package.json');
        expect(res.length).toBe(undefined);

        res.body = null;
        expect(res.length).toBe(undefined);
      });
    });

    describe('and .body is not', () => {
      it('should return undefined', () => {
        const res = response();
        expect(res.length).toBe(undefined);
      });
    });
  });
});
