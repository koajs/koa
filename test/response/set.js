
'use strict';

const assert = require('assert');
const context = require('../helpers/context');

describe('ctx.set(name, val)', () => {
  it('should set a field value', () => {
    const ctx = context();
    ctx.set('x-foo', 'bar');
    assert.equal(ctx.response.get('X-foo'), 'bar');
  });

  it('should not coerce number to string', () => {
    const ctx = context();
    ctx.set('x-foo', 5);
    assert.strictEqual(ctx.response.header['x-foo'], 5);
  });

  it('should not coerce undefined to string', () => {
    const ctx = context();
    ctx.set('x-foo', undefined);
    assert.strictEqual(ctx.response.header['x-foo'], undefined);
  });

  it('should set a field value of array', () => {
    const ctx = context();
    ctx.set('x-foo', ['foo', 'bar', 123 ]);
    assert.deepEqual(ctx.response.header['x-foo'], [ 'foo', 'bar', '123' ]);
  });
});

describe('ctx.set(object)', () => {
  it('should set multiple fields', () => {
    const ctx = context();

    ctx.set({
      foo: 0,
      bar: '2'
    });

    assert.strictEqual(ctx.response.header.foo, 0);
    assert.equal(ctx.response.header.bar, '2');
  });
});
