
'use strict';

const context = require('../helpers/context');

describe('ctx.remove(name)', () => {
  it('should remove a field', () => {
    const ctx = context();
    ctx.set('x-foo', 'bar');
    ctx.remove('x-foo');
    ctx.response.header.should.eql({});
  });
});
