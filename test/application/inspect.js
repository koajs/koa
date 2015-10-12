
'use strict';

const koa = require('../..');

describe('app.inspect()', function(){
  it('should work', function(){
    const app = koa();
    const util = require('util');
    const str = util.inspect(app);
  })
})
