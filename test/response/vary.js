
'use strict';

const assert = require('assert');
const context = require('../helpers/context');

describe('ctx.vary(field)', () => {
  describe('when Vary is not set', () => {
    it('should set it', () => {
      const ctx = context();
      ctx.vary('Accept');
      assert.equal(ctx.response.header.vary, 'Accept');
    });
  });

  describe('when Vary is set', () => {
    it('should append', () => {
      const ctx = context();
      ctx.vary('Accept');
      ctx.vary('Accept-Encoding');
      assert.equal(ctx.response.header.vary, 'Accept, Accept-Encoding');
    });
  });

  describe('when Vary already contains the value', () => {
    it('should not append', () => {
      const ctx = context();
      ctx.vary('Accept');
      ctx.vary('Accept-Encoding');
      ctx.vary('Accept');
      ctx.vary('Accept-Encoding');
      assert.equal(ctx.response.header.vary, 'Accept, Accept-Encoding');
    });
  });
});
