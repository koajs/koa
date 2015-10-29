
'use strict';

const assert = require('assert');
const Koa = require('../..');

describe('app.inspect()', function(){
  it('should work', function(){
    const app = new Koa();
    const util = require('util');
    const str = util.inspect(app);
    assert.equal("{ subdomainOffset: 2, proxy: false, env: 'test' }", str);
  });
});
