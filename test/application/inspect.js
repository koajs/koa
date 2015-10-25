
'use strict';

const assert = require('assert');
const Koa = require('../..');

describe('app.inspect()', () => {
  it('should work', () => {
    const app = new Koa();
    const util = require('util');
    const str = util.inspect(app);
    assert.equal("{ subdomainOffset: 2, proxy: false, env: 'test' }", str);
  });
});
