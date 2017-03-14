
'use strict';

const Stream = require('stream');
const Koa = require('../..');
const Request = require('../helpers/context').request;

describe('req.ip', () => {
  describe('with req.ips present', () => {
    it('should return req.ips[0]', () => {
      const app = new Koa();
      const req = { headers: {}, socket: new Stream.Duplex() };
      app.proxy = true;
      req.headers['x-forwarded-for'] = '127.0.0.1';
      req.socket.remoteAddress = '127.0.0.2';
      const request = Request(req, undefined, app);
      expect(request.ip).toBe('127.0.0.1');
    });
  });

  describe('with no req.ips present', () => {
    it('should return req.socket.remoteAddress', () => {
      const req = { socket: new Stream.Duplex() };
      req.socket.remoteAddress = '127.0.0.2';
      const request = Request(req);
      expect(request.ip).toBe('127.0.0.2');
    });

    describe('with req.socket.remoteAddress not present', () => {
      it('should return an empty string', () => {
        const socket = new Stream.Duplex();
        Object.defineProperty(socket, 'remoteAddress', {
          get: () => undefined, // So that the helper doesn't override it with a reasonable value
          set: () => {}
        });
        expect(Request({ socket }).ip).toBe('');
      });
    });
  });

  it('should be cached', () => {
    const req = { socket: new Stream.Duplex() };
    req.socket.remoteAddress = '127.0.0.2';
    const request = Request(req);
    req.socket.remoteAddress = '127.0.0.1';
    expect(request.ip).toBe('127.0.0.2');
  });
});
