const { describe, it } = require('node:test')
const assert = require('node:assert/strict')

describe('Load with esm', () => {
  it('should default export koa', async () => {
    const exported = await import('koa')
    const required = require('../')
    assert.strictEqual(exported.default, required)
  })

  it('should match exports own property names', async () => {
    const exported = new Set(Object.getOwnPropertyNames(await import('koa')))
    const required = new Set(Object.getOwnPropertyNames(require('../')))

    // Remove constructor properties + default export.
    for (const k of ['prototype', 'length', 'name']) {
      required.delete(k)
    }

    // Commented out to "fix" CommonJS, ESM, bundling issue.
    // @see https://github.com/koajs/koa/issues/1513
    // exported.delete('default');

    assert.strictEqual(exported.size, required.size)
    assert.strictEqual([...exported].every(property => required.has(property)), true)
  })

  it('CommonJS exports default property', async () => {
    const required = require('../')
    assert.strictEqual(Object.prototype.hasOwnProperty.call(required, 'default'), true)
  })

  it('CommonJS exports default property referencing self', async () => {
    const required = require('../')
    assert.strictEqual(required.default, required)
  })
})
