
'use strict';

const Koa = require('../..');

describe('app.inspect()', function(){
  it('should work', function(){
    const app = new Koa();
    const util = require('util');
    util.inspect(app);
  });
});
