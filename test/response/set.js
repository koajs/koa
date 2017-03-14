
'use strict';

const context = require('../helpers/context');

describe('ctx.set(name, val)', () => {
  it('should set a field value', () => {
    const ctx = context();
    ctx.set('x-foo', 'bar');
    expect(ctx.response.header['x-foo']).toBe('bar');
  });

  it('should coerce to a string', () => {
    const ctx = context();
    ctx.set('x-foo', 5);
    expect(ctx.response.header['x-foo']).toBe('5');
  });

  it('should set a field value of array', () => {
    const ctx = context();
    ctx.set('x-foo', ['foo', 'bar']);
    expect(ctx.response.header['x-foo']).toEqual(['foo', 'bar']);
  });
});

describe('ctx.set(object)', () => {
  it('should set multiple fields', () => {
    const ctx = context();

    ctx.set({
      foo: '1',
      bar: '2'
    });

    expect(ctx.response.header.foo).toBe('1');
    expect(ctx.response.header.bar).toBe('2');
  });
});
