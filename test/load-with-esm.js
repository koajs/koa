const assert = require('assert');

// ESM support is flagged on v12.x.
const majorVersion = +process.version.split('.')[0].slice(1);
if (majorVersion < 12) {
  process.exit();
}

// eslint-disable-next-line no-eval
const importESM = eval('(specifier) => import(specifier)');

describe('Load with esm', () => {
  it('should default export koa', async() => {
    const exported = await importESM('koa');
    const required = require('../');
    assert.strictEqual(exported.default, required);
  });

  it('should match exports own property names', async() => {
    const exported = new Set(Object.getOwnPropertyNames(await importESM('koa')));
    const required = new Set(Object.getOwnPropertyNames(require('../')));

    // Remove constructor properties + default export.
    for (const k of ['prototype', 'length', 'name']) {
      required.delete(k);
    }
    exported.delete('default');

    assert.strictEqual(exported.size, required.size);
    assert.strictEqual([...exported].every(property => required.has(property)), true);
  });
});
