
'use strict';

const koa = require('../..');

describe('app.toJSON()', function(){
  it('should work', function(){
    const app = koa();
    const obj = app.toJSON();

    obj.should.eql({
      subdomainOffset: 2,
      env: 'test'
    });
  })
})
