
'use strict';

const Koa = require('../..');

describe('app.inspect()', () => {
  it('should work', () => {
    const app = new Koa();
    const util = require('util');
    const str = util.inspect(app);
    expect(str).toBe("{ subdomainOffset: 2, proxy: false, env: 'test' }");
  });
});
