
'use strict';

const context = require('../helpers/context');

describe('ctx.acceptsLanguages(langs)', () => {
  describe('with no arguments', () => {
    describe('when Accept-Language is populated', () => {
      it('should return accepted types', () => {
        const ctx = context();
        ctx.req.headers['accept-language'] = 'en;q=0.8, es, pt';
        ctx.acceptsLanguages().should.eql(['es', 'pt', 'en']);
      });
    });
  });

  describe('with multiple arguments', () => {
    describe('when Accept-Language is populated', () => {
      describe('if any types types match', () => {
        it('should return the best fit', () => {
          const ctx = context();
          ctx.req.headers['accept-language'] = 'en;q=0.8, es, pt';
          ctx.acceptsLanguages('es', 'en').should.equal('es');
        });
      });

      describe('if no types match', () => {
        it('should return false', () => {
          const ctx = context();
          ctx.req.headers['accept-language'] = 'en;q=0.8, es, pt';
          ctx.acceptsLanguages('fr', 'au').should.be.false;
        });
      });
    });

    describe('when Accept-Language is not populated', () => {
      it('should return the first type', () => {
        const ctx = context();
        ctx.acceptsLanguages('es', 'en').should.equal('es');
      });
    });
  });

  describe('with an array', () => {
    it('should return the best fit', () => {
      const ctx = context();
      ctx.req.headers['accept-language'] = 'en;q=0.8, es, pt';
      ctx.acceptsLanguages(['es', 'en']).should.equal('es');
    });
  });
});
