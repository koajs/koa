'use strict';

const response = require('../helpers/context').response;
const fs = require('fs');

describe('res.body=', () => {
  describe('when Content-Type is set', () => {
    it('should not override', () => {
      const res = response();
      res.type = 'png';
      res.body = new Buffer('something');
      expect(res.header['content-type']).toBe('image/png');
    });

    describe('when body is an object', () => {
      it('should override as json', () => {
        const res = response();

        res.body = '<em>hey</em>';
        expect(res.header['content-type']).toBe('text/html; charset=utf-8');

        res.body = { foo: 'bar' };
        expect(res.header['content-type']).toBe('application/json; charset=utf-8');
      });
    });

    it('should override length', () => {
      const res = response();
      res.type = 'html';
      res.body = 'something';
      expect(res.length).toBe(9);
    });
  });

  describe('when a string is given', () => {
    it('should default to text', () => {
      const res = response();
      res.body = 'Tobi';
      expect(res.header['content-type']).toBe('text/plain; charset=utf-8');
    });

    it('should set length', () => {
      const res = response();
      res.body = 'Tobi';
      expect(res.header['content-length']).toBe('4');
    });

    describe('and contains a non-leading <', () => {
      it('should default to text', () => {
        const res = response();
        res.body = 'aklsdjf < klajsdlfjasd';
        expect(res.header['content-type']).toBe('text/plain; charset=utf-8');
      });
    });
  });

  describe('when an html string is given', () => {
    it('should default to html', () => {
      const res = response();
      res.body = '<h1>Tobi</h1>';
      expect(res.header['content-type']).toBe('text/html; charset=utf-8');
    });

    it('should set length', () => {
      const string = '<h1>Tobi</h1>';
      const res = response();
      res.body = string;
      expect(Buffer.byteLength(string)).toBe(res.length);
    });

    it('should set length when body is overridden', () => {
      const string = '<h1>Tobi</h1>';
      const res = response();
      res.body = string;
      res.body = string + string;
      expect(2 * Buffer.byteLength(string)).toBe(res.length);
    });

    describe('when it contains leading whitespace', () => {
      it('should default to html', () => {
        const res = response();
        res.body = '    <h1>Tobi</h1>';
        expect(res.header['content-type']).toBe('text/html; charset=utf-8');
      });
    });
  });

  describe('when an xml string is given', () => {
    it('should default to html', () => {
      /**
       * ctx test is to show that we're not going
       * to be stricter with the html sniff
       * or that we will sniff other string types.
       * You should `.type=` if ctx simple test fails.
       */

      const res = response();
      res.body = '<?xml version="1.0" encoding="UTF-8"?>\n<俄语>данные</俄语>';
      expect(res.header['content-type']).toBe('text/html; charset=utf-8');
    });
  });

  describe('when a stream is given', () => {
    it('should default to an octet stream', () => {
      const res = response();
      res.body = fs.createReadStream('LICENSE');
      expect(res.header['content-type']).toBe('application/octet-stream');
    });
  });

  describe('when a buffer is given', () => {
    it('should default to an octet stream', () => {
      const res = response();
      res.body = new Buffer('hey');
      expect(res.header['content-type']).toBe('application/octet-stream');
    });

    it('should set length', () => {
      const res = response();
      res.body = new Buffer('Tobi');
      expect(res.header['content-length']).toBe('4');
    });
  });

  describe('when an object is given', () => {
    it('should default to json', () => {
      const res = response();
      res.body = { foo: 'bar' };
      expect(res.header['content-type']).toBe('application/json; charset=utf-8');
    });
  });
});
