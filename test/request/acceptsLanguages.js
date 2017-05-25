
'use strict';

const assert = require('assert');
const context = require('../helpers/context');

describe('ctx.acceptsLanguages(langs)', () => {
  describe('with no arguments', () => {
    describe('when Accept-Language is populated', () => {
      it('should return accepted types', () => {
        const ctx = context();
        ctx.req.headers['accept-language'] = 'en;q=0.8, es, pt';
        assert.deepEqual(ctx.acceptsLanguages(), ['es', 'pt', 'en']);
      });
    });
  });

  describe('with multiple arguments', () => {
    describe('when Accept-Language is populated', () => {
      describe('if any types types match', () => {
        it('should return the best fit', () => {
          const ctx = context();
          ctx.req.headers['accept-language'] = 'en;q=0.8, es, pt';
          assert.equal(ctx.acceptsLanguages('es', 'en'), 'es');
        });
      });

      describe('if no types match', () => {
        it('should return false', () => {
          const ctx = context();
          ctx.req.headers['accept-language'] = 'en;q=0.8, es, pt';
          assert.equal(ctx.acceptsLanguages('fr', 'au'), false);
        });
      });
    });

    describe('when Accept-Language is not populated', () => {
      it('should return the first type', () => {
        const ctx = context();
        assert.equal(ctx.acceptsLanguages('es', 'en'), 'es');
      });
    });
  });

  describe('with an array', () => {
    it('should return the best fit', () => {
      const ctx = context();
      ctx.req.headers['accept-language'] = 'en;q=0.8, es, pt';
      assert.equal(ctx.acceptsLanguages(['es', 'en']), 'es');
    });
  });
});
