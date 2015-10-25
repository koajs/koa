
'use strict';

const request = require('../helpers/context').request;

describe('req.ip', () => {
  describe('with req.ips present', () => {
    it('should return req.ips[0]', () => {
      const req = request();
      req.app.proxy = true;
      req.header['x-forwarded-for'] = '127.0.0.1';
      req.socket.remoteAddress = '127.0.0.2';
      req.ip.should.equal('127.0.0.1');
    });
  });

  describe('with no req.ips present', () => {
    it('should return req.socket.remoteAddress', () => {
      const req = request();
      req.socket.remoteAddress = '127.0.0.2';
      req.ip.should.equal('127.0.0.2');
    });

    describe('with req.socket.remoteAddress not present', () => {
      it('should return an empty string', () => {
        const req = request();
        req.socket.remoteAddress = null;
        req.ip.should.equal('');
      });
    });
  });
});
