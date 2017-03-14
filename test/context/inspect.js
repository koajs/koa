
'use strict';

const context = require('../helpers/context');

describe('ctx.inspect()', () => {
  it('should return a json representation', () => {
    const ctx = context();
    const toJSON = ctx.toJSON(ctx);

    expect(toJSON).toEqual(ctx.inspect());
  });
});
