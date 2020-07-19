const assert = require('assert');

let importESM = () => {};

describe('Load with esm', () => {
  before(function(){
    // ESM support is flagged on v12.x.
    const majorVersion = +process.version.split('.')[0].slice(1);
    if (majorVersion < 12) {
      this.skip();
    } else {
      // eslint-disable-next-line no-eval
      importESM = eval('(specifier) => import(specifier)');
    }
  });

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
