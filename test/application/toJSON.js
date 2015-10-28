
'use strict';

const Koa = require('../..');

describe('app.toJSON()', function(){
  it('should work', function(){
    const env = process.env.NODE_ENV;
    process.env.NODE_ENV = 'test';

    const app = new Koa();
    const obj = app.toJSON();

    process.env.NODE_ENV = env;

    obj.should.eql({
      subdomainOffset: 2,
      env: 'test'
    });
  });
});
