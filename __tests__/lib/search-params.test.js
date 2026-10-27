const { describe, it } = require('node:test')
const sp = require('../../lib/search-params')
const assert = require('node:assert/strict')

describe('search-params', () => {
  describe('stringify', () => {
    it('Should stringify a simple object', () => {
      assert.deepStrictEqual(sp.stringify({ a: 1, b: 'b' }), 'a=1&b=b')
      assert.strictEqual(sp.stringify({ a: true, b: false }), 'a=true&b=false')
    })

    it('Should stringify an object with an array', () => {
      assert.deepStrictEqual(sp.stringify({ a: [1, 2] }), 'a=1&a=2')
      assert.strictEqual(sp.stringify({ a: [true, false, 0, '', true] }), 'a=true&a=false&a=0&a=&a=true')
    })

    it('Should stringify an object with an array with a single value', () => {
      assert.deepStrictEqual(sp.stringify({ a: [1] }), 'a=1')
    })

    it('Stringify an object with an array with a single empty value', () => {
      assert.deepStrictEqual(sp.stringify({ a: [''] }), 'a=')
    })

    it('Should not stringify an object with a nested object', () => {
      assert.deepStrictEqual(sp.stringify({ a: { b: 1 } }), 'a=')
    })
  })

  describe('parse', () => {
    it('Should parse a simple query string', () => {
      assert.deepStrictEqual(sp.parse('a=1&b=2'), { a: '1', b: '2' })
    })

    it('Should parse a query string with same key and multiple values', () => {
      assert.deepEqual(sp.parse('a=1&a=2'), { a: ['1', '2'] })
    })

    it('Should parse a query string with an array with a single empty value', () => {
      assert.deepStrictEqual(sp.parse('a='), { a: '' })
    })
  })
})

describe('parse prototype keys', () => {
  const prototypeKeys = ['__proto__', '%5F%5Fproto%5F%5F', 'constructor', 'prototype']

  prototypeKeys.forEach(key => {
    it(`Should preserve repeated ${key} as an own property`, () => {
      const query = sp.parse(`${key}=a&${key}=b&x=1`)
      const name = decodeURIComponent(key)
      assert.strictEqual(Object.getPrototypeOf(query), Object.prototype)
      assert.strictEqual(Object.hasOwn(query, name), true)
      assert.deepStrictEqual(query[name], ['a', 'b'])
      assert.deepStrictEqual(Object.keys(query), [name, 'x'])
      for (const field in query) {
        assert.strictEqual(Object.hasOwn(query, field), true)
      }
      assert.strictEqual(query.x, '1')
    })
  })

  it('Should preserve a single __proto__ value as a mutable own property', () => {
    const query = sp.parse('__proto__=a')
    const name = '__proto__'
    assert.deepStrictEqual(Object.getOwnPropertyDescriptor(query, name), {
      value: 'a',
      writable: true,
      enumerable: true,
      configurable: true
    })
    query[name] = 'b'
    assert.strictEqual(query[name], 'b')
    assert.strictEqual(Object.getPrototypeOf(query), Object.prototype)
    assert.strictEqual(delete query[name], true)
    assert.strictEqual(Object.hasOwn(query, name), false)
  })
})
