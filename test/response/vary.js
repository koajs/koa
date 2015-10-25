
'use strict';

const context = require('../helpers/context');

describe('ctx.vary(field)', () => {
  describe('when Vary is not set', () => {
    it('should set it', () => {
      const ctx = context();
      ctx.vary('Accept');
      ctx.response.header.vary.should.equal('Accept');
    });
  });

  describe('when Vary is set', () => {
    it('should append', () => {
      const ctx = context();
      ctx.vary('Accept');
      ctx.vary('Accept-Encoding');
      ctx.response.header.vary.should.equal('Accept, Accept-Encoding');
    });
  });

  describe('when Vary already contains the value', () => {
    it('should not append', () => {
      const ctx = context();
      ctx.vary('Accept');
      ctx.vary('Accept-Encoding');
      ctx.vary('Accept');
      ctx.vary('Accept-Encoding');
      ctx.response.header.vary.should.equal('Accept, Accept-Encoding');
    });
  });
});
