
'use strict';

const context = require('../helpers/context');

describe('ctx.vary(field)', () => {
  describe('when Vary is not set', () => {
    it('should set it', () => {
      const ctx = context();
      ctx.vary('Accept');
      expect(ctx.response.header.vary).toBe('Accept');
    });
  });

  describe('when Vary is set', () => {
    it('should append', () => {
      const ctx = context();
      ctx.vary('Accept');
      ctx.vary('Accept-Encoding');
      expect(ctx.response.header.vary).toBe('Accept, Accept-Encoding');
    });
  });

  describe('when Vary already contains the value', () => {
    it('should not append', () => {
      const ctx = context();
      ctx.vary('Accept');
      ctx.vary('Accept-Encoding');
      ctx.vary('Accept');
      ctx.vary('Accept-Encoding');
      expect(ctx.response.header.vary).toBe('Accept, Accept-Encoding');
    });
  });
});
