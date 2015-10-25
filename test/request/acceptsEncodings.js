
'use strict';

const context = require('../helpers/context');

describe('ctx.acceptsEncodings()', () => {
  describe('with no arguments', () => {
    describe('when Accept-Encoding is populated', () => {
      it('should return accepted types', () => {
        const ctx = context();
        ctx.req.headers['accept-encoding'] = 'gzip, compress;q=0.2';
        ctx.acceptsEncodings().should.eql(['gzip', 'compress', 'identity']);
        ctx.acceptsEncodings('gzip', 'compress').should.equal('gzip');
      });
    });

    describe('when Accept-Encoding is not populated', () => {
      it('should return identity', () => {
        const ctx = context();
        ctx.acceptsEncodings().should.eql(['identity']);
        ctx.acceptsEncodings('gzip', 'deflate', 'identity').should.equal('identity');
      });
    });
  });

  describe('with multiple arguments', () => {
    it('should return the best fit', () => {
      const ctx = context();
      ctx.req.headers['accept-encoding'] = 'gzip, compress;q=0.2';
      ctx.acceptsEncodings('compress', 'gzip').should.eql('gzip');
      ctx.acceptsEncodings('gzip', 'compress').should.eql('gzip');
    });
  });

  describe('with an array', () => {
    it('should return the best fit', () => {
      const ctx = context();
      ctx.req.headers['accept-encoding'] = 'gzip, compress;q=0.2';
      ctx.acceptsEncodings(['compress', 'gzip']).should.eql('gzip');
    });
  });
});
