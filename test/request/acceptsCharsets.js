
'use strict';

const context = require('../helpers/context');

describe('ctx.acceptsCharsets()', () => {
  describe('with no arguments', () => {
    describe('when Accept-Charset is populated', () => {
      it('should return accepted types', () => {
        const ctx = context();
        ctx.req.headers['accept-charset'] = 'utf-8, iso-8859-1;q=0.2, utf-7;q=0.5';
        expect(ctx.acceptsCharsets()).toEqual(['utf-8', 'utf-7', 'iso-8859-1']);
      });
    });
  });

  describe('with multiple arguments', () => {
    describe('when Accept-Charset is populated', () => {
      describe('if any types match', () => {
        it('should return the best fit', () => {
          const ctx = context();
          ctx.req.headers['accept-charset'] = 'utf-8, iso-8859-1;q=0.2, utf-7;q=0.5';
          expect(ctx.acceptsCharsets('utf-7', 'utf-8')).toBe('utf-8');
        });
      });

      describe('if no types match', () => {
        it('should return false', () => {
          const ctx = context();
          ctx.req.headers['accept-charset'] = 'utf-8, iso-8859-1;q=0.2, utf-7;q=0.5';
          expect(ctx.acceptsCharsets('utf-16')).toBe(false);
        });
      });
    });

    describe('when Accept-Charset is not populated', () => {
      it('should return the first type', () => {
        const ctx = context();
        expect(ctx.acceptsCharsets('utf-7', 'utf-8')).toBe('utf-7');
      });
    });
  });

  describe('with an array', () => {
    it('should return the best fit', () => {
      const ctx = context();
      ctx.req.headers['accept-charset'] = 'utf-8, iso-8859-1;q=0.2, utf-7;q=0.5';
      expect(ctx.acceptsCharsets(['utf-7', 'utf-8'])).toBe('utf-8');
    });
  });
});
