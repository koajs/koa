'use strict';

const context = require('../helpers/context');

describe('ctx.assert(value, status)', () => {
  it('should throw an error', () => {
    const ctx = context();

    try {
      ctx.assert(false, 404);
      throw new Error('asdf');
    } catch (err) {
      expect(err.status).toBe(404);
      expect(err.expose).toBe(true);
    }
  });
});
