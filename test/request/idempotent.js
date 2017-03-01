'use strict';

const request = require('../helpers/context').request;

describe('ctx.idempotent', () => {
  describe('when the request method is idempotent', () => {
    it('should return true', () => {
      ['GET', 'HEAD', 'PUT', 'DELETE', 'OPTIONS', 'TRACE'].forEach(check);
      function check(method){
        const req = request();
        req.method = method;
        expect(req.idempotent).toBe(true);
      }
    });
  });

  describe('when the request method is not idempotent', () => {
    it('should return false', () => {
      const req = request();
      req.method = 'POST';
      expect(req.idempotent).toBe(false);
    });
  });
});
